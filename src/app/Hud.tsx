import { useEffect, useState } from "react";
import { PLACES, TIMES, WEATHERS } from "../content/scenes";
import { SceneChip } from "../play/Chip";
import { arrangeScene } from "../state/actions";
import { displayName, nextQuestion } from "../state/selectors";
import { useStudio } from "../state/store";
import { ui, useUi } from "../state/ui";
import type { PlaceId, SceneAxis, TimeId, WeatherId } from "../state/types";

const SHOW_MS = 2800;
const SHOW_READ_MS = 1500;

const OPTIONS: Record<SceneAxis, ReadonlyArray<{ id: string; label: string }>> = {
  place: PLACES,
  time: TIMES,
  weather: WEATHERS,
};

function answer(axis: SceneAxis, id: string): void {
  if (axis === "place") arrangeScene({ place: id as PlaceId });
  else if (axis === "time") arrangeScene({ time: id as TimeId });
  else arrangeScene({ weather: id as WeatherId });
}

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** One surface above the stage: what the helper just did, or the next question to ask the child. */
export function Hud() {
  const mode = useStudio((s) => s.mode);
  const scene = useStudio((s) => s.scene);
  const characters = useStudio((s) => s.characters);
  const skipped = useUi((s) => s.skipped);
  const support = useUi((s) => s.agent.support);
  const activity = useUi((s) => s.activity);
  const latest = activity.length > 0 ? activity[activity.length - 1] : null;
  const [expiredId, setExpiredId] = useState<number | null>(null);

  useEffect(() => {
    if (!latest) return;
    const timer = setTimeout(() => setExpiredId(latest.id), latest.read ? SHOW_READ_MS : SHOW_MS);
    return () => clearTimeout(timer);
  }, [latest]);

  if (latest && expiredId !== latest.id) {
    return (
      <div key={latest.id} className={`hud hud--act${latest.ok ? "" : " hud--err"}`} role="status">
        {latest.kid && <span className="hud__kid">{latest.kid}</span>}
        <code className="hud__tag">{latest.tag}</code>
      </div>
    );
  }
  if (mode !== "play") return null;
  const q = nextQuestion(scene, skipped);
  if (q) {
    return (
      <div key={q.axis} className="hud hud--ask" role="group" aria-label={q.ask}>
        <span className="hud__q">{q.ask}</span>
        <div className="hud__row">
          {OPTIONS[q.axis].map((o) => (
            <SceneChip key={o.id} id={o.id} label={o.label} on={false} onClick={() => answer(q.axis, o.id)} />
          ))}
        </div>
        <button type="button" className="hud__later" onClick={() => ui.skipQuestion(q.axis)}>
          Later
        </button>
      </div>
    );
  }
  if (support === "native" && characters.length > 0) {
    return (
      <div className="hud hud--idle">Helper ready · say what {cap(displayName(characters[0]))} should do</div>
    );
  }
  return null;
}
