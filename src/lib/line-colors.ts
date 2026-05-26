export const LINE_COLOR_PAIRS = {
  beverage: { vivid: "#0077CC", deep: "#6EC6FF" },
  botanical: { vivid: "#2A9D4B", deep: "#D62828" },
  essence: { vivid: "#7B2CBF", deep: "#C026D3" },
  gastronomy: { vivid: "#800020", deep: "#E8B7C5" },
  perfumery: { vivid: "#FF2D95", deep: "#FF8ACD" },
} as const;

export type LineColorId = keyof typeof LINE_COLOR_PAIRS;

export function getLineColorPair(lineId: string) {
  if (lineId in LINE_COLOR_PAIRS) {
    return LINE_COLOR_PAIRS[lineId as LineColorId];
  }

  return null;
}
