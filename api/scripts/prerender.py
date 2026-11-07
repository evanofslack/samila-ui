"""Render the images the web app ships with, straight through the renderer.

    uv run python scripts/prerender.py           # equations.json, default, missing thumbnails
    uv run python scripts/prerender.py --force   # re-render every thumbnail too
    uv run python scripts/prerender.py --check   # fail if equations.json is out of date

Renders run locally in a process pool, so the API's rate limits don't apply.
"""

import argparse
import io
import json
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

API = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(API))

from PIL import Image  # noqa: E402

from app.equations import EQUATIONS, PAIRS  # noqa: E402
from app.render import RenderParams, render  # noqa: E402

WEB = API.parent / "web"
PRESETS = WEB / "lib" / "presets.json"
EQUATIONS_JSON = WEB / "lib" / "equations.json"
IMAGES = WEB / "public" / "images"
THUMBS = IMAGES / "thumbs"

DEFAULT_SIZE = 1400
# thumbnails render at the API's minimum and are scaled down, which smooths the points
THUMB_RENDER, THUMB_SIZE = 500, 240
THUMB_SEED = 4242
# light lines on the dark panel colour, a little denser than usual to read when small
THUMB_STYLE = {"color": "#dfe3ee", "bg": "#141a2a", "spot": 0.6, "alpha": 0.18}


def equations_json() -> str:
    data = {
        "functions": [{"id": i, "display": e.display} for i, e in enumerate(EQUATIONS)],
        "pairs": PAIRS,
    }
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def save_webp(png: bytes, path: Path, size: int, quality: int) -> None:
    image = Image.open(io.BytesIO(png)).convert("RGB")
    if image.width != size:
        image = image.resize((size, size), Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "WEBP", quality=quality, method=6)


def render_default(preset: dict) -> None:
    f1, f2 = PAIRS[preset["eq"]]
    params = RenderParams(
        f1=f1,
        f2=f2,
        seed=preset["seed"],
        proj=preset["proj"],
        mode=preset["mode"],
        color=preset["color"],
        bg=preset["bg"],
        cmap=preset["cmap"],
        marker=preset["marker"],
        spot=preset["spot"],
        alpha=preset["alpha"],
        rotation=preset["rotation"],
        size=DEFAULT_SIZE,
    )
    png, _ = render(params)
    save_webp(png, IMAGES / "default.webp", DEFAULT_SIZE, quality=88)


def render_thumb(eq: int) -> int:
    f1, f2 = PAIRS[eq]
    params = RenderParams(f1=f1, f2=f2, seed=THUMB_SEED, size=THUMB_RENDER, **THUMB_STYLE)
    png, _ = render(params)
    save_webp(png, THUMBS / f"v{eq}.webp", THUMB_SIZE, quality=80)
    return eq


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--check", action="store_true", help="only check equations.json")
    parser.add_argument("--force", action="store_true", help="re-render existing thumbnails")
    args = parser.parse_args()

    expected = equations_json()
    if args.check:
        if not EQUATIONS_JSON.exists() or EQUATIONS_JSON.read_text() != expected:
            print(f"{EQUATIONS_JSON} is out of date; run `just prerender`", file=sys.stderr)
            return 1
        return 0

    EQUATIONS_JSON.write_text(expected)
    print(f"wrote {EQUATIONS_JSON.relative_to(API.parent)}")

    presets = json.loads(PRESETS.read_text())
    todo = [eq for eq in range(len(PAIRS)) if args.force or not (THUMBS / f"v{eq}.webp").exists()]
    with ProcessPoolExecutor() as pool:
        default = pool.submit(render_default, presets["default"])
        for done, eq in enumerate(pool.map(render_thumb, todo), 1):
            print(f"\rthumbnails {done}/{len(todo)} (v{eq})", end="", flush=True)
        default.result()
    print(f"\nwrote {len(todo)} thumbnails and the default image")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
