import {
  SECTION03_FORWARD_FRAME_MS,
  SECTION03_FRAME_COUNT,
} from "@/lib/section03-assets";

export type ProductLineBoxLeg = "forward" | "reverse";

export type ProductLineBoxFrameState = {
  frame: number;
  leg: ProductLineBoxLeg;
};

function getLegDurationMs(): number {
  return (SECTION03_FRAME_COUNT - 1) * SECTION03_FORWARD_FRAME_MS;
}

function getCycleDurationMs(): number {
  return getLegDurationMs() * 2;
}

export function getProductLineBoxFrame(
  now: number,
  cycleStartMs: number,
): ProductLineBoxFrameState {
  const legDurationMs = getLegDurationMs();
  const cycleDurationMs = getCycleDurationMs();
  const elapsed = (now - cycleStartMs) % cycleDurationMs;

  if (elapsed < legDurationMs) {
    const step = Math.min(
      SECTION03_FRAME_COUNT - 1,
      Math.floor(elapsed / SECTION03_FORWARD_FRAME_MS),
    );

    return {
      frame: step + 1,
      leg: "forward",
    };
  }

  const reverseElapsed = elapsed - legDurationMs;
  const step = Math.min(
    SECTION03_FRAME_COUNT - 1,
    Math.floor(reverseElapsed / SECTION03_FORWARD_FRAME_MS),
  );

  return {
    frame: SECTION03_FRAME_COUNT - step,
    leg: "reverse",
  };
}
