"""Image rendering in a process pool.

samila seeds the global `random` module for every point, so renders are not
thread-safe; each one runs in its own worker process instead.
"""

import asyncio
import io
import random
import warnings
from concurrent.futures import Future, ProcessPoolExecutor
from dataclasses import dataclass

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402
from samila import GenerateMode, GenerativeImage, Marker, Projection  # noqa: E402

from app.equations import EQUATIONS  # noqa: E402

MAX_SEED = 2**20
# samila draws a fixed 10x10 inch figure, so pixels = inches * dpi
FIGURE_INCHES = 10
MIN_SIZE, MAX_SIZE, DEFAULT_SIZE = 500, 4000, 1000


@dataclass(frozen=True)
class RenderParams:
    # indices into EQUATIONS, resolved inside the worker
    f1: int
    f2: int
    seed: int | None = None
    proj: str = Projection.RECTILINEAR.value
    mode: str = GenerateMode.F1_VS_F2.value
    color: str = "#000000"
    bg: str = "#ffffff"
    cmap: str | None = None
    marker: str = "point"
    spot: float = 0.5
    alpha: float = 0.1
    rotation: float = 0.0
    size: int = DEFAULT_SIZE


def render(params: RenderParams) -> tuple[bytes, int]:
    """Render one image. Returns (png_bytes, seed). Runs in a worker process."""
    f1, f2 = EQUATIONS[params.f1].fn, EQUATIONS[params.f2].fn
    seed = params.seed if params.seed is not None else random.SystemRandom().randint(0, MAX_SEED)

    g = GenerativeImage(f1, f2)
    # samila creates its figure at rcParams["figure.dpi"], and rotation saves an intermediate
    # image at the figure's dpi, so set it here rather than only on the final savefig
    dpi = params.size / FIGURE_INCHES
    with matplotlib.rc_context({"figure.dpi": dpi}), warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        g.generate(seed=seed, mode=GenerateMode(params.mode))
        if params.cmap:
            color, cmap = g.data1, params.cmap
        else:
            color, cmap = params.color, None
        try:
            g.plot(
                color=color,
                bgcolor=params.bg,
                cmap=cmap,
                spot_size=params.spot,
                projection=Projection(params.proj),
                marker=Marker[params.marker.upper()],
                alpha=params.alpha,
                rotation=params.rotation,
            )
            buf = io.BytesIO()
            g.fig.savefig(
                buf, format="png", dpi=dpi, facecolor=g.fig.get_facecolor(), edgecolor="none"
            )
            return buf.getvalue(), seed
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

    async def render(self, params: RenderParams) -> tuple[bytes, int]:
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
