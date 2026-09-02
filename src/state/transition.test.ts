import { beforeEach, describe, expect, it } from "vitest";
import {
  colorAnother,
  enterPlay,
  fillRegion,
  finishPicture,
  pickSketch,
  removeCharacter,
  resetAll,
} from "./actions";
import { getState } from "./store";
import { flyingCharacter, stashedCharacter } from "./transition";

function pickAndColor(sketchId: string, region: string): string {
  const res = pickSketch(sketchId);
  if (!res.ok) throw new Error(res.code);
  fillRegion(region, "red");
  return res.character.id;
}

beforeEach(() => resetAll());

describe("flyingCharacter", () => {
  it("flies the colored picture that was on the canvas", () => {
    const id = pickAndColor("cat", "head");
    const prev = getState();
    enterPlay();
    expect(flyingCharacter(prev, getState())).toBe(id);
  });

  it("does not fly when a blank picture is dropped on the way in", () => {
    pickAndColor("cat", "head");
    enterPlay();
    colorAnother();
    pickSketch("fish");
    const prev = getState();
    enterPlay();
    expect(getState().mode).toBe("play");
    expect(flyingCharacter(prev, getState())).toBeNull();
  });

  it("ignores changes that stay in one mode or go back to coloring", () => {
    pickAndColor("cat", "head");
    const coloring = getState();
    fillRegion("body", "blue");
    expect(flyingCharacter(coloring, getState())).toBeNull();
    enterPlay();
    const playing = getState();
    colorAnother();
    expect(flyingCharacter(playing, getState())).toBeNull();
  });
});

describe("stashedCharacter", () => {
  it("stashes the colored picture put away with the check button", () => {
    const id = pickAndColor("cat", "head");
    const prev = getState();
    finishPicture();
    expect(stashedCharacter(prev, getState())).toBe(id);
  });

  it("stashes when a tool empties the canvas while coloring", () => {
    const id = pickAndColor("cat", "head");
    const prev = getState();
    colorAnother();
    expect(stashedCharacter(prev, getState())).toBe(id);
  });

  it("does not stash a blank picture, a removed one, or the flight into play", () => {
    pickSketch("cat");
    let prev = getState();
    colorAnother();
    expect(stashedCharacter(prev, getState())).toBeNull();
    const id = pickAndColor("fish", "body");
    prev = getState();
    removeCharacter(id);
    expect(stashedCharacter(prev, getState())).toBeNull();
    pickAndColor("cat", "head");
    prev = getState();
    enterPlay();
    expect(stashedCharacter(prev, getState())).toBeNull();
  });
});
