import { describe, expect, it } from "vitest";
import { DEFAULT_STROKE_SIZE, STROKE_PRESETS } from "../strokes";
import { HORIZON, PLACES, TIMES, WEATHERS, sceneOptions } from "./index";

const unique = (xs: string[]) => new Set(xs).size === xs.length;

describe("scenes", () => {
  it("has unique ids and exposes every place, time and weather", () => {
    expect(unique(PLACES.map((p) => p.id))).toBe(true);
    expect(unique(WEATHERS.map((w) => w.id))).toBe(true);
    expect(TIMES.map((t) => t.id)).toEqual(["day", "night"]);
    expect(sceneOptions()).toEqual({
      places: PLACES.map((p) => p.id),
      times: ["day", "night"],
      weathers: WEATHERS.map((w) => w.id),
    });
    expect(sceneOptions().places).toHaveLength(12);
    expect(sceneOptions().weathers).toHaveLength(6);
  });
  it("puts every place on the shared horizon", () => {
    for (const p of PLACES) expect(p.horizon).toBe(HORIZON);
    expect(HORIZON).toBe(0.78);
  });
  it("keeps sayings ascii and non-empty", () => {
    for (const x of [...PLACES, ...TIMES, ...WEATHERS]) {
      expect(x.sayings.length).toBeGreaterThanOrEqual(2);
      for (const s of x.sayings) expect(s).toMatch(/^[\x20-\x7e]+$/);
    }
  });
});

describe("strokes", () => {
  it("orders widths pencil < pen < brush at every size", () => {
    for (const size of ["s", "m", "l"] as const) {
      expect(STROKE_PRESETS.pencil[size].width).toBeLessThan(STROKE_PRESETS.pen[size].width);
      expect(STROKE_PRESETS.pen[size].width).toBeLessThan(STROKE_PRESETS.brush[size].width);
    }
    expect(DEFAULT_STROKE_SIZE).toBe("m");
    expect(STROKE_PRESETS.pencil.m.dash).toBe("3 1.5");
    expect(STROKE_PRESETS.brush.m.blur).toBe(0.8);
  });
});
