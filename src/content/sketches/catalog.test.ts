import { describe, expect, it } from "vitest";
import { RIGS } from "../rigs";
import { SKETCHES, SKETCH_LIST, sketchById } from "./catalog";

const rigIds = new Set(RIGS.map((r) => r.id));

describe("sketch catalog", () => {
  it("has unique ids and valid rigs", () => {
    const ids = SKETCHES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SKETCHES) expect(rigIds.has(s.rig)).toBe(true);
  });

  it("labels every region and gives 2-3 english sayings", () => {
    for (const s of SKETCHES) {
      const regionIds = s.regions.map((r) => r.id);
      expect(new Set(regionIds).size).toBe(regionIds.length);
      for (const r of s.regions) expect(r.label.trim().length).toBeGreaterThan(0);
      expect(s.sayings.length).toBeGreaterThanOrEqual(2);
      expect(s.sayings.length).toBeLessThanOrEqual(3);
      for (const word of [s.title, ...s.sayings, ...s.regions.map((r) => r.label)]) {
        expect(/^[\x20-\x7e]+$/.test(word)).toBe(true);
      }
    }
  });

  it("keeps region counts inside the level band", () => {
    for (const s of SKETCHES) {
      const n = s.regions.length;
      if (s.level === "easy") expect(n >= 3 && n <= 6).toBe(true);
      else expect(n >= 8 && n <= 12).toBe(true);
    }
  });

  it("requires accents on object sketches only", () => {
    for (const s of SKETCHES) {
      if (s.rig === "object") expect(s.accents?.length).toBeGreaterThan(0);
      else expect(s.accents).toBeUndefined();
    }
  });

  it("loads svg markup for every entry", () => {
    expect(SKETCH_LIST).toHaveLength(SKETCHES.length);
    for (const s of SKETCH_LIST) expect(s.svg).toContain(`data-rig="${s.rig}"`);
    expect(sketchById("cat")?.title).toBe("Cat");
    expect(sketchById("nope")).toBeUndefined();
  });
});
