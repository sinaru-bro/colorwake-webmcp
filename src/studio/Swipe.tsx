import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

const SETTLE_MS = 120;
const START_INSET = 12;

export interface SwipeItem {
  id: string;
  label: string;
  on: boolean;
  node: ReactNode;
}

/** One row of choices, like flipping photos: the centred one is the pick, neighbours peek. */
export function Swipe({
  items,
  selected,
  half,
  page,
  start,
  ariaLabel,
  onPick,
  onCenter,
}: {
  items: SwipeItem[];
  selected: string | null;
  half: number;
  page?: boolean;
  start?: boolean;
  ariaLabel: string;
  onPick: (id: string) => void;
  onCenter?: (id: string) => void;
}) {
  const row = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const el = row.current?.querySelector<HTMLElement>(`[data-id="${selected ?? ""}"]`);
    el?.scrollIntoView({ inline: start ? "start" : "center", block: "nearest", behavior: "smooth" });
  }, [selected, start]);
  const settle = () => {
    const el = row.current;
    if (!el || !onCenter) return;
    const box = el.getBoundingClientRect();
    const mid = start ? box.left + START_INSET + half : box.left + el.clientWidth / 2;
    let best: { id: string; d: number } | null = null;
    for (const child of el.querySelectorAll<HTMLElement>("[data-id]")) {
      const r = child.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (!best || d < best.d) best = { id: child.dataset.id ?? "", d };
    }
    if (best && best.id !== selected) onCenter(best.id);
  };
  return (
    <div
      ref={row}
      className={`mswipe${page ? " mswipe--page" : ""}${start ? " mswipe--start" : ""}`}
      aria-label={ariaLabel}
      style={{ "--half": `${half}px` } as CSSProperties}
      onScroll={() => {
        clearTimeout(timer.current);
        timer.current = window.setTimeout(settle, SETTLE_MS);
      }}
    >
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          data-id={it.id}
          className={`mswipe__item${it.on ? " mswipe__item--on" : ""}`}
          aria-label={it.label}
          aria-pressed={it.on}
          onClick={() => onPick(it.id)}
        >
          {it.node}
        </button>
      ))}
    </div>
  );
}
