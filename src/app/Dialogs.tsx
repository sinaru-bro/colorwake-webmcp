import { useEffect } from "react";
import { colorAnother, enterPlay, startFresh } from "../state/actions";
import { clearSaved } from "../state/persistence";
import { ui, useUi } from "../state/ui";
import { usePlayLabel } from "./usePlayLabel";

const TOAST_MS = 3000;

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

export function DoneSheet() {
  const open = useUi((s) => s.doneSheetOpen);
  const label = usePlayLabel();
  if (!open) return null;
  return (
    <>
      <div className="sheet-scrim" onClick={() => ui.setDoneSheet(false)} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-label="Done">
        <button type="button" className="sheet__btn" onClick={() => colorAnother()}>
          Save &amp; color another
        </button>
        <button type="button" className="sheet__btn sheet__btn--primary" onClick={() => enterPlay()}>
          {label}
        </button>
      </div>
    </>
  );
}

export function Toast() {
  const message = useUi((s) => s.toast);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => ui.toast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}
