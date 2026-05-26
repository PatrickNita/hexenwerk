"use client";

import { useCursorTheme } from "@/components/cursor-provider";
import StatementCandleLayer from "@/components/statement-candle-layer";
import {
  StatementArtboardRuntimeProvider,
  useStatementArtboardRuntime,
} from "@/components/statement-artboard-runtime";
import StatementLightningLayer from "@/components/statement-lightning-witches";
import StatementLogLayer from "@/components/statement-log-layer";
import { SECTION02_PRODUCT_SRC } from "@/lib/section02-assets";
import Image from "next/image";

function StatementArtboardContent() {
  const { registerProduct, registerFireGlow } = useStatementArtboardRuntime();
  const { pinnedLineId, setActiveLineId } = useCursorTheme();

  return (
    <div className="statement-artboard">
      <Image
        src="/assets/section02/section02.png"
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
        className="statement-artboard__product"
        sizes="(max-width: 767px) 42vw, 22vw"
      />
      <div
        className="statement-fire-hit"
        aria-hidden
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse" && pinnedLineId === null) {
            setActiveLineId("fire");
          }
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
