import { useEffect, useRef, useState } from "react";
import { sketchById } from "../content/sketches/catalog";
import { Icon } from "../render/icons";
import { SketchSurface } from "../render/SketchSurface";
import { colorAnother, removeCharacter, resetAll, selectCharacter } from "../state/actions";
import { displayName } from "../state/selectors";
import { useStudio } from "../state/store";
import { LIMITS } from "../state/types";
import { useUi } from "../state/ui";
import { TOOL_NAMES } from "../webmcp/toolNames";

const RESET_HOLD_MS = 1500;
const REMOVE_HOLD_MS = 1000;

function useHold(ms: number, onComplete: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [holding, setHolding] = useState(false);
  const start = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onComplete();
    }, ms);
  };
  const cancel = () => {
    setHolding(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => cancel, []);
  return { holding, start, cancel };
}

function Tray() {
  const characters = useStudio((s) => s.characters);
  const activeId = useStudio((s) => s.activeCharacterId);
  const shown = characters.filter((c) => c.id !== activeId);
  const [holdId, setHoldId] = useState<string | null>(null);
  const hold = useHold(REMOVE_HOLD_MS, () => {
    if (holdId) removeCharacter(holdId);
    setHoldId(null);
  });
  return (
    <div className="tray" aria-label="Saved pictures">
      {shown.map((c) => {
        const sketch = sketchById(c.sketchId);
        if (!sketch) return null;
        return (
          <button
            key={c.id}
            type="button"
            className={`tray__thumb${holdId === c.id && hold.holding ? " reset--holding" : ""}`}
            title={`${displayName(c)} — tap to color, hold to remove`}
            onClick={() => selectCharacter(c.id)}
            onPointerDown={() => {
              setHoldId(c.id);
              hold.start();
            }}
            onPointerUp={hold.cancel}
            onPointerLeave={hold.cancel}
            onPointerCancel={hold.cancel}
          >
            <SketchSurface sketch={sketch} paint={c.paint} />
            <span className="reset__fill" />
          </button>
        );
      })}
      {characters.length < LIMITS.maxCharacters && (
        <span className="tray__thumb tray__thumb--empty" aria-hidden="true" />
      )}
    </div>
  );
}

function AgentBadge() {
  const agent = useUi((s) => s.agent);
  const activity = useUi((s) => s.activity);
  const storageError = useUi((s) => s.storageError);
  const [open, setOpen] = useState(false);
  const status = storageError
    ? { cls: " badge--warn", text: "Not saving", detail: "Storage is full — new changes may be lost" }
    : agent.support === "native"
      ? { cls: "", text: "Helper ready", detail: `${TOOL_NAMES.length} site tools` }
      : { cls: " badge--none", text: "Helper off", detail: "Needs ChatGPT desktop or Chrome 149+" };
  return (
    <button
      type="button"
      className={`badge${status.cls}`}
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
    >
      <span className="badge__dot" aria-hidden="true" />
      {status.text}
      {open && (
        <span className="badge__pop" role="dialog">
          <strong>{status.detail}</strong>
          <br />
          {TOOL_NAMES.map((n) => (
            <span key={n}>
              <code>{n}</code>
              <br />
            </span>
          ))}
          {activity.length > 0 && (
            <span className="badge__log">
              <strong>Recent</strong>
              <br />
              {activity
                .slice(-6)
                .reverse()
                .map((a) => (
                  <span key={a.id}>
                    <code>{a.tag}</code>
                    {a.kid ? ` — ${a.kid}` : ""}
                    <br />
                  </span>
                ))}
            </span>
          )}
        </span>
      )}
    </button>
  );
}

function ResetButton() {
  const hold = useHold(RESET_HOLD_MS, resetAll);
  return (
    <button
      type="button"
      className={`reset${hold.holding ? " reset--holding" : ""}`}
      aria-label="Reset all"
      title="Hold to reset everything"
      onPointerDown={hold.start}
      onPointerUp={hold.cancel}
      onPointerLeave={hold.cancel}
      onPointerCancel={hold.cancel}
    >
      <span className="reset__fill" />
      <Icon name="reset" size={22} />
    </button>
  );
}

export function Header() {
  const mode = useStudio((s) => s.mode);
  return (
    <header className="header">
      <span className="logo">
        colorwake
      </span>
      {mode === "color" ? (
        <Tray />
      ) : (
        <button type="button" className="another" onClick={() => colorAnother()}>
          <Icon name="brush" size={22} />
          Color another
        </button>
      )}
      <span className="header__spacer" />
      <AgentBadge />
      <ResetButton />
    </header>
  );
}
