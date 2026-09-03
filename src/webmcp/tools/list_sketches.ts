import { SKETCHES } from "../../content/sketches/catalog";
import { fail, ok } from "../results";
import { ListSketchesInput } from "../schemas";
import { defineTool } from "./shared";

const RIG_HINTS = {
  quadruped: "four legs",
  swimmer: "swims",
  winged: "flies",
  biped: "two legs",
  object: "things",
} as const;

export const listSketches = defineTool({
  name: "list_sketches",
  title: "Browse sketches",
  description:
    "List the coloring sketches the player can pick: id, title, body type (rig), difficulty (easy = a few big regions, normal = 8–12 regions) and a few English synonyms for it. Use it to find the sketch id for pick_sketch when the player names an animal or thing in any language. Read-only.",
  schema: ListSketchesInput,
  readOnly: true,
  execute(input) {
    const parsed = ListSketchesInput.safeParse(input ?? {});
    if (!parsed.success) {
      return fail("bad_filter", "rig or level is not a known value.", {
        options: [...Object.keys(RIG_HINTS), "easy", "normal"],
      });
    }
    const { rig, level } = parsed.data;
    const sketches = SKETCHES.filter((s) => (!rig || s.rig === rig) && (!level || s.level === level)).map(
      (s) => ({
        id: s.id,
        title: s.title,
        rig: s.rig,
        level: s.level,
        regions: s.regions.length,
        sayings: s.sayings,
      }),
    );
    const result = ok({ count: sketches.length, sketches, rigs: RIG_HINTS });
    return sketches.length === 0 ? { ...result, hint: "No sketch matches; drop the filter." } : result;
  },
});
