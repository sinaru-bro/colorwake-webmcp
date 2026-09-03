import { beforeEach, describe, expect, it } from "vitest";
import { fillRegion, finishPicture, pickSketch, resetAll } from "./actions";
import { parseSaved } from "./persistence";
import { getState } from "./store";
import { DEFAULT_TOOL } from "./types";

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
  it("drops saved characters that would not render", () => {
    finish("cat");
    const good = getState().characters[0];
    const raw = JSON.stringify({
      ...getState(),
      characters: [
        good,
        { ...good, id: "broken-paint", paint: {} },
        { ...good, id: "broken-stroke", paint: { fills: {}, strokes: [{}] } },
        { ...good, id: "broken-position", position: { x: "left" } },
      ],
      cast: [good.id, "broken-paint"],
    });
    const parsed = parseSaved(raw);
    expect(parsed?.characters.map((c) => c.id)).toEqual([good.id]);
    expect(parsed?.cast).toEqual([good.id]);
  });
  it("falls back to a sane tool and scene when they are corrupt", () => {
    finish("cat");
    const raw = JSON.stringify({ ...getState(), tool: { tool: "laser" }, scene: { place: "moon" } });
    const parsed = parseSaved(raw);
    expect(parsed?.tool).toEqual(DEFAULT_TOOL);
    expect(parsed?.scene.place).toBeNull();
  });
});
