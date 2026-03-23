#!/usr/bin/env python3

import sys
from pathlib import Path
from HersheyFonts import HersheyFonts
import fitz


HERSHEY_EM = 21.0

hf = HersheyFonts()
hf.load_default_font("futural")


def strokes_to_paths(strokes, x_offset, y_offset, scale):
    paths = []
    for stroke in strokes:
        if len(stroke) < 2:
            continue
        pts = [(x_offset + p[0] * scale, y_offset + p[1] * scale) for p in stroke]
        d = "M " + " L ".join(f"{x:.3f},{y:.3f}" for x, y in pts)
        paths.append(d)
    return paths


def pdf_to_singleline_svg(pdf_path: str, stroke_color: str = "#000000", stroke_width: float = 1.0) -> str:
    doc = fitz.open(pdf_path)
    page = doc[0]
    page_width = page.rect.width
    page_height = page.rect.height

    all_paths = []

    blocks = page.get_text("dict")["blocks"]
    for block in blocks:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                text = span["text"].strip()
                if not text:
                    continue
                size = span["size"]
                x, y = span["origin"]
                scale = size / HERSHEY_EM
                strokes = list(hf.strokes_for_text(text))
                paths = strokes_to_paths(strokes, x, y, scale)
                all_paths.extend(paths)

    doc.close()

    path_elements = "\n  ".join(
        f'<path d="{d}" fill="none" stroke="{stroke_color}" stroke-width="{stroke_width}" stroke-linecap="round" stroke-linejoin="round"/>'
        for d in all_paths
    )

    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{page_width:.2f}" height="{page_height:.2f}" viewBox="0 0 {page_width:.2f} {page_height:.2f}">
  {path_elements}
</svg>"""

    return svg


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 pdf_to_singleline.py input.pdf")
        sys.exit(1)

    pdf_path = sys.argv[1]
    stroke_color = "#000000"
    stroke_width = 1.0

    if "--stroke-color" in sys.argv:
        i = sys.argv.index("--stroke-color")
        stroke_color = sys.argv[i + 1]
    if "--stroke-width" in sys.argv:
        i = sys.argv.index("--stroke-width")
        stroke_width = float(sys.argv[i + 1])

    svg = pdf_to_singleline_svg(pdf_path, stroke_color=stroke_color, stroke_width=stroke_width)

    out = Path(pdf_path).with_stem(Path(pdf_path).stem + "_singleline").with_suffix(".svg")
    out.write_text(svg, encoding="utf-8")
    print(f"done -> {out}")