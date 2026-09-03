import { useEffect, useState } from "react";
import { nextQuestion } from "../state/selectors";
import { useStudio } from "../state/store";
import { useUi } from "../state/ui";
import type { Scene, SceneAxis } from "../state/types";

const SHOW_MS = 2800;
const SHOW_READ_MS = 1500;
/** How long a question stays up — enough for a grown-up to read it and ask the player. */
const ASK_MS = 5000;

/** Asks each unset scene axis once per visit to the play screen, then gets out of the way. */
function Guide({ scene, visible }: { scene: Scene; visible: boolean }) {
  const [asked, setAsked] = useState<SceneAxis | null>(null);
  const question = nextQuestion(scene);
  const axis = visible && question && question.axis !== asked ? question.axis : null;

  useEffect(() => {
    if (!axis) return;
    const timer = setTimeout(() => setAsked(axis), ASK_MS);
    return () => clearTimeout(timer);
  }, [axis]);

  if (!axis || !question) return null;
  return (
    <div key={axis} className="hud hud--ask" role="status">
      <span className="hud__q">{question.ask}</span>
    </div>
  );
}

/** One surface above the stage: what the helper just did, or the next question to ask the player. */
export function Hud() {
  const mode = useStudio((s) => s.mode);
  const scene = useStudio((s) => s.scene);
  const activity = useUi((s) => s.activity);
  const transition = useUi((s) => s.transition);
  const muted = useUi((s) => s.mutedActivity);
  const latest = activity.length > 0 ? activity[activity.length - 1] : null;
  const [expiredId, setExpiredId] = useState<number | null>(null);

  useEffect(() => {
    if (!latest) return;
    const timer = setTimeout(() => setExpiredId(latest.id), latest.read ? SHOW_READ_MS : SHOW_MS);
    return () => clearTimeout(timer);
  }, [latest]);

  const showingActivity = latest !== null && latest.id > muted && expiredId !== latest.id;
  return (
    <>
      {showingActivity && !transition && (
        <div key={latest.id} className={`hud hud--act${latest.ok ? "" : " hud--err"}`} role="status">
          {latest.kid && <span className="hud__kid">{latest.kid}</span>}
          <code className="hud__tag">{latest.tag}</code>
        </div>
      )}
      {mode === "play" && <Guide scene={scene} visible={!transition && !showingActivity} />}
    </>
  );
}
