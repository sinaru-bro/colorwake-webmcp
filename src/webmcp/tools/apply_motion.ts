import { clampParams } from "../../content/motions/clamp";
import { partClass } from "../../content/motions/primitives";
import {
  FALLBACK_PRESET_ID,
  STOP_PRESET_ID,
  chooseVariant,
  findPreset,
  presetsForRig,
  variantIds,
} from "../../content/motions/presets";
import { rigById } from "../../content/rigs";
import { HORIZON, placeById } from "../../content/scenes";
import { actionsAt, findAction, type PlaceAction } from "../../content/scenes/actions";
import { sketchById } from "../../content/sketches/catalog";
import { bandToStage } from "../../play/scene/geometry";
import { arrangeScene, bringOnStage } from "../../state/actions";
import { getState } from "../../state/store";
import { LIMITS, type Character, type PlaceId, type PlayMode, type Pose, type Step } from "../../state/types";
import { summarize } from "../describe";
import { getEngine, type PresetSource } from "../engineBridge";
import { fail, ok } from "../results";
import { ApplyMotionInput } from "../schemas";
import { clampNumber, defineTool, ensurePlayMode, parseInput, resolveCharacter } from "./shared";

interface PreparedSteps {
  steps: Step[];
  skipped: string[];
  clamped: Record<string, unknown> | null;
  ignored: string[];
}

/** The last variant each character did per preset, so a repeat comes out different. */
const lastVariant = new Map<string, string>();
/** After a path ends the friend grows back once its new spot has painted. */
const SETTLE_GROW_MS = 60;
/** Friends currently on a prop, with the size they had before. */
const onProps = new Map<string, { action: string; place: PlaceId; scale: number }>();

function prepareSteps(steps: Step[], parts: Set<string>, speed: number): PreparedSteps {
  const kept: Step[] = [];
  const skipped: string[] = [];
  const clamped: Record<string, unknown> = {};
  const ignored: string[] = [];
  steps.forEach((step, i) => {
    if (step.part && !parts.has(step.part)) {
      skipped.push(step.part);
      return;
    }
    const ctx = { isPart: Boolean(step.part), partClass: partClass(step.part), speed };
    const c = clampParams(step.primitive, step.params, ctx);
    if (Object.keys(c.clamped).length) clamped[`steps[${i}].params`] = c.clamped;
    ignored.push(...c.ignored.map((k) => `steps[${i}].params.${k}`));
    const next: Step = { ...step, params: c.params };
    if (step.durationMs !== undefined) {
      next.durationMs = clampNumber(step.durationMs, LIMITS.durationMs.min, LIMITS.durationMs.max);
      if (next.durationMs !== step.durationMs) clamped[`steps[${i}].durationMs`] = next.durationMs;
    }
    if (step.delayMs !== undefined) {
      next.delayMs = clampNumber(step.delayMs, 0, LIMITS.delayMs.max);
      if (next.delayMs !== step.delayMs) clamped[`steps[${i}].delayMs`] = next.delayMs;
    }
    kept.push(next);
  });
  return { steps: kept, skipped, clamped: Object.keys(clamped).length ? clamped : null, ignored };
}

/** Lets a friend off its prop: back on the ground at its usual size. */
export function leaveProp(characterId: string): void {
  const prop = onProps.get(characterId);
  if (!prop) return;
  onProps.delete(characterId);
  const c = getState().characters.find((x) => x.id === characterId);
  if (!c) return;
  const position = { x: c.position.x, y: Math.max(c.position.y, HORIZON) };
  arrangeScene({ placements: [{ characterId, position, scale: prop.scale }] });
}

/** Stops prop actions that no longer make sense — the place changed or the friend was moved. */
export function leaveProps(keepPlace: PlaceId | null, movedIds: string[] = []): void {
  for (const [id, prop] of [...onProps]) {
    if (prop.place === keepPlace && !movedIds.includes(id)) continue;
    getEngine().stop(id);
    leaveProp(id);
  }
}

function playOnProp(character: Character, action: PlaceAction, speed: number) {
  const engine = getEngine();
  const prev = onProps.get(character.id)?.scale ?? character.scale;
  onProps.delete(character.id);
  const position = bandToStage(action.at, engine.stageSize());
  arrangeScene({ placements: [{ characterId: character.id, position, scale: (action.scale ?? 1) * prev }] });
  onProps.set(character.id, { action: action.id, place: action.place, scale: prev });
  const played = engine.play({
    characterId: character.id,
    preset: null,
    presetSource: null,
    steps: action.parts ?? [],
    mode: "parallel",
    speed,
    loop: Boolean(action.pendulum),
    action,
    onSettle: (pos) => {
      arrangeScene({ placements: [{ characterId: character.id, position: pos }] });
      setTimeout(() => leaveProp(character.id), SETTLE_GROW_MS);
    },
  });
  if (!played.ok) return fail(played.code, "The motion could not start.");
  return ok({
    character: summarize(character),
    action: action.id,
    place: action.place,
    loop: Boolean(action.pendulum),
    speed,
    durationMs: played.durationMs,
  });
}

export const applyMotion = defineTool({
  name: "apply_motion",
  title: "Make a character move",
  description:
    'Animate a colored picture. Give a preset from list_motions (fly, swim, dance, jump, walk …) — any preset works on any character — with a variant, or omit it to vary. Looping presets end after a few seconds; loop: true keeps going until "stop". Place actions (swing, slide, bus, inside) use what is drawn in the current place. Or compose steps from primitives (e.g. "roll" = spin + move). Replaces the current motion; enters play mode and brings the character on stage if needed.',
  schema: ApplyMotionInput,
  execute: runApplyMotion,
});

