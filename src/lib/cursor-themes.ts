export type CursorTheme = {
  id: string;
  particles: string[];
  core: string;
  hot: string;
  tick: string;
};

export const CURSOR_THEMES: Record<string, CursorTheme> = {
  default: {
    id: "default",
    particles: ["#ffffff", "#cccccc", "#888888", "#555555", "#333333"],
    core: "#eeeeee",
    hot: "#ffffff",
    tick: "#666666",
  },
  beverage: {
    id: "beverage",
    particles: ["#e8f4ff", "#b8dff5", "#7ec8e3", "#4a90a4"],
    core: "#7ec8e3",
    hot: "#e8f4ff",
    tick: "#4a90a4",
  },
  botanical: {
    id: "botanical",
    particles: ["#4a7c42", "#2d5a27", "#c0392b", "#8b1a1a"],
    core: "#4a7c42",
    hot: "#c0392b",
    tick: "#2d5a27",
  },
  essence: {
    id: "essence",
    particles: ["#2d2d38", "#1a1a22", "#9d7fd4", "#6b4c9a"],
    core: "#6b4c9a",
    hot: "#9d7fd4",
    tick: "#1a1a22",
  },
  gastronomy: {
    id: "gastronomy",
    particles: ["#722f47", "#4a1528", "#6b7c3a", "#556b2f"],
    core: "#722f47",
    hot: "#6b7c3a",
    tick: "#4a1528",
  },
  perfumery: {
    id: "perfumery",
    particles: ["#f8f4ef", "#f5d5d0", "#e8c4bc", "#fffef8"],
    core: "#f5d5d0",
    hot: "#fffef8",
    tick: "#e8c4bc",
  },
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
