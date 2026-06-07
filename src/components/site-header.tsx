import Image from "next/image";
import Link from "next/link";
import { SITE_LOGO_SRC } from "@/lib/site-assets";

type SiteHeaderProps = {
  className?: string;
};

export default function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header
      className={["site-header", className].filter(Boolean).join(" ")}
    >
      <Link href="#s1" className="site-header-link">
        <Image
          src={SITE_LOGO_SRC}
          alt="HEXENWERK"
          width={176}
          height={38}
          priority
          className="site-header-logo"
        />
      </Link>
    </header>
  );
}
