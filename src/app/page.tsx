import HeroBrand from "@/components/hero-brand";
import HeroSideArt from "@/components/hero-side-art";
import HeroSpec from "@/components/hero-spec";
import ProductLines from "@/components/product-lines";
import ScrollAwareHeader from "@/components/scroll-aware-header";

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <>
      <ScrollAwareHeader />

      <main className="snap-root">
        <section id="s1" className="snap-section snap-section--hero">
          <div className="hero-top">
            <div className="hero-top__cell hero-top__cell--side">
              <HeroSideArt flip />
            </div>
            <div className="hero-top__cell hero-top__cell--brand">
              <HeroBrand />
            </div>
            <div className="hero-top__cell hero-top__cell--side">
              <HeroSideArt />
            </div>
          </div>
          <div className="hero-stage">
            <HeroSpec />
          </div>
          <span className="scroll-hint">↓ 02</span>
        </section>

        <section id="s2" className="snap-section snap-section--lines">
          <div className="section-inner section-inner--lines">
            <div className="mb-4 flex items-end justify-between border-b-2 border-border pb-3 md:mb-6">
              <h2 className="text-xs uppercase tracking-[0.3em] md:text-sm">
                Product Lines
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                Click
              </span>
            </div>
            <ProductLines />
          </div>
        </section>

        <section id="s3" className="snap-section">
          <div className="section-inner items-center text-center">
            <div className="mx-auto max-w-lg">
              <h2 className="font-mono text-2xl uppercase tracking-[0.3em] md:text-4xl">
                One Standard.
              </h2>
              <p className="mt-8 text-sm leading-relaxed text-muted md:text-base">
                Raw leaf. No compromise.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                Five lines. One source.
              </p>
            </div>
          </div>
        </section>

        <section id="s4" className="snap-section">
          <div className="section-inner section-slab justify-end">
            <div className="w-full">
              <div className="ember-rule mb-8" aria-hidden />
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted">
                © {year} Hexenwerk Tobacco
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
