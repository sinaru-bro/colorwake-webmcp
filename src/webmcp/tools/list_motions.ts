import { describePrimitives } from "../../content/motions/clamp";
import { PRESETS, variantIds } from "../../content/motions/presets";
import { RIGS } from "../../content/rigs";
import { sceneOptions } from "../../content/scenes";
import { PLACE_ACTIONS, actionsAt } from "../../content/scenes/actions";
import { sketchById } from "../../content/sketches/catalog";
import { activeCharacter, findCharacter } from "../../state/selectors";
import { getState } from "../../state/store";
import type { PlaceId, Preset, RigId } from "../../state/types";
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

function presetEntry(p: Preset, withSayings: boolean, withVariants: boolean) {
  const variants = withVariants ? variantIds(p) : undefined;
  return {
    id: p.id,
    label: p.label,
    loop: p.variants[0].loop,
    ...(withSayings ? { sayings: p.sayings } : {}),
    ...(variants ? { variants } : {}),
  };
}

/** What the drawn props allow here, and where the other actions live. */
function placeActions(place: PlaceId | null) {
  const elsewhere: Partial<Record<PlaceId, string[]>> = {};
  for (const a of PLACE_ACTIONS) {
    if (a.place === place) continue;
    (elsewhere[a.place] ??= []).push(a.id);
  }
  return { here: actionsAt(place).map((a) => ({ id: a.id, label: a.label, sayings: a.sayings })), elsewhere };
}

export const listMotions = defineTool({
  name: "list_motions",
  title: "Browse motions and scenes",
  description:
    "List what the play screen can do: motion presets for a character (its body type's plus universal ones) with their variants, the place actions drawn into the current scene (swing, slide, bus, inside) and where the others are, the primitives you can combine into your own motion (move, rotate, scale, bounce, shake, spin, flip, tilt, fade, wave) with limits, the body parts you may target, and scene options. Call it when the child asks for something new. Read-only.",
  schema: ListMotionsInput,
  readOnly: true,
  execute(input) {
    const parsed = parseInput(ListMotionsInput, input);
    if (!parsed.ok) return parsed;
    const rig = parsed.data.all ? "all" : rigOf(parsed.data.character);
    const rigs = rig === "all" ? RIGS : RIGS.filter((r) => r.id === rig);
    const universal = PRESETS.filter((p) => p.rig === "any").map((p) => ({ id: p.id, label: p.label }));
    const build = (withSayings: boolean, withVariants: boolean, withParams: boolean, compact = false) => {
      const presets = PRESETS.filter((p) => p.rig !== "any" && rigs.some((r) => r.id === p.rig));
      const byRig: Partial<Record<RigId, string[]>> = {};
      for (const p of presets) if (p.rig !== "any") (byRig[p.rig] ??= []).push(p.id);
      return {
        ...(rig === "all" ? { rigs: rigs.map((r) => r.id) } : { rig }),
        parts: [...new Set(rigs.flatMap((r) => r.parts.map((p) => p.id)))],
        presets: compact
          ? byRig
          : presets.map((p) => ({
              ...presetEntry(p, withSayings, withVariants),
              ...(rig === "all" ? { rig: p.rig } : {}),
            })),
        universal,
        placeActions: placeActions(getState().scene.place),
        primitives: describePrimitives().map((d) =>
          withParams ? { id: d.id, params: d.params } : { id: d.id, params: Object.keys(d.params) },
        ),
        composeHint: COMPOSE_HINT,
        scene: sceneOptions(),
      };
    };
    let body = build(true, true, true);
    if (JSON.stringify(body).length > LIST_SIZE_LIMIT) body = build(false, true, true);
    if (JSON.stringify(body).length > LIST_SIZE_LIMIT) body = build(false, true, false);
    if (JSON.stringify(body).length > LIST_SIZE_LIMIT) body = build(false, false, false);
    if (JSON.stringify(body).length > LIST_SIZE_LIMIT) body = build(false, false, false, true);
    return ok(body);
  },
});
