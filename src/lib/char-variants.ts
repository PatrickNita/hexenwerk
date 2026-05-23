const A_VARIANTS = [
  "A",
  "À",
  "Á",
  "Â",
  "Ã",
  "Ä",
  "Å",
  "Ā",
  "Ă",
  "Ą",
  "Ǎ",
  "Ȁ",
  "Ȃ",
  "Ȧ",
  "Ǟ",
  "Ǡ",
  "Ǻ",
  "Ḁ",
] as const;

const CONSERVATIVE_VARIANTS: Record<string, readonly string[]> = {
  "1": ["1"],
  "0": ["0"],
  "%": ["%"],
};

const CHAR_VARIANTS: Record<string, readonly string[]> = {
  C: ["C", "Ç", "Ć", "Ĉ", "Ċ", "Č", "Ḉ", "Ȼ"],
  I: ["I", "Ì", "Í", "Î", "Ï", "Ĩ", "Ī", "Ĭ", "Į", "İ", "Ȉ", "Ȋ", "Ḭ", "Ḯ"],
  G: ["G", "Ĝ", "Ğ", "Ġ", "Ģ", "Ǥ", "Ǧ", "Ǵ", "Ḡ"],
  A: A_VARIANTS,
  R: ["R", "Ŕ", "Ř", "Ŗ", "Ȑ", "Ȓ", "Ṙ", "Ṛ", "Ṝ", "Ṟ"],
  L: ["L", "Ŀ", "Ĺ", "Ľ", "Ļ", "Ł", "Ƚ", "Ḷ", "Ḹ"],
  E: ["E", "È", "É", "Ê", "Ë", "Ē", "Ĕ", "Ė", "Ę", "Ě", "Ȅ", "Ȇ"],
  F: ["F", "Ḟ"],
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

export function getCharSlotWidth(char: string): string {
  if (char === "%") {
    return "1.25ch";
  }

  if (char === " ") {
    return "0.35em";
  }

  return "1.15ch";
}
