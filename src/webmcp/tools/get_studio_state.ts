import { getState } from "../../state/store";
import { describeState } from "../describe";
import { ok } from "../results";
import { GetStudioStateInput } from "../schemas";
import { defineTool, parseInput } from "./shared";

export const getStudioState = defineTool({
  name: "get_studio_state",
  title: "Look at the studio",
  description:
    "Read what is on screen right now: the mode (coloring or playing), every picture the child has colored (which regions have which colors, how done it is, where it stands, whether it is moving), the current tool and color, and the scene (place, time, weather, effects). Call this first before directing the play screen so you react to the child's real colors. Read-only. Note: colorwake never paints for the child — there is no fill or draw tool; the child does all coloring.",
  schema: GetStudioStateInput,
  readOnly: true,
  execute(input) {
    const parsed = parseInput(GetStudioStateInput, input);
    if (!parsed.ok) return parsed;
    return ok(describeState(getState()));
  },
});
