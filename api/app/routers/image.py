import logging
import random
import time
from dataclasses import dataclass
from typing import Annotated, Literal

import matplotlib
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from samila import GenerateMode, Marker, Projection

from app.equations import EQUATIONS, PAIRS, pair_index
from app.ratelimit import rate_limit
from app.render import (
    DEFAULT_LINEWIDTH,
    DEFAULT_SIZE,
    DEFAULT_START,
    DEFAULT_STEP,
    DEFAULT_STOP,
    GRID_LIMIT,
    MAX_POINTS,
    MAX_SEED,
    MAX_SIZE,
    MIN_SIZE,
    RendererBusy,
    RenderParams,
    RenderTimeout,
    grid_points,
)
from app.samila_config import samila_config

log = logging.getLogger(__name__)

router = APIRouter(tags=["image"])

_EXCLUDED = {"RANDOM", "DEFAULT"}

PROJECTIONS = tuple(
    dict.fromkeys(p.value for n, p in Projection.__members__.items() if n not in _EXCLUDED)
)
MODES = tuple(
    dict.fromkeys(m.value for n, m in GenerateMode.__members__.items() if n not in _EXCLUDED)
)
MARKERS = tuple(n.lower() for n in Marker.__members__ if n not in _EXCLUDED)
CMAPS = (
    "viridis",
    "plasma",
    "inferno",
    "magma",
    "cividis",
    "twilight",
    "turbo",
    "cool",
    "spring",
    "ocean",
)

ProjectionName = Literal[*PROJECTIONS]
ModeName = Literal[*MODES]
MarkerName = Literal[*MARKERS]

HEX = r"[0-9a-fA-F]{6}"
COLOR = rf"^({HEX}|complement)$"
BACKGROUND = rf"^({HEX}|transparent|complement)$"
COLORS = rf"^{HEX}(,{HEX}){{1,5}}$"
# every colormap matplotlib knows, for cmap= beyond the curated few
ALL_CMAPS = frozenset(matplotlib.colormaps)

ERRORS = {
    422: {"description": "Invalid or conflicting parameters"},
    429: {"description": "Rate limit exceeded (see Retry-After)"},
    503: {"description": "Renderer busy, try again later"},
    504: {"description": "Render timed out"},
}


def _color(value: str) -> str:
    return value if value in ("transparent", "complement") else f"#{value}"


def _invalid(detail: str) -> HTTPException:
    return HTTPException(status_code=422, detail=detail)


@dataclass(frozen=True)
class ImageRequest:
    params: RenderParams
    # the numbered variation, when the equations are one
    eq: int | None
    # whether the same request always gives the same image
    fixed: bool


