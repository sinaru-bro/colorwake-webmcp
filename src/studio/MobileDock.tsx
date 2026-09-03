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

const PHONE = "(max-aspect-ratio: 1/1) and (max-width: 600px)";
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
  { id: "s", dot: 8 },
  { id: "m", dot: 14 },
  { id: "l", dot: 20 },
];
const CUSTOM_START = "#ff8a5b";
const DARK_INK = "#2e2a26";

function usePhone(): boolean {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const update = () => setPhone(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return phone;
}

interface SwipeItem {
  id: string;
  label: string;
  on: boolean;
  node: ReactNode;
}

/** One row of choices: swipe to browse, the centred one snaps; tap picks. */
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

function ColorSheet({ close }: { close: () => void }) {
  const tool = useStudio((s) => s.tool);
  const activeSketch = useStudio(
    (s) => s.characters.find((c) => c.id === s.activeCharacterId)?.sketchId ?? null,
  );
  const canPlay = useStudio((s) => coloredCharacters(s).length > 0);
  const agent = useUi((s) => s.agent);
  return (
    <>
      <section className="msheet__sec">
        <span className="side__label">Pictures</span>
        <Swipe
          ariaLabel="Pictures"
          half={52}
          selected={activeSketch}
          items={SKETCH_LIST.map((s) => ({
            id: s.id,
            label: s.title,
            on: activeSketch === s.id,
            node: (
              <>
                <span className="mswipe__thumb">
                  <SketchSurface sketch={s} paint={EMPTY_PAINT} />
                </span>
                <span>{s.title}</span>
              </>
            ),
          }))}
          onPick={(id) => {
            const res = pickSketch(id);
            if (!res.ok && res.code === "tray_full") ui.notice(FULL_NOTICE);
            else close();
          }}
        />
      </section>
      <section className="msheet__sec">
        <span className="side__label">Tools</span>
        <Swipe
          ariaLabel="Tools"
          half={48}
          selected={tool.tool}
          items={TOOLS.map((t) => ({
            id: t.id,
            label: t.label,
            on: tool.tool === t.id,
            node: (
              <>
                <ToolIcon name={t.id} size={38} />
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
        <div className="sizes">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`size${tool.size === s.id ? " size--on" : ""}`}
              aria-label={`Size ${s.id}`}
              aria-pressed={tool.size === s.id}
              onClick={() => setTool({ size: s.id })}
            >
              <i style={{ width: s.dot, height: s.dot }} />
            </button>
          ))}
        </div>
      </section>
      <section className="msheet__sec">
        <span className="side__label">Colors</span>
        <div className="msheet__colors">
          <Swipe
            ariaLabel="Colors"
            half={30}
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
      <MyFriends />
      <div className="play-dock">
        <button
          type="button"
          className="play-cta"
          disabled={!canPlay}
          onClick={() => {
            close();
            enterPlay();
          }}
        >
          Let&apos;s play with my friends!
        </button>
        {agent.support === "native" && canPlay && (
          <span className="play-dock__hint">or just tell your AI &quot;Let&apos;s play!&quot;</span>
        )}
      </div>
    </>
  );
}

export function MobileDock() {
  const phone = usePhone();
  const mode = useStudio((s) => s.mode);
  const place = useStudio((s) => s.scene.place);
  const tool = useStudio((s) => s.tool);
  const noPicture = useStudio((s) => s.activeCharacterId === null);
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
        className={`mdock-fab${coloring && noPicture ? " mdock-fab--pulse" : ""}`}
        aria-label={coloring ? "Pictures, tools and colors" : "Scene and friends"}
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
      {open && (
        <div className="msheet">
          <button type="button" className="msheet__scrim" aria-label="Close" onClick={close} />
          <div className="msheet__panel">{coloring ? <ColorSheet close={close} /> : <ScenePanel />}</div>
        </div>
      )}
    </>
  );
}
