import type { TimeId } from "../../state/types";

export interface SkyDef {
  id: TimeId;
  label: string;
  sayings: string[];
  gradient: { top: string; horizon: string };
  celestial: "sun" | "moon";
  stars: number;
  placeBrightness: number;
  placeSaturate: number;
}

export const TIMES: SkyDef[] = [
  {
    id: "day",
    label: "Day",
    sayings: ["daytime", "morning", "sunny day"],
    gradient: { top: "#BFE6FF", horizon: "#EAF7FF" },
    celestial: "sun",
    stars: 0,
    placeBrightness: 1,
    placeSaturate: 1,
  },
  {
    id: "night",
    label: "Night",
    sayings: ["nighttime", "dark", "bedtime", "moon"],
    gradient: { top: "#1B2350", horizon: "#3B4A8A" },
    celestial: "moon",
    stars: 20,
    placeBrightness: 0.7,
    placeSaturate: 0.85,
  },
];

export function timeById(id: string): SkyDef | undefined {
  return TIMES.find((t) => t.id === id);
}
