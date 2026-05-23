// Variants scoped to glyphs present in Geist Pixel Grid (GeistPixel-Grid.woff2).

const CONSERVATIVE_VARIANTS: Record<string, readonly string[]> = {
  "1": ["1"],
  "0": ["0"],
  "%": ["%"],
};

const CHAR_VARIANTS: Record<string, readonly string[]> = {
  C: ["C", "Ç", "Ć", "Ĉ", "Ċ", "Č"],
  I: ["I", "Ì", "Í", "Î", "Ï", "Ĩ", "Ī", "Į", "İ"],
  G: ["G", "Ĝ", "Ğ", "Ġ", "Ģ", "Ḡ"],
  A: ["A", "À", "Á", "Â", "Ã", "Ä", "Å", "Ā", "Ă", "Ą", "Ǎ"],
  R: ["R", "Ŕ", "Ř", "Ŗ"],
  L: ["L", "Ĺ", "Ľ", "Ļ", "Ł"],
  E: ["E", "È", "É", "Ê", "Ë", "Ē", "Ė", "Ę", "Ě"],
  F: ["F"],
};

const CONSERVATIVE_PREFIX = "100%";

function isConservativeIndex(charIndex: number, text: string): boolean {
  return text.startsWith(CONSERVATIVE_PREFIX) && charIndex < CONSERVATIVE_PREFIX.length;
}

export function getVariantsForChar(
  char: string,
  charIndex = 0,
  text = "",
): readonly string[] {
  if (isConservativeIndex(charIndex, text)) {
    return CONSERVATIVE_VARIANTS[char] ?? [char];
  }

  const key = char.toUpperCase();

  return CHAR_VARIANTS[key] ?? [char];
}
