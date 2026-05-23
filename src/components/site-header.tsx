import Image from "next/image";
import Link from "next/link";

type SiteHeaderProps = {
  className?: string;
};

export default function SiteHeader({ className }: SiteHeaderProps) {
  return (
    <header className={["site-header", className].filter(Boolean).join(" ")}>
      <Link href="#s1" className="site-header-link">
        <Image
          src="/assets/brand/hexenwerk-logo.webp"
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
