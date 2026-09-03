import { clampParams } from "../../content/motions/clamp";
import { PRIMITIVES, partClass, toKeyframes, type Frame } from "../../content/motions/primitives";
import { FALLBACK_PRESET_ID, STOP_PRESET_ID, chooseVariant, findPreset } from "../../content/motions/presets";
import type { PlaceAction } from "../../content/scenes/actions";
import {
  LIMITS,
  type Facing,
  type PlayMode,
  type Pose,
  type Position,
  type RigId,
  type Step,
} from "../../state/types";
import { bandScale, bandToStage, type StageSize } from "../scene/geometry";
import {
  FACE_MIN_DX,
  POSE_MS,
  TURN_MS,
  lookFor,
  lookTransform,
  fitTravel,
  travelFacingFrames,
  turnFraction,
  turnFrames,
  type Look,
  type Room,
} from "./travel";

export interface ActorHandle {
  root: HTMLElement;
  /** The element the scene positions. */
  box: HTMLElement;
  /** Wrapper that is mirrored to face the direction of travel and leaned into a pose. */
  facing: HTMLElement | null;
  parts: Map<string, SVGGElement>;
  heightPx: number;
  rig: RigId;
  faces: Facing;
  /** Ground contact line as a fraction of the actor box height. */
  baseline: number;
  /** Stage position (fractions), kept current by the actor. */
  x: number;
  y: number;
  /** Current mirror state of `facing` (1 = as drawn). */
  sx: 1 | -1;
  /** Current pose angle of `facing`, degrees. */
  lean: number;
}

export interface ActorLayout {
  heightPx: number;
  x: number;
  y: number;
}

export interface PlayRequest {
  characterId: string;
  preset?: string | null;
  variant?: string | null;
  steps?: Step[];
  mode: PlayMode;
  speed: number;
  loop: boolean | number | "auto";
  pose?: Pose | null;
  action?: PlaceAction | null;
  onSettle?: (position: Position) => void;
}

export interface PlayOutcome {
  ok: true;
  durationMs: number;
  skipped: string[];
  fallback: "wiggle" | null;
  deferred: boolean;
}

export type PlayResult = PlayOutcome | { ok: false; code: "unknown_motion" | "no_motion" };

interface Running {
  /** What started this, so a re-mounted actor can pick it up again. */
  req: PlayRequest;
  animations: Animation[];
  /** Turn and pose tracks on the facing wrapper. */
  looks: Animation[];
  /** Holds that outlive the motion, until the next motion or a stop. */
  held: Animation[];
  /** Whether held whole-body moves settle into the scene when the motion ends. */
  settles: boolean;
  timers: ReturnType<typeof setTimeout>[];
  props: Array<{ el: Element; className: string }>;
  preset: string | null;
  variant: string | null;
  action: string | null;
  loop: boolean;
  cancelled: boolean;
}

const SKETCH_UNITS = 512;
/** Body centre height above the feet, as a fraction of the sketch — spin, flip and poses pivot here. */
const CENTER_ABOVE_FEET = 0.3;
/** Half the drawn width of a sketch relative to its box, used to keep travel on stage. */
const HALF_WIDTH = 0.42;
const EDGE_PAD_PX = 8;
/** A prop action waits for the friend to walk over (the actor's position transition). */
const ARRIVE_MS = 300;
/** How long a motion loops when the request leaves the count to the app. */
const AUTO_LOOP_MS = 4500;

const actors = new Map<string, ActorHandle>();
const running = new Map<string, Running>();
const pending = new Map<string, PlayRequest>();
/** Holds left behind by finished motions. */
const held = new Map<string, Animation[]>();
const stage = { w: 0, h: 0 };

export function setStage(w: number, h: number): void {
  stage.w = w;
  stage.h = h;
}

export function stageSize(): StageSize | null {
  return stage.w && stage.h ? { w: stage.w, h: stage.h } : null;
}

