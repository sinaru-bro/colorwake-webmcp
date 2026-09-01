import { clampParams } from "../../content/motions/clamp";
import { partClass } from "../../content/motions/primitives";
import { FALLBACK_PRESET_ID, findPreset, presetsForRig, STOP_PRESET_ID } from "../../content/motions/presets";
import { rigById } from "../../content/rigs";
import { sketchById } from "../../content/sketches/catalog";
import { LIMITS, type PlayMode, type Step } from "../../state/types";
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

export const applyMotion = defineTool({
  name: "apply_motion",
  title: "Make a character move",
  description:
    'Animate a colored picture on the play screen. Give a preset name from list_motions (fly, jump, spin, dance, swim, walk …) — any preset works on any character, parts it lacks are skipped — or compose your own from primitive steps when the child asks for something new (e.g. "roll" = spin + move). Use "stop" to stop. Replaces the character\'s current motion. Switches to play mode if needed. Does not change colors.',
  schema: ApplyMotionInput,
  execute(input) {
    const parsed = parseInput(ApplyMotionInput, input);
    if (!parsed.ok) return parsed;
    const { character: ref, motion, steps, mode, speed: rawSpeed, loop: rawLoop } = parsed.data;
    const resolved = resolveCharacter(ref);
    if (!resolved.ok) return resolved;
    const character = resolved.character;
    const rig = sketchById(character.sketchId)?.rig ?? "object";
    if (!motion && !steps) {
      return fail("no_motion", "Give a preset name or steps.", {
        hint: "Call list_motions for names.",
        options: presetsForRig(rig).map((p) => p.id),
      });
    }
    const switched = ensurePlayMode();
    if (!switched.ok) return switched;
    const engine = getEngine();
    if (motion === STOP_PRESET_ID) {
      engine.stop(character.id);
      return ok({ character: summarize(character), stopped: true, switchedTo: switched.switchedTo });
    }
    const clamped: Record<string, unknown> = {};
    let speed = rawSpeed ?? 1;
    if (speed !== clampNumber(speed, LIMITS.speed.min, LIMITS.speed.max)) {
      speed = clampNumber(speed, LIMITS.speed.min, LIMITS.speed.max);
      clamped.speed = speed;
    }
    let loop: boolean | number | undefined = rawLoop;
    if (typeof loop === "number" && loop !== clampNumber(loop, 1, LIMITS.loop.max)) {
      loop = clampNumber(loop, 1, LIMITS.loop.max);
      clamped.loop = loop;
    }
    const parts = new Set(rigById(rig)?.parts.map((p) => p.id) ?? []);
    let presetId: string | null = null;
    let source: PresetSource | null = null;
    let sourceSteps: Step[];
    let playMode: PlayMode = mode ?? "parallel";
    if (motion) {
      const found = findPreset(motion, rig);
      if (!found) {
        return fail("unknown_motion", `No preset "${motion}".`, {
          hint: "Or compose it with steps.",
          options: presetsForRig(rig).map((p) => p.id),
        });
      }
      presetId = found.preset.id;
      source = found.source;
      sourceSteps = found.preset.steps;
      playMode = mode ?? found.preset.mode;
      if (loop === undefined) loop = found.preset.loop;
    } else {
      sourceSteps = steps ?? [];
    }
    const prepared = prepareSteps(sourceSteps, parts, speed);
    let fallback: "wiggle" | null = null;
    if (prepared.steps.length === 0) {
      const wiggle = findPreset(FALLBACK_PRESET_ID, rig);
      if (!wiggle) return fail("no_motion", "Nothing in that motion applies to this character.");
      prepared.steps = wiggle.preset.steps;
      fallback = "wiggle";
      if (loop === undefined) loop = wiggle.preset.loop;
    }
    const played = engine.play({
      characterId: character.id,
      preset: presetId,
      presetSource: source,
      steps: prepared.steps,
      mode: playMode,
      speed,
      loop: loop ?? false,
    });
    if (!played.ok) return fail(played.code, "The motion could not start.");
    const allClamped = { ...clamped, ...(prepared.clamped ?? {}) };
    return ok({
      character: summarize(character),
      motion: presetId,
      source,
      steps: presetId ? undefined : prepared.steps.length,
      mode: playMode,
      loop: loop ?? false,
      speed,
      durationMs: played.durationMs,
      skipped: [...new Set([...prepared.skipped, ...played.skipped])],
      fallback: fallback ?? played.fallback,
      ignored: motion && steps ? ["steps", ...prepared.ignored] : prepared.ignored,
      clamped: Object.keys(allClamped).length ? allClamped : null,
      switchedTo: switched.switchedTo,
    });
  },
});
