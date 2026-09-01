import { PALETTE, type PaletteColor } from "../content/palette";

export interface ColorMatch {
  id: string;
  mapped: { from: string; to: string } | null;
}

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
};

function parseHex(input: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function nearest(rgb: [number, number, number]): PaletteColor {
  let best = PALETTE[0];
  let bestD = Infinity;
  for (const c of PALETTE) {
    const p = parseHex(c.hex)!;
    const d = (p[0] - rgb[0]) ** 2 + (p[1] - rgb[1]) ** 2 + (p[2] - rgb[2]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

export function resolveColor(input: string): ColorMatch | null {
  const key = input.trim().toLowerCase();
  if (!key) return null;
  const exact = PALETTE.find((c) => c.id === key || c.label.toLowerCase() === key);
  if (exact) return { id: exact.id, mapped: null };
  const alias = PALETTE.find((c) => c.aliases.includes(key));
  if (alias) return { id: alias.id, mapped: { from: input, to: alias.id } };
  const rgb =
    parseHex(key) ??
    (CSS_NAMES[key.replace(/\s+/g, "")] ? parseHex(CSS_NAMES[key.replace(/\s+/g, "")]) : null);
  if (!rgb) return null;
  const n = nearest(rgb);
  return { id: n.id, mapped: { from: input, to: n.id } };
}
