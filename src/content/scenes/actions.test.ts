import { describe, expect, it } from "vitest";
import { bandToStage } from "../../play/scene/geometry";
import { clampParams } from "../motions/clamp";
import { partClass } from "../motions/primitives";
import { PLACES } from "./places";
import { PLACE_ACTIONS, actionsAt, findAction } from "./actions";

describe("place actions", () => {
  it("live in drawn places and know how they move", () => {
    const places = new Set(PLACES.map((p) => p.id));
    for (const a of PLACE_ACTIONS) {
      expect(places.has(a.place), a.id).toBe(true);
      expect(Boolean(a.path) !== Boolean(a.pendulum), a.id).toBe(true);
      expect(a.sayings.length).toBeGreaterThanOrEqual(2);
      for (const s of a.sayings) expect(s).toMatch(/^[\x20-\x7e]+$/);
      for (const s of a.parts ?? []) {
        const r = clampParams(s.primitive, s.params, {
          isPart: true,
          partClass: partClass(s.part),
          speed: 1,
        });
        expect(r.clamped, `${a.id} ${s.part}`).toEqual({});
      }
    }
    expect(actionsAt("playground").map((a) => a.id)).toEqual(["swing", "slide"]);
    expect(actionsAt("school").map((a) => a.id)).toEqual(["bus", "inside"]);
    expect(actionsAt("home").map((a) => a.id)).toEqual(["inside"]);
    expect(actionsAt(null)).toEqual([]);
  });
  it("finds an action here or says where it is", () => {
    expect(findAction("swing", "playground")).toMatchObject({ here: true, places: ["playground"] });
    expect(findAction("swing", "sea")).toMatchObject({ here: false, places: ["playground"] });
    expect(findAction("inside", "home")).toMatchObject({ here: true, places: ["school", "home"] });
    expect(findAction("nope", "home")).toMatchObject({ action: null, here: false, places: [] });
  });
});

describe("bandToStage", () => {
  it("puts the horizon at 78% and centres a letterboxed drawing", () => {
    const stage = { w: 1180, h: 654 };
    const feet = bandToStage({ x: 800, y: 936 }, stage);
    expect(feet.x).toBeCloseTo(0.5);
    expect(feet.y).toBeCloseTo(0.78);
    const seat = bandToStage({ x: 400, y: 858 }, stage);
    expect(seat.x).toBeGreaterThan(0.25);
    expect(seat.x).toBeLessThan(0.35);
    expect(seat.y).toBeLessThan(0.78);
    expect(seat.y).toBeGreaterThan(0.6);
  });
  it("falls back to a width-spanning drawing without a stage", () => {
    expect(bandToStage({ x: 1600, y: 936 }, null)).toEqual({ x: 1, y: 0.78 });
    expect(bandToStage({ x: 0, y: 0 }, null).y).toBeCloseTo(0);
  });
});
