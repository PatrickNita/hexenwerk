import { mixHex } from "@/lib/fire-glow";
import { LINE_COLOR_PAIRS, type LineColorId } from "@/lib/line-colors";

export type CursorTheme = {
  id: string;
  particles: string[];
  core: string;
  hot: string;
  tick: string;
};

function themeFromLinePair(id: LineColorId): CursorTheme {
  const { vivid, deep } = LINE_COLOR_PAIRS[id];

  return {
    id,
    particles: [
      vivid,
      deep,
      mixHex(vivid, deep, 0.5),
      mixHex(deep, "#000000", 0.25),
    ],
    core: vivid,
    hot: deep,
    tick: mixHex(deep, "#000000", 0.35),
  };
}

export const CURSOR_THEMES: Record<string, CursorTheme> = {
  default: {
    id: "default",
    particles: ["#ffffff", "#cccccc", "#888888", "#555555", "#333333"],
    core: "#eeeeee",
    hot: "#ffffff",
    tick: "#666666",
  },
  beverage: themeFromLinePair("beverage"),
  botanical: themeFromLinePair("botanical"),
  essence: themeFromLinePair("essence"),
  gastronomy: themeFromLinePair("gastronomy"),
  perfumery: themeFromLinePair("perfumery"),
  fire: {
    id: "fire",
    particles: ["#fff4e0", "#ffcc44", "#ff8800", "#cc3300", "#a06830"],
    core: "#ff8800",
    hot: "#fff4e0",
    tick: "#cc3300",
  },
};

export function getCursorTheme(id: string): CursorTheme {
  return CURSOR_THEMES[id] ?? CURSOR_THEMES.default;
}
