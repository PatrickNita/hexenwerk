"use client";

import { useEffect, useRef, useState } from "react";
import { useCursorTheme } from "@/components/cursor-provider";
import {
  drawEmber,
  pickFireColor,
  trimEmbers,
  type EmberParticle,
} from "@/lib/fire-embers";
import { loadAllCandleSpawnPoints, type SpawnPoint } from "@/lib/statement-candle-spawn";
import { SECTION02_CANDLE_SRCS } from "@/lib/section02-assets";

const EMBER_LIFE_MIN = 450;
const EMBER_LIFE_MAX = 700;
const MAX_EMBERS = 110;
const MAX_EMBERS_MOBILE = 65;
const BURST_SPAWN_CHANCE = 0.25;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function StatementCandleFire() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<EmberParticle[]>([]);
  const spawnPointsRef = useRef<SpawnPoint[]>([]);
  const spawnAccumulatorRef = useRef(0);
  const spawnIndexRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const mobileRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [spawnReady, setSpawnReady] = useState(false);
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

    const rebuildSpawnPoints = () => {
      const width = Math.max(1, root.offsetWidth);
      const height = Math.max(1, root.offsetHeight);

      loadAllCandleSpawnPoints(SECTION02_CANDLE_SRCS, width, height)
        .then((points) => {
          if (cancelled) {
            return;
          }

          spawnPointsRef.current = points;
          particlesRef.current = [];
          setSpawnReady(true);
        })
        .catch(() => {
          if (!cancelled) {
            setSpawnReady(true);
          }
        });
    };

    const scheduleRebuild = () => {
      if (rebuildTimer !== null) {
        clearTimeout(rebuildTimer);
      }

      rebuildTimer = setTimeout(() => {
        rebuildTimer = null;
        rebuildSpawnPoints();
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

    if (!root || !canvas || !spawnReady) {
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

    const maxEmbers = () =>
      mobileRef.current ? MAX_EMBERS_MOBILE : MAX_EMBERS;
    const spawnInterval = () => randomBetween(6, 10);

    const pickSpawnPoint = () => {
      const points = spawnPointsRef.current;
      if (points.length === 0) {
        return null;
      }

      const index = spawnIndexRef.current % points.length;
      spawnIndexRef.current += 1;
      return points[index];
    };

    const spawnEmber = () => {
      const origin = pickSpawnPoint();
      if (!origin) {
        return;
      }

      particlesRef.current.push({
        x: origin.x + (Math.random() - 0.5) * 3,
        y: origin.y + (Math.random() - 0.5) * 2,
        size: 3.5 + Math.random() * 2.5,
        color: pickFireColor(performance.now(), activeLineIdRef.current),
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(0.12 + Math.random() * 0.1),
        born: performance.now(),
        life:
          EMBER_LIFE_MIN + Math.random() * (EMBER_LIFE_MAX - EMBER_LIFE_MIN),
      });

      particlesRef.current = trimEmbers(particlesRef.current, maxEmbers());
    };

    if (reducedMotion) {
      return () => {
        observer.disconnect();
      };
    }

    const tick = (now: number) => {
      const delta = now - lastFrame;
      lastFrame = now;

      ctx.clearRect(0, 0, width, height);

      spawnAccumulatorRef.current += delta;
      let nextSpawn = spawnInterval();
      while (spawnAccumulatorRef.current >= nextSpawn) {
        spawnAccumulatorRef.current -= nextSpawn;
        spawnEmber();
        if (Math.random() < BURST_SPAWN_CHANCE) {
          spawnEmber();
        }
        nextSpawn = spawnInterval();
      }

      particlesRef.current = particlesRef.current.filter((particle) =>
        drawEmber(ctx, particle, now),
      );

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
      spawnAccumulatorRef.current = 0;
      spawnIndexRef.current = 0;
    };
  }, [reducedMotion, spawnReady]);

  return (
    <div ref={rootRef} className="statement-candle-fire" aria-hidden>
      <canvas ref={canvasRef} className="statement-candle-fire__canvas" />
    </div>
  );
}
