"""Rebuild the engraving as SVG paths from the owner-provided reference.

uv run --with pillow --with numpy --with opencv-python-headless --with vtracer \
    python scripts/art/vectorize.py /path/to/reference.png
bunx svgo --input public/fun/art-recreation/engraving.svg \
    --output public/fun/art-recreation/engraving.svg

The reference is a 960 × 767 engraving. Remove its printed flame before tracing;
the page draws and animates a separate flame. The output contains no bitmap.
Python packages are build tools only, not website dependencies.
"""

import argparse
import re
import tempfile
from pathlib import Path

import cv2
import numpy as np
import vtracer
from PIL import Image, ImageDraw


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("reference", type=Path)
    args = parser.parse_args()
    image = Image.open(args.reference).convert("RGB")
    if image.size != (960, 767):
        parser.error("The reference must be 960 × 767 pixels.")

    # Follow the flame rather than painting over the finger and candle around it.
    mask = Image.new("L", image.size)
    ImageDraw.Draw(mask).polygon(
        [(470, 261), (492, 258), (489, 282), (496, 304), (504, 329),
         (506, 350), (501, 374), (488, 394), (463, 394), (450, 375),
         (444, 352), (446, 324), (451, 299), (457, 280)],
        fill=255,
    )
    restored = cv2.inpaint(np.array(image), np.array(mask), 5, cv2.INPAINT_TELEA)
    # Trace at double resolution so subpixel lines survive the curve fitting.
    luminance = Image.fromarray(restored).convert("L").resize(
        (1920, 1534), Image.Resampling.LANCZOS,
    )
    plate = Image.fromarray(np.where(np.array(luminance) < 130, 0, 255).astype("uint8"))
    destination = Path(__file__).resolve().parents[2] / "public/fun/art-recreation"
    destination.mkdir(parents=True, exist_ok=True)
    output = destination / "engraving.svg"
    with tempfile.TemporaryDirectory() as temporary:
        prepared = Path(temporary) / "plate.png"
        plate.save(prepared)
        vtracer.convert_image_to_svg_py(
            str(prepared), str(output), colormode="binary",
            mode="spline", filter_speckle=2,
            corner_threshold=60, length_threshold=2,
            max_iterations=10, splice_threshold=45, path_precision=1,
        )
    svg = output.read_text()
    svg = re.sub(r"<\?xml[^>]*>\s*|<!--.*?-->\s*", "", svg, flags=re.DOTALL)
    svg = svg.replace(
        '<svg ', '<svg viewBox="0 0 1920 1534" ', 1,
    )
    svg = svg.replace('fill="#000000"', 'fill="#29251c"')
    svg = svg.replace(
        '<path', '<rect width="1920" height="1534" fill="#d3c7a9"/><path', 1,
    )
    output.write_text(
        '<!-- SVG linework traced from the owner-provided engraving. No raster content. -->\n'
        + svg.strip() + "\n"
    )
    print(f"Created {output.relative_to(destination.parents[2])}: {output.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
