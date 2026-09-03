import { getState } from "../../state/store";
import { describeState } from "../describe";
import { ok } from "../results";
import { GetStudioStateInput } from "../schemas";
import { defineTool, parseInput } from "./shared";

export const getStudioState = defineTool({
  name: "get_studio_state",
  title: "Look at the studio",
  description:
    "Read what is on screen now: the mode (coloring or playing), every picture the player has colored (which regions have which colors, how done it is, where it stands, whether it is on the play screen — 3 at a time — and moving), the current tool and color, the scene (place, time, weather — null means not chosen yet) and placeActions the current place allows. Call this first before directing the play screen; if nextQuestion is set, ask the player that next. Read-only.",
  schema: GetStudioStateInput,
  readOnly: true,
  execute(input) {
    const parsed = parseInput(GetStudioStateInput, input);
    if (!parsed.ok) return parsed;
    return ok(describeState(getState()));
  },
});
