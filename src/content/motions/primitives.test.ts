import { describe, expect, it } from "vitest";
import type { Primitive } from "../../state/types";
import { clampParams, describePrimitives } from "./clamp";
import { PRIMITIVES, ROTATE_CAPS, partClass, toKeyframes } from "./primitives";

const whole = { isPart: false, partClass: null, speed: 1 } as const;
const part = (id: string) => ({ isPart: true, partClass: partClass(id), speed: 1 });

describe("partClass", () => {
  it("classifies part ids", () => {
    expect(partClass(undefined)).toBeNull();
    expect(partClass("arm-l")).toBe("arm");
    expect(partClass("wing-r")).toBe("arm");
    expect(partClass("hand-l")).toBe("arm");
    expect(partClass("leg-fl")).toBe("leg");
    expect(partClass("foot-r")).toBe("leg");
    expect(partClass("head")).toBe("head");
    expect(partClass("ear-l")).toBe("head");
    expect(partClass("tail")).toBe("other");
    expect(partClass("accent-1")).toBe("other");
  });
});

describe("clampParams", () => {
  it("clamps whole-actor ranges and reports them", () => {
    const r = clampParams("move", { dx: 900, dy: -50 }, whole);
    expect(r.params.dx).toBe(400);
    expect(r.params.dy).toBe(-50);
    expect(r.clamped).toEqual({ dx: 400 });
  });
  it("uses tighter part ranges", () => {
    const r = clampParams("move", { dx: 300 }, part("tail"));
    expect(r.params.dx).toBe(120);
  });
  it("applies part-class rotation caps", () => {
    expect(clampParams("rotate", { to: 170 }, part("arm-l")).params.to).toBe(160);
    expect(clampParams("rotate", { to: 170 }, part("leg-l")).params.to).toBe(45);
    expect(clampParams("rotate", { to: 170 }, part("head")).params.to).toBe(30);
    expect(clampParams("rotate", { to: 170 }, part("tail")).params.to).toBe(75);
    expect(clampParams("wave", { angle: 99, offset: -300 }, part("arm-r")).params).toMatchObject({
      angle: ROTATE_CAPS.arm.waveAngle,
      offset: -ROTATE_CAPS.arm.waveOffset,
    });
  });
  it("ignores unknown keys and keeps defaults", () => {
    const r = clampParams("bounce", { nope: 1 }, whole);
    expect(r.ignored).toEqual(["nope"]);
    expect(r.params).toEqual({ height: 40, squash: 0.1 });
  });
  it("rounds spin turns and coerces numeric strings", () => {
    expect(clampParams("spin", { turns: 1.5 }, whole).params.turns).toBe(2);
    expect(clampParams("spin", { turns: 9 }, whole).params.turns).toBe(3);
    expect(clampParams("rotate", { to: "30" }, whole).params.to).toBe(30);
  });
  it("falls back to defaults for bad enums and booleans", () => {
    expect(clampParams("shake", { axis: "z" }, whole)).toMatchObject({
      params: { axis: "x" },
      clamped: { axis: "x" },
    });
    expect(clampParams("move", { hold: "true" }, whole).params.hold).toBe(true);
    expect(clampParams("move", { hold: "maybe" }, whole).params.hold).toBe(false);
  });
});

describe("build", () => {
  const ids = Object.keys(PRIMITIVES) as Primitive[];
  it("returns to rest for every primitive except move.hold", () => {
    for (const id of ids) {
      const def = PRIMITIVES[id];
      const { params } = clampParams(id, {}, whole);
      const step = def.build(params, whole);
      expect(step.frames.length).toBeGreaterThanOrEqual(2);
      expect(step.keyframes.length).toBe(step.frames.length);
      const first = step.frames[0];
      const last = step.frames[step.frames.length - 1];
      const norm = (f: typeof first) => [
        f.tx ?? 0,
        f.ty ?? 0,
        (f.rotate ?? 0) % 360,
        f.sx ?? 1,
        f.sy ?? 1,
        f.opacity ?? 1,
      ];
      expect(norm(last)).toEqual(norm(first));
      expect(step.options.composite).toBe("accumulate");
    }
  });
  it("holds only when move.hold is true", () => {
    const { params } = clampParams("move", { dy: -200, hold: true }, whole);
    const step = PRIMITIVES.move.build(params, whole);
    expect(step.holds).toBe(true);
    expect(step.options.fill).toBe("forwards");
    expect(step.frames[step.frames.length - 1]).toEqual({ tx: 0, ty: -200 });
  });
  it("lifts the arc midpoint against the travel direction", () => {
    const { params } = clampParams("move", { dx: 100, dy: 0, path: "arc" }, whole);
    const step = PRIMITIVES.move.build(params, whole);
    expect(step.frames[1]).toEqual({ tx: 50, ty: -30 });
  });
  it("scales translation when converting to keyframes", () => {
    const kf = toKeyframes([{ tx: 100, ty: -50, rotate: 10 }], 0.5);
    expect(kf[0].transform).toBe("translate(50.00px, -25.00px) rotate(10deg) scale(1, 1)");
  });
  it("describes every primitive for list_motions", () => {
    const d = describePrimitives();
    expect(d.map((x) => x.id)).toEqual(ids);
    expect(d.find((x) => x.id === "move")?.params.dx).toContain("[-400,400]");
  });
});
