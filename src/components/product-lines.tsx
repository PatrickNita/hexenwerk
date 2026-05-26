"use client";

import { useEffect, useRef, useState } from "react";
import { useCursorTheme } from "@/components/cursor-provider";
import { getGlowSpriteColor } from "@/lib/fire-glow";
import { getLineColorPair } from "@/lib/line-colors";

const lines = [
  {
    id: "beverage",
    index: "01",
    name: "Beverage",
    blurb: "Bar and mixology-forward profiles.",
  },
  {
    id: "botanical",
    index: "02",
    name: "Botanical",
    blurb: "Herbal depth, raw and structured.",
  },
  {
    id: "essence",
    index: "03",
    name: "Essence",
    blurb: "Concentrated character, stripped back.",
  },
  {
    id: "gastronomy",
    index: "04",
    name: "Gastronomy",
    blurb: "Savory alignment for the table.",
  },
  {
    id: "perfumery",
    index: "05",
    name: "Perfumery",
    blurb: "Aromatic precision, dark florals.",
  },
] as const;

export default function ProductLines() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const { pinLineId, unpinLineId } = useCursorTheme();
  const panelRefs = useRef<(HTMLLIElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const openIndexRef = useRef(openIndex);
  const debugRafRef = useRef({ frames: 0, lastSampleAt: 0 });
  const s3EngagedRef = useRef(false);
  const rafRunningRef = useRef(false);
  const updateLoopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    openIndexRef.current = openIndex;
    updateLoopRef.current?.();
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    const panelIndex = lines.findIndex((line) => line.index === openIndex);
    const panel = panelRefs.current[panelIndex];

    panel?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [openIndex]);

  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const s3 = document.getElementById("s3");

    const shouldRun = () =>
      openIndexRef.current !== null || s3EngagedRef.current;

    const stopLoop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      rafRunningRef.current = false;
    };

    const syncPanelAccents = (now: number) => {
      const hasOpen = openIndexRef.current !== null;

      lines.forEach((line, lineIndex) => {
        const panel = panelRefs.current[lineIndex];
        if (!panel) {
          return;
        }

        const isOpenPanel = openIndexRef.current === line.index;
        const isHovered = panel.matches(":hover");
        const isActive =
          isOpenPanel || (isHovered && (!hasOpen || !isOpenPanel));

        if (!isActive) {
          panel.style.removeProperty("--line-accent");
          return;
        }

        if (motionMedia.matches) {
          const colors = getLineColorPair(line.id);
          if (colors) {
            panel.style.setProperty("--line-accent", colors.vivid);
          }
          return;
        }

        panel.style.setProperty(
          "--line-accent",
          getGlowSpriteColor(now, line.id),
        );
      });
    };

    const tick = (now: number) => {
      if (!shouldRun()) {
        stopLoop();
        return;
      }

      syncPanelAccents(now);
      const perf = debugRafRef.current;
      perf.frames += 1;
      if (perf.lastSampleAt === 0) {
        perf.lastSampleAt = now;
      } else if (now - perf.lastSampleAt >= 2000) {
        const elapsedSec = (now - perf.lastSampleAt) / 1000;
        // #region agent log
        fetch("http://127.0.0.1:7524/ingest/5e4ed788-fddd-43ad-9fc8-34c88879a75a", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "4ae409",
          },
          body: JSON.stringify({
            sessionId: "4ae409",
            runId: "post-fix",
            hypothesisId: "D",
            location: "product-lines.tsx:tick",
            message: "product lines RAF sample",
            data: {
              rafFps: Math.round(perf.frames / elapsedSec),
              openIndex: openIndexRef.current,
              s3Engaged: s3EngagedRef.current,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        perf.frames = 0;
        perf.lastSampleAt = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafRunningRef.current || motionMedia.matches) {
        return;
      }
      rafRunningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };

    const updateLoop = () => {
      if (shouldRun()) {
        startLoop();
      } else {
        stopLoop();
        panelRefs.current.forEach((panel) => {
          panel?.style.removeProperty("--line-accent");
        });
      }
    };

    const engageS3 = () => {
      s3EngagedRef.current = true;
      updateLoop();
    };

    const disengageS3 = () => {
      s3EngagedRef.current = false;
      updateLoop();
    };

    s3?.addEventListener("mouseenter", engageS3);
    s3?.addEventListener("mouseleave", disengageS3);
    updateLoopRef.current = updateLoop;
    updateLoop();

    return () => {
      updateLoopRef.current = null;
      s3?.removeEventListener("mouseenter", engageS3);
      s3?.removeEventListener("mouseleave", disengageS3);
      stopLoop();
      panelRefs.current.forEach((panel) => {
        panel?.style.removeProperty("--line-accent");
      });
    };
  }, []);

  const togglePanel = (index: string, lineId: string) => {
    setOpenIndex((current) => {
      const next = current === index ? null : index;
      if (next) {
        pinLineId(lineId);
      } else {
        unpinLineId();
      }
      return next;
    });
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLLIElement>,
    index: string,
    lineId: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      togglePanel(index, lineId);
    }
  };

  return (
    <ul className="lines-track">
      {lines.map((line, lineIndex) => {
        const isOpen = openIndex === line.index;

        return (
          <li
            key={line.index}
            ref={(element) => {
              panelRefs.current[lineIndex] = element;
            }}
            data-line={line.id}
            className={`line-panel${isOpen ? " line-panel--open" : ""}`}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onClick={() => togglePanel(line.index, line.id)}
            onKeyDown={(event) => handleKeyDown(event, line.index, line.id)}
          >
            <div className="line-panel-inner">
              <span className="line-index-box">{line.index}</span>
              <h3 className="line-name">{line.name}</h3>
              <p className="line-blurb">{line.blurb}</p>
              {isOpen ? (
                <div className="line-panel-actions">
                  <button
                    type="button"
                    className="line-panel-btn line-panel-btn--line"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Explore {line.name}
                  </button>
                  <button
                    type="button"
                    className="line-panel-btn line-panel-btn--all"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Explore All Products
                  </button>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
