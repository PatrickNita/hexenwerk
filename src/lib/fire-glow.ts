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

/** Monochromatic vivid/deep triads per product line — same structure as fire orange/brown. */
const LINE_GLOW_PALETTES: Record<LineGlowId, [GlowStops, GlowStops]> = {
  beverage: [
    { hot: "#e8f4ff", mid: "#7ec8e3", cool: "#4a90a4" },
    { hot: "#7ec8e3", mid: "#4a90a4", cool: "#1a3540" },
  ],
  botanical: [
    { hot: "#5a934f", mid: "#4a7c42", cool: "#2d5a27" },
    { hot: "#3a6532", mid: "#2d5a27", cool: "#141f0e" },
  ],
  essence: [
    { hot: "#9d7fd4", mid: "#6b4c9a", cool: "#1a1a22" },
    { hot: "#6b4c9a", mid: "#3d2d5c", cool: "#0a0a10" },
  ],
  gastronomy: [
    { hot: "#8b4a62", mid: "#722f47", cool: "#4a1528" },
    { hot: "#6b3a4a", mid: "#4a1528", cool: "#240a14" },
  ],
  perfumery: [
    { hot: "#fffef8", mid: "#f5d5d0", cool: "#e8c4bc" },
    { hot: "#e8c4bc", mid: "#c9a89e", cool: "#8a7068" },
  ],
};

/** Fireplace origin on the section02 artboard. */
const GLOW_ORIGIN_X = "50%";
const GLOW_ORIGIN_Y = "82%";

function glowRadialBackground(hot: string, mid: string, cool: string) {
  return `radial-gradient(circle farthest-side at ${GLOW_ORIGIN_X} ${GLOW_ORIGIN_Y}, ${hot} 0%, ${mid} 28%, ${cool} 58%, ${cool} 100%)`;
}

export function defaultLightningBackground() {
  return glowRadialBackground(
    GLOW_DARK_ORANGE.hot,
    GLOW_DARK_ORANGE.mid,
    GLOW_DARK_ORANGE.cool,
  );
}

const PHASE_ORDER: GlowPhase[] = ["darkOrange", "darkBrown"];

/** 1s per color → 2s full cycle. */
const PHASE_MS = 1000;
const CYCLE_MS = PHASE_MS * PHASE_ORDER.length;

const GLOW_BRIGHTNESS = 1.35;
const GLOW_CONTRAST = 1.28;
const GLOW_STRENGTH = 1;

const IDLE_GLOW: FireGlowState = {
  phase: "darkOrange",
  hot: GLOW_DARK_ORANGE.hot,
  mid: GLOW_DARK_ORANGE.mid,
  cool: GLOW_DARK_ORANGE.cool,
  brightness: GLOW_BRIGHTNESS,
  strength: GLOW_STRENGTH,
};

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

function getPhasePalettes(lineId?: string | null): [GlowStops, GlowStops] {
  if (isProductLineGlowId(lineId)) {
    return LINE_GLOW_PALETTES[lineId];
  }

  return [GLOW_DARK_ORANGE, GLOW_DARK_BROWN];
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
  const [phaseA, phaseB] = getPhasePalettes(lineId);
  const { phase, blend, nextPhase } = pickCyclePhase(now);
  const t = blend * blend * (3 - 2 * blend);

  return {
    phase: blend > 0.5 ? nextPhase : phase,
    hot: mixHex(phaseA.hot, phaseB.hot, t),
    mid: mixHex(phaseA.mid, phaseB.mid, t),
    cool: mixHex(phaseA.cool, phaseB.cool, t),
    brightness: glowBrightness(lineId),
    strength: GLOW_STRENGTH,
  };
}

export function getGlowEmberColor(now: number, lineId?: string | null): string {
  const glow = computeFireGlowCycle(now, lineId);
  const roll = Math.random();

  if (roll < 0.35) {
    return glow.hot;
  }

  if (roll < 0.6) {
    return mixHex(glow.hot, glow.mid, 0.4 + Math.random() * 0.35);
  }

  if (roll < 0.82) {
    return glow.mid;
  }

  return mixHex(glow.mid, glow.cool, 0.3 + Math.random() * 0.4);
}

export function applyFireGlowToElement(
  element: HTMLElement | null | undefined,
  glow: FireGlowState,
) {
  if (!element) {
    return;
  }

  element.style.setProperty("--statement-lightning-hot", glow.hot);
  element.style.setProperty("--statement-lightning-mid", glow.mid);
  element.style.setProperty("--statement-lightning-cool", glow.cool);
  element.style.backgroundImage = glowRadialBackground(glow.hot, glow.mid, glow.cool);
  element.style.opacity = glow.strength.toFixed(3);
  element.style.filter = `brightness(${glow.brightness.toFixed(3)}) contrast(${GLOW_CONTRAST})`;
}

export function defaultFireGlow(): FireGlowState {
  return { ...IDLE_GLOW };
}
