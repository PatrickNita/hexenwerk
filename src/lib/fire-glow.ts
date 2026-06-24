import { LINE_COLOR_PAIRS } from "@/lib/line-colors";

export type GlowPhase = "darkOrange" | "darkBrown";

export type FireGlowState = {
  phase: GlowPhase;
  hot: string;
  mid: string;
  cool: string;
  brightness: number;
  strength: number;
};

export const LINE_GLOW_IDS = [
  "beverage",
  "botanical",
  "essence",
  "gastronomy",
  "perfumery",
] as const;

export type LineGlowId = (typeof LINE_GLOW_IDS)[number];

type GlowStops = {
  hot: string;
  mid: string;
  cool: string;
};

const GLOW_DARK_ORANGE = {
  hot: "#ff7700",
  mid: "#cc4400",
  cool: "#3a1200",
} as const;

const GLOW_DARK_BROWN = {
  hot: "#a06830",
  mid: "#6b4423",
  cool: "#3d2512",
} as const;

const PHASE_ORDER: GlowPhase[] = ["darkOrange", "darkBrown"];

/** 1s per color → 2s full cycle. */
const PHASE_MS = 1000;
const CYCLE_MS = PHASE_MS * PHASE_ORDER.length;

const GLOW_BRIGHTNESS = 1.35;
const GLOW_STRENGTH = 1;

function parseHex(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const toChannel = (channel: number) =>
    Math.round(Math.max(0, Math.min(255, channel)))
      .toString(16)
      .padStart(2, "0");

  return `#${toChannel(r)}${toChannel(g)}${toChannel(b)}`;
}

export function mixHex(from: string, to: string, amount: number) {
  const a = parseHex(from);
  const b = parseHex(to);
  const t = Math.max(0, Math.min(1, amount));

  return rgbToHex(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t,
  );
}

function lineGlowFromTwoColors(vivid: string, deep: string): [GlowStops, GlowStops] {
  return [
    {
      hot: vivid,
      mid: mixHex(vivid, deep, 0.45),
      cool: mixHex(deep, "#000000", 0.35),
    },
    {
      hot: deep,
      mid: mixHex(deep, vivid, 0.45),
      cool: mixHex(deep, "#000000", 0.5),
    },
  ];
}

/** Two-color vivid/deep triads per product line — same structure as fire orange/brown. */
const LINE_GLOW_PALETTES: Record<LineGlowId, [GlowStops, GlowStops]> = {
  beverage: lineGlowFromTwoColors(
    LINE_COLOR_PAIRS.beverage.vivid,
    LINE_COLOR_PAIRS.beverage.deep,
  ),
  botanical: lineGlowFromTwoColors(
    LINE_COLOR_PAIRS.botanical.vivid,
    LINE_COLOR_PAIRS.botanical.deep,
  ),
  essence: lineGlowFromTwoColors(
    LINE_COLOR_PAIRS.essence.vivid,
    LINE_COLOR_PAIRS.essence.deep,
  ),
  gastronomy: lineGlowFromTwoColors(
    LINE_COLOR_PAIRS.gastronomy.vivid,
    LINE_COLOR_PAIRS.gastronomy.deep,
  ),
  perfumery: lineGlowFromTwoColors(
    LINE_COLOR_PAIRS.perfumery.vivid,
    LINE_COLOR_PAIRS.perfumery.deep,
  ),
};

function getPhasePalettes(lineId?: string | null): [GlowStops, GlowStops] {
  if (isProductLineGlowId(lineId)) {
    return LINE_GLOW_PALETTES[lineId];
  }

  return [GLOW_DARK_ORANGE, GLOW_DARK_BROWN];
}

function paletteForPhase(palettes: [GlowStops, GlowStops], phase: GlowPhase) {
  return phase === "darkBrown" ? palettes[1] : palettes[0];
}

function pickCyclePhase(now: number): {
  phase: GlowPhase;
  blend: number;
  nextPhase: GlowPhase;
} {
  const cyclePos = now % CYCLE_MS;
  const phaseIndex = Math.floor(cyclePos / PHASE_MS);
  const phase = PHASE_ORDER[phaseIndex] ?? "darkOrange";
  const nextPhase =
    PHASE_ORDER[(phaseIndex + 1) % PHASE_ORDER.length] ?? "darkBrown";
  const blend = (cyclePos % PHASE_MS) / PHASE_MS;

  return { phase, blend, nextPhase };
}

export function isProductLineGlowId(
  id: string | null | undefined,
): id is LineGlowId {
  return id != null && LINE_GLOW_IDS.includes(id as LineGlowId);
}

function glowBrightness(lineId?: string | null) {
  if (lineId === "perfumery") {
    return 1.25;
  }

  return GLOW_BRIGHTNESS;
}

export function computeFireGlowCycle(
  now: number,
  lineId?: string | null,
): FireGlowState {
  const palettes = getPhasePalettes(lineId);
  const { phase, blend, nextPhase } = pickCyclePhase(now);
  const from = paletteForPhase(palettes, phase);
  const to = paletteForPhase(palettes, nextPhase);
  const t = blend * blend * (3 - 2 * blend);

  return {
    phase: blend > 0.5 ? nextPhase : phase,
    hot: mixHex(from.hot, to.hot, t),
    mid: mixHex(from.mid, to.mid, t),
    cool: mixHex(from.cool, to.cool, t),
    brightness: glowBrightness(lineId),
    strength: GLOW_STRENGTH,
  };
}

export function getGlowSpriteColor(now: number, lineId?: string | null): string {
  if (isProductLineGlowId(lineId)) {
    const { vivid, deep } = LINE_COLOR_PAIRS[lineId];
    const { phase, blend, nextPhase } = pickCyclePhase(now);
    const from = phase === "darkBrown" ? deep : vivid;
    const to = nextPhase === "darkBrown" ? deep : vivid;
    const t = blend * blend * (3 - 2 * blend);

    return mixHex(from, to, t);
  }

  return computeFireGlowCycle(now, lineId).hot;
}
