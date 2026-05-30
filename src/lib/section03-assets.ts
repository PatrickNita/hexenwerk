export const SECTION03_LINE_IDS = [
  "beverage",
  "botanical",
  "essence",
  "gastronomy",
  "perfumery",
] as const;

export type Section03LineId = (typeof SECTION03_LINE_IDS)[number];

export const SECTION03_FRAME_COUNT = 61;
export const SECTION03_FRAME_FPS = 20;
export const SECTION03_FORWARD_FRAME_MS = 1000 / SECTION03_FRAME_FPS;

export function getSection03FrameSrc(lineId: string, frame: number): string {
  return `/assets/section03/${lineId}/frame_${String(frame).padStart(4, "0")}.webp`;
}

export function getSection03FrameSrcs(lineId: string): string[] {
  return Array.from({ length: SECTION03_FRAME_COUNT }, (_, index) =>
    getSection03FrameSrc(lineId, index + 1),
  );
}

export function getAllSection03FrameSrcs(): string[] {
  return SECTION03_LINE_IDS.flatMap((lineId) => getSection03FrameSrcs(lineId));
}
