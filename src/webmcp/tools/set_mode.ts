import { colorAnother, enterPlay } from "../../state/actions";
import { nextQuestion } from "../../state/selectors";
import { getState } from "../../state/store";
import { LIMITS } from "../../state/types";
import { summarize } from "../describe";
import { fail, ok } from "../results";
import { SetModeInput } from "../schemas";
import { defineTool, parseInput } from "./shared";

export const setMode = defineTool({
  name: "set_mode",
  title: "Switch between coloring and playing",
  description:
    'Switch between coloring and playing, like the on-screen buttons ("Let\'s play with my friends!" and the + in My friends). mode "play" puts the current picture in My friends and turns the canvas into the play screen, where up to 3 friends come alive — use when the child says they are done or wants to play. mode "color" goes back to coloring with the sketch strip open — use when the child wants to color another picture. A picture needs at least one color before it can play.',
  schema: SetModeInput,
  execute(input) {
    const parsed = parseInput(SetModeInput, input);
    if (!parsed.ok) return parsed;
    if (parsed.data.mode === "play") {
      const res = enterPlay();
      if (!res.ok) {
        return fail("not_colored_yet", "Nothing is colored yet, so there is nothing to play with.", {
          hint: "Offer a color with set_tool — the child needs to color first.",
        });
      }
      const s = getState();
      return ok({
        mode: "play",
        already: res.already,
        saved: res.saved,
        dropped: res.dropped,
        tray: { count: s.characters.length, capacity: LIMITS.maxCharacters },
        stage: { count: s.cast.length, capacity: LIMITS.maxOnStage },
        characters: s.characters.map((c) => ({ ...summarize(c), onStage: s.cast.includes(c.id) })),
        nextQuestion: nextQuestion(s.scene),
      });
    }
    const res = colorAnother();
    return ok({
      mode: "color",
      already: res.already,
      saved: res.saved,
      hint: "Call pick_sketch to put a sketch on the canvas.",
    });
  },
});
