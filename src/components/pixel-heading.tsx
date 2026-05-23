"use client";

import { getCharSlotWidth, getVariantsForChar } from "@/lib/char-variants";
import { useEffect, useRef, useState } from "react";

const PIXEL_FONT = "var(--font-geist-pixel-grid)";
const TEXT = "100% CIGAR LEAF";
const CHARS = TEXT.split("");
const ARIA_LABEL = "100% Cigar Leaf";

const CHANGE_MIN_MS = 400;
const CHANGE_MAX_MS = 900;
const STAGGER_MAX_MS = 1200;
const FREEZE_CHANCE = 0.25;
const FREEZE_MIN_MS = 2000;
const FREEZE_MAX_MS = 5000;

type CharAnimState = {
  variantIndex: number;
  nextChangeAt: number;
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function nextRandomIndex(current: number, count: number): number {
  if (count <= 1) {
    return 0;
  }

  let next = Math.floor(Math.random() * count);

  while (next === current) {
    next = Math.floor(Math.random() * count);
  }

  return next;
}

const INITIAL_VARIANT_INDICES = CHARS.map(() => 0);

function createAnimStates(now: number): CharAnimState[] {
  return CHARS.map((char, charIndex) => {
    if (char === " ") {
      return { variantIndex: 0, nextChangeAt: Number.POSITIVE_INFINITY };
    }

    const variants = getVariantsForChar(char, charIndex, TEXT);

    return {
      variantIndex: Math.floor(Math.random() * variants.length),
      nextChangeAt: now + randomBetween(0, STAGGER_MAX_MS),
    };
  });
}

export default function PixelHeading() {
  const [variantIndices, setVariantIndices] =
    useState<number[]>(INITIAL_VARIANT_INDICES);
  const [reducedMotion, setReducedMotion] = useState(false);
  const animStatesRef = useRef<CharAnimState[] | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const now = performance.now();
    animStatesRef.current = createAnimStates(now);
    setVariantIndices(animStatesRef.current.map((state) => state.variantIndex));

    const frame = (time: number) => {
      const states = animStatesRef.current;

      if (!states) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      let changed = false;

      for (let charIndex = 0; charIndex < CHARS.length; charIndex++) {
        const char = CHARS[charIndex];

        if (char === " ") {
          continue;
        }

        const state = states[charIndex];

        if (time < state.nextChangeAt) {
          continue;
        }

        if (Math.random() < FREEZE_CHANCE) {
          state.nextChangeAt = time + randomBetween(FREEZE_MIN_MS, FREEZE_MAX_MS);
          continue;
        }

        const variants = getVariantsForChar(char, charIndex, TEXT);
        state.variantIndex = nextRandomIndex(state.variantIndex, variants.length);
        state.nextChangeAt = time + randomBetween(CHANGE_MIN_MS, CHANGE_MAX_MS);
        changed = true;
      }

      if (changed) {
        setVariantIndices(states.map((state) => state.variantIndex));
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      animStatesRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <div className="hero-heading text-center" aria-label={ARIA_LABEL}>
      <div
        className="flex flex-wrap justify-center leading-none tracking-[0.12em] lg:tracking-[0.14em]"
        style={{ fontFamily: PIXEL_FONT }}
        aria-hidden
      >
        {CHARS.map((char, charIndex) => {
          if (char === " ") {
            return (
              <span
                key={`${charIndex}-space`}
                className="inline-block w-[0.35em]"
              />
            );
          }

          const variants = getVariantsForChar(char, charIndex, TEXT);
          const variantIndex = reducedMotion ? 0 : variantIndices[charIndex];
          const displayChar = variants[variantIndex] ?? char;

          return (
            <span
              key={`${charIndex}-${char}`}
              className="inline-block text-center"
              style={{
                width: getCharSlotWidth(char),
                minWidth: getCharSlotWidth(char),
              }}
            >
              {displayChar}
            </span>
          );
        })}
      </div>
    </div>
  );
}
