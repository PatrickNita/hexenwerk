import { SITE_PRELOAD_SRCS } from "@/lib/site-assets";

export default function SitePreloadLinks() {
  return SITE_PRELOAD_SRCS.map((href) => (
    <link key={href} rel="preload" as="image" href={href} />
  ));
}
