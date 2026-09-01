import { beforeEach, describe, expect, it } from "vitest";
import { enterPlay, fillRegion, pickSketch, resetAll } from "../state/actions";
import { getState } from "../state/store";
import { describeState } from "./describe";
import { getEngine, setEngine, type EnginePlayRequest } from "./engineBridge";
import { toInputSchema } from "./schemas";
import { TOOLS, toolByName } from "./tools";
import { TRAY_FULL_MESSAGE } from "./tools/pick_sketch";

type Result = Record<string, unknown> & { ok: boolean; code?: string; options?: unknown[]; hint?: string };

function call(name: string, input: unknown = {}): Result {
  const tool = toolByName(name);
  if (!tool) throw new Error(name);
  return tool.execute(input) as Result;
}

function colored(sketchId: string, region = "body"): string {
  const res = pickSketch(sketchId);
  if (!res.ok) throw new Error(res.code);
  fillRegion(region, "red");
  return res.character.id;
}

beforeEach(() => {
  resetAll();
  setEngine(null);
});

describe("tool registry", () => {
  it("has nine tools in the fixed order with descriptions under 480 characters", () => {
    expect(TOOLS.map((t) => t.name)).toEqual([
      "get_studio_state",
      "list_sketches",
      "list_motions",
      "set_mode",
      "pick_sketch",
      "set_tool",
      "apply_motion",
      "arrange_scene",
      "add_effect",
    ]);
    for (const t of TOOLS) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeLessThanOrEqual(480);
    }
  });
  it("produces serializable strict JSON schemas", () => {
    for (const t of TOOLS) {
      const schema = toInputSchema(t.schema);
      expect(() => JSON.stringify(schema)).not.toThrow();
      expect(schema.additionalProperties).toBe(false);
      expect(schema.$schema).toBeUndefined();
    }
  });
  it("marks exactly the three read tools as read-only", () => {
    expect(TOOLS.filter((t) => t.readOnly).map((t) => t.name)).toEqual([
      "get_studio_state",
      "list_sketches",
      "list_motions",
    ]);
  });
  it("never throws on garbage input", () => {
    for (const t of TOOLS) {
      const res = t.execute({ nonsense: 1 }) as Result;
      expect(typeof res.ok).toBe("boolean");
    }
  });
});

describe("set_mode", () => {
  it("refuses play when the only picture is blank", () => {
    pickSketch("cat");
    expect(call("set_mode", { mode: "play" })).toMatchObject({ ok: false, code: "not_colored_yet" });
    expect(getState().mode).toBe("color");
  });
  it("saves a colored picture and enters play", () => {
    const id = colored("cat");
    const res = call("set_mode", { mode: "play" });
    expect(res).toMatchObject({ ok: true, mode: "play", saved: id });
    expect(getState().mode).toBe("play");
  });
  it("color in color mode keeps the picture and clears the canvas", () => {
    const id = colored("cat");
    const res = call("set_mode", { mode: "color" });
    expect(res).toMatchObject({ ok: true, mode: "color", saved: id });
    expect(getState().activeCharacterId).toBeNull();
    expect(getState().characters).toHaveLength(1);
  });
  it("color on an empty canvas is idempotent", () => {
    expect(call("set_mode", { mode: "color" })).toMatchObject({ ok: true, already: true });
  });
});

describe("pick_sketch", () => {
  it("rejects unknown sketches with options", () => {
    const res = call("pick_sketch", { sketch: "unicorn" });
    expect(res).toMatchObject({ ok: false, code: "unknown_sketch" });
    expect(res.options).toContain("cat");
  });
  it("reports a full tray with the shared message", () => {
    colored("cat");
    colored("fish");
    colored("bird");
    colored("robot");
    const res = call("pick_sketch", { sketch: "rocket" });
    expect(res).toMatchObject({ ok: false, code: "tray_full", error: TRAY_FULL_MESSAGE });
    expect(getState().characters).toHaveLength(4);
  });
  it("switches back to color mode from play", () => {
    colored("cat");
    enterPlay();
    const res = call("pick_sketch", { sketch: "fish" });
    expect(res).toMatchObject({ ok: true, switchedTo: "color", replaced: false });
    expect(getState().mode).toBe("color");
  });
});

describe("set_tool", () => {
  it("maps css colors to the nearest palette color", () => {
    const res = call("set_tool", { color: "#87ceeb" });
    expect(res).toMatchObject({ ok: true, tool: { color: "sky" }, mapped: { from: "#87ceeb", to: "sky" } });
  });
  it("requires at least one field", () => {
    expect(call("set_tool", {})).toMatchObject({ ok: false, code: "nothing_to_change" });
  });
  it("rejects unknown colors with the palette as options", () => {
    const res = call("set_tool", { color: "not-a-color" });
    expect(res).toMatchObject({ ok: false, code: "unknown_color" });
    expect(res.options).toHaveLength(12);
  });
});

