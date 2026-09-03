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
  chooseVariant,
  findPreset,
  presetsForRig,
  variantIds,
} from "./index";

const rigs = RIGS.map((r) => r.id);

describe("preset catalog", () => {
  it("has a lean preset set per body type, six universal presets and stop", () => {
    expect(PRESETS).toHaveLength(34);
    expect(UNIVERSAL_IDS.sort()).toEqual(["grow", "hide", "jump", "spin", "stop", "wiggle"]);
    const counts: Record<string, number> = { quadruped: 7, swimmer: 5, winged: 5, biped: 6, object: 5 };
    for (const rig of rigs) expect(PRESETS.filter((p) => p.rig === rig)).toHaveLength(counts[rig]);
    expect(UNIVERSAL_IDS).toContain(FALLBACK_PRESET_ID);
    expect(UNIVERSAL_IDS).toContain(STOP_PRESET_ID);
  });
  it("gives every body type its shared moves plus a signature move", () => {
    for (const rig of rigs) {
      for (const id of ["swim", "fly", "dance", "greet"])
        expect(findPreset(id, rig)?.source, `${rig}/${id}`).toBe("rig");
    }
    const signatures: Record<string, string> = {
      quadruped: "wag",
      swimmer: "dive",
      winged: "peck",
      biped: "cheer",
      object: "launch",
    };
    for (const rig of rigs) expect(findPreset(signatures[rig], rig)?.source, rig).toBe("rig");
  });
  it("keeps ids unique within a rig and every variant within limits", () => {
    for (const rig of [...rigs, "any"]) {
      const ids = PRESETS.filter((p) => p.rig === rig).map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    for (const p of PRESETS) {
      expect(p.variants.length).toBeGreaterThanOrEqual(1);
      expect(new Set(p.variants.map((v) => v.id)).size).toBe(p.variants.length);
      expect(p.sayings.length).toBeGreaterThanOrEqual(2);
      for (const s of p.sayings) expect(s).toMatch(/^[\x20-\x7e]+$/);
      for (const v of p.variants) {
        expect(v.steps.length, `${p.rig}/${p.id}/${v.id}`).toBeLessThanOrEqual(LIMITS.maxSteps);
        if (v.pose) expect(Math.abs(v.pose.rotate)).toBeLessThanOrEqual(90);
      }
    }
  });
  it("references only parts that exist on the preset's rig", () => {
    for (const p of PRESETS) {
      if (p.rig === "any") continue;
      const parts = new Set(RIGS.find((r) => r.id === p.rig)!.parts.map((x) => x.id));
      for (const v of p.variants) {
        for (const s of v.steps)
          if (s.part) expect(parts.has(s.part), `${p.rig}/${p.id}/${v.id} ${s.part}`).toBe(true);
      }
    }
  });
  it("never needs clamping (all params within whole/part caps)", () => {
    for (const p of PRESETS) {
      for (const v of p.variants) {
        for (const s of v.steps) {
          const ctx = { isPart: !!s.part, partClass: partClass(s.part), speed: 1 };
          const r = clampParams(s.primitive, s.params, ctx);
          expect(r.clamped, `${p.rig}/${p.id}/${v.id} ${s.primitive}${s.part ? "@" + s.part : ""}`).toEqual(
            {},
          );
          expect(r.ignored).toEqual([]);
          if (s.durationMs !== undefined) {
            expect(s.durationMs).toBeGreaterThanOrEqual(LIMITS.durationMs.min);
            expect(s.durationMs).toBeLessThanOrEqual(LIMITS.durationMs.max);
          }
          if (s.delayMs !== undefined) expect(s.delayMs).toBeLessThanOrEqual(LIMITS.delayMs.max);
        }
      }
    }
  });
  it("lies front-on bodies down to swim and fly, and keeps side-on swimmers level", () => {
    expect(findPreset("swim", "biped")?.preset.variants[0].pose).toEqual({ rotate: 80 });
    expect(findPreset("fly", "object")?.preset.variants[0].pose).toEqual({ rotate: 90 });
    expect(findPreset("swim", "quadruped")?.preset.variants[0].pose).toEqual({ rotate: 65 });
    expect(findPreset("fly", "winged")?.preset.variants[0].pose).toBeUndefined();
  });
});

describe("variants", () => {
  it("names variants only when there is a choice", () => {
    expect(variantIds(findPreset("fly", "biped")!.preset)).toEqual(["around", "away", "high", "loop"]);
    expect(variantIds(findPreset("wag", "quadruped")!.preset)).toBeUndefined();
  });
  it("honours a request, falls back to the only variant, and avoids the last one", () => {
    const fly = findPreset("fly", "biped")!.preset;
    expect(chooseVariant(fly, "high")?.id).toBe("high");
    expect(chooseVariant(fly, "nope")).toBeNull();
    expect(chooseVariant(findPreset("wag", "quadruped")!.preset, null, "default")?.id).toBe("default");
    for (let i = 0; i < 20; i++)
      expect(chooseVariant(fly, null, "around", () => i / 20)?.id).not.toBe("around");
    expect(chooseVariant(fly, null, null, () => 0)?.id).toBe("around");
    expect(chooseVariant(fly, null, null, () => 0.999)?.id).toBe("loop");
  });
});

describe("lookup", () => {
  it("prefers the rig's own preset, then universal, then other rigs", () => {
    expect(findPreset("walk", "quadruped")?.source).toBe("rig");
    expect(findPreset("spin", "quadruped")?.source).toBe("universal");
    expect(findPreset("fly", "winged")?.source).toBe("rig");
    expect(findPreset("wag", "swimmer")?.source).toBe("other");
    expect(findPreset("jump", "biped")?.source).toBe("universal");
    expect(findPreset("nope", "biped")).toBeNull();
  });
  it("lists rig presets plus universal ones", () => {
    for (const rig of rigs as RigId[]) {
      const list = presetsForRig(rig);
      const counts: Record<string, number> = {
        quadruped: 13,
        swimmer: 11,
        winged: 11,
        biped: 12,
        object: 11,
      };
      expect(list).toHaveLength(counts[rig]);
      expect(list.map((p) => p.id)).toContain("stop");
    }
  });
});
