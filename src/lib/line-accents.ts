import { LINE_COLOR_PAIRS, type LineColorId } from "@/lib/line-colors";

export const LINE_ACCENTS = {
  beverage: LINE_COLOR_PAIRS.beverage.vivid,
  botanical: LINE_COLOR_PAIRS.botanical.vivid,
  essence: LINE_COLOR_PAIRS.essence.vivid,
  gastronomy: LINE_COLOR_PAIRS.gastronomy.vivid,
  perfumery: LINE_COLOR_PAIRS.perfumery.vivid,
} as const;

export type LineAccentId = keyof typeof LINE_ACCENTS;

export const STRENGTH_DEFAULT = "var(--ember)";

export function getLineAccentColor(lineId: string | null): string {
  if (lineId && lineId in LINE_ACCENTS) {
    return LINE_ACCENTS[lineId as LineAccentId];
  }

  return STRENGTH_DEFAULT;
}
