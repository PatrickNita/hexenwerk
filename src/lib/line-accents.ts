export const LINE_ACCENTS = {
  beverage: "#7ec8e3",
  botanical: "#4a7c42",
  essence: "#6b4c9a",
  gastronomy: "#722f47",
  perfumery: "#f5d5d0",
} as const;

export type LineAccentId = keyof typeof LINE_ACCENTS;

export const STRENGTH_DEFAULT = "var(--ember)";

export function getLineAccentColor(lineId: string | null): string {
  if (lineId && lineId in LINE_ACCENTS) {
    return LINE_ACCENTS[lineId as LineAccentId];
  }

  return STRENGTH_DEFAULT;
}
