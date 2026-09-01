import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "../render/icons";
import { ui, useUi } from "../state/ui";

const PORTRAIT = "(max-aspect-ratio: 1/1)";

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
  const lower = label.toLowerCase();
  return (
    <aside
      className={`side${open ? "" : " side--rail"}${className ? ` ${className}` : ""}`}
      aria-label={label}
    >
      {!portrait && (
        <button
          type="button"
          className="side__tab"
          onClick={() => ui.setSidebar(!open)}
          aria-expanded={open}
          aria-label={open ? `Hide ${lower}` : `Show ${lower}`}
        >
          <Icon name={open ? "chevronRight" : "chevronLeft"} size={22} />
        </button>
      )}
      {open ? (
        children
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
