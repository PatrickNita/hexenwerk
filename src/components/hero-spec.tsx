"use client";

import { useCursorTheme } from "@/components/cursor-provider";
import { getLineAccentColor } from "@/lib/line-accents";

type SpecRow = {
  label: string;
  value: string;
  accent?: boolean;
};

const SPEC_ROWS: SpecRow[] = [
  { label: "Type", value: "Ligero / Seco" },
  { label: "Sort", value: "Criollo 98 / Piloto Cubano" },
  { label: "Leaf Origin", value: "Dominican Republic" },
  { label: "Origin", value: "Single Origin" },
  { label: "Strength", value: "7/10", accent: true },
  { label: "Lines", value: "05" },
];

export default function HeroSpec() {
  const { activeLineId } = useCursorTheme();
  const strengthColor = getLineAccentColor(activeLineId);

  return (
    <dl className="hero-spec">
      {SPEC_ROWS.map(({ label, value, accent }) => (
        <div key={label} className="hero-spec__cell">
          <div className="hero-spec__content">
            <dt>{label}</dt>
            <dd
              className={accent ? "hero-spec__value--accent" : undefined}
              style={accent ? { color: strengthColor } : undefined}
            >
              {value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
