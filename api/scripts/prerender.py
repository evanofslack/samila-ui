"""Render the images the web app ships with, straight through the renderer.

    uv run python scripts/prerender.py           # equations.json, default, missing thumbnails,
                                                 # and gallery images whose entry changed
    uv run python scripts/prerender.py --force   # re-render every thumbnail and gallery image too
    uv run python scripts/prerender.py --check   # fail if equations.json or the gallery is stale

Renders run locally in a process pool, so the API's rate limits don't apply.
"""

import argparse
import hashlib
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
GALLERY_JSON = WEB / "lib" / "gallery.json"
GALLERY = IMAGES / "gallery"
# which gallery entry each image was rendered from, so changed entries re-render
GALLERY_STAMPS = GALLERY / "stamps.json"

DEFAULT_SIZE = 1400
# thumbnails render at the API's minimum and are scaled down, which smooths the points
THUMB_RENDER, THUMB_SIZE = 500, 240
THUMB_SEED = 4242
# light lines on the dark panel colour, a little denser than usual to read when small
THUMB_STYLE = {"color": "#dfe3ee", "bg": "#141a2a", "spot": 0.6, "alpha": 0.18}
# gallery images: the long side shown in the editor, and the grid's smaller copy
GALLERY_SIZE, GALLERY_SMALL = 1400, 480


def equations_json() -> str:
    data = {
        "functions": [{"id": i, "display": e.display} for i, e in enumerate(EQUATIONS)],
        "pairs": PAIRS,
    }
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def save_webp(png: bytes, path: Path, size: int, quality: int) -> None:
    """Save as webp with the long side at size, keeping transparency."""
    image = Image.open(io.BytesIO(png))
    image = image.convert("RGBA" if image.getextrema()[-1][0] < 255 else "RGB")
    if max(image.size) != size:
        scale = size / max(image.size)
        resized = (round(image.width * scale), round(image.height * scale))
        image = image.resize(resized, Image.Resampling.LANCZOS)
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
        width=DEFAULT_SIZE,
        height=DEFAULT_SIZE,
    )
    png = render(params).png
    save_webp(png, IMAGES / "default.webp", DEFAULT_SIZE, quality=88)


def render_thumb(eq: int) -> int:
    f1, f2 = PAIRS[eq]
    params = RenderParams(
        f1=f1, f2=f2, seed=THUMB_SEED, width=THUMB_RENDER, height=THUMB_RENDER, **THUMB_STYLE
    )
    png = render(params).png
    save_webp(png, THUMBS / f"v{eq}.webp", THUMB_SIZE, quality=80)
    return eq


def gallery_stamps() -> dict[str, str]:
    """A hash of each gallery entry, keyed by its index."""
    entries = json.loads(GALLERY_JSON.read_text())
    return {
        str(i): hashlib.sha256(json.dumps(e, sort_keys=True).encode()).hexdigest()[:16]
        for i, e in enumerate(entries)
    }


def render_gallery(item: tuple[int, dict]) -> int:
    i, e = item
    aspect = e["aspect"]
    width, height = (
        (GALLERY_SIZE, round(GALLERY_SIZE / aspect))
        if aspect >= 1
        else (round(GALLERY_SIZE * aspect), GALLERY_SIZE)
    )
    if e["fseed"] is not None:
        equations = {"fseed": e["fseed"]}
    else:
        equations = {"f1": e["f1"], "f2": e["f2"]}
    params = RenderParams(
        **equations,
        seed=e["seed"],
        start=e["start"],
        stop=e["stop"],
        step=e["step"],
        proj=e["proj"],
        mode=e["mode"],
        color=e["color"],
        bg=e["bg"],
        cmap=tuple(e["colors"]) if e["colors"] else e["cmap"],
        marker=e["marker"],
        spot=e["spot"],
        alpha=e["alpha"],
        linewidth=e["linewidth"],
        rotation=e["rotation"],
        width=width,
        height=height,
    )
    png = render(params).png
    save_webp(png, GALLERY / f"g{i}.webp", GALLERY_SIZE, quality=86)
    save_webp(png, GALLERY / f"g{i}-sm.webp", GALLERY_SMALL, quality=82)
    return i


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--check", action="store_true", help="only check equations.json")
    parser.add_argument("--force", action="store_true", help="re-render existing thumbnails")
    args = parser.parse_args()

    expected = equations_json()
    stamps = gallery_stamps()
    if args.check:
        if not EQUATIONS_JSON.exists() or EQUATIONS_JSON.read_text() != expected:
            print(f"{EQUATIONS_JSON} is out of date; run `just prerender`", file=sys.stderr)
            return 1
        rendered = json.loads(GALLERY_STAMPS.read_text()) if GALLERY_STAMPS.exists() else {}
        if rendered != stamps:
            print("gallery images are out of date; run `just prerender`", file=sys.stderr)
            return 1
        return 0

    EQUATIONS_JSON.write_text(expected)
    print(f"wrote {EQUATIONS_JSON.relative_to(API.parent)}")

    presets = json.loads(PRESETS.read_text())
    todo = [eq for eq in range(len(PAIRS)) if args.force or not (THUMBS / f"v{eq}.webp").exists()]
    entries = json.loads(GALLERY_JSON.read_text())
    rendered = json.loads(GALLERY_STAMPS.read_text()) if GALLERY_STAMPS.exists() else {}
    gallery_todo = [
        (i, e)
        for i, e in enumerate(entries)
        if args.force or rendered.get(str(i)) != stamps[str(i)]
    ]
    with ProcessPoolExecutor() as pool:
        default = pool.submit(render_default, presets["default"])
        for done, eq in enumerate(pool.map(render_thumb, todo), 1):
            print(f"\rthumbnails {done}/{len(todo)} (v{eq})", end="", flush=True)
        print()
        for done, i in enumerate(pool.map(render_gallery, gallery_todo), 1):
            print(f"\rgallery {done}/{len(gallery_todo)} (g{i})", end="", flush=True)
        default.result()
    # images of entries that no longer exist
    for path in GALLERY.glob("g*.webp"):
        if int(path.stem.removeprefix("g").removesuffix("-sm")) >= len(entries):
            path.unlink()
    GALLERY_STAMPS.write_text(json.dumps(stamps, indent=4) + "\n")
    print(f"\nwrote {len(todo)} thumbnails, {len(gallery_todo)} gallery images and the default")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
