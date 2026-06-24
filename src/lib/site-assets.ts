export const SITE_LOGO_VERSION = 2;

export function getSiteLogoSrc(): string {
  return `/assets/brand/hexenwerk-logo.webp?v=${SITE_LOGO_VERSION}`;
}

export const SITE_LOGO_SRC = getSiteLogoSrc();
export const SITE_HERO_WITCH_SRC = "/assets/hero/witch.png";

export const SITE_PRELOAD_SRCS = [
  SITE_LOGO_SRC,
  SITE_HERO_WITCH_SRC,
] as const;
