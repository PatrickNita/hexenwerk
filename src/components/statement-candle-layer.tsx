"use client";

import { useStatementArtboardRuntime } from "@/components/statement-artboard-runtime";
import { SECTION02_CANDLE_FRAME_SRCS } from "@/lib/section02-assets";
import { useCallback, useRef } from "react";

export default function StatementCandleLayer() {
  const { spritesReady, registerCandleSprite } = useStatementArtboardRuntime();
  const imgRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const syncRefs = useCallback(() => {
    registerCandleSprite(imgRef.current, glowRef.current);
  }, [registerCandleSprite]);

  return (
    <div className="statement-artboard__layer statement-artboard__layer--candles">
      {spritesReady ? (
        <img
          ref={(el) => {
            imgRef.current = el;
            syncRefs();
          }}
          src={SECTION02_CANDLE_FRAME_SRCS[0]}
          alt=""
          className="statement-log-frame statement-log-frame--active"
        />
      ) : null}
      {spritesReady ? (
        <div
          ref={(el) => {
            glowRef.current = el;
            syncRefs();
          }}
          className="statement-candle-glow-frame statement-candle-glow-frame--2 statement-candle-glow-frame--active"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
