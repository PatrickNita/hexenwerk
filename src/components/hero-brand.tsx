import Image from "next/image";
import PixelHeading from "@/components/pixel-heading";

export default function HeroBrand() {
  return (
    <div className="hero-brand">
      <Image
        src="/assets/brand/hexenwerk-logo.webp"
        alt="HEXENWERK"
        width={176}
        height={38}
        priority
        className="hero-brand-logo"
        style={{ width: "auto" }}
      />
      <PixelHeading />
    </div>
  );
}
