import { PALETTE, paletteColor } from "../content/palette";

export interface ColorMatch {
  /** Palette id, or a lowercase #rrggbb for a color outside the palette. */
  color: string;
  mapped: { from: string; to: string } | null;
}

const HEX = /^#[0-9a-f]{6}$/i;

const CSS_NAMES: Record<string, string> = {
  red: "#ff0000",
  orange: "#ffa500",
  yellow: "#ffff00",
  green: "#008000",
  blue: "#0000ff",
  purple: "#800080",
  pink: "#ffc0cb",
  brown: "#a52a2a",
  black: "#000000",
  white: "#ffffff",
  gray: "#808080",
  grey: "#808080",
  violet: "#ee82ee",
  teal: "#008080",
  navy: "#000080",
  lime: "#00ff00",
  cyan: "#00ffff",
  magenta: "#ff00ff",
  gold: "#ffd700",
  beige: "#f5f5dc",
  skyblue: "#87ceeb",
  lightblue: "#add8e6",
  salmon: "#fa8072",
  tan: "#d2b48c",
  silver: "#c0c0c0",
  turquoise: "#40e0d0",
  coral: "#ff7f50",
  hotpink: "#ff69b4",
  mint: "#98ff98",
  olive: "#808000",
  maroon: "#800000",
  indigo: "#4b0082",
  lavender: "#e6e6fa",
};

function normalizeHex(input: string): string | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return null;
  let h = m[1].toLowerCase();
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  return `#${h}`;
}

/** True for a color outside the palette, stored as #rrggbb. */
export function isCustomColor(color: string): boolean {
  return HEX.test(color);
}

/** CSS hex for a palette id or custom color; undefined when neither. */
export function colorHex(color: string): string | undefined {
  return paletteColor(color)?.hex ?? (HEX.test(color) ? color : undefined);
}

/** Text luminance helper: dark ink reads better on light colors. */
export function isLightColor(hex: string): boolean {
  const h = normalizeHex(hex);
  if (!h) return false;
  const n = parseInt(h.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

export function resolveColor(input: string): ColorMatch | null {
  const key = input.trim().toLowerCase();
  if (!key) return null;
  const exact = PALETTE.find((c) => c.id === key || c.label.toLowerCase() === key);
  if (exact) return { color: exact.id, mapped: null };
  const alias = PALETTE.find((c) => c.aliases.includes(key));
  if (alias) return { color: alias.id, mapped: { from: input, to: alias.id } };
  const hex = normalizeHex(key);
  if (hex) {
    const same = PALETTE.find((c) => c.hex.toLowerCase() === hex);
    return same ? { color: same.id, mapped: { from: input, to: same.id } } : { color: hex, mapped: null };
  }
  const named = CSS_NAMES[key.replace(/\s+/g, "")];
  return named ? { color: named, mapped: { from: input, to: named } } : null;
}
