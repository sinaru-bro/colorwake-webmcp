import { sketchById } from "../content/sketches/catalog";
import { activeCharacter, coloredCharacters, isColored } from "../state/selectors";
import { useStudio } from "../state/store";

export function usePlayLabel(): string {
  const s = useStudio((st) => st);
  const active = activeCharacter(s);
  const activeColored = active ? isColored(active) : false;
  const others = coloredCharacters(s).filter((c) => c.id !== active?.id).length;
  const verb = activeColored ? "Save & play with" : "Play with";
  if (others > 0) return `${verb} friends`;
  const title = active ? (sketchById(active.sketchId)?.title ?? "it") : "it";
  return `${verb} ${title}`;
}
