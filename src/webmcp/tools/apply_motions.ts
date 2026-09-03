import { ApplyMotionsInput } from "../schemas";
import { runApplyMotion } from "./apply_motion";
import { defineTool, parseInput } from "./shared";

export const applyMotions = defineTool({
  name: "apply_motions",
  title: "Make several characters move",
  description:
    'Animate up to three friends in one call — each action works like apply_motion (preset from list_motions, optional variant, speed, loop). Use it whenever the player wants more than one friend moving ("everybody dance!") instead of calling apply_motion repeatedly. Actions start together and each reports its own result. For a single friend, or composed steps, use apply_motion.',
  schema: ApplyMotionsInput,
  execute(input) {
    const parsed = parseInput(ApplyMotionsInput, input);
    if (!parsed.ok) return parsed;
    const raw = parsed.data.actions.map((action) => runApplyMotion(action));
    const assemble = (results: unknown[]) => {
      const started = results.filter((r) => (r as { ok: boolean }).ok).length;
      if (started === 0) {
        return { ok: false, code: "all_failed", error: "None of the motions could start.", results };
      }
      return { ok: true, started, results };
    };
    return raw.some((r) => r instanceof Promise) ? Promise.all(raw).then(assemble) : assemble(raw);
  },
});
