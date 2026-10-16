# Turns a generated patent plate (ink on paper + one orange accent) into the site's
# light/dark pair: <name>-light.webp re-balanced to the page tone, and <name>-dark.webp
# with the neutral ink inverted onto near-black while the orange stays exactly as it is.
#
# Usage: python scripts/plates.py <source.png> <name>   ->  assets/img/<name>-{light,dark}.webp
# Needs Pillow and NumPy.
import sys
from pathlib import Path

import numpy as np
from PIL import Image

PAPER = np.array([240, 236, 228], dtype=float)  # light theme plate tone
DARK_PAPER = 12.0                               # dark theme plate tone
SIZE = (800, 1000)                              # 4:5, like every other plate


def main(src: str, name: str) -> None:
    img = Image.open(src).convert('RGB').resize(SIZE, Image.LANCZOS)
    raw = np.asarray(img).astype(float)

    # Light: scale each channel so the paper lands on the page tone; ink stays black.
    paper = np.median(raw.reshape(-1, 3), axis=0)
    light = np.clip(raw * (PAPER / paper), 0, 255)

    # Dark: neutral ink -> light hairlines on near-black; keep the orange spot colour.
    lum = light @ np.array([0.299, 0.587, 0.114])
    neutral = np.clip(DARK_PAPER + 0.85 * (np.median(lum) - lum), 0, 255)
    orange = np.clip((light[..., 0] - light[..., 2] - 40) / 60, 0, 1)[..., None]
    dark = orange * light + (1 - orange) * neutral[..., None]

    out = Path(__file__).resolve().parent.parent / 'assets' / 'img'
    for suffix, arr in (('light', light), ('dark', dark)):
        path = out / f'{name}-{suffix}.webp'
        Image.fromarray(arr.round().astype(np.uint8)).save(path, 'WEBP', quality=80, method=6)
        print(path)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__ or 'usage: plates.py <source.png> <name>')
    main(sys.argv[1], sys.argv[2])
