"use client";

import { useStatementArtboardRuntime } from "@/components/statement-artboard-runtime";
import { useCallback, useRef } from "react";

export default function StatementLightningLayer() {
  const { registerLightning } = useStatementArtboardRuntime();
  const lightningRef = useRef<HTMLDivElement>(null);

  const syncRef = useCallback(() => {
    registerLightning(lightningRef.current);
  }, [registerLightning]);

  return (
    <div
      ref={(el) => {
        lightningRef.current = el;
        syncRef();
      }}
      className="statement-lightning"
      style={{
        WebkitMaskImage: 'url("/assets/section02/lightning-witches.png")',
        maskImage: 'url("/assets/section02/lightning-witches.png")',
      }}
      aria-hidden
    />
  );
}
