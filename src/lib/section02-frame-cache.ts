import {
  SECTION02_CANDLE_FRAME_NUMBERS,
  SECTION02_CANDLE_FRAME_SRCS,
  SECTION02_CANDLE_GLOW_MASK_SRCS,
  SECTION02_LOG_FRAME_SRCS,
  SECTION02_LOG_GLOW_MASK_SRCS,
} from "@/lib/section02-assets";

const PRELOAD_CONCURRENCY = 8;

type CachedFrame = {
  image: HTMLImageElement;
  blobUrl: string;
};

const frameCache = new Map<string, CachedFrame>();
let preloadPromise: Promise<void> | null = null;
let framesReady = false;

async function loadAndDecodeFrame(src: string, key: string): Promise<void> {
  if (frameCache.has(key)) {
    return;
  }

  let blobUrl = src;

  try {
    const response = await fetch(src);
    if (response.ok) {
      const blob = await response.blob();
      blobUrl = URL.createObjectURL(blob);
    }
  } catch {
    // Fall back to the HTTP URL when fetch fails (e.g. offline before preload).
  }

  const img = new window.Image();
  img.src = blobUrl;

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });

  try {
    await img.decode();
  } catch {
    // Ignore decode errors for missing or slow frames.
  }

  frameCache.set(key, { image: img, blobUrl });
}

async function runWithConcurrency(
  tasks: Array<() => Promise<void>>,
  concurrency: number,
): Promise<void> {
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const taskIndex = index;
      index += 1;
      await tasks[taskIndex]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()),
  );
}

export function preloadSection02Frames(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (framesReady) {
    return Promise.resolve();
  }

  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = (async () => {
    const tasks: Array<() => Promise<void>> = [];

    SECTION02_LOG_FRAME_SRCS.forEach((src, index) => {
      tasks.push(() => loadAndDecodeFrame(src, `log:${index}`));
    });

    SECTION02_LOG_GLOW_MASK_SRCS.forEach((src, index) => {
      tasks.push(() => loadAndDecodeFrame(src, `log-glow:${index + 1}`));
    });

    SECTION02_CANDLE_FRAME_SRCS.forEach((src, index) => {
      tasks.push(() => loadAndDecodeFrame(src, `candle:${index}`));
    });

    SECTION02_CANDLE_GLOW_MASK_SRCS.forEach((src, index) => {
      const frameNumber = SECTION02_CANDLE_FRAME_NUMBERS[index];
      tasks.push(() => loadAndDecodeFrame(src, `candle-glow:${frameNumber}`));
    });

    await runWithConcurrency(tasks, PRELOAD_CONCURRENCY);
    framesReady = true;
  })();

  return preloadPromise;
}

export function isSection02FramesReady(): boolean {
  return framesReady;
}

function getBlobUrl(key: string, fallback: string): string {
  return frameCache.get(key)?.blobUrl ?? fallback;
}

function getCachedImage(key: string): HTMLImageElement | undefined {
  return frameCache.get(key)?.image;
}

export function getSection02LogSpriteImage(
  index: number,
): HTMLImageElement | undefined {
  return getCachedImage(`log:${index}`);
}

export function getSection02LogGlowMaskImage(
  frame: number,
): HTMLImageElement | undefined {
  return getCachedImage(`log-glow:${frame}`);
}

export function getSection02CandleSpriteImage(
  index: number,
): HTMLImageElement | undefined {
  return getCachedImage(`candle:${index}`);
}

export function getSection02CandleGlowMaskImage(
  frame: number,
): HTMLImageElement | undefined {
  return getCachedImage(`candle-glow:${frame}`);
}

export function getSection02LogSpriteBlobUrl(index: number): string {
  return getBlobUrl(`log:${index}`, SECTION02_LOG_FRAME_SRCS[index] ?? "");
}

export function getSection02LogGlowMaskBlobUrl(frame: number): string {
  return getBlobUrl(
    `log-glow:${frame}`,
    SECTION02_LOG_GLOW_MASK_SRCS[frame - 1] ?? "",
  );
}

export function getSection02CandleSpriteBlobUrl(index: number): string {
  return getBlobUrl(`candle:${index}`, SECTION02_CANDLE_FRAME_SRCS[index] ?? "");
}

export function getSection02CandleGlowMaskBlobUrl(frame: number): string {
  const index = SECTION02_CANDLE_FRAME_NUMBERS.indexOf(
    frame as (typeof SECTION02_CANDLE_FRAME_NUMBERS)[number],
  );

  return getBlobUrl(
    `candle-glow:${frame}`,
    index >= 0 ? SECTION02_CANDLE_GLOW_MASK_SRCS[index] : "",
  );
}
