import { beforeEach, describe, expect, it } from "vitest";
import { arrangeScene, enterPlay, fillRegion, pickSketch, resetAll } from "../state/actions";
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
  it("has ten tools in the fixed order with descriptions under 480 characters", () => {
    expect(TOOLS.map((t) => t.name)).toEqual([
      "get_guide",
      "get_studio_state",
      "list_sketches",
      "list_motions",
      "set_mode",
      "pick_sketch",
      "set_tool",
      "apply_motion",
      "apply_motions",
      "arrange_scene",
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
  it("marks exactly the four read tools as read-only", () => {
    expect(TOOLS.filter((t) => t.readOnly).map((t) => t.name)).toEqual([
      "get_guide",
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
    for (let i = 0; i < 20; i += 1) colored("cat");
    const res = call("pick_sketch", { sketch: "rocket" });
    expect(res).toMatchObject({ ok: false, code: "tray_full", error: TRAY_FULL_MESSAGE });
    expect(getState().characters).toHaveLength(20);
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
  it("keeps a hex as a custom color and names css colors", () => {
    expect(call("set_tool", { color: "#87CEEB" })).toMatchObject({
      ok: true,
      tool: { color: "#87ceeb" },
      mapped: null,
    });
    expect(call("set_tool", { color: "teal" })).toMatchObject({
      ok: true,
      tool: { color: "#008080" },
      mapped: { from: "teal", to: "#008080" },
    });
    expect(call("set_tool", { color: "light blue" })).toMatchObject({ ok: true, tool: { color: "sky" } });
  });
  it("requires at least one field", () => {
    expect(call("set_tool", {})).toMatchObject({ ok: false, code: "nothing_to_change" });
  });
  it("rejects unknown colors with the palette as options", () => {
    const res = call("set_tool", { color: "not-a-color" });
    expect(res).toMatchObject({ ok: false, code: "unknown_color" });
    expect(res.options).toHaveLength(12);
    expect(res.options).toContain("#rrggbb");
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
    const res = call("apply_motion", { character: id, motion: "spin", speed: 9 });
    expect(res).toMatchObject({
      ok: true,
      motion: "spin",
      source: "universal",
      switchedTo: "play",
      clamped: { speed: 2 },
    });
    expect(req).not.toBeNull();
    expect(getState().mode).toBe("play");
  });
  it("skips parts another rig lacks and falls back to wiggle when nothing remains", () => {
    const id = colored("rocket");
    const res = call("apply_motion", { character: id, motion: "wag" });
    expect(res.ok).toBe(true);
    expect(res.source).toBe("other");
    expect(res.fallback).toBe("wiggle");
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

describe("play screen", () => {
  it("tells which friends are on stage", () => {
    const ids = ["cat", "fish", "bird", "robot"].map((s) => colored(s));
    enterPlay();
    const state = describeState(getState()) as {
      stage: unknown;
      characters: { id: string; onStage: boolean }[];
    };
    expect(state.stage).toEqual({ count: 3, capacity: 3 });
    expect(state.characters.map((c) => c.onStage)).toEqual([false, true, true, true]);
    expect(getState().cast).toEqual(ids.slice(1));
  });
  it("apply_motion brings an off-stage friend on", () => {
    const [a] = ["cat", "fish", "bird", "robot"].map((s) => colored(s));
    enterPlay();
    expect(call("apply_motion", { character: a, motion: "fly" })).toMatchObject({
      ok: true,
      broughtOnStage: true,
    });
    expect(getState().cast).toContain(a);
    expect(getState().cast).toHaveLength(3);
    expect(call("apply_motion", { character: a, motion: "fly" })).toMatchObject({ broughtOnStage: false });
  });
});

describe("get_guide", () => {
  it("returns the guide with every tool mentioned, under 3000 characters", () => {
    const res = call("get_guide") as Result & { guide: string };
    expect(res.ok).toBe(true);
    for (const t of TOOLS) expect(res.guide).toContain(t.name);
    expect(res.guide.length).toBeLessThanOrEqual(3000);
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
      scene: { places: string[]; times: string[]; weathers: string[] };
    };
    expect(res.universal.map((u) => u.id)).toContain("stop");
    expect(res.scene.places).toHaveLength(12);
    expect(res.scene.times).toEqual(["day", "night"]);
  });
});

function capture(): { reqs: EnginePlayRequest[]; stopped: string[] } {
  const reqs: EnginePlayRequest[] = [];
  const stopped: string[] = [];
  setEngine({
    ...getEngine(),
    play: (r) => {
      reqs.push(r);
      return { ok: true, durationMs: 1000, skipped: [], fallback: null };
    },
    stop: (c) => {
      stopped.push(c);
    },
    stageSize: () => ({ w: 1180, h: 654 }),
  });
  return { reqs, stopped };
}

describe("variants and poses", () => {
  it("uses the character's own posed preset and reports the variant", () => {
    const id = colored("robot");
    const { reqs } = capture();
    const res = call("apply_motion", { character: id, motion: "swim", variant: "across" });
    expect(res).toMatchObject({ ok: true, motion: "swim", variant: "across", source: "rig" });
    expect(reqs[0]).toMatchObject({ variant: "across", pose: { rotate: 80 } });
  });
  it("never repeats the last variant when none is asked for", () => {
    const id = colored("cat");
    capture();
    const seen = new Set<string>();
    let last: string | null = null;
    for (let i = 0; i < 12; i++) {
      const v = call("apply_motion", { character: id, motion: "fly" }).variant as string;
      expect(v).not.toBe(last);
      seen.add(v);
      last = v;
    }
    expect(seen.size).toBeGreaterThan(1);
  });
  it("rejects an unknown variant with the real ones", () => {
    const id = colored("cat");
    const res = call("apply_motion", { character: id, motion: "dance", variant: "moonwalk" });
    expect(res).toMatchObject({ ok: false, code: "unknown_variant" });
    expect(res.options).toEqual(["bop", "twist", "hop", "spin"]);
  });
  it("gives single-way presets no variant", () => {
    const id = colored("cat");
    capture();
    expect(call("apply_motion", { character: id, motion: "wag" })).toMatchObject({ ok: true, variant: null });
  });
});

describe("place actions", () => {
  it("needs the right place and says which", () => {
    const id = colored("cat");
    enterPlay();
    arrangeScene({ place: "sea" });
    const res = call("apply_motion", { character: id, motion: "swing" });
    expect(res).toMatchObject({ ok: false, code: "not_here", options: ["playground"] });
    expect(call("apply_motion", { character: id, motion: "inside" }).options).toEqual(["school", "home"]);
  });
  it("moves the friend to the prop, shrinks it, and hands the engine the action", () => {
    const id = colored("cat");
    enterPlay();
    arrangeScene({ place: "playground" });
    const { reqs } = capture();
    const res = call("apply_motion", { character: id, motion: "swing" });
    expect(res).toMatchObject({ ok: true, action: "swing", place: "playground", loop: true });
    const c = getState().characters.find((x) => x.id === id)!;
    expect(c.scale).toBeCloseTo(0.6);
    expect(c.position.x).toBeGreaterThan(0.2);
    expect(c.position.x).toBeLessThan(0.35);
    expect(c.position.y).toBeLessThan(0.78);
    expect(reqs[0]).toMatchObject({ action: { id: "swing" }, loop: true, mode: "parallel" });
    expect(reqs[0].steps.length).toBeGreaterThan(0);
  });
  it("gets off the prop on stop, on another motion, and when the place changes", () => {
    const id = colored("cat");
    enterPlay();
    arrangeScene({ place: "playground" });
    const { stopped } = capture();
    call("apply_motion", { character: id, motion: "swing" });
    call("apply_motion", { character: id, motion: "stop" });
    expect(getState().characters[0].scale).toBe(1);
    call("apply_motion", { character: id, motion: "slide" });
    expect(getState().characters[0].scale).toBeCloseTo(0.6);
    call("apply_motion", { character: id, motion: "jump" });
    expect(getState().characters[0].scale).toBe(1);
    call("apply_motion", { character: id, motion: "swing" });
    call("arrange_scene", { place: "home" });
    expect(getState().characters[0].scale).toBe(1);
    expect(stopped).toContain(id);
  });
  it("lists what the current place allows", () => {
    colored("cat");
    enterPlay();
    arrangeScene({ place: "school" });
    const list = call("list_motions") as Result & {
      placeActions: { here: { id: string }[]; elsewhere: Record<string, string[]> };
      presets: { id: string; variants?: string[] }[];
    };
    expect(list.placeActions.here.map((a) => a.id)).toEqual(["bus", "inside"]);
    expect(list.placeActions.elsewhere.playground).toEqual(["swing", "slide"]);
    expect(list.presets.find((p) => p.id === "fly")?.variants).toEqual(["around", "away", "high", "loop"]);
    expect((describeState(getState()) as { placeActions: string[] }).placeActions).toEqual(["bus", "inside"]);
  });
});

describe("apply_motions", () => {
  it("starts up to three friends in one call", () => {
    const ids = ["cat", "fish", "bird"].map((s) => colored(s));
    const { reqs } = capture();
    const res = call("apply_motions", {
      actions: [
        { character: ids[0], motion: "dance" },
        { character: ids[1], motion: "swim" },
        { character: ids[2], motion: "fly", variant: "high" },
      ],
    }) as Result & { results: Result[] };
    expect(res).toMatchObject({ ok: true, started: 3 });
    expect(res.results.map((r) => r.ok)).toEqual([true, true, true]);
    expect(reqs).toHaveLength(3);
    expect(reqs[2]).toMatchObject({ preset: "fly", variant: "high" });
    expect(getState().mode).toBe("play");
  });
  it("reports each action on its own when one fails", () => {
    const id = colored("cat");
    capture();
    const res = call("apply_motions", {
      actions: [
        { character: id, motion: "dance" },
        { character: "ghost", motion: "dance" },
      ],
    }) as Result & { results: Result[] };
    expect(res).toMatchObject({ ok: true, started: 1 });
    expect(res.results[0].ok).toBe(true);
    expect(res.results[1]).toMatchObject({ ok: false, code: "unknown_character" });
  });
  it("fails as a whole when nothing starts, and rejects four actions", () => {
    colored("cat");
    capture();
    const none = call("apply_motions", { actions: [{ character: "ghost", motion: "dance" }] });
    expect(none).toMatchObject({ ok: false, code: "all_failed" });
    const four = call("apply_motions", {
      actions: Array.from({ length: 4 }, () => ({ character: "cat", motion: "dance" })),
    });
    expect(four).toMatchObject({ ok: false, code: "bad_input" });
  });
});
