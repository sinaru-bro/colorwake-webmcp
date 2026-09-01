import { PALETTE_IDS } from "../../content/palette";
import { resolveColor } from "../../lib/color";
import { setTool as applyTool } from "../../state/actions";
import { activeCharacter } from "../../state/selectors";
import { getState } from "../../state/store";
import type { ToolState } from "../../state/types";
import { ui } from "../../state/ui";
import { fail, ok } from "../results";
import { SetToolInput } from "../schemas";
import { defineTool, ensureColorMode, parseInput } from "./shared";

export const setTool = defineTool({
  name: "set_tool",
  title: "Change brush and color",
  description:
    "Hand the child a drawing tool and color: fill (tap a region to fill it — best for 3–4 year olds), pen, brush or pencil, in a palette color (red, orange, yellow, green, sky, blue, purple, pink, brown, peach, black, white — other color names are mapped to the nearest). Use when the child asks for a color or tool. Changes only what the next touch paints with. Does not paint anything and does not change existing colors.",
  schema: SetToolInput,
  execute(input) {
    const parsed = parseInput(SetToolInput, input);
    if (!parsed.ok) return parsed;
    const { tool, color, size } = parsed.data;
    if (!tool && !color && !size) {
      return fail("nothing_to_change", "Pass a tool, a color or a size.", { options: PALETTE_IDS });
    }
    const update: Partial<ToolState> = {};
    let mapped: { from: string; to: string } | null = null;
    if (color !== undefined) {
      const match = resolveColor(color);
      if (!match) {
        return fail("unknown_color", `"${color}" is not a color I know.`, { options: PALETTE_IDS });
      }
      update.color = match.id;
      mapped = match.mapped;
    }
    if (tool) update.tool = tool;
    if (size) update.size = size;
    const switchedTo = ensureColorMode();
    const next = applyTool(update);
    ui.pulseHelper();
    const hint = switchedTo && !activeCharacter(getState()) ? "Call pick_sketch next." : undefined;
    return ok({ tool: next, mapped, switchedTo, ...(hint ? { hint } : {}) });
  },
});
