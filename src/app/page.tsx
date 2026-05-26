import HeroBrand from "@/components/hero-brand";
import HeroSideArt from "@/components/hero-side-art";
import HeroSpec from "@/components/hero-spec";
import ProductLines from "@/components/product-lines";
import ScrollAwareHeader from "@/components/scroll-aware-header";
import SectionCrumb from "@/components/section-crumb";
import StatementArtboard from "@/components/statement-artboard";

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

        <section id="s2" className="snap-section snap-section--statement">
          <div className="statement-crumb-band">
            <SectionCrumb label="The Product" meta="02" />
          </div>
          <div className="statement-stage">
            <div className="statement-bg-wrap">
              <StatementArtboard />
            </div>
          </div>
        </section>

        <section id="s3" className="snap-section snap-section--lines">
          <div className="section-inner section-inner--lines">
            <SectionCrumb label="Product Lines" meta="03" />
            <ProductLines />
          </div>
        </section>

        <section id="s4" className="snap-section">
          <div className="section-inner section-slab">
            <SectionCrumb label="Legal" meta="04" />
            <div className="mt-auto w-full">
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
