import type { WeatherId } from "../../state/types";

export type ParticleKind = "none" | "rays" | "drops" | "flakes" | "clouds" | "leaves";

export interface WeatherDef {
  id: WeatherId;
  label: string;
  sayings: string[];
  particle: { kind: ParticleKind; count: number; cycleMs: number };
  brightness: number;
  dayOnly?: boolean;
  actorTilt?: { degrees: number; periodMs: number };
  flash?: { minGapMs: number; maxGapMs: number; durationMs: number };
}

export const WEATHERS: WeatherDef[] = [
  {
    id: "clear",
    label: "Clear",
    sayings: ["sunny", "sunshine", "nice day"],
    particle: { kind: "rays", count: 6, cycleMs: 24000 },
    brightness: 1.03,
    dayOnly: true,
  },
  {
    id: "rain",
    label: "Rain",
    sayings: ["raining", "rainy", "shower"],
    particle: { kind: "drops", count: 64, cycleMs: 900 },
    brightness: 0.95,
  },
  {
    id: "snow",
    label: "Snow",
    sayings: ["snowing", "snowy", "snowflakes"],
    particle: { kind: "flakes", count: 30, cycleMs: 6000 },
    brightness: 1,
  },
  {
    id: "cloudy",
    label: "Cloudy",
    sayings: ["gray sky", "overcast", "clouds"],
    particle: { kind: "clouds", count: 4, cycleMs: 50000 },
    brightness: 0.9,
  },
  {
    id: "wind",
    label: "Windy",
    sayings: ["breeze", "blowing", "gusty"],
    particle: { kind: "leaves", count: 20, cycleMs: 2500 },
    brightness: 1,
    actorTilt: { degrees: 3, periodMs: 2000 },
  },
  {
    id: "thunder",
    label: "Thunderstorm",
    sayings: ["lightning", "storm", "boom"],
    particle: { kind: "drops", count: 110, cycleMs: 700 },
    brightness: 0.6,
    flash: { minGapMs: 4000, maxGapMs: 9000, durationMs: 200 },
  },
];

export function weatherById(id: string): WeatherDef | undefined {
  return WEATHERS.find((w) => w.id === id);
}
