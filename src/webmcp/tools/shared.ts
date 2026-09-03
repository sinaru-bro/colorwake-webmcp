import type { z } from "zod";
import { colorAnother, enterPlay } from "../../state/actions";
import { findCharacter, isColored } from "../../state/selectors";
import { getState } from "../../state/store";
import type { Character } from "../../state/types";
import { ui } from "../../state/ui";
import { describeActivity } from "../activity";
import { summarize } from "../describe";
import { fail, type ToolError } from "../results";

export interface ToolDef {
  name: string;
  title: string;
  description: string;
  schema: z.ZodType;
  readOnly?: boolean;
  execute(input: unknown): unknown;
}

export const MAX_OPTIONS = 24;

export function defineTool(def: ToolDef): ToolDef {
  return {
    ...def,
    execute(input: unknown) {
      const before = getState();
      let result: unknown;
      try {
        result = def.execute(input);
      } catch {
        result = fail("internal", `${def.name} failed unexpectedly.`, {
          hint: "Call get_studio_state and retry.",
        });
      }
      const note = describeActivity(def.name, input, result, before, getState());
      ui.noteActivity({
        tool: def.name,
        kid: note.kid,
        tag: note.tag,
        ok: (result as { ok?: boolean }).ok === true,
        read: def.readOnly === true,
        at: Date.now(),
      });
      if (note.flash.length > 0) ui.flash(note.flash);
      return result;
    },
  };
}

export function parseInput<T extends z.ZodType>(
  schema: T,
  input: unknown,
): { ok: true; data: z.infer<T> } | ToolError {
  const result = schema.safeParse(input ?? {});
  if (result.success) return { ok: true, data: result.data };
  const detail = result.error.issues
    .slice(0, 3)
    .map((i) => `${i.path.join(".") || "input"}: ${i.message}`)
    .join("; ");
  return fail("bad_input", `Input did not match the schema (${detail}).`, {
    hint: "Check the field names and types in the tool description.",
  });
}

export type CharacterResolution = { ok: true; character: Character } | ToolError;

export function resolveCharacter(ref: string, requireColored = true): CharacterResolution {
  const s = getState();
  const found = findCharacter(s, ref);
  if (found.kind === "none") {
    return fail("unknown_character", `No character "${ref}" on the play screen.`, {
      hint: "Use an id from get_studio_state.",
      options: s.characters.map(summarize),
    });
  }
  if (found.kind === "ambiguous") {
    return fail("ambiguous_character", `More than one "${ref}" — say which one.`, {
      options: found.candidates.map((c) => ({ ...summarize(c), progress: 0 })),
    });
  }
  if (requireColored && !isColored(found.character)) {
    return fail("not_colored_yet", "That picture has no color yet, so it cannot play.", {
      hint: "Offer a color with set_tool — the player needs to color first.",
    });
  }
  return { ok: true, character: found.character };
}

export type Switch = { ok: true; switchedTo: "play" | "color" | null } | ToolError;

export function ensurePlayMode(): Switch {
  if (getState().mode === "play") return { ok: true, switchedTo: null };
  const res = enterPlay();
  if (!res.ok) {
    return fail("not_colored_yet", "Nothing is colored yet, so there is nothing to play with.", {
      hint: "Offer a color with set_tool — the player needs to color first.",
    });
  }
  return { ok: true, switchedTo: "play" };
}

export function ensureColorMode(): "color" | null {
  if (getState().mode === "color") return null;
  colorAnother();
  return "color";
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
