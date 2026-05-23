"use client";

import { useEffect, useRef, useState } from "react";
import { useCursorTheme } from "@/components/cursor-provider";

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
  const { setActiveLineId } = useCursorTheme();
  const panelRefs = useRef<(HTMLLIElement | null)[]>([]);

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

  const togglePanel = (index: string, lineId: string) => {
    setOpenIndex((current) => {
      const next = current === index ? null : index;
      if (next) {
        setActiveLineId(lineId);
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
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                setActiveLineId(line.id);
              }
            }}
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
