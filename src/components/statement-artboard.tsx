"use client";

import { useCursorTheme } from "@/components/cursor-provider";
import StatementCandleLayer from "@/components/statement-candle-layer";
import {
  StatementArtboardRuntimeProvider,
  useStatementArtboardRuntime,
} from "@/components/statement-artboard-runtime";
import StatementLightningLayer from "@/components/statement-lightning-witches";
import StatementLogLayer from "@/components/statement-log-layer";
import {
  SECTION02_BG_SRC,
  SECTION02_PRODUCT_SRC,
} from "@/lib/section02-assets";
import Image from "next/image";

function StatementArtboardContent() {
  const { registerProduct, registerFireGlow } = useStatementArtboardRuntime();
  const { pinnedLineId, activeLineId, setActiveLineId } = useCursorTheme();

  return (
    <div className="statement-artboard">
      <Image
        src={SECTION02_BG_SRC}
        alt=""
        fill
        unoptimized
        className="statement-artboard__layer statement-artboard__layer--bg"
        sizes="100vw"
        priority
      />
      <div ref={registerFireGlow} className="statement-fire-glow">
        <StatementLogLayer />
        <StatementCandleLayer />
        <StatementLightningLayer />
      </div>
      <Image
        ref={registerProduct}
        src={SECTION02_PRODUCT_SRC}
        alt="Hexenwerk Red Wine tin"
        width={480}
        height={480}
        unoptimized
        priority
        className="statement-artboard__product"
        sizes="(max-width: 767px) 18.7vw, 19.8vw"
      />
      <div
        className="statement-fire-hit"
        aria-hidden
        onClick={() => {
          if (pinnedLineId !== null) {
            return;
          }

          setActiveLineId(activeLineId === "fire" ? null : "fire");
        }}
      />
    </div>
  );
}

export default function StatementArtboard() {
  return (
    <StatementArtboardRuntimeProvider>
      <StatementArtboardContent />
    </StatementArtboardRuntimeProvider>
  );
}