export function registerActor(characterId: string, handle: ActorHandle): void {
  actors.set(characterId, handle);
  for (const part of handle.parts.values()) {
    const pivot = part.dataset.pivot ?? "";
    part.style.transformBox = "view-box";
    part.style.transformOrigin = pivot ? pivot.replace(/\s+/, "px ") + "px" : "center";
  }
  handle.root.style.transformOrigin = `50% ${(handle.baseline * 100).toFixed(2)}%`;
  const queued = pending.get(characterId);
  if (queued) {
    pending.delete(characterId);
    play(queued);
  }
}

export function updateActorLayout(characterId: string, layout: ActorLayout): void {
  const handle = actors.get(characterId);
  if (handle) Object.assign(handle, layout);
}

/** Actors re-mount (a new sketch, a dev remount); a motion in flight waits for the new element. */
export function unregisterActor(characterId: string): void {
  const inFlight = running.get(characterId)?.req ?? null;
  halt(characterId, false);
  actors.delete(characterId);
  if (inFlight) pending.set(characterId, inFlight);
}

const centerOf = (handle: ActorHandle): number => handle.heightPx * CENTER_ABOVE_FEET;

/** Freezes the facing wrapper at the look it currently shows, so cancelling never snaps it. */
function commitFacing(handle: ActorHandle): void {
  const el = handle.facing;
  if (!el) return;
  try {
    const t = getComputedStyle(el).transform;
    if (t && t !== "none") {
      const a = Number(/matrix\(([^,]+),/.exec(t)?.[1]);
      if (Number.isFinite(a) && a !== 0) handle.sx = a < 0 ? -1 : 1;
    }
  } catch {
    // Not in a browser — keep the last known look.
  }
  el.style.transform = lookTransform({ sx: handle.sx, lean: handle.lean }, centerOf(handle));
}

/** Gets the body back upright after a posed motion. */
function relax(handle: ActorHandle): void {
  const el = handle.facing;
  if (!el || handle.lean === 0) return;
  const c = centerOf(handle);
  const from = lookTransform({ sx: handle.sx, lean: handle.lean }, c);
  const to = lookTransform({ sx: handle.sx, lean: 0 }, c);
  handle.lean = 0;
  const anim = el.animate([{ transform: from }, { transform: to }], {
    duration: POSE_MS,
    easing: "ease-in-out",
    fill: "forwards",
  });
  anim.finished
    .then(() => {
      el.style.transform = to;
      anim.cancel();
    })
    .catch(() => undefined);
}

function clear(entry: Running, handle: ActorHandle | undefined): void {
  entry.cancelled = true;
  for (const t of entry.timers) clearTimeout(t);
  for (const { el, className } of entry.props) el.classList.remove(className);
  if (handle) commitFacing(handle);
  for (const a of [...entry.animations, ...entry.looks, ...entry.held]) a.cancel();
}

function halt(characterId: string, upright: boolean): boolean {
  pending.delete(characterId);
  const kept = held.get(characterId) ?? [];
  held.delete(characterId);
  for (const a of kept) a.cancel();
  const entry = running.get(characterId);
  if (!entry) return kept.length > 0;
  const handle = actors.get(characterId);
  clear(entry, handle);
  running.delete(characterId);
  if (handle) handle.box.style.zIndex = "";
  if (upright && handle) relax(handle);
  return true;
}

export function stop(characterId: string): boolean {
  return halt(characterId, true);
}

export function stopAll(): void {
  for (const id of new Set([...running.keys(), ...held.keys()])) stop(id);
  pending.clear();
}

export function current(characterId: string): {
  preset: string | null;
  variant: string | null;
  action: string | null;
  loop: boolean;
} | null {
  const entry = running.get(characterId);
  return entry
    ? { preset: entry.preset, variant: entry.variant, action: entry.action, loop: entry.loop }
    : null;
}

interface Turn {
  /** How the body looks while travelling out. */
  there: Look;
  /** How it looks coming back, or null when the step does not return. */
  home: Look | null;
}

interface Compiled {
  target: Element;
  keyframes: Keyframe[];
  options: KeyframeEffectOptions;
  span: number;
  turn: Turn | null;
  /** Stays applied after the motion ends. */
  holds: boolean;
  /** Where a held whole-body move leaves the body, in viewBox units. */
  settle: { dx: number; dy: number } | null;
}

function roomFor(handle: ActorHandle): Room | null {
  if (!stage.w || !stage.h || !handle.heightPx) return null;
  const unit = handle.heightPx / SKETCH_UNITS;
  const half = handle.heightPx * HALF_WIDTH;
  const cx = handle.x * stage.w;
  const cy = handle.y * stage.h;
  return {
    left: Math.max(0, (cx - half - EDGE_PAD_PX) / unit),
    right: Math.max(0, (stage.w - cx - half - EDGE_PAD_PX) / unit),
    up: Math.max(0, (cy - handle.heightPx * handle.baseline - EDGE_PAD_PX) / unit),
    down: Math.max(0, (stage.h - cy - handle.heightPx * (1 - handle.baseline) - EDGE_PAD_PX) / unit),
  };
}

/** The look a body settles into when it is not travelling. */
function restLook(handle: ActorHandle, pose: number): Look {
  if (handle.faces === "front") return { sx: 1, lean: pose };
  return { sx: handle.sx, lean: pose };
}

function compileSteps(
  steps: Step[],
  handle: ActorHandle,
  speed: number,
  fromPreset: boolean,
  pose: number,
): { compiled: Compiled[]; skipped: string[] } {
  const compiled: Compiled[] = [];
  const skipped: string[] = [];
  const scale = handle.heightPx / SKETCH_UNITS;
  const centerPx = centerOf(handle);
  const room = roomFor(handle);
  for (const step of steps.slice(0, LIMITS.maxSteps)) {
    const target = step.part ? handle.parts.get(step.part) : handle.root;
    if (!target) {
      if (step.part) skipped.push(step.part);
      continue;
    }
    const def = PRIMITIVES[step.primitive];
    const ctx = { isPart: Boolean(step.part), partClass: partClass(step.part), speed };
    const { params } = clampParams(step.primitive, step.params, ctx);
    let turn: Turn | null = null;
    let settle: Compiled["settle"] = null;
    if (!step.part && step.primitive === "move") {
      if (room) {
        const fit = fitTravel(Number(params.dx), Number(params.dy), room, fromPreset);
        params.dx = fit.dx;
        params.dy = fit.dy;
      }
      const dx = Number(params.dx);
      if (params.hold === true) settle = { dx, dy: Number(params.dy) };
      const turns = handle.faces !== "front" || pose !== 0;
      if (handle.facing && turns && Math.abs(dx) >= FACE_MIN_DX) {
        const dir: 1 | -1 = dx > 0 ? 1 : -1;
        const back: 1 | -1 = dx > 0 ? -1 : 1;
        turn = {
          there: lookFor(handle.faces, dir, pose),
          home: params.hold === true ? null : lookFor(handle.faces, back, pose),
        };
      }
    }
    const built = def.build(params, ctx);
    const duration = Math.min(
      LIMITS.durationMs.max,
      Math.max(LIMITS.durationMs.min, step.durationMs ?? def.defaultDurationMs),
    );
    const delay = Math.min(LIMITS.delayMs.max, Math.max(0, step.delayMs ?? 0));
    const frames: Frame[] = built.frames;
    compiled.push({
      target,
      keyframes: step.part ? toKeyframes(frames, 1) : toKeyframes(frames, scale, centerPx),
      options: {
        ...built.options,
        duration,
        delay,
        easing: step.ease ?? built.options.easing ?? "ease-in-out",
      },
      span: delay + duration,
      turn,
      holds: built.holds === true,
      settle,
    });
  }
  return { compiled, skipped };
}

/** Drawing units of the place → the actor's own viewBox units. */
function bandUnit(handle: ActorHandle): number {
  const size = stageSize();
  if (!size || !handle.heightPx) return 1;
  return (bandScale(size) * SKETCH_UNITS) / handle.heightPx;
}

/** A path action as one whole-actor animation; the friend holds where the path ends. */
function compilePath(action: PlaceAction, handle: ActorHandle): Compiled | null {
  const path = action.path;
  if (!path || path.length === 0) return null;
  const k = bandUnit(handle);
  const total = path.reduce((s, wp) => s + wp.durationMs, 0);
  const frames: Frame[] = [{ offset: 0, ease: path[0].ease }];
  let t = 0;
  path.forEach((wp, i) => {
    t += wp.durationMs;
    frames.push({
      offset: t / total,
      tx: (wp.x - action.at.x) * k,
      ty: (wp.y - action.at.y) * k,
      ...(wp.scale !== undefined ? { sx: wp.scale, sy: wp.scale } : {}),
      ...(wp.opacity !== undefined ? { opacity: wp.opacity } : {}),
      ...(wp.lean !== undefined ? { rotate: wp.lean } : {}),
      ease: path[i + 1]?.ease,
    });
  });
  const scale = handle.heightPx / SKETCH_UNITS;
  return {
    target: handle.root,
    keyframes: toKeyframes(frames, scale, centerOf(handle)),
    options: {
      duration: total,
      delay: ARRIVE_MS,
      easing: "linear",
      fill: "forwards",
      composite: "accumulate",
    },
    span: ARRIVE_MS + total,
    turn: null,
    holds: false,
    settle: null,
  };
}

/** A pendulum action: the feet trace the arc of a swing hanging from a point above them. */
function compilePendulum(action: PlaceAction, handle: ActorHandle): Compiled | null {
  const p = action.pendulum;
  if (!p) return null;
  const L = p.pivotAbove * bandUnit(handle);
  const at = (deg: number): Frame => {
    const r = (deg * Math.PI) / 180;
    return { tx: L * Math.sin(r), ty: L * (1 - Math.cos(r)), rotate: deg, ease: "ease-in-out" };
  };
  const scale = handle.heightPx / SKETCH_UNITS;
  return {
    target: handle.root,
    keyframes: toKeyframes([at(-p.angle), at(p.angle), at(-p.angle)], scale, centerOf(handle)),
    options: { duration: p.periodMs, easing: "linear", composite: "accumulate" },
    span: p.periodMs,
    turn: null,
    holds: false,
    settle: null,
  };
}

function iterationsFor(rounds: number, span: number, total: number): number {
  if (rounds === Infinity) return Infinity;
  return Math.max(1, Math.round((total * rounds) / span));
}

/** Where the body stands once its held moves have ended; null when nothing holds or the stage is unknown. */
function settleOf(compiled: Compiled[], handle: ActorHandle, rounds: number): Position | null {
  const size = stageSize();
  const holds = compiled.flatMap((c) => (c.settle ? [c.settle] : []));
  if (!size || !handle.heightPx || holds.length === 0) return null;
  const unit = (handle.heightPx / SKETCH_UNITS) * rounds;
  const dx = holds.reduce((s, h) => s + h.dx, 0);
  const dy = holds.reduce((s, h) => s + h.dy, 0);
  return {
    x: Math.min(1, Math.max(0, handle.x + (dx * unit) / size.w)),
    y: Math.min(1, Math.max(0, handle.y + (dy * unit) / size.h)),
  };
}

/** Starts one compiled step (plus its look track) and records the animations. */
function launch(
  entry: Running,
  handle: ActorHandle,
  c: Compiled,
  iterations: number,
  speed: number,
  extraDelay: number,
): Animation {
  const options = { ...c.options, iterations, delay: (c.options.delay ?? 0) + extraDelay };
  const anim = c.target.animate(
    c.keyframes.map(({ opacity: _fade, ...rest }) => rest),
    options,
  );
  anim.playbackRate = speed;
  if (c.holds && !(c.settle && entry.settles)) entry.held.push(anim);
  else entry.animations.push(anim);
  if (c.keyframes.some((k) => k.opacity !== undefined)) {
    // Opacity cannot accumulate onto the base like transforms do, so it runs as its own track.
    const fade = c.target.animate(
      c.keyframes.map((k) => ({
        ...(k.offset !== undefined ? { offset: k.offset } : {}),
        ...(k.easing ? { easing: k.easing } : {}),
        opacity: k.opacity ?? 1,
      })),
      { ...options, composite: "replace" },
    );
    fade.playbackRate = speed;
    entry.animations.push(fade);
  }
  if (c.turn && handle.facing) {
    const w = turnFraction(Number(options.duration));
    const face = handle.facing.animate(travelFacingFrames(c.turn.there, c.turn.home, w, centerOf(handle)), {
      duration: options.duration,
      delay: options.delay,
      iterations,
      easing: "linear",
      fill: "forwards",
    });
    face.playbackRate = speed;
    entry.looks.push(face);
    handle.sx = c.turn.there.sx;
    handle.lean = c.turn.there.lean;
  }
  return anim;
}

/** Turns and leans the body into `look` before a step; null if it already looks that way. */
function preLook(
  entry: Running,
  handle: ActorHandle,
  look: Look,
  speed: number,
): { anim: Animation; duration: number } | null {
  if (!handle.facing || (handle.sx === look.sx && handle.lean === look.lean)) return null;
  const from = { sx: handle.sx, lean: handle.lean };
  const duration = handle.lean === look.lean ? TURN_MS : POSE_MS;
  const anim = handle.facing.animate(turnFrames(from, look, centerOf(handle)), {
    duration,
    fill: "forwards",
  });
  anim.playbackRate = speed;
  entry.looks.push(anim);
  handle.sx = look.sx;
  handle.lean = look.lean;
  return { anim, duration };
}

/** Keeps the pendulum in step with the drawn swing it hangs from. */
function syncTo(anim: Animation, selector: string, periodMs: number): void {
  if (typeof document === "undefined") return;
  const ref = document.querySelector(selector)?.getAnimations?.()[0];
  const time = ref?.currentTime;
  if (typeof time === "number") anim.currentTime = time % periodMs;
}

/** Ends a motion that ran its course: the body gets up and, after a path or a held move, keeps its new spot. */
function finish(
  characterId: string,
  entry: Running,
  handle: ActorHandle,
  settleAt: Position | null,
  onSettle?: (p: Position) => void,
): void {
  if (running.get(characterId) !== entry || entry.cancelled) return;
  running.delete(characterId);
  handle.box.style.zIndex = "";
  if (entry.held.length) held.set(characterId, [...(held.get(characterId) ?? []), ...entry.held]);
  entry.held = [];
  if (settleAt) {
    const box = handle.box;
    box.style.transition = "none";
    clear(entry, handle);
    onSettle?.(settleAt);
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(() => (box.style.transition = "")));
    } else box.style.transition = "";
  } else {
    commitFacing(handle);
    for (const a of [...entry.animations, ...entry.looks]) a.cancel();
  }
  relax(handle);
}

