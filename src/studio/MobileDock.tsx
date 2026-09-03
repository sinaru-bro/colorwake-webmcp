import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MyFriends } from "../app/MyFriends";
import { PALETTE } from "../content/palette";
import { SKETCH_LIST } from "../content/sketches/catalog";
import { colorHex, isCustomColor, isLightColor } from "../lib/color";
import { ScenePanel } from "../play/ScenePanel";
import { SCENE_ICONS } from "../play/sceneIcons";
import { ToolIcon } from "../render/icons";
import { SketchSurface } from "../render/SketchSurface";
import { enterPlay, pickSketch, setTool } from "../state/actions";
import { coloredCharacters } from "../state/selectors";
import { useStudio } from "../state/store";
import type { Paint, StrokeSize, ToolId } from "../state/types";
import { ui, useUi } from "../state/ui";
import { usePhone } from "./phone";

const SETTLE_MS = 120;
const EMPTY_PAINT: Paint = { fills: {}, strokes: [] };
const FULL_NOTICE = {
  title: "My friends is full!",
  hint: "Hold a picture there to make room",
  at: "friends",
} as const;
const TOOLS: { id: ToolId; label: string }[] = [
  { id: "brush", label: "Brush" },
  { id: "pencil", label: "Pencil" },
  { id: "pen", label: "Marker" },
  { id: "fill", label: "Fill" },
];
const SIZES: { id: StrokeSize; dot: number }[] = [
  { id: "s", dot: 14 },
  { id: "m", dot: 22 },
  { id: "l", dot: 32 },
];
const CUSTOM_START = "#ff8a5b";
const DARK_INK = "#2e2a26";

interface SwipeItem {
  id: string;
  label: string;
  on: boolean;
  node: ReactNode;
}

