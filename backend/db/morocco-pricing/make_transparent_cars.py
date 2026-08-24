#!/usr/bin/env python3
"""
Turn the white-background car photos into transparent PNGs.

Needed because the SIXT-style card puts the car over a gradient that is DARK at
the bottom. A plain `mix-blend-mode: multiply` would drag the white bodywork to
near-black down there, and `drop-shadow` would outline the image rectangle
instead of the car.

A naive "make white transparent" would also eat the white bodywork, so this
flood-fills inward from the border instead: only white that is *connected to the
edge* is removed, and enclosed white (the car itself) is kept.

  python3 make_transparent_cars.py <src_dir> <out_dir>
"""
import sys, os
from PIL import Image, ImageDraw, ImageFilter

# Tolerance is deliberately tight. At 34 the fill leaked through the soft edge
# where a white roof meets the white backdrop and punched holes in the car
# (visible as black patches once the dark card showed through). Lower is safer:
# leftover background fringe is far less visible than a hole in the bodywork.
TOLERANCE = 14
FEATHER = 0.6       # edge softening, in px


def make_transparent(src_path: str, out_path: str) -> tuple:
    im = Image.open(src_path).convert("RGB")
    w, h = im.size

    # 1px white frame so the fill can always reach round the subject
    canvas = Image.new("RGB", (w + 2, h + 2), (255, 255, 255))
    canvas.paste(im, (1, 1))

    # flood fill from all four corners; only edge-connected white goes
    marker = (255, 0, 255)
    for seed in [(0, 0), (canvas.width - 1, 0), (0, canvas.height - 1),
                 (canvas.width - 1, canvas.height - 1)]:
        ImageDraw.floodfill(canvas, seed, marker, thresh=TOLERANCE)

    # alpha = 0 wherever the marker landed
    filled = canvas.crop((1, 1, w + 1, h + 1))
    px = filled.load()
    alpha = Image.new("L", (w, h), 255)
    ap = alpha.load()
    removed = 0
    for y in range(h):
        for x in range(w):
            if px[x, y] == marker:
                ap[x, y] = 0
                removed += 1

    # The backdrop fades into the car through a few anti-aliased pixels. Flood
    # fill only clears the near-white ones, so a pale halo survives and shows up
    # as a white outline once the car sits on the dark card. Erode the mask by a
    # pixel to bite that fringe off, then feather what is left.
    alpha = alpha.filter(ImageFilter.MinFilter(3))
    if FEATHER:
        alpha = alpha.filter(ImageFilter.GaussianBlur(FEATHER))

    out = im.convert("RGBA")
    out.putalpha(alpha)

    # trim fully transparent margins so the car fills its box
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)

    out.save(out_path, "PNG", optimize=True)
    pct = removed / (w * h) * 100
    return out.size, pct


def main():
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        if not f.lower().endswith(".png") or f.startswith("_"):
            continue
        size, pct = make_transparent(os.path.join(src, f), os.path.join(dst, f))
        flag = "  <-- check" if pct < 25 or pct > 80 else ""
        print(f"  {f:34s} {size[0]}x{size[1]}  bg removed {pct:5.1f}%{flag}")


if __name__ == "__main__":
    main()
