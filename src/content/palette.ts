import type { ColorId } from "../state/types";

export interface PaletteColor {
  id: ColorId;
  label: string;
  hex: string;
  aliases: string[];
}

export const PALETTE: PaletteColor[] = [
  { id: "red", label: "Red", hex: "#E5484D", aliases: ["crimson", "scarlet"] },
  { id: "orange", label: "Orange", hex: "#F76B15", aliases: ["tangerine"] },
  { id: "yellow", label: "Yellow", hex: "#FFD60A", aliases: ["gold", "lemon"] },
  { id: "green", label: "Green", hex: "#46A758", aliases: ["grass", "lime"] },
  {
    id: "sky",
    label: "Sky blue",
    hex: "#4CC3F0",
    aliases: ["sky blue", "skyblue", "light blue", "lightblue", "cyan"],
  },
  { id: "blue", label: "Blue", hex: "#3E63DD", aliases: ["navy", "royal blue"] },
  { id: "purple", label: "Purple", hex: "#8E4EC6", aliases: ["violet", "lavender"] },
  { id: "white", label: "White", hex: "#FFFFFF", aliases: ["snow", "ivory"] },
  { id: "peach", label: "Peach", hex: "#F9C9A8", aliases: ["skin", "beige", "apricot"] },
  { id: "brown", label: "Brown", hex: "#A3623D", aliases: ["chocolate", "tan"] },
  { id: "black", label: "Black", hex: "#1F1F1F", aliases: ["dark", "charcoal"] },
];

export const PALETTE_IDS: ColorId[] = PALETTE.map((c) => c.id);

export function paletteColor(id: ColorId): PaletteColor | undefined {
  return PALETTE.find((c) => c.id === id);
}
