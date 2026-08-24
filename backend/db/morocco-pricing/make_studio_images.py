#!/usr/bin/env python3
"""
Bake a SIXT-style grey studio backdrop into each car photo.

SIXT's card has NO CSS background — the grey sweep is part of their car image.
Our source photos are cut-outs on plain white, so a CSS gradient behind them
could never match. This composites the car onto a real studio backdrop:

  * elliptical light pool behind/under the car
  * darker vignette toward the corners
  * soft contact shadow under the wheels

The white pixels of the source are removed by multiplying it over the backdrop,
which is exactly what `mix-blend-mode: multiply` did in CSS — only now it is
baked in at full resolution, so the card just shows the image.

  python3 make_studio_images.py <src_dir> <out_dir>
"""
import sys, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops

W, H = 1000, 620          # card-friendly
CORNER_RGB = (72, 78, 84)  # darkest corner
MID_RGB    = (137, 143, 149)
LIGHT_RGB  = (219, 223, 227)  # centre of the light pool


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def build_backdrop() -> Image.Image:
    """Vertical base sweep + elliptical light pool + corner vignette."""
    base = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(base)

    # vertical sweep: dark top -> mid -> slightly darker bottom (a 'floor')
    for y in range(H):
        t = y / (H - 1)
        if t < 0.55:
            c = lerp(CORNER_RGB, MID_RGB, t / 0.55)
        else:
            c = lerp(MID_RGB, lerp(CORNER_RGB, MID_RGB, 0.45), (t - 0.55) / 0.45)
        d.line([(0, y), (W, y)], fill=c)

    # elliptical light pool centred slightly below the middle
    pool = Image.new("L", (W, H), 0)
    pd = ImageDraw.Draw(pool)
    cx, cy = W * 0.52, H * 0.58
    rx, ry = W * 0.46, H * 0.42
    steps = 60
    for i in range(steps, 0, -1):
        f = i / steps
        pd.ellipse(
            [cx - rx * f, cy - ry * f, cx + rx * f, cy + ry * f],
            fill=int(255 * (1 - f) ** 1.5),
        )
    pool = pool.filter(ImageFilter.GaussianBlur(W * 0.07))

    light = Image.new("RGB", (W, H), LIGHT_RGB)
    base = Image.composite(light, base, pool)

    # gentle corner vignette so edges stay dark like the reference
    vig = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse([-W * 0.15, -H * 0.30, W * 1.15, H * 1.30], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(W * 0.10))
    dark = Image.new("RGB", (W, H), CORNER_RGB)
    base = Image.composite(base, dark, vig)

    return base.filter(ImageFilter.GaussianBlur(1.2))


def compose(car_path: str, out_path: str, backdrop: Image.Image):
    car = Image.open(car_path).convert("RGB")

    # fit the car into the frame, leaving margin
    box_w, box_h = int(W * 0.88), int(H * 0.74)
    car.thumbnail((box_w, box_h), Image.LANCZOS)

    layer = Image.new("RGB", (W, H), (255, 255, 255))
    x = (W - car.width) // 2
    y = int(H * 0.60) - car.height // 2      # sit slightly below centre
    layer.paste(car, (x, y))

    # multiply: white drops out, the car keeps its own tones
    out = ImageChops.multiply(backdrop, layer)

    # soft contact shadow beneath the car
    sh = Image.new("L", (W, H), 0)
    sd = ImageDraw.Draw(sh)
    ell_y = y + car.height - int(car.height * 0.06)
    sd.ellipse(
        [x + car.width * 0.10, ell_y - car.height * 0.05,
         x + car.width * 0.90, ell_y + car.height * 0.10],
        fill=110,
    )
    sh = sh.filter(ImageFilter.GaussianBlur(W * 0.022))
    shadow = Image.new("RGB", (W, H), (40, 44, 49))
    out = Image.composite(shadow, out, sh.point(lambda p: int(p * 0.55)))
    # re-paste the car so the shadow never sits on top of the body
    out.paste(ImageChops.multiply(out.crop((x, y, x + car.width, y + car.height)),
                                  car), (x, y))

    out.save(out_path, "PNG", optimize=True)
    return out_path


def main():
    src, dst = sys.argv[1], sys.argv[2]
    os.makedirs(dst, exist_ok=True)
    backdrop = build_backdrop()
    backdrop.save(os.path.join(dst, "_backdrop_preview.png"))
    n = 0
    for f in sorted(os.listdir(src)):
        if not f.lower().endswith(".png") or f.startswith("_"):
            continue
        compose(os.path.join(src, f), os.path.join(dst, f), backdrop)
        n += 1
        print("  ", f)
    print(f"composed {n} images -> {dst}")


if __name__ == "__main__":
    main()
