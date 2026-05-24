import { FIRE_COLORS } from "@/lib/fire-colors";
import { getGlowEmberColor } from "@/lib/fire-glow";

export type EmberParticle = {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  born: number;
  life: number;
};

export function pickEmberColorFromGlow(now: number, lineId?: string | null): string {
  return getGlowEmberColor(now, lineId);
}

export function pickFireColor(now?: number, lineId?: string | null) {
  if (now !== undefined) {
    return pickEmberColorFromGlow(now, lineId);
  }

  return FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)];
}

export function opacityForEmberAge(t: number) {
  if (t < 0.4) return 1;
  if (t < 0.65) return 0.6;
  if (t < 0.85) return 0.3;
  return 0;
}

export function drawEmber(
  ctx: CanvasRenderingContext2D,
  particle: EmberParticle,
  now: number,
) {
  const age = now - particle.born;
  const t = age / particle.life;

  if (t >= 1) {
    return false;
  }

  particle.x += particle.vx;
  particle.y += particle.vy;

  const alpha = opacityForEmberAge(t);
  if (alpha <= 0) {
    return false;
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
}

export function trimEmbers(particles: EmberParticle[], cap: number) {
  if (particles.length <= cap) {
    return particles;
  }

  return particles.slice(particles.length - cap);
}
