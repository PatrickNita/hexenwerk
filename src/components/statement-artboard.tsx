"use client";

import { useCursorTheme } from "@/components/cursor-provider";
import StatementCandleFire from "@/components/statement-candle-fire";
import StatementLightningLayer from "@/components/statement-lightning-witches";
import StatementLogFire from "@/components/statement-log-fire";
import { SECTION02_CANDLE_SRCS } from "@/lib/section02-assets";
import Image from "next/image";

export default function StatementArtboard() {
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
      <Image
        src="/assets/section02/log.png"
        alt=""
        fill
        unoptimized
        className="statement-artboard__layer statement-artboard__layer--log"
        sizes="100vw"
      />
      <StatementLogFire layer="embers" />
      <StatementLightningLayer />
      <StatementLogFire layer="smoke" />
      {SECTION02_CANDLE_SRCS.map((src) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          unoptimized
          className="statement-artboard__layer statement-artboard__layer--candles"
          sizes="100vw"
        />
      ))}
      <StatementCandleFire />
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
