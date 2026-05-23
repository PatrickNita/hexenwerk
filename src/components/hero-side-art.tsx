import Image from "next/image";

type HeroSideArtProps = {
  flip?: boolean;
};

export default function HeroSideArt({ flip }: HeroSideArtProps) {
  return (
    <div className={flip ? "hero-top__art hero-top__art--flip" : "hero-top__art"}>
      <Image
        src="/assets/hero/witch.png"
        alt=""
        fill
        priority
        sizes="25vw"
        className="hero-top__art-image"
      />
    </div>
  );
}
