export type SpawnPoint = {
  x: number;
  y: number;
};

const SAMPLE_STEP = 2;
const TOP_BAND_PX = 14;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function isCandlePixel(_r: number, _g: number, _b: number, a: number) {
  // Candle layers are black silhouettes with alpha only (RGB ≈ 0).
  return a > 64;
}

export async function buildCandleSpawnPoints(
  src: string,
  width: number,
  height: number,
): Promise<SpawnPoint[]> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return [];
  }

  ctx.drawImage(img, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height).data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y += SAMPLE_STEP) {
    for (let x = 0; x < width; x += SAMPLE_STEP) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (!isCandlePixel(r, g, b, a)) {
        continue;
      }

      found = true;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (!found) {
    return [];
  }

  const centerX = (minX + maxX) / 2;
  const topBandMaxY = minY + TOP_BAND_PX;
  const topPoints: SpawnPoint[] = [];

  for (let y = minY; y <= topBandMaxY; y += SAMPLE_STEP) {
    for (let x = minX; x <= maxX; x += SAMPLE_STEP) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (isCandlePixel(r, g, b, a)) {
        topPoints.push({ x, y });
      }
    }
  }

  if (topPoints.length === 0) {
    return [{ x: centerX, y: minY }];
  }

  const avgX =
    topPoints.reduce((sum, point) => sum + point.x, 0) / topPoints.length;
  const avgY =
    topPoints.reduce((sum, point) => sum + point.y, 0) / topPoints.length;

  return [
    { x: avgX, y: avgY },
    { x: avgX - 2, y: avgY - 1 },
    { x: avgX + 2, y: avgY - 1 },
  ];
}

export async function loadAllCandleSpawnPoints(
  sources: readonly string[],
  width: number,
  height: number,
): Promise<SpawnPoint[]> {
  const batches = await Promise.all(
    sources.map((src) => buildCandleSpawnPoints(src, width, height)),
  );

  return batches.flat();
}
