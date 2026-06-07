import Image from "next/image";
import PixelHeading from "@/components/pixel-heading";
import { SITE_LOGO_SRC } from "@/lib/site-assets";

export default function HeroBrand() {
  return (
    <div className="hero-brand">
      <Image
        src={SITE_LOGO_SRC}
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
