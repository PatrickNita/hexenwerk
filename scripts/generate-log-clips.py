"""Bake log clip alpha × luminance mask into single glow mask PNGs for iOS WebKit."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets" / "section02"
LOG_FRAMES = range(1, 8)
LUMINANCE_MASK = ASSETS / "log-mask.png"


def composite_glow_mask(clip_path: Path, luminance_path: Path, output_path: Path) -> None:
    clip = Image.open(clip_path).convert("RGBA")
    luminance = Image.open(luminance_path).convert("L")

    if luminance.size != clip.size:
        luminance = luminance.resize(clip.size, Image.Resampling.LANCZOS)

    clip_alpha = clip.getchannel("A")
    out_alpha = ImageChops.multiply(clip_alpha, luminance)

    output = Image.new("RGBA", clip.size, (255, 255, 255, 0))
    output.putalpha(out_alpha)
    output.save(output_path, optimize=True)
    print(f"wrote {output_path.relative_to(ROOT)}")


def main() -> None:
    if not LUMINANCE_MASK.is_file():
        raise SystemExit(f"missing luminance mask: {LUMINANCE_MASK}")

    for frame in LOG_FRAMES:
        clip_path = ASSETS / f"log-clip{frame}.png"
        output_path = ASSETS / f"log-glow{frame}.png"
        if not clip_path.is_file():
            raise SystemExit(f"missing clip: {clip_path}")
        composite_glow_mask(clip_path, LUMINANCE_MASK, output_path)


if __name__ == "__main__":
    main()
