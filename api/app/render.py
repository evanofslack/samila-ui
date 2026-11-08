"""Image rendering in a process pool.

samila seeds the global `random` module for every point, so renders are not
thread-safe; each one runs in its own worker process instead.
"""

import asyncio
import io
import math
import random
import warnings
from concurrent.futures import Future, ProcessPoolExecutor
from dataclasses import dataclass

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402
from samila import GenerateMode, GenerativeImage, Marker, Projection  # noqa: E402

from app.equations import EQUATIONS  # noqa: E402

MAX_SEED = 2**20
# samila draws a 10 inch figure along the long side, so pixels = inches * dpi
FIGURE_INCHES = 10
MIN_SIZE, MAX_SIZE, DEFAULT_SIZE = 500, 4000, 1000
# the grid of starting points, samila's defaults
DEFAULT_START, DEFAULT_STOP, DEFAULT_STEP = -math.pi, math.pi, 0.01
GRID_LIMIT = 12.0
# points grow with the square of the grid, so cap them to keep renders bounded
MAX_POINTS = 1_600_000
DEFAULT_LINEWIDTH = 1.5


@dataclass(frozen=True)
class RenderParams:
    # indices into EQUATIONS, resolved inside the worker; unused when fseed is set
    f1: int | None = None
    f2: int | None = None
    # seeds samila's random equation generator instead of using f1 and f2
    fseed: int | None = None
    seed: int | None = None
    start: float = DEFAULT_START
    stop: float = DEFAULT_STOP
    step: float = DEFAULT_STEP
    proj: str = Projection.RECTILINEAR.value
    mode: str = GenerateMode.F1_VS_F2.value
    # a colour, or samila's "transparent" / "complement"
    color: str = "#000000"
    bg: str = "#ffffff"
    # a matplotlib colormap name, or two or more colours for a custom gradient
    cmap: str | tuple[str, ...] | None = None
    marker: str = "point"
    spot: float = 0.5
    alpha: float = 0.1
    linewidth: float = DEFAULT_LINEWIDTH
    rotation: float = 0.0
    width: int = DEFAULT_SIZE
    height: int = DEFAULT_SIZE


@dataclass(frozen=True)
class RenderResult:
    png: bytes
    seed: int
    # samila's generated equations, for fseed renders
    expr1: str | None = None
    expr2: str | None = None


def grid_points(start: float, stop: float, step: float) -> int:
    return round((stop - start) / step) ** 2


def _colormap(cmap: str | tuple[str, ...] | None):
    if isinstance(cmap, tuple):
        return LinearSegmentedColormap.from_list("custom", list(cmap))
    return cmap


def render(params: RenderParams) -> RenderResult:
    """Render one image. Runs in a worker process."""
    seed = params.seed if params.seed is not None else random.SystemRandom().randint(0, MAX_SEED)

    if params.fseed is not None:
        # samila writes the equations itself; only an integer seed comes from the request
        g = GenerativeImage(func_seed=params.fseed)
    else:
        g = GenerativeImage(EQUATIONS[params.f1].fn, EQUATIONS[params.f2].fn)

    # the long side is FIGURE_INCHES, and the dpi makes it the requested pixels; square
    # images come out exactly as before
    long_side = max(params.width, params.height)
    dpi = long_side / FIGURE_INCHES
    inches = (params.width / dpi, params.height / dpi)
    transparent = params.bg == "transparent"
    # samila creates its figure at rcParams["figure.dpi"], and rotation saves an intermediate
    # image at the figure's dpi, so set it here rather than only on the final savefig
    with matplotlib.rc_context({"figure.dpi": dpi}), warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        g.generate(
            seed=seed,
            start=params.start,
            stop=params.stop,
            step=params.step,
            mode=GenerateMode(params.mode),
        )
        if params.cmap:
            color, cmap = g.data1, _colormap(params.cmap)
        else:
            color, cmap = params.color, None
        try:
            g.plot(
                color=color,
                bgcolor=params.bg,
                cmap=cmap,
                spot_size=params.spot,
                size=inches if params.width != params.height else None,
                projection=Projection(params.proj),
                marker=Marker[params.marker.upper()],
                alpha=params.alpha,
                linewidth=params.linewidth,
                rotation=params.rotation,
            )
            buf = io.BytesIO()
            g.fig.savefig(
                buf,
                format="png",
                dpi=dpi,
                facecolor="none" if transparent else g.fig.get_facecolor(),
                edgecolor="none",
                transparent=transparent,
            )
            return RenderResult(buf.getvalue(), seed, g.function1_str, g.function2_str)
        finally:
            if getattr(g, "fig", None) is not None:
                plt.close(g.fig)


class RendererBusy(Exception):
    """All workers and queue slots are in use."""


class RenderTimeout(Exception):
    """The render did not finish in time."""


class Renderer:
    """Owns the process pool and bounds the number of in-flight renders."""

    def __init__(self, workers: int, queue: int, timeout: float) -> None:
        self.capacity = workers + queue
        self.timeout = timeout
        self._in_flight = 0
        self._pool = ProcessPoolExecutor(max_workers=workers)

    def _release(self, _: Future) -> None:
        self._in_flight -= 1

    async def render(self, params: RenderParams) -> RenderResult:
        if self._in_flight >= self.capacity:
            raise RendererBusy
        loop = asyncio.get_running_loop()
        self._in_flight += 1
        try:
            fut = loop.run_in_executor(self._pool, render, params)
        except BaseException:
            self._in_flight -= 1
            raise
        # Release the slot when the work actually finishes, not when we stop waiting,
        # so a timed-out render still counts against capacity while it runs.
        fut.add_done_callback(self._release)
        try:
            return await asyncio.wait_for(asyncio.shield(fut), self.timeout)
        except TimeoutError as e:
            raise RenderTimeout from e

    def shutdown(self) -> None:
        self._pool.shutdown(wait=False, cancel_futures=True)
