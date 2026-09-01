import { LIMITS, type EffectId, type Intensity } from "../state/types";

export interface EffectDef {
  id: EffectId;
  label: string;
  sayings: string[];
  attachable: boolean;
  particles: Record<Intensity, number>;
  cycleMs: number;
}

export const MAX_EFFECTS = LIMITS.maxEffects;

export const EFFECTS: EffectDef[] = [
  {
    id: "stars",
    label: "Stars",
    sayings: ["twinkle", "sparkles", "starry"],
    attachable: false,
    particles: { light: 12, normal: 20, heavy: 32 },
    cycleMs: 3000,
  },
  {
    id: "hearts",
    label: "Hearts",
    sayings: ["love", "hugs", "kisses"],
    attachable: true,
    particles: { light: 6, normal: 10, heavy: 16 },
    cycleMs: 4000,
  },
  {
    id: "bubbles",
    label: "Bubbles",
    sayings: ["bubbly", "blow bubbles"],
    attachable: true,
    particles: { light: 10, normal: 18, heavy: 30 },
    cycleMs: 5000,
  },
];

export const EFFECT_IDS: EffectId[] = EFFECTS.map((e) => e.id);

export function effectById(id: string): EffectDef | undefined {
  return EFFECTS.find((e) => e.id === id);
}