/** The apply_motion body, shared with apply_motions. */
export function runApplyMotion(input: unknown) {
  const parsed = parseInput(ApplyMotionInput, input);
  if (!parsed.ok) return parsed;
  const { character: ref, motion, variant, steps, mode, speed: rawSpeed, loop: rawLoop } = parsed.data;
  const resolved = resolveCharacter(ref);
  if (!resolved.ok) return resolved;
  const character = resolved.character;
  const rig = sketchById(character.sketchId)?.rig ?? "object";
  const place = getState().scene.place;
  const here = actionsAt(place).map((a) => a.id);
  if (!motion && !steps) {
    return fail("no_motion", "Give a preset name or steps.", {
      hint: "Call list_motions for names.",
      options: [...presetsForRig(rig).map((p) => p.id), ...here],
    });
  }
  const switched = ensurePlayMode();
  if (!switched.ok) return switched;
  const engine = getEngine();
  if (motion === STOP_PRESET_ID) {
    engine.stop(character.id);
    leaveProp(character.id);
    return ok({ character: summarize(character), stopped: true, switchedTo: switched.switchedTo });
  }
  const broughtOnStage = bringOnStage(character.id);
  const clamped: Record<string, unknown> = {};
  let speed = rawSpeed ?? 1;
  if (speed !== clampNumber(speed, LIMITS.speed.min, LIMITS.speed.max)) {
    speed = clampNumber(speed, LIMITS.speed.min, LIMITS.speed.max);
    clamped.speed = speed;
  }
  if (motion) {
    const found = findAction(motion, place);
    if (found.action && !found.here) {
      const where = found.places.map((p) => placeById(p)?.label ?? p).join(" or ");
      return fail("not_here", `${found.action.label} needs the ${where} scene.`, {
        hint: "Ask the player if they want to go there, then arrange_scene with that place first.",
        options: found.places,
      });
    }
    if (found.action) {
      const result = playOnProp(character, found.action, speed);
      return result.ok
        ? {
            ...result,
            broughtOnStage,
            switchedTo: switched.switchedTo,
            clamped: clamped.speed ? clamped : null,
          }
        : result;
    }
  }
  let loop: boolean | number | undefined = rawLoop;
  if (typeof loop === "number" && loop !== clampNumber(loop, 1, LIMITS.loop.max)) {
    loop = clampNumber(loop, 1, LIMITS.loop.max);
    clamped.loop = loop;
  }
  const parts = new Set(rigById(rig)?.parts.map((p) => p.id) ?? []);
  let presetId: string | null = null;
  let source: PresetSource | null = null;
  let chosen: string | null = null;
  let pose: Pose | undefined;
  let sourceSteps: Step[];
  let playMode: PlayMode = mode ?? "parallel";
  if (motion) {
    const found = findPreset(motion, rig);
    if (!found) {
      return fail("unknown_motion", `No preset "${motion}".`, {
        hint: "Or compose it with steps.",
        options: [...presetsForRig(rig).map((p) => p.id), ...here],
      });
    }
    const key = `${character.id}:${found.preset.id}`;
    const picked = chooseVariant(found.preset, variant, lastVariant.get(key));
    if (!picked) {
      return fail("unknown_variant", `"${found.preset.id}" has no variant "${variant}".`, {
        options: variantIds(found.preset) ?? [],
      });
    }
    presetId = found.preset.id;
    source = found.source;
    sourceSteps = picked.steps;
    pose = picked.pose;
    playMode = mode ?? picked.mode;
    if (loop === undefined) loop = picked.loop;
    if (found.preset.variants.length > 1) {
      chosen = picked.id;
      lastVariant.set(key, picked.id);
    }
  } else {
    sourceSteps = steps ?? [];
  }
  const prepared = prepareSteps(sourceSteps, parts, speed);
  let fallback: "wiggle" | null = null;
  if (prepared.steps.length === 0) {
    const wiggle = findPreset(FALLBACK_PRESET_ID, rig);
    if (!wiggle) return fail("no_motion", "Nothing in that motion applies to this character.");
    prepared.steps = wiggle.preset.variants[0].steps;
    fallback = "wiggle";
    if (loop === undefined) loop = wiggle.preset.variants[0].loop;
  }
  leaveProp(character.id);
  const loopArg: boolean | number | "auto" =
    rawLoop === undefined && loop === true ? "auto" : (loop ?? false);
  const played = engine.play({
    characterId: character.id,
    preset: presetId,
    presetSource: source,
    variant: chosen,
    steps: prepared.steps,
    mode: playMode,
    speed,
    loop: loopArg,
    pose: pose ?? null,
    onSettle: (position) => arrangeScene({ placements: [{ characterId: character.id, position }] }),
  });
  if (!played.ok) return fail(played.code, "The motion could not start.");
  const allClamped = { ...clamped, ...(prepared.clamped ?? {}) };
  return ok({
    character: summarize(character),
    motion: presetId,
    variant: chosen,
    source,
    steps: presetId ? undefined : prepared.steps.length,
    mode: playMode,
    loop: loopArg,
    speed,
    durationMs: played.durationMs,
    skipped: [...new Set([...prepared.skipped, ...played.skipped])],
    fallback: fallback ?? played.fallback,
    ignored: motion && steps ? ["steps", ...prepared.ignored] : prepared.ignored,
    clamped: Object.keys(allClamped).length ? allClamped : null,
    broughtOnStage,
    switchedTo: switched.switchedTo,
  });
}
