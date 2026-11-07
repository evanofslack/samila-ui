from typing import Callable, Optional, Tuple

import matplotlib.colors as colors
import matplotlib.pyplot as plt
from app.equations import combos
from fastapi import APIRouter, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from samila import GenerativeImage
from samila.functions import save_fig_buf
from samila.params import VALID_COLORS, Projection

router = APIRouter(
    tags=["image"],
)


def handle_eq(eq: int) -> Tuple[Optional[Callable], Optional[Callable]]:
    f1, f2 = None, None
    if eq != None:
        try:
            f1, f2 = combos[eq]

        except IndexError:  # Out of range of defined combos
            pass
    return f1, f2


def handle_proj(proj: str) -> Optional[str]:
    p = None
    if proj != None:
        for x in Projection:
            if proj.lower() == x.value:
                p = x
                break
        else:
            print("projection not found")
    return p


def handle_color(color: str) -> Optional[str | Tuple[float, float, float]]:
    c = None
    if color != None:
        if isinstance(color, str) and color in VALID_COLORS:
            c = color
        elif isinstance(color, str):
            try:
                c = colors.hex2color(f"#{color}")  # Add '#' to create valid hexcode
            except Exception as e:
                print(e)
                print(f"{color} is an invalid color")
    return c


def handle_spot_size(spot_size: float) -> Optional[float]:
    spot = None
    if spot_size != None and spot_size <= 1.0 and spot_size >= 0.0:
        spot = spot_size
    return spot


def handle_seed(seed: str) -> Optional[str]:
    s = None
    if seed != None:
        s = seed
    return s


def handle_text(g: GenerativeImage, text: str) -> None:
    if text != None:
        plt.text(
            0.05,
            0.9,
            text,
            color="white",
            fontsize=48,
            transform=g.fig.transFigure,
            fontweight=700,
            fontstretch=100,
            fontfamily="montserrat",
        )


def create_image(
    f1: Optional[Callable],
    f2: Optional[Callable],
    proj: Optional[str],
    color: Optional[str | Tuple[float, float, float]],
    bg: Optional[str | Tuple[float, float, float]],
    spot: Optional[float],
    seed: Optional[str],
) -> GenerativeImage:
    g = GenerativeImage(f1, f2)
    g.generate(seed=seed)
    g.plot(projection=proj, color=color, bgcolor=bg, spot_size=spot)
    return g


def write_image(g: GenerativeImage):
    resp = save_fig_buf(g.fig)
    if not resp["status"]:
        print("Could not save image to buffer")
        return None
    buffer = resp["buffer"]
    buffer.seek(0)
    return buffer


@router.get("/image", responses={200: {"content": {"image/png": {}}}})
async def generative_image(
    eq: int | None = None,
    proj: str | None = None,
    color: str | None = None,
    bg: str | None = None,
    spot: float | None = None,
    seed: int | None = None,
):
    """
    Generate image with Samila

    """

    print(eq, proj, color, bg, seed)

    f1, f2 = handle_eq(eq)  # Equations
    p = handle_proj(proj)  # Projection
    c = handle_color(color)  # Line Color
    b = handle_color(bg)  # Background Color
    ss = handle_spot_size(spot)  # Spot Size
    s = handle_seed(seed)  # Seed
    g = create_image(f1, f2, p, c, b, ss, s)  # Generate Image
    buffer = write_image(g)  # Write image to buffer
    headers = {"X-Seed": str(g.seed)}  # Add seed as header

    return StreamingResponse(content=buffer, headers=headers, media_type="image/png")