describe("apply_motion", () => {
  it("refuses a blank picture", () => {
    pickSketch("cat");
    expect(call("apply_motion", { character: "cat", motion: "fly" })).toMatchObject({
      ok: false,
      code: "not_colored_yet",
    });
  });
  it("lists options for an unknown character", () => {
    colored("cat");
    const res = call("apply_motion", { character: "dog", motion: "fly" });
    expect(res).toMatchObject({ ok: false, code: "unknown_character" });
    expect(res.options).toHaveLength(1);
  });
  it("flags an ambiguous sketch reference", () => {
    colored("cat");
    colored("cat");
    expect(call("apply_motion", { character: "cat", motion: "fly" })).toMatchObject({
      ok: false,
      code: "ambiguous_character",
    });
  });
  it("stops through the engine", () => {
    const id = colored("cat");
    const stopped: string[] = [];
    setEngine({ ...getEngine(), stop: (c) => stopped.push(c) });
    expect(call("apply_motion", { character: id, motion: "stop" })).toMatchObject({
      ok: true,
      stopped: true,
    });
    expect(stopped).toEqual([id]);
  });
  it("plays a universal preset on any character and enters play mode", () => {
    const id = colored("cat");
    let req: EnginePlayRequest | null = null;
    setEngine({
      ...getEngine(),
      play: (r) => {
        req = r;
        return { ok: true, durationMs: 2400, skipped: [], fallback: null };
      },
    });
    const res = call("apply_motion", { character: id, motion: "fly", speed: 9 });
    expect(res).toMatchObject({
      ok: true,
      motion: "fly",
      source: "universal",
      switchedTo: "play",
      clamped: { speed: 2 },
    });
    expect(req).not.toBeNull();
    expect(getState().mode).toBe("play");
  });
  it("skips parts another rig lacks and falls back to wiggle when nothing remains", () => {
    const id = colored("rocket");
    const res = call("apply_motion", { character: id, motion: "walk" });
    expect(res.ok).toBe(true);
    expect(res.source).toBe("other");
    expect((res.skipped as string[]).length).toBeGreaterThan(0);
  });
  it("rejects nine steps at the schema", () => {
    const id = colored("cat");
    const steps = Array.from({ length: 9 }, () => ({ primitive: "spin" }));
    expect(call("apply_motion", { character: id, steps })).toMatchObject({ ok: false, code: "bad_input" });
  });
});

describe("arrange_scene", () => {
  it("changes only what is passed and clamps coordinates", () => {
    const id = colored("cat");
    const res = call("arrange_scene", {
      place: "sea",
      placements: [{ character: id, at: { x: 1.4, y: 0.9 } }],
    });
    expect(res).toMatchObject({
      ok: true,
      scene: { place: "sea", time: null, weather: null },
      nextQuestion: { axis: "time", ask: "Is it day or night?" },
      switchedTo: "play",
    });
    expect(res.clamped).toEqual({ "placements[0].at": { x: 1, y: 0.9 } });
  });
  it("rejects unknown places with options", () => {
    colored("cat");
    const res = call("arrange_scene", { place: "moon" });
    expect(res).toMatchObject({ ok: false, code: "unknown_place" });
    expect(res.options).toContain("sea");
  });
  it("accepts anchors", () => {
    const id = colored("cat");
    const res = call("arrange_scene", { placements: [{ character: id, at: "sky" }] });
    expect(getState().characters[0].position).toEqual({ x: 0.5, y: 0.5 });
    expect(res.ok).toBe(true);
  });
});

describe("add_effect", () => {
  it("refuses to attach stars to a character", () => {
    const id = colored("cat");
    expect(call("add_effect", { effect: "stars", character: id })).toMatchObject({
      ok: false,
      code: "effect_not_attachable",
    });
  });
  it("caps at three effects", () => {
    const id = colored("cat");
    expect(call("add_effect", { effect: "stars" }).ok).toBe(true);
    expect(call("add_effect", { effect: "hearts" }).ok).toBe(true);
    expect(call("add_effect", { effect: "bubbles", character: id }).ok).toBe(true);
    expect(call("add_effect", { effect: "hearts", character: id })).toMatchObject({
      ok: false,
      code: "too_many_effects",
    });
  });
  it("points weather words at arrange_scene", () => {
    colored("cat");
    expect(call("add_effect", { effect: "rain" }).hint).toMatch(/arrange_scene/);
  });
});

describe("read tools", () => {
  it("get_studio_state never leaks stroke points and stays under 1500 characters", () => {
    for (const s of ["cat", "fish", "bird", "robot"]) {
      const res = pickSketch(s);
      if (!res.ok) throw new Error(res.code);
      fillRegion("body", "red");
      fillRegion("head", "blue");
    }
    const json = JSON.stringify(describeState(getState()));
    expect(json).not.toMatch(/"points"/);
    expect(json.length).toBeLessThanOrEqual(1500);
  });
  it("list_sketches and list_motions stay under 3000 characters", () => {
    expect(JSON.stringify(call("list_sketches")).length).toBeLessThanOrEqual(3000);
    expect(JSON.stringify(call("list_motions", { all: true })).length).toBeLessThanOrEqual(3000);
    const one = call("list_motions", { character: "cat" });
    expect(one.ok).toBe(true);
  });
  it("list_motions includes stop among universal presets and scene options", () => {
    const res = call("list_motions") as Result & {
      universal: { id: string }[];
      scene: { effects: string[] };
    };
    expect(res.universal.map((u) => u.id)).toContain("stop");
    expect(res.scene.effects).toEqual(["stars", "hearts", "bubbles"]);
  });
});
