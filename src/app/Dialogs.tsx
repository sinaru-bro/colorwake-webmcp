import { useEffect } from "react";
import { startFresh } from "../state/actions";
import { clearSaved } from "../state/persistence";
import { ui, useUi } from "../state/ui";

const NOTICE_MS = 3500;

export function ResumeDialog() {
  const pending = useUi((s) => s.resumePending);
  if (!pending) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="resume-title">
      <div className="modal__box">
        <h2 id="resume-title">Continue where you left off?</h2>
        <p>Your pictures from last time are still here.</p>
        <div className="modal__btns">
          <button
            type="button"
            className="modal__btn"
            onClick={() => {
              clearSaved();
              startFresh();
              ui.setResumePending(false);
            }}
          >
            Start fresh
          </button>
          <button
            type="button"
            className="modal__btn modal__btn--primary"
            onClick={() => ui.setResumePending(false)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export function Notice() {
  const notice = useUi((s) => s.notice);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => ui.notice(null), NOTICE_MS);
    return () => clearTimeout(t);
  }, [notice]);
  if (!notice) return null;
  return (
    <div key={notice.title} className="notice" role="status">
      <span className="notice__title">{notice.title}</span>
      <span className="notice__hint">{notice.hint}</span>
    </div>
  );
}
