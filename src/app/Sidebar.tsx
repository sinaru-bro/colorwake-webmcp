import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "../render/icons";
import { ui, useUi } from "../state/ui";

const PORTRAIT = "(max-aspect-ratio: 1/1)";
const COLLAPSE_MS = 280;

function usePortrait(): boolean {
  const [portrait, setPortrait] = useState(() => window.matchMedia(PORTRAIT).matches);
  useEffect(() => {
    const mq = window.matchMedia(PORTRAIT);
    const update = () => setPortrait(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return portrait;
}

interface Props {
  label: string;
  rail: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Sidebar({ label, rail, className, children }: Props) {
  const portrait = usePortrait();
  const sidebarOpen = useUi((s) => s.sidebarOpen);
  const open = portrait || sidebarOpen;
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(0);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const toggle = () => {
    if (open) {
      setClosing(true);
      clearTimeout(closeTimer.current);
      closeTimer.current = window.setTimeout(() => setClosing(false), COLLAPSE_MS);
    }
    ui.setSidebar(!open);
  };
  const lower = label.toLowerCase();
  const panel = open || closing;
  return (
    <aside
      className={`side${open ? "" : " side--rail"}${panel && !open ? " side--closing" : ""}${className ? ` ${className}` : ""}`}
      aria-label={label}
    >
      {!portrait && (
        <button
          type="button"
          className="side__toggle"
          onClick={toggle}
          aria-expanded={open}
          aria-label={open ? `Hide ${lower}` : `Show ${lower}`}
          title={open ? `Hide ${lower}` : `Show ${lower}`}
        >
          <Icon name={open ? "panelHide" : "panelShow"} size={22} />
        </button>
      )}
      {panel ? (
        <div className="side__panel">{children}</div>
      ) : (
        <button
          type="button"
          className="rail"
          onClick={() => ui.setSidebar(true)}
          aria-label={`Show ${lower}`}
        >
          {rail}
        </button>
      )}
    </aside>
  );
}
