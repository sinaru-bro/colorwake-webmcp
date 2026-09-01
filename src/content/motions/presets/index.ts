import type { Preset, RigId } from "../../../state/types";
import { BIPED_PRESETS } from "./biped";
import { OBJECT_PRESETS } from "./object";
import { QUADRUPED_PRESETS } from "./quadruped";
import { SWIMMER_PRESETS } from "./swimmer";
import { UNIVERSAL_PRESETS } from "./universal";
import { WINGED_PRESETS } from "./winged";

const RIG_ORDER: RigId[] = ["quadruped", "swimmer", "winged", "biped", "object"];

const BY_RIG: Record<RigId, Preset[]> = {
  quadruped: QUADRUPED_PRESETS,
  swimmer: SWIMMER_PRESETS,
  winged: WINGED_PRESETS,
  biped: BIPED_PRESETS,
  object: OBJECT_PRESETS,
};

export const PRESETS: Preset[] = [...RIG_ORDER.flatMap((r) => BY_RIG[r]), ...UNIVERSAL_PRESETS];

export const UNIVERSAL_IDS: string[] = UNIVERSAL_PRESETS.map((p) => p.id);

export const FALLBACK_PRESET_ID = "wiggle";
export const STOP_PRESET_ID = "stop";

export type PresetSource = "rig" | "universal" | "other";

export function presetsForRig(rig: RigId): Preset[] {
  return [...BY_RIG[rig], ...UNIVERSAL_PRESETS];
}

export function findPreset(id: string, rig: RigId): { preset: Preset; source: PresetSource } | null {
  const own = BY_RIG[rig].find((p) => p.id === id);
  if (own) return { preset: own, source: "rig" };
  const universal = UNIVERSAL_PRESETS.find((p) => p.id === id);
  if (universal) return { preset: universal, source: "universal" };
  for (const other of RIG_ORDER) {
    if (other === rig) continue;
    const hit = BY_RIG[other].find((p) => p.id === id);
    if (hit) return { preset: hit, source: "other" };
  }
  return null;
}
