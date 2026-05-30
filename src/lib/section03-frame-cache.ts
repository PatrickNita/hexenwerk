import {
  SECTION03_FRAME_COUNT,
  SECTION03_LINE_IDS,
  getSection03FrameSrc,
} from "@/lib/section03-assets";

const PRELOAD_CONCURRENCY = 8;

const frameCache = new Map<string, HTMLImageElement>();
let preloadPromise: Promise<void> | null = null;
let framesReady = false;

function cacheKey(lineId: string, frame: number): string {
  return `${lineId}:${frame}`;
}

async function loadAndDecodeFrame(
  lineId: string,
  frame: number,
): Promise<void> {
  const key = cacheKey(lineId, frame);

  if (frameCache.has(key)) {
    return;
  }

  const img = new window.Image();
  img.src = getSection03FrameSrc(lineId, frame);

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });

  try {
    await img.decode();
  } catch {
    // Ignore decode errors for missing or slow frames.
  }

  frameCache.set(key, img);
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

export function preloadSection03Frames(): Promise<void> {
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

    for (const lineId of SECTION03_LINE_IDS) {
      for (let frame = 1; frame <= SECTION03_FRAME_COUNT; frame += 1) {
        tasks.push(() => loadAndDecodeFrame(lineId, frame));
      }
    }

    await runWithConcurrency(tasks, PRELOAD_CONCURRENCY);
    framesReady = true;
  })();

  return preloadPromise;
}

export function isSection03FramesReady(): boolean {
  return framesReady;
}

export function getSection03FrameImage(
  lineId: string,
  frame: number,
): HTMLImageElement | undefined {
  return frameCache.get(cacheKey(lineId, frame));
}
