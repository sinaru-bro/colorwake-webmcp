import { useEffect, useState } from "react";
import { nextQuestion } from "../state/selectors";
import { useStudio } from "../state/store";
import { useUi } from "../state/ui";
import type { Scene, SceneAxis } from "../state/types";

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

/** One surface above the stage: the next question to ask the player. */
export function Hud() {
  const mode = useStudio((s) => s.mode);
  const scene = useStudio((s) => s.scene);
  const transition = useUi((s) => s.transition);
  if (mode !== "play") return null;
  return <Guide scene={scene} visible={!transition} />;
}
