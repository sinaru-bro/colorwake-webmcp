import { beforeEach, describe, expect, it } from "vitest";
import {
  arrangeScene,
  colorAnother,
  enterPlay,
  fillRegion,
  finishPicture,
  pickSketch,
  removeCharacter,
  resetAll,
  selectCharacter,
  toggleOnStage,
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

function finishAll(...sketchIds: string[]): string[] {
  return sketchIds.map((sketchId) => {
    const id = pickAndColor(sketchId, "body");
    finishPicture();
    return id;
  });
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
  it("refuses a 21st picture when twenty are colored", () => {
    for (let i = 0; i < 20; i += 1) pickAndColor("cat", "head");
    expect(pickSketch("rocket")).toEqual({ ok: false, code: "tray_full" });
    expect(getState().characters).toHaveLength(20);
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

describe("finishPicture", () => {
  it("puts a colored picture away and empties the canvas", () => {
    const id = pickAndColor("cat", "head");
    expect(finishPicture()).toEqual({ ok: true, saved: id });
    expect(getState().mode).toBe("color");
    expect(getState().activeCharacterId).toBeNull();
    expect(getState().characters).toHaveLength(1);
  });
  it("refuses a blank picture", () => {
    const res = pickSketch("cat");
    expect(finishPicture()).toEqual({ ok: false, code: "not_colored_yet" });
    expect(getState().activeCharacterId).toBe(res.ok ? res.character.id : null);
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
  it("keeps the other friends in their slots when one is placed by hand", () => {
    const a = pickAndColor("cat", "head");
    pickAndColor("fish", "body");
    arrangeScene({ placements: [{ characterId: a, position: { x: 0.5, y: 0.5 } }] });
    pickAndColor("bird", "body");
    enterPlay();
    const chars = getState().characters;
    expect(chars.find((c) => c.id === a)).toMatchObject({
      placement: "manual",
      position: { x: 0.5, y: 0.5 },
    });
    const autos = chars.filter((c) => c.placement === "auto").map((c) => c.position.x);
    expect(autos).toEqual([0.5, 0.8]);
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
    const [a] = finishAll("cat", "fish");
    enterPlay();
    expect(getState().characters.map((c) => c.position.x)).toEqual([0.35, 0.65]);
    removeCharacter(a);
    expect(getState().characters.map((c) => c.position.x)).toEqual([0.5]);
    expect(getState().cast).toHaveLength(1);
  });
});

describe("selectCharacter", () => {
  it("drops a blank picture left on the canvas", () => {
    const [a] = finishAll("cat");
    pickSketch("fish");
    expect(selectCharacter(a)).toBe(true);
    expect(getState().characters.map((c) => c.sketchId)).toEqual(["cat"]);
    expect(getState().activeCharacterId).toBe(a);
  });
  it("puts a colored picture away before switching", () => {
    const [a] = finishAll("cat");
    const b = pickAndColor("fish", "body");
    selectCharacter(a);
    expect(getState().characters).toHaveLength(2);
    expect(getState().cast).toEqual([a, b]);
  });
});

describe("play screen", () => {
  it("has the newest three friends on it by default", () => {
    const ids = finishAll("cat", "fish", "bird", "robot");
    expect(getState().cast).toEqual(ids.slice(1));
    enterPlay();
    expect(getState().cast).toEqual(ids.slice(1));
    const onStage = getState().characters.filter((c) => getState().cast.includes(c.id));
    expect(onStage.map((c) => c.position.x)).toEqual([0.2, 0.5, 0.8]);
  });
  it("lets the longest-standing friend step off when a fourth steps on", () => {
    const [a, , c, d] = finishAll("cat", "fish", "bird", "robot");
    expect(toggleOnStage(a)).toBe(true);
    expect(getState().cast).toEqual([c, d, a]);
    expect(toggleOnStage(d)).toBe(false);
    expect(getState().cast).toEqual([c, a]);
    expect(toggleOnStage("nobody")).toBeNull();
  });
  it("refills an empty play screen with the newest friends on play", () => {
    const [a, b] = finishAll("cat", "fish");
    toggleOnStage(a);
    toggleOnStage(b);
    expect(getState().cast).toEqual([]);
    enterPlay();
    expect(getState().cast).toEqual([a, b]);
  });
  it("brings a placed friend on stage", () => {
    const [a, , , d] = finishAll("cat", "fish", "bird", "robot");
    arrangeScene({ placements: [{ characterId: a, position: { x: 0.1, y: 0.7 } }] });
    expect(getState().cast).toContain(a);
    expect(getState().cast).toContain(d);
    expect(getState().cast).toHaveLength(3);
  });
});