export function play(req: PlayRequest): PlayResult {
  const handle = actors.get(req.characterId);
  if (!handle) {
    pending.set(req.characterId, req);
    return { ok: true, durationMs: 0, skipped: [], fallback: null, deferred: true };
  }
  if (req.preset === STOP_PRESET_ID) {
    stop(req.characterId);
    return { ok: true, durationMs: 0, skipped: [], fallback: null, deferred: false };
  }
  let steps = req.steps ?? [];
  let mode = req.mode;
  let loop = req.loop;
  let pose = req.pose?.rotate ?? 0;
  let presetId: string | null = null;
  let variantId: string | null = req.variant ?? null;
  const action = req.action ?? null;
  if (req.preset) {
    const found = findPreset(req.preset, handle.rig);
    const variant = found ? chooseVariant(found.preset, req.variant) : null;
    if (!found || !variant) return { ok: false, code: "unknown_motion" };
    steps = variant.steps;
    mode = variant.mode;
    loop = req.loop ?? variant.loop;
    pose = variant.pose?.rotate ?? 0;
    presetId = found.preset.id;
    variantId = found.preset.variants.length > 1 ? variant.id : null;
  }
  if (steps.length === 0 && !action) return { ok: false, code: "no_motion" };
  const speed = Math.min(LIMITS.speed.max, Math.max(LIMITS.speed.min, req.speed || 1));
  const fromPreset = Boolean(req.preset) || Boolean(action);
  let { compiled, skipped } = compileSteps(steps, handle, speed, fromPreset, pose);
  let fallback: "wiggle" | null = null;
  let settleAt: Position | null = null;
  if (action) {
    const lead = action.pendulum ? compilePendulum(action, handle) : compilePath(action, handle);
    if (!lead) return { ok: false, code: "no_motion" };
    compiled = [lead, ...compiled];
    mode = "parallel";
    loop = Boolean(action.pendulum);
    skipped = [];
    if (action.path) {
      const size = stageSize();
      const end = action.path[action.path.length - 1];
      settleAt = bandToStage(end, size);
    }
  } else if (compiled.length === 0) {
    const wiggle = findPreset(FALLBACK_PRESET_ID, handle.rig);
    if (!wiggle) return { ok: false, code: "no_motion" };
    ({ compiled } = compileSteps(wiggle.preset.variants[0].steps, handle, speed, true, 0));
    mode = wiggle.preset.variants[0].mode;
    fallback = "wiggle";
    presetId = presetId ?? FALLBACK_PRESET_ID;
  }
  const total =
    mode === "sequence" ? compiled.reduce((s, c) => s + c.span, 0) : Math.max(...compiled.map((c) => c.span));
  const rounds =
    loop === true
      ? Infinity
      : loop === "auto"
        ? Math.min(LIMITS.loop.max, Math.max(1, Math.round((AUTO_LOOP_MS * speed) / total)))
        : Math.min(LIMITS.loop.max, Math.max(1, Math.round(loop === false ? 1 : loop)));
  if (!action && rounds !== Infinity && req.onSettle) {
    settleAt = settleOf(compiled, handle, mode === "sequence" ? rounds : 1);
  }
  halt(req.characterId, false);
  const entry: Running = {
    req,
    animations: [],
    looks: [],
    held: [],
    settles: settleAt !== null,
    timers: [],
    props: [],
    preset: presetId,
    variant: variantId,
    action: action?.id ?? null,
    loop: loop === true,
    cancelled: false,
  };
  running.set(req.characterId, entry);
  handle.box.style.zIndex = action ? "1" : "";
  let lead = 0;
  if (mode === "parallel") {
    const first = compiled.find((c) => c.turn);
    const look = first?.turn ? first.turn.there : restLook(handle, pose);
    lead = preLook(entry, handle, look, speed)?.duration ?? 0;
    compiled.forEach((c, i) => {
      const anim = launch(entry, handle, c, iterationsFor(rounds, c.span, total), speed, lead);
      if (i === 0 && action?.pendulum?.sync) syncTo(anim, action.pendulum.sync, action.pendulum.periodMs);
    });
  } else {
    const runSequence = async () => {
      const intro = preLook(entry, handle, restLook(handle, pose), speed);
      if (intro) await intro.anim.finished.catch(() => undefined);
      for (let round = 0; round < rounds && !entry.cancelled; round++) {
        for (const c of compiled) {
          if (entry.cancelled) return;
          try {
            const lead = c.turn ? preLook(entry, handle, c.turn.there, speed) : null;
            if (lead) await lead.anim.finished;
            if (entry.cancelled) return;
            await launch(entry, handle, c, 1, speed, 0).finished;
          } catch {
            return;
          }
        }
      }
      finish(req.characterId, entry, handle, settleAt, req.onSettle);
    };
    void runSequence();
  }
  if (action?.prop && typeof document !== "undefined") {
    const el = document.querySelector(action.prop.selector);
    if (el) {
      const { className, atMs, forMs } = action.prop;
      entry.timers.push(
        setTimeout(
          () => {
            el.classList.add(className);
            entry.props.push({ el, className });
          },
          (ARRIVE_MS + atMs) / speed,
        ),
        setTimeout(() => el.classList.remove(className), (ARRIVE_MS + atMs + forMs) / speed),
      );
    }
  }
  if (mode === "parallel" && rounds !== Infinity) {
    const longest = Math.max(
      ...entry.animations.map((a) => Number(a.effect?.getComputedTiming().endTime ?? 0)),
    );
    entry.timers.push(
      setTimeout(() => finish(req.characterId, entry, handle, settleAt, req.onSettle), longest / speed + 50),
    );
  }
  const length = lead + total * (rounds === Infinity ? 1 : rounds);
  return { ok: true, durationMs: Math.round(length / speed), skipped, fallback, deferred: false };
}

export const engine = { play, stop, stopAll, current, stageSize };
