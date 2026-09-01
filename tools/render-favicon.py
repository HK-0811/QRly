#!/usr/bin/env python3
"""
Regenerate frontend/src/app/favicon.ico from the QRly mark.

The mark lives in three places and this is the least authoritative of them:
components/chrome.tsx draws it for the app, app/icon.svg is what modern browsers
actually use, and this exists only because something still requests
/favicon.ico — feed readers, crawlers, pinned Windows shortcuts — and would
otherwise get a 404.

Run it if the accent ever changes:

    python tools/render-favicon.py

Why a script rather than a checked-in binary nobody can reproduce: the .ico is
generated art, and a committed 25KB blob with no recipe is how this project ended
up shipping the Next.js placeholder for four phases without anyone noticing.

An .ico carries no media query, so this is the light-scheme mark only. The dark
variant is in app/icon.svg, which is what a tab strip in dark mode will be using.
"""

from PIL import Image, ImageDraw

# Resolved from oklch(0.58 0.215 32); globals.css remains authoritative.
ACCENT = (0xDD, 0x2B, 0x09, 255)
INK = (0x0A, 0x0A, 0x0A, 255)

# Sizes Windows and browsers actually pick from.
SIZES = [16, 32, 48, 64, 128, 256]

OUT = "frontend/src/app/favicon.ico"


def render(n: int) -> Image.Image:
    """
    One square of the mark plus its two offsets, drawn back to front.

    Geometry is derived per size rather than scaled from a single master so every
    edge lands on a whole pixel. This design has zero radius and hard edges —
    downsampling a large master would soften exactly the thing that makes it
    look drawn rather than rendered.

    `pad + square + offset + pad == n` by construction, so the glyph is centred
    and nothing is clipped.
    """
    pad = max(1, round(n / 24))
    offset = round(6 * n / 24)
    square = n - 2 * pad - offset

    img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    def box(x: int, y: int, fill):
        d.rectangle([x, y, x + square - 1, y + square - 1], fill=fill)

    # Matches the box-shadow stack in Mark: a CSS shadow paints behind its
    # element, and the first shadow paints above the second.
    box(pad, pad + offset, INK)  # 0 offset 0 var(--rule-ink)
    box(pad + offset, pad, ACCENT)  # offset 0 0 var(--accent)
    box(pad, pad, INK)  # the element itself

    return img


def main() -> None:
    frames = [render(n) for n in SIZES]
    # Pillow writes every requested size into one .ico from the largest frame.
    frames[-1].save(OUT, format="ICO", sizes=[(n, n) for n in SIZES])
    print(f"wrote {OUT} with sizes {', '.join(str(n) for n in SIZES)}")


if __name__ == "__main__":
    main()
