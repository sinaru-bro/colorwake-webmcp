import { beforeEach, describe, expect, it } from "vitest";
import {
  arrangeScene,
  colorAnother,
  enterPlay,
  fillRegion,
  pickSketch,
  removeCharacter,
  resetAll,
  setEffect,
  undo,
} from "./actions";
import { getState } from "./store";
import { activeCharacter } from "./selectors";

function pickAndColor(sketchId: string, region: string, color = "red") {
  const res = pickSketch(sketchId);
  if (!res.ok) throw new Error(res.code);
  fillRegion(region, color);
  return res.character.id;
}

beforeEach(() => resetAll());

describe("pickSketch", () => {
  it("rejects unknown sketches", () => {
    expect(pickSketch("dragonfly")).toEqual({ ok: false, code: "unknown_sketch" });
  });
  it("does not add a second picture while the active one is blank", () => {
    const first = pickSketch("cat");
    const second = pickSketch("fish");
    expect(first.ok && second.ok && second.replaced).toBe(true);
    expect(getState().characters).toHaveLength(1);
    expect(activeCharacter(getState())?.sketchId).toBe("fish");
  });
  it("keeps a colored picture in the tray and adds a new one", () => {
    pickAndColor("cat", "head");
    const res = pickSketch("fish");
    expect(res.ok && !res.replaced).toBe(true);
    expect(getState().characters).toHaveLength(2);
  });
  it("refuses a fifth picture when four are colored", () => {
    pickAndColor("cat", "head");
    pickAndColor("fish", "body");
    pickAndColor("bird", "body");
    pickAndColor("robot", "body");
    expect(pickSketch("rocket")).toEqual({ ok: false, code: "tray_full" });
  });
  it("switches back to color mode when called during play", () => {
    pickAndColor("cat", "head");
    enterPlay();
    const res = pickSketch("fish");
    expect(res.ok && res.switchedTo).toBe("color");
    expect(getState().mode).toBe("color");
  });
});

describe("enterPlay", () => {
  it("refuses when nothing is colored", () => {
    pickSketch("cat");
    expect(enterPlay()).toEqual({ ok: false, code: "not_colored_yet" });
    expect(getState().mode).toBe("color");
  });
  it("saves the active colored picture", () => {
    const id = pickAndColor("cat", "head");
    const res = enterPlay();
    expect(res.ok && res.saved).toBe(id);
    expect(getState().mode).toBe("play");
  });
  it("drops a blank active picture when others are colored", () => {
    pickAndColor("cat", "head");
    const blank = pickSketch("fish");
    const res = enterPlay();
    expect(blank.ok && res.ok && res.dropped).toBe(blank.ok ? blank.character.id : null);
    expect(getState().characters).toHaveLength(1);
  });
});

describe("colorAnother", () => {
  it("keeps a colored active picture and empties the canvas", () => {
    const id = pickAndColor("cat", "head");
    const res = colorAnother();
    expect(res.saved).toBe(id);
    expect(getState().activeCharacterId).toBeNull();
    expect(getState().characters).toHaveLength(1);
  });
  it("is idempotent on an empty canvas", () => {
    expect(colorAnother().already).toBe(true);
  });
});

describe("auto layout", () => {
  it("spreads auto-placed characters and leaves manual ones alone", () => {
    const a = pickAndColor("cat", "head");
    pickAndColor("fish", "body");
    arrangeScene({ placements: [{ characterId: a, position: { x: 0.5, y: 0.5 } }] });
    pickAndColor("bird", "body");
    const chars = getState().characters;
    expect(chars.find((c) => c.id === a)).toMatchObject({
      placement: "manual",
      position: { x: 0.5, y: 0.5 },
    });
    const autos = chars.filter((c) => c.placement === "auto").map((c) => c.position.x);
    expect(autos).toEqual([0.35, 0.65]);
  });
});

describe("effects", () => {
  it("caps at three and updates intensity on repeat", () => {
    expect(setEffect("stars").ok).toBe(true);
    expect(setEffect("hearts", true, "light", "c_x").ok).toBe(true);
    expect(setEffect("hearts", true, "heavy", "c_y").ok).toBe(true);
    expect(setEffect("bubbles")).toEqual({ ok: false, code: "too_many_effects" });
    const again = setEffect("hearts", true, "heavy", "c_x");
    expect(again.ok && again.updated).toBe(true);
    expect(setEffect("none").ok && getState().scene.effects).toHaveLength(0);
  });
});

describe("undo", () => {
  it("restores the previous paint", () => {
    pickAndColor("cat", "head");
    fillRegion("body", "blue");
    expect(undo()).toBe(true);
    expect(activeCharacter(getState())?.paint.fills).toEqual({ head: "red" });
  });
});

describe("removeCharacter", () => {
  it("re-lays out the rest", () => {
    const a = pickAndColor("cat", "head");
    pickAndColor("fish", "body");
    removeCharacter(a);
    expect(getState().characters.map((c) => c.position.x)).toEqual([0.5]);
  });
});
