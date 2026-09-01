import { EFFECT_IDS } from "../../content/effects";
import { describePrimitives } from "../../content/motions/clamp";
import { PRESETS } from "../../content/motions/presets";
import { RIGS } from "../../content/rigs";
import { sceneOptions } from "../../content/scenes";
import { sketchById } from "../../content/sketches/catalog";
import { activeCharacter, findCharacter } from "../../state/selectors";
import { getState } from "../../state/store";
import type { Preset, RigId } from "../../state/types";
import { ok } from "../results";
import { ListMotionsInput } from "../schemas";
import { defineTool, parseInput } from "./shared";

export const LIST_SIZE_LIMIT = 3000;

const COMPOSE_HINT =
  "apply_motion with steps:[{primitive, part?, params, durationMs?, delayMs?, ease?}], mode: sequence|parallel, up to 8 steps. Any preset works on any character.";

function rigOf(ref: string | undefined): RigId | "all" {
  const s = getState();
  const c = ref ? findCharacter(s, ref) : null;
  const character = c && c.kind === "found" ? c.character : ref ? null : activeCharacter(s);
  if (!character) return "all";
  return sketchById(character.sketchId)?.rig ?? "all";
}

function presetEntry(p: Preset, withSayings: boolean) {
  return withSayings
    ? { id: p.id, label: p.label, loop: p.loop, sayings: p.sayings }
    : { id: p.id, label: p.label, loop: p.loop };
}

export const listMotions = defineTool({
  name: "list_motions",
  title: "Browse motions, effects and scenes",
  description:
    "List what the play screen can do: motion presets for a character (its body type's plus universal ones any character can do), the primitive moves you can combine into your own motion (move, rotate, scale, bounce, shake, spin, flip, tilt, fade, wave) with limits, the body parts you may target, and scene options (places, day/night, weather, effects). Call it when the child asks for something that is not an obvious preset, then compose steps for apply_motion. Read-only.",
  schema: ListMotionsInput,
  readOnly: true,
  execute(input) {
    const parsed = parseInput(ListMotionsInput, input);
    if (!parsed.ok) return parsed;
    const rig = parsed.data.all ? "all" : rigOf(parsed.data.character);
    const rigs = rig === "all" ? RIGS : RIGS.filter((r) => r.id === rig);
    const universal = PRESETS.filter((p) => p.rig === "any").map((p) => ({ id: p.id, label: p.label }));
    const build = (withSayings: boolean, withParams: boolean) => {
      const presets = PRESETS.filter((p) => p.rig !== "any" && rigs.some((r) => r.id === p.rig));
      return {
        ...(rig === "all" ? { rigs: rigs.map((r) => r.id) } : { rig }),
        parts: [...new Set(rigs.flatMap((r) => r.parts.map((p) => p.id)))],
        presets: presets.map((p) => ({
          ...presetEntry(p, withSayings),
          ...(rig === "all" ? { rig: p.rig } : {}),
        })),
        universal,
        primitives: describePrimitives().map((d) =>
          withParams ? { id: d.id, params: d.params } : { id: d.id, params: Object.keys(d.params) },
        ),
        composeHint: COMPOSE_HINT,
        scene: { ...sceneOptions(), effects: EFFECT_IDS },
      };
    };
    let body = build(true, true);
    if (JSON.stringify(body).length > LIST_SIZE_LIMIT) body = build(false, true);
    if (JSON.stringify(body).length > LIST_SIZE_LIMIT) body = build(false, false);
    return ok(body);
  },
});
