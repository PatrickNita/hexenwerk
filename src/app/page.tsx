import Image from "next/image";

const lines = [
  {
    index: "01",
    name: "Beverage",
    blurb: "Bar and mixology-forward profiles.",
  },
  {
    index: "02",
    name: "Botanical",
    blurb: "Herbal depth, raw and structured.",
  },
  {
    index: "03",
    name: "Essence",
    blurb: "Concentrated character, stripped back.",
  },
  {
    index: "04",
    name: "Gastronomy",
    blurb: "Savory alignment for the table.",
  },
  {
    index: "05",
    name: "Perfumery",
    blurb: "Aromatic precision, dark florals.",
  },
] as const;

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="relative z-10 flex min-h-full flex-col font-sans">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-foreground">
          Hexenwerk / Tobacco
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-muted">
          05 Lines
        </p>
      </header>

      <section className="flex flex-col items-center justify-center px-6 py-24 md:py-32 lg:py-40">
        <Image
          src="/assets/brand/hexenwerk-logo.webp"
          alt="HEXENWERK"
          width={640}
          height={200}
          priority
          className="h-auto w-full max-w-xl md:max-w-2xl"
        />
        <p className="mt-12 max-w-md text-center text-[11px] uppercase tracking-[0.45em] text-muted">
          Five distinct lines. One standard.
        </p>
      </section>

      <hr className="border-border" />

      <section className="px-6 py-16 md:px-10 md:py-20">
        <div className="mb-10 flex items-end justify-between border-b border-border pb-4">
          <h2 className="text-sm uppercase tracking-[0.3em] text-foreground">
            Product Lines
          </h2>
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            Index 01-05
          </span>
        </div>

        <ul className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {lines.map((line) => (
            <li
              key={line.index}
              className="group flex flex-col bg-surface transition-colors hover:bg-surface-hover"
            >
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
                  {line.index}
                </span>
                <h3 className="mt-4 text-lg uppercase tracking-[0.2em] text-foreground">
                  {line.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {line.blurb}
                </p>
                <div
                  className="hatch mt-8 flex min-h-32 items-end border border-border p-4 transition-colors group-hover:border-border-hover"
                  aria-hidden
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted/60">
                    {line.name}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <hr className="border-border" />

      <footer className="mt-auto border-t border-border px-6 py-6 md:px-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
          © {year} Hexenwerk Tobacco
        </p>
      </footer>
    </div>
  );
}
