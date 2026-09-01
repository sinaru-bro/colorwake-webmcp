import { describe, expect, it } from "vitest";
import { LIMITS, type RigId } from "../../../state/types";
import { RIGS } from "../../rigs";
import { clampParams } from "../clamp";
import { partClass } from "../primitives";
import {
  FALLBACK_PRESET_ID,
  PRESETS,
  STOP_PRESET_ID,
  UNIVERSAL_IDS,
  findPreset,
  presetsForRig,
} from "./index";

const rigs = RIGS.map((r) => r.id);

describe("preset catalog", () => {
  it("has 15 rig presets, 6 universal presets and stop", () => {
    expect(PRESETS).toHaveLength(22);
    expect(UNIVERSAL_IDS.sort()).toEqual(["fly", "grow", "hide", "jump", "spin", "stop", "wiggle"]);
    for (const rig of rigs) expect(PRESETS.filter((p) => p.rig === rig)).toHaveLength(3);
    expect(UNIVERSAL_IDS).toContain(FALLBACK_PRESET_ID);
    expect(UNIVERSAL_IDS).toContain(STOP_PRESET_ID);
  });
  it("keeps ids unique within a rig and steps within limits", () => {
    for (const rig of [...rigs, "any"]) {
      const ids = PRESETS.filter((p) => p.rig === rig).map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    for (const p of PRESETS) {
      expect(p.steps.length).toBeLessThanOrEqual(LIMITS.maxSteps);
      expect(p.sayings.length).toBeGreaterThanOrEqual(2);
      for (const s of p.sayings) expect(s).toMatch(/^[\x20-\x7e]+$/);
    }
  });
  it("references only parts that exist on the preset's rig", () => {
    for (const p of PRESETS) {
      if (p.rig === "any") continue;
      const parts = new Set(RIGS.find((r) => r.id === p.rig)!.parts.map((x) => x.id));
      for (const s of p.steps) if (s.part) expect(parts.has(s.part), `${p.rig}/${p.id} ${s.part}`).toBe(true);
    }
  });
  it("never needs clamping (all params within whole/part caps)", () => {
    for (const p of PRESETS) {
      for (const s of p.steps) {
        const ctx = { isPart: !!s.part, partClass: partClass(s.part), speed: 1 };
        const r = clampParams(s.primitive, s.params, ctx);
        expect(r.clamped, `${p.rig}/${p.id} ${s.primitive}${s.part ? "@" + s.part : ""}`).toEqual({});
        expect(r.ignored).toEqual([]);
        if (s.durationMs !== undefined) {
          expect(s.durationMs).toBeGreaterThanOrEqual(LIMITS.durationMs.min);
          expect(s.durationMs).toBeLessThanOrEqual(LIMITS.durationMs.max);
        }
        if (s.delayMs !== undefined) expect(s.delayMs).toBeLessThanOrEqual(LIMITS.delayMs.max);
      }
    }
  });
});

describe("lookup", () => {
  it("prefers the rig's own preset, then universal, then other rigs", () => {
    expect(findPreset("walk", "quadruped")?.source).toBe("rig");
    expect(findPreset("fly", "quadruped")?.source).toBe("universal");
    expect(findPreset("fly", "winged")?.source).toBe("rig");
    expect(findPreset("swim", "quadruped")?.source).toBe("other");
    expect(findPreset("jump", "biped")?.source).toBe("rig");
    expect(findPreset("nope", "biped")).toBeNull();
  });
  it("lists rig presets plus universal ones", () => {
    for (const rig of rigs as RigId[]) {
      const list = presetsForRig(rig);
      expect(list).toHaveLength(10);
      expect(list.map((p) => p.id)).toContain("stop");
    }
  });
});