def image_params(
    eq: Annotated[
        int | None,
        Query(ge=0, le=len(PAIRS) - 1, description="Variation (equation pair); random if unset"),
    ] = None,
    f1: Annotated[
        int | None,
        Query(
            ge=0,
            le=len(EQUATIONS) - 1,
            description="First equation (see /api/equations); use with f2 instead of eq",
        ),
    ] = None,
    f2: Annotated[
        int | None,
        Query(ge=0, le=len(EQUATIONS) - 1, description="Second equation; use with f1"),
    ] = None,
    fseed: Annotated[
        int | None,
        Query(
            ge=0,
            le=MAX_SEED,
            description="Let samila write two random equations from this seed, instead of "
            "eq or f1 and f2 (see /api/equations/random/{fseed})",
        ),
    ] = None,
    seed: Annotated[int | None, Query(ge=0, le=MAX_SEED, description="Random if unset")] = None,
    start: Annotated[
        float,
        Query(ge=-GRID_LIMIT, le=GRID_LIMIT, description="Start of the grid of points (x and y)"),
    ] = DEFAULT_START,
    stop: Annotated[
        float, Query(ge=-GRID_LIMIT, le=GRID_LIMIT, description="End of the grid of points")
    ] = DEFAULT_STOP,
    step: Annotated[
        float,
        Query(
            ge=0.002,
            le=1,
            description=f"Grid spacing; smaller is denser. At most {MAX_POINTS:,} points",
        ),
    ] = DEFAULT_STEP,
    proj: Annotated[ProjectionName, Query(description="Projection")] = "rectilinear",
    mode: Annotated[ModeName, Query(description="Generate mode")] = "f1_vs_f2",
    color: Annotated[
        str,
        Query(pattern=COLOR, description="Point color, hex without '#', or 'complement' of bg"),
    ] = "000000",
    bg: Annotated[
        str,
        Query(
            pattern=BACKGROUND,
            description="Background color, hex without '#', 'transparent', or 'complement' "
            "of color",
        ),
    ] = "ffffff",
    cmap: Annotated[
        str | None,
        Query(description="Gradient colormap, any matplotlib name (see /api/colormaps)"),
    ] = None,
    colors: Annotated[
        str | None,
        Query(
            pattern=COLORS,
            description="Custom gradient: 2 to 6 comma-separated hex colors, instead of cmap",
        ),
    ] = None,
    marker: Annotated[MarkerName, Query(description="Marker shape")] = "point",
    spot: Annotated[float, Query(ge=0.01, le=10, description="Point size")] = 0.5,
    alpha: Annotated[float, Query(ge=0.01, le=1, description="Point opacity")] = 0.1,
    linewidth: Annotated[
        float, Query(ge=0, le=5, description="Marker outline width")
    ] = DEFAULT_LINEWIDTH,
    rotation: Annotated[float, Query(ge=0, le=360, description="Rotation in degrees")] = 0.0,
    size: Annotated[
        int | None,
        Query(ge=MIN_SIZE, le=MAX_SIZE, description="Width and height of a square image"),
    ] = None,
    width: Annotated[
        int | None,
        Query(ge=MIN_SIZE, le=MAX_SIZE, description="Image width; use with height"),
    ] = None,
    height: Annotated[
        int | None,
        Query(ge=MIN_SIZE, le=MAX_SIZE, description="Image height; use with width"),
    ] = None,
) -> ImageRequest:
    """The query parameters shared by /image and /config, checked and resolved."""
    if (f1 is None) != (f2 is None):
        raise _invalid("f1 and f2 must be given together")
    if f1 is not None and eq is not None:
        raise _invalid("give either eq or f1 and f2, not both")
    if fseed is not None and (eq is not None or f1 is not None):
        raise _invalid("give fseed instead of eq or f1 and f2, not with them")
    if start >= stop:
        raise _invalid("start must be less than stop")
    if grid_points(start, stop, step) > MAX_POINTS:
        raise _invalid(f"the grid has too many points (at most {MAX_POINTS:,}); raise step")
    if cmap is not None and cmap not in ALL_CMAPS:
        raise _invalid(f"unknown colormap {cmap!r} (see /api/colormaps)")
    if cmap is not None and colors is not None:
        raise _invalid("give either cmap or colors, not both")
    gradient = cmap is not None or colors is not None
    if color == "complement" and bg in ("complement", "transparent"):
        raise _invalid("color can only complement a solid background")
    if bg == "complement" and gradient:
        raise _invalid("bg can only complement a solid color, not a gradient")
    if (width is None) != (height is None):
        raise _invalid("width and height must be given together")
    if size is not None and width is not None:
        raise _invalid("give either size or width and height, not both")
    if width is None or height is None:
        width = height = size if size is not None else DEFAULT_SIZE

    fixed = seed is not None and (eq is not None or f1 is not None or fseed is not None)
    if fseed is not None:
        f1 = f2 = None
    elif f1 is None or f2 is None:
        if eq is None:
            eq = random.randrange(len(PAIRS))
        f1, f2 = PAIRS[eq]
    else:
        eq = pair_index(f1, f2)
    params = RenderParams(
        f1=f1,
        f2=f2,
        fseed=fseed,
        seed=seed,
        start=start,
        stop=stop,
        step=step,
        proj=proj,
        mode=mode,
        color=_color(color),
        bg=_color(bg),
        cmap=tuple(f"#{c}" for c in colors.split(",")) if colors else cmap,
        marker=marker,
        spot=spot,
        alpha=alpha,
        linewidth=linewidth,
        rotation=rotation,
        width=width,
        height=height,
    )
    return ImageRequest(params, eq, fixed)


@router.get(
    "/image",
    response_class=Response,
    responses={200: {"content": {"image/png": {}}}, **ERRORS},
    dependencies=[Depends(rate_limit)],
)
async def generative_image(
    request: Request, image: Annotated[ImageRequest, Depends(image_params)]
) -> Response:
    """Generate an image with Samila. The seed and equations are returned in headers."""
    params, eq, cacheable = image.params, image.eq, image.fixed
    f1, f2, fseed = params.f1, params.f2, params.fseed

    began = time.perf_counter()
    try:
        result = await request.app.state.renderer.render(params)
    except RendererBusy as e:
        raise HTTPException(status_code=503, detail="Renderer busy, try again later") from e
    except RenderTimeout as e:
        raise HTTPException(status_code=504, detail="Render timed out") from e
    duration = time.perf_counter() - began
    log.info("render %s seed=%d duration=%.2fs", params, result.seed, duration)

    if fseed is not None:
        equations = {"X-Fseed": str(fseed)}
    else:
        equations = {
            "X-F1": str(f1),
            "X-F2": str(f2),
            # only when the pair is a numbered variation
            **({"X-Eq": str(eq)} if eq is not None else {}),
        }
    return Response(
        content=result.png,
        media_type="image/png",
        headers={
            "X-Seed": str(result.seed),
            **equations,
            "Cache-Control": "public, max-age=31536000, immutable" if cacheable else "no-store",
        },
    )


@router.get("/config", responses=ERRORS)
async def samila_config_json(
    image: Annotated[ImageRequest, Depends(image_params)], response: Response
) -> dict:
    """The samila config for an image, which GenerativeImage(config=...) loads in Python.

    Takes the same parameters as /image; seed is required.
    """
    if image.params.seed is None:
        raise _invalid("seed is required for a config")
    response.headers["Cache-Control"] = "public, max-age=3600" if image.fixed else "no-store"
    return samila_config(image.params)
