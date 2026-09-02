import { describe, expect, it } from "vitest";
import {
  facingScale,
  fitTravel,
  lookFor,
  lookTransform,
  travelFacingFrames,
  turnFraction,
  turnFrames,
} from "./travel";

const room = { left: 300, right: 900, up: 500, down: 100 };
const up = (sx: 1 | -1) => ({ sx, lean: 0 });

describe("fitTravel", () => {
  it("shortens travel to the room on that side", () => {
    expect(fitTravel(1200, 0, room, false)).toEqual({ dx: 900, dy: 0 });
    expect(fitTravel(-500, 0, room, false)).toEqual({ dx: -300, dy: 0 });
    expect(fitTravel(0, -800, room, true)).toEqual({ dx: 0, dy: -500 });
    expect(fitTravel(0, 300, room, true)).toEqual({ dx: 0, dy: 100 });
  });
  it("lets presets head for the roomier side, never explicit steps", () => {
    expect(fitTravel(-700, 0, room, true)).toEqual({ dx: 700, dy: 0 });
    expect(fitTravel(-700, 0, room, false)).toEqual({ dx: -300, dy: 0 });
    expect(fitTravel(-200, 0, room, true)).toEqual({ dx: -200, dy: 0 });
  });
  it("never flips vertical travel", () => {
    expect(fitTravel(0, 400, room, true).dy).toBe(100);
  });
});

describe("facing", () => {
  it("mirrors a drawing only when it looks away from the travel direction", () => {
    expect(facingScale("left", -1)).toBe(1);
    expect(facingScale("left", 1)).toBe(-1);
    expect(facingScale("right", 1)).toBe(1);
    expect(facingScale("right", -1)).toBe(-1);
    expect(facingScale("front", 1)).toBe(1);
    expect(facingScale("front", -1)).toBe(1);
  });
  it("keeps a side-on pose as drawn but points a front-on pose the way it goes", () => {
    expect(lookFor("left", 1, 18)).toEqual({ sx: -1, lean: 18 });
    expect(lookFor("left", -1, 18)).toEqual({ sx: 1, lean: 18 });
    expect(lookFor("front", 1, 80)).toEqual({ sx: 1, lean: 80 });
    expect(lookFor("front", -1, 80)).toEqual({ sx: 1, lean: -80 });
  });
  it("writes the same four functions for every look", () => {
    expect(lookTransform(up(1), 60)).toBe(
      "scale(1, 1) translate(0px, -60.00px) rotate(0deg) translate(0px, 60.00px)",
    );
    expect(lookTransform({ sx: -1, lean: 80 }, 60)).toBe(
      "scale(-1, 1) translate(0px, -60.00px) rotate(80deg) translate(0px, 60.00px)",
    );
    expect(lookTransform(up(1), 60, true)).toContain("scale(0.06, 1.06)");
  });
  it("turns through edge-on, and leans without a squeeze", () => {
    const kf = turnFrames(up(1), up(-1), 60);
    expect(kf[0].transform).toContain("scale(1, 1)");
    expect(kf[1]).toMatchObject({ offset: 0.5 });
    expect(kf[1].transform).toContain("scale(0.06, 1.06)");
    expect(kf[2].transform).toContain("scale(-1, 1)");
    const lie = turnFrames(up(1), { sx: 1, lean: 80 }, 60);
    expect(lie).toHaveLength(2);
    expect(lie[1].transform).toContain("rotate(80deg)");
  });
  it("turns at the far end and back before the loop repeats", () => {
    const kf = travelFacingFrames(up(-1), up(1), 0.1, 60);
    expect(kf.map((k) => k.offset)).toEqual([0, 0.45, 0.5, 0.55, 0.9, 0.95, 1]);
    expect(kf[0].transform).toContain("scale(-1, 1)");
    expect(kf[3].transform).toContain("scale(1, 1)");
    expect(kf[6].transform).toContain("scale(-1, 1)");
    expect(travelFacingFrames(up(1), null, 0.1, 60)).toHaveLength(2);
  });
  it("stands a front-on swimmer up while it turns around", () => {
    const kf = travelFacingFrames({ sx: 1, lean: 80 }, { sx: 1, lean: -80 }, 0.1, 60);
    expect(kf[2].transform).toContain("scale(1, 1)");
    expect(kf[2].transform).toContain("rotate(0deg)");
    expect(kf[3].transform).toContain("rotate(-80deg)");
  });
  it("caps the turn share of short steps", () => {
    expect(turnFraction(4000)).toBeCloseTo(0.05);
    expect(turnFraction(400)).toBe(0.24);
  });
});
