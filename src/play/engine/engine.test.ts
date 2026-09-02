import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Step } from "../../state/types";
import { current, play, registerActor, setStage, stop, unregisterActor, type ActorHandle } from "./index";

interface Fake {
  style: Record<string, string>;
  dataset: Record<string, string>;
  animations: Array<{ options: KeyframeEffectOptions; cancel: ReturnType<typeof vi.fn> }>;
  animate: (keyframes: Keyframe[], options: KeyframeEffectOptions) => Animation;
}

function fake(): Fake {
  const el: Fake = {
    style: {},
    dataset: {},
    animations: [],
    animate: (_keyframes, options) => {
      const n = options.iterations === Infinity ? 1 : (options.iterations ?? 1);
      const endTime = Number(options.delay ?? 0) + Number(options.duration ?? 0) * Number(n);
      const cancel = vi.fn();
      el.animations.push({ options, cancel });
      return {
        playbackRate: 1,
        cancel,
        finished: Promise.resolve(),
        effect: { getComputedTiming: () => ({ endTime }) },
      } as unknown as Animation;
    },
  };
  return el;
}

const STAGE = { w: 1000, h: 600 };
const BODY = { heightPx: 228, x: 0.5, y: 0.78, baseline: 420 / 512 };

function mount(id: string, parts: Record<string, Fake> = {}, rig: ActorHandle["rig"] = "object") {
  const root = fake();
  const box = fake();
  registerActor(id, {
    root: root as unknown as HTMLElement,
    box: box as unknown as HTMLElement,
    facing: null,
    parts: new Map(Object.entries(parts)) as unknown as Map<string, SVGGElement>,
    rig,
    faces: "front",
    sx: 1,
    lean: 0,
    ...BODY,
  });
  return { root, box };
}

const launch: Step[] = [{ primitive: "move", params: { dy: -900, hold: true }, durationMs: 1400 }];
const raise: Step[] = [
  { primitive: "move", part: "arm-l", params: { dy: -60, hold: true }, durationMs: 300 },
];
const base = { mode: "parallel" as const, speed: 1, loop: false };

beforeEach(() => {
  vi.useFakeTimers();
  setStage(STAGE.w, STAGE.h);
});

afterEach(() => {
  for (const id of ["r", "b"]) unregisterActor(id);
  vi.useRealTimers();
});

describe("held moves", () => {
  it("settles a held whole-body move into the scene and leaves no animation behind", () => {
    const { root, box } = mount("r");
    const onSettle = vi.fn();
    const res = play({ characterId: "r", steps: launch, ...base, onSettle });
    expect(res).toMatchObject({ ok: true, durationMs: 1400 });
    expect(root.animations[0].options.fill).toBe("forwards");
    vi.advanceTimersByTime(1500);
    const unit = BODY.heightPx / 512;
    const up = (BODY.y * STAGE.h - BODY.heightPx * BODY.baseline - 8) / unit;
    expect(onSettle).toHaveBeenCalledTimes(1);
    const at = onSettle.mock.calls[0][0];
    expect(at.x).toBeCloseTo(BODY.x, 6);
    expect(at.y).toBeCloseTo(BODY.y - (Math.min(900, up) * unit) / STAGE.h, 6);
    expect(root.animations[0].cancel).toHaveBeenCalledTimes(1);
    expect(box.style.transition).toBe("");
    expect(current("r")).toBeNull();
  });

  it("keeps a held part until a stop", () => {
    const arm = fake();
    mount("b", { "arm-l": arm }, "biped");
    const onSettle = vi.fn();
    play({ characterId: "b", steps: raise, ...base, onSettle });
    vi.advanceTimersByTime(400);
    expect(onSettle).not.toHaveBeenCalled();
    expect(current("b")).toBeNull();
    expect(arm.animations[0].cancel).not.toHaveBeenCalled();
    expect(stop("b")).toBe(true);
    expect(arm.animations[0].cancel).toHaveBeenCalledTimes(1);
  });

  it("clears the last hold when a new motion starts", () => {
    const arm = fake();
    mount("b", { "arm-l": arm }, "biped");
    play({ characterId: "b", steps: raise, ...base });
    vi.advanceTimersByTime(400);
    play({ characterId: "b", steps: [{ primitive: "shake", params: {} }], ...base });
    expect(arm.animations[0].cancel).toHaveBeenCalledTimes(1);
  });

  it("holds a whole-body move in place when it cannot settle, until a stop", () => {
    setStage(0, 0);
    const { root } = mount("r");
    play({ characterId: "r", steps: launch, ...base, onSettle: vi.fn() });
    vi.advanceTimersByTime(1500);
    expect(current("r")).toBeNull();
    expect(root.animations[0].cancel).not.toHaveBeenCalled();
    stop("r");
    expect(root.animations[0].cancel).toHaveBeenCalledTimes(1);
  });
});

const sway: Step[] = [{ primitive: "bounce", params: { height: 10 }, durationMs: 500 }];

describe("auto loop", () => {
  it("runs a few seconds of rounds, then ends on its own", () => {
    const { root } = mount("r");
    const res = play({ characterId: "r", steps: sway, mode: "parallel", speed: 1, loop: "auto" });
    expect(res).toMatchObject({ ok: true, durationMs: 4500 });
    expect(root.animations[0].options.iterations).toBe(9);
    vi.advanceTimersByTime(4600);
    expect(current("r")).toBeNull();
    expect(root.animations[0].cancel).toHaveBeenCalledTimes(1);
  });

  it("keeps an explicit loop: true going until a stop", () => {
    const { root } = mount("r");
    const res = play({ characterId: "r", steps: sway, mode: "parallel", speed: 1, loop: true });
    expect(res).toMatchObject({ ok: true, durationMs: 500 });
    expect(root.animations[0].options.iterations).toBe(Infinity);
    vi.advanceTimersByTime(60000);
    expect(current("r")).not.toBeNull();
    stop("r");
    expect(current("r")).toBeNull();
  });
});
