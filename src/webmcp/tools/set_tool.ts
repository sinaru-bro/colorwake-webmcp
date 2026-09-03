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

const COLOR_OPTIONS = [...PALETTE_IDS, "#rrggbb"];

export const setTool = defineTool({
  name: "set_tool",
  title: "Change brush and color",
  description:
    "Hand the player a drawing tool and color: fill (tap a region to fill it — the simplest), pen, brush or pencil, in a palette color (red, orange, yellow, green, sky, blue, purple, white, peach, brown, black) or any other color as a CSS name or #rrggbb hex (mint, turquoise, #ff69b4 become custom colors). Use when the player asks for a color or tool. Changes only what the next touch paints with. Does not paint anything and does not change existing colors.",
  schema: SetToolInput,
  execute(input) {
    const parsed = parseInput(SetToolInput, input);
    if (!parsed.ok) return parsed;
    const { tool, color, size } = parsed.data;
    if (!tool && !color && !size) {
      return fail("nothing_to_change", "Pass a tool, a color or a size.", { options: COLOR_OPTIONS });
    }
    const update: Partial<ToolState> = {};
    let mapped: { from: string; to: string } | null = null;
    if (color !== undefined) {
      const match = resolveColor(color);
      if (!match) {
        return fail(
          "unknown_color",
          `"${color}" is not a color I know — use a palette id, a common color name or #rrggbb.`,
          {
            options: COLOR_OPTIONS,
          },
        );
      }
      update.color = match.color;
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
