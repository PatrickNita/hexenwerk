import {
  getSection02CandleGlowMaskImage,
  getSection02CandleSpriteImage,
  getSection02LogGlowMaskImage,
  getSection02LogSpriteImage,
} from "@/lib/section02-frame-cache";
import { SECTION02_CANDLE_FRAME_NUMBERS } from "@/lib/section02-assets";

export type Section02FireFrameParams = {
  logIndex: number;
  candleIndex: number;
  glowColor: string;
  width: number;
  height: number;
};

let glowBuffer: HTMLCanvasElement | null = null;
let glowBufferCtx: CanvasRenderingContext2D | null = null;

function getGlowBuffer(width: number, height: number): CanvasRenderingContext2D {
  if (!glowBuffer) {
    glowBuffer = document.createElement("canvas");
  }

  if (glowBuffer.width !== width || glowBuffer.height !== height) {
    glowBuffer.width = width;
    glowBuffer.height = height;
  }

  if (!glowBufferCtx) {
    glowBufferCtx = glowBuffer.getContext("2d");
  }

  if (!glowBufferCtx) {
    throw new Error("Failed to create section 02 glow buffer context.");
  }

  return glowBufferCtx;
}

function drawCoverFill(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  ctx.drawImage(image, 0, 0, width, height);
}

function drawDarkenGlow(
  ctx: CanvasRenderingContext2D,
  mask: HTMLImageElement,
  color: string,
  width: number,
  height: number,
) {
  const bufferCtx = getGlowBuffer(width, height);

  bufferCtx.clearRect(0, 0, width, height);
  bufferCtx.globalCompositeOperation = "source-over";
  bufferCtx.fillStyle = color;
  bufferCtx.fillRect(0, 0, width, height);
  bufferCtx.globalCompositeOperation = "destination-in";
  bufferCtx.drawImage(mask, 0, 0, width, height);

  ctx.save();
  ctx.globalCompositeOperation = "darken";
  ctx.drawImage(glowBuffer!, 0, 0, width, height);
  ctx.restore();
}

export function renderSection02FireFrame(
  ctx: CanvasRenderingContext2D,
  params: Section02FireFrameParams,
) {
  const { logIndex, candleIndex, glowColor, width, height } = params;

  if (width <= 0 || height <= 0) {
    return;
  }

  ctx.clearRect(0, 0, width, height);

  const logSprite = getSection02LogSpriteImage(logIndex);
  const logGlowMask = getSection02LogGlowMaskImage(logIndex + 1);
  const candleSprite = getSection02CandleSpriteImage(candleIndex);
  const candleFrameNumber = SECTION02_CANDLE_FRAME_NUMBERS[candleIndex];
  const candleGlowMask =
    candleFrameNumber !== undefined
      ? getSection02CandleGlowMaskImage(candleFrameNumber)
      : undefined;

  if (logSprite) {
    drawCoverFill(ctx, logSprite, width, height);
  }

  if (logGlowMask && glowColor) {
    drawDarkenGlow(ctx, logGlowMask, glowColor, width, height);
  }

  if (candleSprite) {
    drawCoverFill(ctx, candleSprite, width, height);
  }

  if (candleGlowMask && glowColor) {
    drawDarkenGlow(ctx, candleGlowMask, glowColor, width, height);
  }
}
