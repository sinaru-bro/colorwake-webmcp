import { beforeEach, describe, expect, it } from "vitest";
import { fillRegion, pickSketch, resetAll } from "../state/actions";
import { uiStore } from "../state/ui";
import { toolByName } from "./tools";

type Result = Record<string, unknown> & { ok: boolean };

function call(name: string, input: unknown = {}): Result {
  const tool = toolByName(name);
  if (!tool) throw new Error(name);
  return tool.execute(input) as Result;
}

function colored(sketchId: string): string {
  const res = pickSketch(sketchId);
  if (!res.ok) throw new Error(res.code);
  fillRegion("body", "red");
  return res.character.id;
}

const last = () => uiStore.getState().activity.at(-1)!;

beforeEach(() => {
  resetAll();
});

describe("next question", () => {
  it("walks place, time, then weather", () => {
    colored("cat");
    expect(call("set_mode", { mode: "play" }).nextQuestion).toMatchObject({
      axis: "place",
      ask: "Where are we?",
    });
    expect(call("arrange_scene", { place: "sea" }).nextQuestion).toMatchObject({ axis: "time" });
    expect(call("arrange_scene", { time: "night" }).nextQuestion).toMatchObject({ axis: "weather" });
    expect(call("get_studio_state").nextQuestion).toMatchObject({ axis: "weather" });
    expect(call("arrange_scene", { weather: "snow" }).nextQuestion).toBeNull();
  });
  it("starts every axis unset", () => {
    resetAll();
    colored("fish");
    expect(call("get_studio_state").scene).toMatchObject({ place: null, time: null, weather: null });
    expect(call("get_studio_state").nextQuestion).toMatchObject({ axis: "place" });
  });
});

describe("activity notes", () => {
  it("captions the child's view and tags the tool", () => {
    const id = colored("cat");
    call("set_mode", { mode: "play" });
    expect(last()).toMatchObject({
      tool: "set_mode",
      kid: "Let's play!",
      tag: "set_mode · play",
      ok: true,
      read: false,
    });
    call("arrange_scene", { place: "sea", time: "night" });
    expect(last().kid).toBe("Off to the sea! Night time!");
    expect(last().tag).toBe("arrange_scene · sea · night");
    expect(uiStore.getState().flash?.keys).toEqual(["place:sea", "time:night"]);
    call("apply_motion", { character: id, motion: "fly" });
    expect(last().kid).toBe("Red cat, fly!");
  });
  it("keeps reads quiet and errors honest", () => {
    colored("cat");
    call("get_studio_state");
    expect(last()).toMatchObject({ kid: null, tag: "get_studio_state", read: true });
    call("arrange_scene", { place: "moon" });
    expect(last()).toMatchObject({ kid: "Hmm, try again", tag: "arrange_scene · unknown_place", ok: false });
  });
  it("keeps at most twenty entries", () => {
    colored("cat");
    for (let i = 0; i < 25; i += 1) call("get_studio_state");
    expect(uiStore.getState().activity.length).toBeLessThanOrEqual(20);
  });
});
