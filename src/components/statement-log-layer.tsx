"use client";

import { useStatementArtboardRuntime } from "@/components/statement-artboard-runtime";
import { SECTION02_LOG_FRAME_SRCS } from "@/lib/section02-assets";
import { useCallback, useRef } from "react";

export default function StatementLogLayer() {
  const { registerLogSprite } = useStatementArtboardRuntime();
  const imgRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const syncRefs = useCallback(() => {
    registerLogSprite(imgRef.current, glowRef.current);
  }, [registerLogSprite]);

  return (
    <div className="statement-artboard__layer statement-artboard__layer--log">
      <img
        ref={(el) => {
          imgRef.current = el;
          syncRefs();
        }}
        src={SECTION02_LOG_FRAME_SRCS[0]}
        alt=""
        className="statement-log-frame statement-log-frame--active"
      />
      <div
        ref={(el) => {
          glowRef.current = el;
          syncRefs();
        }}
        className="statement-log-glow-frame statement-log-glow-frame--1 statement-log-glow-frame--active"
        aria-hidden
      />
    </div>
  );
}