/** One row of choices, like flipping photos: the centred one is the pick, neighbours peek. */
function Swipe({
  items,
  selected,
  half,
  ariaLabel,
  onPick,
  onCenter,
}: {
  items: SwipeItem[];
  selected: string | null;
  half: number;
  ariaLabel: string;
  onPick: (id: string) => void;
  onCenter?: (id: string) => void;
}) {
  const row = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const el = row.current?.querySelector<HTMLElement>(`[data-id="${selected ?? ""}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selected]);
  const settle = () => {
    const el = row.current;
    if (!el || !onCenter) return;
    const mid = el.getBoundingClientRect().left + el.clientWidth / 2;
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
      className="mswipe"
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

/** Full-canvas sketch browser: swipe like photos, then tap the button to start coloring. */
export function MobileSketchBrowser() {
  const [browse, setBrowse] = useState("cat");
  const current = SKETCH_LIST.find((s) => s.id === browse) ?? SKETCH_LIST[0];
  return (
    <div className="mbrowse">
      <Swipe
        ariaLabel="Pictures"
        half={100}
        selected={browse}
        items={SKETCH_LIST.map((s) => ({
          id: s.id,
          label: s.title,
          on: browse === s.id,
          node: (
            <>
              <span className="mswipe__thumb">
                <SketchSurface sketch={s} paint={EMPTY_PAINT} />
              </span>
              <span>{s.title}</span>
            </>
          ),
        }))}
        onPick={(id) => setBrowse(id)}
        onCenter={(id) => setBrowse(id)}
      />
      <button
        type="button"
        className="mbrowse__go"
        onClick={() => {
          const res = pickSketch(current.id);
          if (!res.ok && res.code === "tray_full") ui.notice(FULL_NOTICE);
        }}
      >
        Color this one!
      </button>
    </div>
  );
}

function AnyColor() {
  const color = useStudio((s) => s.tool.color);
  const on = isCustomColor(color);
  const [last, setLast] = useState(on ? color : CUSTOM_START);
  const value = on ? color : last;
  const vars = { "--c": value, "--ck": isLightColor(value) ? DARK_INK : "#fff" } as CSSProperties;
  return (
    <label className={`swatch swatch--custom${on ? " swatch--on" : ""}`} style={vars} title="Any color">
      <input
        type="color"
        className="swatch__input"
        aria-label="Any color"
        value={value}
        onChange={(e) => {
          const hex = e.target.value.toLowerCase();
          setLast(hex);
          setTool({ color: hex });
        }}
      />
    </label>
  );
}

function ToolSheet() {
  const tool = useStudio((s) => s.tool);
  return (
    <>
      <section className="msheet__sec">
        <span className="side__label">Tools</span>
        <Swipe
          ariaLabel="Tools"
          half={40}
          selected={tool.tool}
          items={TOOLS.map((t) => ({
            id: t.id,
            label: t.label,
            on: tool.tool === t.id,
            node: (
              <>
                <ToolIcon name={t.id} size={40} />
                <span>{t.label}</span>
              </>
            ),
          }))}
          onPick={(id) => setTool({ tool: id as ToolId })}
          onCenter={(id) => setTool({ tool: id as ToolId })}
        />
      </section>
      <section className="msheet__sec">
        <span className="side__label">Size</span>
        <Swipe
          ariaLabel="Size"
          half={26}
          selected={tool.size}
          items={SIZES.map((s) => ({
            id: s.id,
            label: `Size ${s.id}`,
            on: tool.size === s.id,
            node: <span className="mswipe__sizedot" style={{ width: s.dot, height: s.dot }} />,
          }))}
          onPick={(id) => setTool({ size: id as StrokeSize })}
          onCenter={(id) => setTool({ size: id as StrokeSize })}
        />
      </section>
      <section className="msheet__sec">
        <span className="side__label">Colors</span>
        <div className="msheet__colors">
          <Swipe
            ariaLabel="Colors"
            half={26}
            selected={isCustomColor(tool.color) ? null : tool.color}
            items={PALETTE.map((c) => ({
              id: c.id,
              label: c.label,
              on: tool.color === c.id,
              node: <span className="mswipe__dot" style={{ background: c.hex }} />,
            }))}
            onPick={(id) => setTool({ color: id })}
            onCenter={(id) => setTool({ color: id })}
          />
          <AnyColor />
        </div>
      </section>
    </>
  );
}

export function MobileDock() {
  const phone = usePhone();
  const mode = useStudio((s) => s.mode);
  const place = useStudio((s) => s.scene.place);
  const tool = useStudio((s) => s.tool);
  const canPlay = useStudio((s) => coloredCharacters(s).length > 0);
  const hasActive = useStudio((s) => s.activeCharacterId !== null);
  const agent = useUi((s) => s.agent);
  const [open, setOpen] = useState(
    () => import.meta.env.DEV && new URLSearchParams(window.location.search).get("sheet") === "1",
  );
  if (!phone) return null;
  const coloring = mode === "color";
  const close = () => setOpen(false);
  return (
    <>
      <button
        type="button"
        className="mdock-fab"
        aria-label={coloring ? "Tools and colors" : "Scene and friends"}
        disabled={coloring && !hasActive}
        onClick={() => setOpen(true)}
      >
        {coloring ? (
          <>
            <ToolIcon name={tool.tool} size={26} />
            <span className="mdock-fab__color" style={{ background: colorHex(tool.color) }} />
          </>
        ) : (
          <span className="mdock-fab__emoji" aria-hidden="true">
            {place ? SCENE_ICONS[place] : "▢"}
          </span>
        )}
      </button>
      {coloring && (
        <div className="mbar">
          <MyFriends />
          <div className="play-dock">
            <button type="button" className="play-cta" disabled={!canPlay} onClick={() => enterPlay()}>
              Let&apos;s play with my friends!
            </button>
            {agent.support === "native" && canPlay && (
              <span className="play-dock__hint">or just tell your AI &quot;Let&apos;s play!&quot;</span>
            )}
          </div>
        </div>
      )}
      {open && (
        <div className="msheet">
          <button type="button" className="msheet__scrim" aria-label="Close" onClick={close} />
          <div className="msheet__panel">{coloring ? <ToolSheet /> : <ScenePanel />}</div>
        </div>
      )}
    </>
  );
}
