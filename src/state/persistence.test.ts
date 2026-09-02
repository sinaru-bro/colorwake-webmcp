import { beforeEach, describe, expect, it } from "vitest";
import { fillRegion, finishPicture, pickSketch, resetAll } from "./actions";
import { parseSaved } from "./persistence";
import { getState } from "./store";

function finish(sketchId: string): string {
  const res = pickSketch(sketchId);
  if (!res.ok) throw new Error(res.code);
  fillRegion("body", "red");
  finishPicture();
  return res.character.id;
}

beforeEach(() => resetAll());

describe("parseSaved", () => {
  it("fills the play screen with the newest three when a save has no cast", () => {
    const ids = ["cat", "fish", "bird", "robot"].map(finish);
    const { cast: _cast, ...legacy } = getState();
    expect(parseSaved(JSON.stringify(legacy))?.cast).toEqual(ids.slice(1));
  });
  it("keeps a saved cast and drops ids it does not know", () => {
    const [a] = ["cat", "fish"].map(finish);
    const raw = JSON.stringify({ ...getState(), cast: [a, "gone"] });
    expect(parseSaved(raw)?.cast).toEqual([a]);
  });
});
