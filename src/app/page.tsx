import HeroBrand from "@/components/hero-brand";
import HeroSideArt from "@/components/hero-side-art";
import HeroSpec from "@/components/hero-spec";
import ProductLines from "@/components/product-lines";
import ScrollAwareHeader from "@/components/scroll-aware-header";
import SectionCrumb from "@/components/section-crumb";
import Image from "next/image";

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
          <div className="statement-crumb">
            <SectionCrumb label="The Product" meta="02" />
          </div>
          <div className="statement-upper">
            <div className="statement-upper__content">
              <h2 className="statement-headline">
                HEXENWERK - 100% CIGAR LEAF HOOKAH TOBACCO
              </h2>
              <p className="statement-body">
                Single-origin cigar leaf. No glycerin. No molasses. Built for
                heat, not compromise.
              </p>
              <div className="statement-product-image">
                <Image
                  src="/assets/section02/section02_product.webp"
                  alt=""
                  fill
                  unoptimized
                  className="statement-product-image__img"
                  sizes="(max-width: 768px) 100vw, 48rem"
                />
              </div>
            </div>
          </div>
          <div className="statement-lower">
            <Image
              src="/assets/section02/section02.webp"
              alt=""
              fill
              unoptimized
              className="statement-image"
              sizes="100vw"
            />
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
