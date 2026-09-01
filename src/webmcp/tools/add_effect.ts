import { EFFECT_IDS, effectById } from "../../content/effects";
import { setEffect } from "../../state/actions";
import { getState } from "../../state/store";
import type { EffectId } from "../../state/types";
import { fail, ok } from "../results";
import { AddEffectInput } from "../schemas";
import { defineTool, ensurePlayMode, parseInput, resolveCharacter } from "./shared";

const WEATHER_WORDS = new Set(["rain", "snow", "cloudy", "wind", "thunder", "clear"]);

function present(effects: ReturnType<typeof getState>["scene"]["effects"]) {
  return effects.map((e) => ({ id: e.id, intensity: e.intensity, target: e.target ?? null }));
}

export const addEffect = defineTool({
  name: "add_effect",
  title: "Add a sparkle effect",
  description:
    'Turn a decorative effect on or off: stars, hearts or bubbles — over the whole play screen, or hearts/bubbles around one character. Use when the child asks for sparkle or love. Up to three at once; pass on:false to remove one, or effect "none" to clear all. Rain and snow are weather — use arrange_scene for those. Does not change colors or motions.',
  schema: AddEffectInput,
  execute(input) {
    const parsed = parseInput(AddEffectInput, input);
    if (!parsed.ok) return parsed;
    const { effect, on = true, intensity = "normal", character } = parsed.data;
    if (effect !== "none" && !effectById(effect)) {
      const weatherHint = WEATHER_WORDS.has(effect) ? "That's weather — use arrange_scene." : undefined;
      return fail("unknown_effect", `No effect "${effect}".`, {
        options: [...EFFECT_IDS, "none"],
        hint: weatherHint,
      });
    }
    let target: string | undefined;
    if (character) {
      const def = effectById(effect);
      if (!def?.attachable) {
        return fail(
          "effect_not_attachable",
          `"${effect}" covers the whole play screen and cannot follow one character.`,
          {
            options: EFFECT_IDS.filter((id) => effectById(id)?.attachable),
          },
        );
      }
      const resolved = resolveCharacter(character);
      if (!resolved.ok) return resolved;
      target = resolved.character.id;
    }
    const switched = ensurePlayMode();
    if (!switched.ok) return switched;
    const res = setEffect(effect as EffectId | "none", on, intensity, target);
    if (!res.ok) {
      return fail("too_many_effects", "Three effects are already on.", {
        hint: "Turn one off first (on:false).",
        options: present(getState().scene.effects),
      });
    }
    return ok({ effects: present(res.effects), updated: res.updated, switchedTo: switched.switchedTo });
  },
});
