import type { ReactNode } from "react";
import { Icon } from "../render/icons";
import { ui, useUi } from "../state/ui";

interface Props {
  label: string;
  rail: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Sidebar({ label, rail, className, children }: Props) {
  const open = useUi((s) => s.sidebarOpen);
  const lower = label.toLowerCase();
  return (
    <aside
      className={`side${open ? "" : " side--rail"}${className ? ` ${className}` : ""}`}
      aria-label={label}
    >
      <button
        type="button"
        className="side__tab"
        onClick={() => ui.setSidebar(!open)}
        aria-expanded={open}
        aria-label={open ? `Hide ${lower}` : `Show ${lower}`}
      >
        <Icon name={open ? "chevronRight" : "chevronLeft"} size={22} />
      </button>
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
