import logging
import random
import time
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from samila import GenerateMode, Marker, Projection

from app.equations import combos
from app.ratelimit import rate_limit
from app.render import (
    DEFAULT_SIZE,
    MAX_SEED,
    MAX_SIZE,
    MIN_SIZE,
    RendererBusy,
    RenderParams,
    RenderTimeout,
)

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
CmapName = Literal[*CMAPS]

HEX = r"^[0-9a-fA-F]{6}$"

ERRORS = {
    429: {"description": "Rate limit exceeded (see Retry-After)"},
    503: {"description": "Renderer busy, try again later"},
    504: {"description": "Render timed out"},
}


@router.get(
    "/image",
    response_class=Response,
    responses={200: {"content": {"image/png": {}}}, **ERRORS},
    dependencies=[Depends(rate_limit)],
)
async def generative_image(
    request: Request,
    eq: Annotated[
        int | None, Query(ge=0, le=len(combos) - 1, description="Equation pair; random if unset")
    ] = None,
    seed: Annotated[int | None, Query(ge=0, le=MAX_SEED, description="Random if unset")] = None,
    proj: Annotated[ProjectionName, Query(description="Projection")] = "rectilinear",
    mode: Annotated[ModeName, Query(description="Generate mode")] = "f1_vs_f2",
    color: Annotated[
        str, Query(pattern=HEX, description="Point color, hex without '#'")
    ] = "000000",
    bg: Annotated[
        str, Query(pattern=HEX, description="Background color, hex without '#'")
    ] = "ffffff",
    cmap: Annotated[
        CmapName | None, Query(description="Gradient colormap; overrides color")
    ] = None,
    marker: Annotated[MarkerName, Query(description="Marker shape")] = "point",
    spot: Annotated[float, Query(ge=0.01, le=10, description="Point size")] = 0.5,
    alpha: Annotated[float, Query(ge=0.01, le=1, description="Point opacity")] = 0.1,
    rotation: Annotated[float, Query(ge=0, le=360, description="Rotation in degrees")] = 0.0,
    size: Annotated[
        int, Query(ge=MIN_SIZE, le=MAX_SIZE, description="Image width and height in pixels")
    ] = DEFAULT_SIZE,
) -> Response:
    """Generate an image with Samila. The seed and equation pair are returned in headers."""
    cacheable = seed is not None and eq is not None
    if eq is None:
        eq = random.randrange(len(combos))
    params = RenderParams(
        eq=eq,
        seed=seed,
        proj=proj,
        mode=mode,
        color=f"#{color}",
        bg=f"#{bg}",
        cmap=cmap,
        marker=marker,
        spot=spot,
        alpha=alpha,
        rotation=rotation,
        size=size,
    )

    start = time.perf_counter()
    try:
        png, used_seed = await request.app.state.renderer.render(params)
    except RendererBusy as e:
        raise HTTPException(status_code=503, detail="Renderer busy, try again later") from e
    except RenderTimeout as e:
        raise HTTPException(status_code=504, detail="Render timed out") from e
    duration = time.perf_counter() - start
    log.info("render %s seed=%d duration=%.2fs", params, used_seed, duration)

    return Response(
        content=png,
        media_type="image/png",
        headers={
            "X-Seed": str(used_seed),
            "X-Eq": str(eq),
            "Cache-Control": "public, max-age=31536000, immutable" if cacheable else "no-store",
        },
    )
