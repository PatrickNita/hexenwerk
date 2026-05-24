"use client";

import { useEffect, useRef, useState } from "react";
import { useCursorTheme } from "@/components/cursor-provider";
import { getGlowEmberColor } from "@/lib/fire-glow";
import { opacityForEmberAge, pickFireColor } from "@/lib/fire-embers";
import { SECTION02_LOG_MASK_URL } from "@/lib/section02-assets";

type SpawnPoint = {
  x: number;
  y: number;
};

type Particle = {
  kind: "ember" | "smoke";
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  born: number;
  life: number;
  peakOpacity: number;
};

type MaskBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

const LOG_SRC = "/assets/section02/log.png";
const MASK_SAMPLE_STEP = 2;
const MAX_SPAWN_POINTS = 1400;
const EMBER_LIFE_MIN = 650;
const EMBER_LIFE_MAX = 950;
const SMOKE_LIFE_MIN = 1200;
const SMOKE_LIFE_MAX = 2200;
const SMOKE_PEAK_OPACITY = 0.4;
const EMBER_BURST_BOOST = 1.15;
const EMBER_BURST_MS = 120;

const SMOKE_COLORS = ["#d8d8d8", "#e4e4e4", "#cccccc", "#b8b8b8"];

const LOG_MASK_STYLE = {
  ["--statement-log-mask" as string]: `url("${SECTION02_LOG_MASK_URL}")`,
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pickSmokeColor() {
  return SMOKE_COLORS[Math.floor(Math.random() * SMOKE_COLORS.length)];
}

function isLogStrokePixel(r: number, g: number, b: number, a: number) {
  return a > 128 && r + g + b > 420 && Math.min(r, g, b) > 180;
}

function opacityForSmokeAge(t: number, peak: number) {
  if (t >= 1) {
    return 0;
  }

  if (t < 0.08) {
    return peak * (0.65 + (t / 0.08) * 0.35);
  }

  return peak * (1 - (t - 0.08) / 0.92);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function expandBounds(bounds: MaskBounds, width: number, height: number) {
  const padX = Math.max(4, Math.round((bounds.maxX - bounds.minX) * 0.08));
  const padY = Math.max(4, Math.round((bounds.maxY - bounds.minY) * 0.08));

  return {
    minX: Math.max(0, bounds.minX - padX),
    minY: Math.max(0, bounds.minY - padY),
    maxX: Math.min(width - 1, bounds.maxX + padX),
    maxY: Math.min(height - 1, bounds.maxY + padY),
  };
}

function computeLogBounds(
  logData: Uint8ClampedArray,
  width: number,
  height: number,
) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y += MASK_SAMPLE_STEP) {
    for (let x = 0; x < width; x += MASK_SAMPLE_STEP) {
      const index = (y * width + x) * 4;
      const r = logData[index];
      const g = logData[index + 1];
      const b = logData[index + 2];
      const a = logData[index + 3];

      if (!isLogStrokePixel(r, g, b, a)) {
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
    return null;
  }

  return expandBounds({ minX, minY, maxX, maxY }, width, height);
}

function downsamplePoints(points: SpawnPoint[]) {
  if (points.length <= MAX_SPAWN_POINTS) {
    return points;
  }

  const stride = Math.ceil(points.length / MAX_SPAWN_POINTS);
  return points.filter((_, index) => index % stride === 0);
}

async function buildSpawnPoints(width: number, height: number) {
  const logImg = await loadImage(LOG_SRC);

  const logCanvas = document.createElement("canvas");
  logCanvas.width = width;
  logCanvas.height = height;

  const logCtx = logCanvas.getContext("2d");
  if (!logCtx) {
    return [] as SpawnPoint[];
  }

  logCtx.drawImage(logImg, 0, 0, width, height);
  const logData = logCtx.getImageData(0, 0, width, height).data;

  const bounds = computeLogBounds(logData, width, height);
  if (!bounds) {
    return [] as SpawnPoint[];
  }

  const logStrokes: SpawnPoint[] = [];

  for (let y = bounds.minY; y <= bounds.maxY; y += MASK_SAMPLE_STEP) {
    for (let x = bounds.minX; x <= bounds.maxX; x += MASK_SAMPLE_STEP) {
      const index = (y * width + x) * 4;
      const lr = logData[index];
      const lg = logData[index + 1];
      const lb = logData[index + 2];
      const la = logData[index + 3];

      if (isLogStrokePixel(lr, lg, lb, la)) {
        logStrokes.push({ x, y });
      }
    }
  }

  return downsamplePoints(logStrokes);
}

function trimParticles(particles: Particle[], kind: Particle["kind"], cap: number) {
  const ofKind = particles.filter((particle) => particle.kind === kind);
  if (ofKind.length <= cap) {
    return particles;
  }

  const removeCount = ofKind.length - cap;
  let removed = 0;

  return particles.filter((particle) => {
    if (particle.kind !== kind || removed >= removeCount) {
      return true;
    }

    removed += 1;
    return false;
  });
}

export default function StatementLogFire({
  layer = "embers",
}: {
  layer?: "embers" | "smoke";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const spawnPointsRef = useRef<SpawnPoint[]>([]);
  const emberSpawnAccumulatorRef = useRef(0);
  const smokeSpawnAccumulatorRef = useRef(0);
  const emberBurstUntilRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const mobileRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [maskReady, setMaskReady] = useState(false);
  const { activeLineId } = useCursorTheme();
  const activeLineIdRef = useRef(activeLineId);

  useEffect(() => {
    activeLineIdRef.current = activeLineId;
  }, [activeLineId]);

  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMedia = window.matchMedia("(max-width: 767px)");

    const updateMotion = () => setReducedMotion(motionMedia.matches);
    const updateMobile = () => {
      mobileRef.current = mobileMedia.matches;
    };

    updateMotion();
    updateMobile();

    motionMedia.addEventListener("change", updateMotion);
    mobileMedia.addEventListener("change", updateMobile);

    return () => {
      motionMedia.removeEventListener("change", updateMotion);
      mobileMedia.removeEventListener("change", updateMobile);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    let cancelled = false;
    let rebuildTimer: ReturnType<typeof setTimeout> | null = null;

    const rebuildMask = () => {
      const width = Math.max(1, root.offsetWidth);
      const height = Math.max(1, root.offsetHeight);

      buildSpawnPoints(width, height)
        .then((points) => {
          if (cancelled) {
            return;
          }

          spawnPointsRef.current = points;
          particlesRef.current = [];
          setMaskReady(true);
        })
        .catch(() => {
          if (!cancelled) {
            setMaskReady(true);
          }
        });
    };

    const scheduleRebuild = () => {
      if (rebuildTimer !== null) {
        clearTimeout(rebuildTimer);
      }

      rebuildTimer = setTimeout(() => {
        rebuildTimer = null;
        rebuildMask();
      }, 120);
    };

    scheduleRebuild();

    const observer = new ResizeObserver(scheduleRebuild);
    observer.observe(root);

    return () => {
      cancelled = true;
      observer.disconnect();

      if (rebuildTimer !== null) {
        clearTimeout(rebuildTimer);
      }
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;

    if (!root || !canvas || !maskReady) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let width = 0;
    let height = 0;
    let lastFrame = performance.now();

    const resize = () => {
      width = Math.max(1, root.offsetWidth);
      height = Math.max(1, root.offsetHeight);
      canvas.width = width;
      canvas.height = height;
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(root);

    const maxEmbers = () => (mobileRef.current ? 140 : 240);
    const maxSmoke = () => (mobileRef.current ? 28 : 45);
    const emberSpawnInterval = () => randomBetween(4, 7);
    const smokeSpawnInterval = () => randomBetween(18, 30);

    const pickSpawnPoint = () => {
      const points = spawnPointsRef.current;
      if (points.length === 0) {
        return null;
      }

      return points[Math.floor(Math.random() * points.length)];
    };

    const spawnEmberBurst = (now: number) => {
      const count = 6 + Math.floor(Math.random() * 6);
      emberBurstUntilRef.current = now + EMBER_BURST_MS;

      for (let i = 0; i < count; i++) {
        const origin = pickSpawnPoint();
        if (!origin) {
          return;
        }

        particlesRef.current.push({
          kind: "ember",
          x: origin.x + (Math.random() - 0.5) * 6,
          y: origin.y + (Math.random() - 0.5) * 6,
          size: 4 + Math.random() * 4,
          color: pickFireColor(performance.now(), activeLineIdRef.current),
          vx: (Math.random() - 0.5) * 0.24,
          vy: -(0.18 + Math.random() * 0.24),
          born: performance.now(),
          life:
            EMBER_LIFE_MIN + Math.random() * (EMBER_LIFE_MAX - EMBER_LIFE_MIN),
          peakOpacity: 1,
        });
      }

      particlesRef.current = trimParticles(
        particlesRef.current,
        "ember",
        maxEmbers(),
      );
    };

    const spawnSmokeBurst = () => {
      const count = 1 + Math.floor(Math.random() * 2);

      for (let i = 0; i < count; i++) {
        const origin = pickSpawnPoint();
        if (!origin) {
          return;
        }

        particlesRef.current.push({
          kind: "smoke",
          x: origin.x + (Math.random() - 0.5) * 14,
          y: origin.y - randomBetween(12, 36) + (Math.random() - 0.5) * 8,
          size: 7 + Math.random() * 9,
          color: pickSmokeColor(),
          vx: (Math.random() - 0.5) * 0.55,
          vy: -(0.28 + Math.random() * 0.34),
          born: performance.now(),
          life:
            SMOKE_LIFE_MIN + Math.random() * (SMOKE_LIFE_MAX - SMOKE_LIFE_MIN),
          peakOpacity: SMOKE_PEAK_OPACITY,
        });
      }

      particlesRef.current = trimParticles(
        particlesRef.current,
        "smoke",
        maxSmoke(),
      );
    };

    const drawSmokePuff = (
      particle: Particle,
      alpha: number,
    ) => {
      const radius = particle.size / 2;
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        radius,
      );

      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.35, particle.color);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.globalAlpha = alpha;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawParticle = (particle: Particle, now: number) => {
      const age = now - particle.born;
      const t = age / particle.life;

      if (t >= 1) {
        return false;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;

      const alpha =
        particle.kind === "ember"
          ? opacityForEmberAge(t)
          : opacityForSmokeAge(t, particle.peakOpacity);

      if (alpha <= 0) {
        return false;
      }

      if (particle.kind === "smoke") {
        drawSmokePuff(particle, alpha);
        return true;
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.fillRect(
        particle.x - particle.size / 2,
        particle.y - particle.size / 2,
        particle.size,
        particle.size,
      );

      return true;
    };

    const drawStaticReducedMotion = () => {
      const points = spawnPointsRef.current;
      const pool =
        points.length > 0
          ? points
              .filter((_, index) => index % Math.ceil(points.length / 6) === 0)
              .slice(0, 6)
          : [];

      if (layer === "embers") {
        ctx.globalAlpha = 1;

        for (const point of pool) {
          ctx.fillStyle = getGlowEmberColor(
            performance.now(),
            activeLineIdRef.current,
          );
          ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
        }

        return;
      }

      const smokePool = pool.slice(0, 2);
      for (const point of smokePool) {
        drawSmokePuff(
          {
            kind: "smoke",
            x: point.x,
            y: point.y - 24,
            size: 14,
            color: SMOKE_COLORS[1],
            vx: 0,
            vy: 0,
            born: 0,
            life: 1,
            peakOpacity: SMOKE_PEAK_OPACITY,
          },
          SMOKE_PEAK_OPACITY,
        );
      }

      ctx.globalAlpha = 1;
    };

    if (reducedMotion) {
      resize();
      drawStaticReducedMotion();
      return () => {
        observer.disconnect();
      };
    }

    const tick = (now: number) => {
      const delta = now - lastFrame;
      lastFrame = now;

      ctx.clearRect(0, 0, width, height);

      emberSpawnAccumulatorRef.current += delta;
      if (layer === "embers") {
        let nextEmberSpawn = emberSpawnInterval();
        while (emberSpawnAccumulatorRef.current >= nextEmberSpawn) {
          emberSpawnAccumulatorRef.current -= nextEmberSpawn;
          spawnEmberBurst(now);
          nextEmberSpawn = emberSpawnInterval();
        }
      }

      smokeSpawnAccumulatorRef.current += delta;
      if (layer === "smoke") {
        let nextSmokeSpawn = smokeSpawnInterval();
        while (smokeSpawnAccumulatorRef.current >= nextSmokeSpawn) {
          smokeSpawnAccumulatorRef.current -= nextSmokeSpawn;
          spawnSmokeBurst();
          nextSmokeSpawn = smokeSpawnInterval();
        }
      }

      const embers: Particle[] = [];
      const smoke: Particle[] = [];

      for (const particle of particlesRef.current) {
        if (particle.kind === "ember") {
          embers.push(particle);
        } else {
          smoke.push(particle);
        }
      }

      if (layer === "embers") {
        particlesRef.current = embers.filter((particle) => drawParticle(particle, now));
      } else {
        particlesRef.current = smoke.filter((particle) => drawParticle(particle, now));
      }

      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      particlesRef.current = [];
      emberSpawnAccumulatorRef.current = 0;
      smokeSpawnAccumulatorRef.current = 0;
      emberBurstUntilRef.current = 0;
    };
  }, [layer, maskReady, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={
        layer === "smoke"
          ? "statement-log-fire statement-log-fire--smoke"
          : "statement-log-fire"
      }
      style={layer === "smoke" ? undefined : LOG_MASK_STYLE}
      aria-hidden
    >
      <canvas ref={canvasRef} className="statement-log-fire__canvas" />
    </div>
  );
}
