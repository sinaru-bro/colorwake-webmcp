import { SKETCHES, sketchById } from "../../content/sketches/catalog";
import { pickSketch as pick } from "../../state/actions";
import { displayName, progress } from "../../state/selectors";
import { getState } from "../../state/store";
import { fail, ok } from "../results";
import { PickSketchInput } from "../schemas";
import { defineTool, MAX_OPTIONS, parseInput } from "./shared";

export const TRAY_FULL_MESSAGE = "Tray is full — hold a picture in the tray to remove it";

export const pickSketch = defineTool({
  name: "pick_sketch",
  title: "Put a sketch on the canvas",
  description:
    "Put a coloring sketch on the canvas for the child to color, exactly like tapping it in the sketch strip. Use when the child names what they want to color. If the current picture already has color it is kept in the tray (up to 4 pictures); a blank one is replaced. Switches to coloring mode if the child was playing. Does not color anything — the child does the coloring.",
  schema: PickSketchInput,
  execute(input) {
    const parsed = parseInput(PickSketchInput, input);
    if (!parsed.ok) return parsed;
    const sketch = sketchById(parsed.data.sketch);
    if (!sketch) {
      return fail("unknown_sketch", `No sketch "${parsed.data.sketch}".`, {
        hint: "Call list_sketches.",
        options: SKETCHES.slice(0, MAX_OPTIONS).map((s) => s.id),
      });
    }
    const res = pick(sketch.id);
    if (!res.ok) {
      if (res.code === "tray_full") {
        return fail("tray_full", TRAY_FULL_MESSAGE, {
          options: getState().characters.map((c) => ({
            id: c.id,
            displayName: displayName(c),
            progress: progress(c),
          })),
        });
      }
      return fail(res.code, `No sketch "${sketch.id}".`);
    }
    return ok({
      character: { id: res.character.id, title: sketch.title, sketch: sketch.id, rig: sketch.rig },
      replaced: res.replaced,
      regions: sketch.regions.map((r) => r.id),
      switchedTo: res.switchedTo,
      hint: "The child can start coloring now.",
    });
  },
});
