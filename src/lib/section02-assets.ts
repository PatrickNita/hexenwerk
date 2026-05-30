export const SECTION02_LOG_FRAMES_VERSION = 1;
export const SECTION02_LOG_FRAME_MS = 150;
export const SECTION02_LOG_FRAME_SRCS = [1, 2, 3, 4, 5, 6, 7].map(
  (n) => `/assets/section02/log${n}.png?v=${SECTION02_LOG_FRAMES_VERSION}`,
);

export const SECTION02_LOG_CLIP_FRAMES_VERSION = 1;
export const SECTION02_LOG_CLIP_FRAME_SRCS = [1, 2, 3, 4, 5, 6, 7].map(
  (n) =>
    `/assets/section02/log-clip${n}.png?v=${SECTION02_LOG_CLIP_FRAMES_VERSION}`,
);

export const SECTION02_LOG_GLOW_MASK_VERSION = 1;
export const SECTION02_LOG_GLOW_MASK_SRCS = [1, 2, 3, 4, 5, 6, 7].map(
  (n) =>
    `/assets/section02/log-glow${n}.png?v=${SECTION02_LOG_GLOW_MASK_VERSION}`,
);

/** @deprecated Dual-mask clip URLs; glow CSS now uses SECTION02_LOG_GLOW_MASK_SRCS. */
export const SECTION02_LOG_GLOW_SHAPE_MASKS = SECTION02_LOG_CLIP_FRAME_SRCS;

export const SECTION02_LOG_MASK_VERSION = 4;
export const SECTION02_LOG_MASK_URL = `/assets/section02/log-mask.png?v=${SECTION02_LOG_MASK_VERSION}`;

export const SECTION02_CANDLE_FRAME_NUMBERS = [2, 3, 4] as const;

export const SECTION02_CANDLE_FRAMES_VERSION = 1;
export const SECTION02_CANDLE_FRAME_MS = SECTION02_LOG_FRAME_MS;
export const SECTION02_CANDLE_FRAME_SRCS = SECTION02_CANDLE_FRAME_NUMBERS.map(
  (n) =>
    `/assets/section02/candles${n}.png?v=${SECTION02_CANDLE_FRAMES_VERSION}`,
);

export const SECTION02_CANDLE_CLIP_FRAMES_VERSION = 2;
export const SECTION02_CANDLE_CLIP_FRAME_SRCS =
  SECTION02_CANDLE_FRAME_NUMBERS.map(
    (n) =>
      `/assets/section02/candles-clip${n}.png?v=${SECTION02_CANDLE_CLIP_FRAMES_VERSION}`,
  );

export const SECTION02_CANDLE_GLOW_MASK_VERSION = 1;
export const SECTION02_CANDLE_GLOW_MASK_SRCS =
  SECTION02_CANDLE_FRAME_NUMBERS.map(
    (n) =>
      `/assets/section02/candles-glow${n}.png?v=${SECTION02_CANDLE_GLOW_MASK_VERSION}`,
  );

/** @deprecated Dual-mask clip URLs; glow CSS now uses SECTION02_CANDLE_GLOW_MASK_SRCS. */
export const SECTION02_CANDLE_GLOW_SHAPE_MASKS =
  SECTION02_CANDLE_CLIP_FRAME_SRCS;

export const SECTION02_CANDLE_MASK_VERSION = 1;
export const SECTION02_CANDLE_MASK_URL = `/assets/section02/candles-mask.png?v=${SECTION02_CANDLE_MASK_VERSION}`;

export const SECTION02_PRODUCT_SRC = "/assets/section02/section02_product.png";

export const SECTION02_BG_SRC = "/assets/section02/section02.png";
export const SECTION02_LIGHTNING_SRC =
  "/assets/section02/lightning-witches.png";

export const SECTION02_PRELOAD_SRCS = [
  SECTION02_BG_SRC,
  SECTION02_PRODUCT_SRC,
  SECTION02_LIGHTNING_SRC,
] as const;

export { preloadImages } from "@/lib/preload-images";
