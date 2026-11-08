"""The samila config for an image, which GenerativeImage(config=...) loads back in Python."""

import matplotlib
import matplotlib.colors
from samila import GenerateMode, Marker, Projection
from samila import __version__ as SAMILA_VERSION
from samila.functions import filter_cmap, filter_color, get_python_version

from app.equations import EQUATIONS, random_equations
from app.render import FIGURE_INCHES, RenderParams, _colormap

# samila draws at matplotlib's default 100 dpi, so a depth of 1 is 1000 pixels
SAMILA_PIXELS = FIGURE_INCHES * 100


def samila_config(params: RenderParams) -> dict:
    """samila's config format, plus the lines that render it, for an image with a seed."""
    assert params.seed is not None
    if params.fseed is not None:
        f1, f2 = random_equations(params.fseed)
    else:
        f1, f2 = EQUATIONS[params.f1].expr, EQUATIONS[params.f2].expr
    gradient = params.cmap is not None
    color, bg = filter_color(params.color, params.bg)
    # samila stores a colormap as its list of colours
    cmap = filter_cmap(_colormap(params.cmap) if gradient else "viridis")
    long_side = max(params.width, params.height)

    plot_args = []
    if gradient:
        # each point is coloured by its value; configs don't store that, so it's passed in
        plot_args.append("color=g.data1")
    if params.width != params.height:
        inches = (
            round(params.width / long_side * FIGURE_INCHES, 4),
            round(params.height / long_side * FIGURE_INCHES, 4),
        )
        plot_args.append(f"size={inches}")

    return {
        "f1": f1,
        "f2": f2,
        "generate": {
            "seed": params.seed,
            "start": params.start,
            "step": params.step,
            "stop": params.stop,
            "mode": GenerateMode(params.mode).value,
        },
        "plot": {
            "color": color,
            "bgcolor": bg,
            "cmap": [matplotlib.colors.to_hex(c) for c in cmap.colors],
            "spot_size": params.spot,
            "projection": Projection(params.proj).value,
            "marker": Marker[params.marker.upper()].value,
            "alpha": params.alpha,
            "linewidth": params.linewidth,
            "depth": long_side / SAMILA_PIXELS,
            "rotation": params.rotation,
        },
        "matplotlib_version": matplotlib.__version__,
        "python_version": get_python_version(),
        "__version__": SAMILA_VERSION,
        # not part of samila's format, which ignores it
        "usage": [
            "from samila import GenerativeImage",
            "g = GenerativeImage(config=open('config.json'))",
            "g.generate()",
            f"g.plot({', '.join(plot_args)})",
            "g.save_image('samila.png')",
        ],
    }
