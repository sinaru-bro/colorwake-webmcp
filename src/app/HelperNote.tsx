import { useEffect, useState } from "react";
import { useUi } from "../state/ui";

const SHOW_MS = 2800;
const SHOW_READ_MS = 1500;

/** The helper's latest move, resting at the foot of the sidebar while an agent is connected. */
export function HelperNote() {
  const support = useUi((s) => s.agent.support);
  const activity = useUi((s) => s.activity);
  const muted = useUi((s) => s.mutedActivity);
  const latest = activity.length > 0 ? activity[activity.length - 1] : null;
  const [expiredId, setExpiredId] = useState<number | null>(null);

  useEffect(() => {
    if (!latest) return;
    const timer = setTimeout(() => setExpiredId(latest.id), latest.read ? SHOW_READ_MS : SHOW_MS);
    return () => clearTimeout(timer);
  }, [latest]);

  if (support !== "native" || !latest || latest.id <= muted || expiredId === latest.id) return null;
  const mods = `${latest.ok ? "" : " helper-note--err"}${latest.read ? " helper-note--read" : ""}`;
  return (
    <div key={latest.id} className={`helper-note${mods}`} role="status">
      <span className="helper-note__dot" aria-hidden="true" />
      <span className="helper-note__text">{latest.kid ?? latest.tag}</span>
    </div>
  );
}
