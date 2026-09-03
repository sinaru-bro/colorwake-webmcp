import { useEffect, useRef, useState } from "react";
import { MyFriends } from "../app/MyFriends";
import { SKETCH_LIST } from "../content/sketches/catalog";
import { colorHex } from "../lib/color";
import { ScenePanel } from "../play/ScenePanel";
import { ToolSections } from "./PalettePanel";
import { SCENE_ICONS } from "../play/sceneIcons";
import { ToolIcon } from "../render/icons";
import { SketchSurface } from "../render/SketchSurface";
import { enterPlay, pickSketch } from "../state/actions";
import { coloredCharacters } from "../state/selectors";
import { useStudio } from "../state/store";
import type { Paint } from "../state/types";
import { ui } from "../state/ui";
import { usePhone } from "./phone";
import { Swipe } from "./Swipe";

const EMPTY_PAINT: Paint = { fills: {}, strokes: [] };
const FULL_NOTICE = {
  title: "My friends is full!",
  hint: "Hold a picture there to make room",
  at: "friends",
} as const;

/** Full-canvas sketch browser: one big picture, faint neighbours peeking; swipe or tap a side to browse, tap the middle to start coloring. */
export function MobileSketchBrowser() {
  const [browse, setBrowse] = useState("cat");
  const idx = Math.max(
    0,
    SKETCH_LIST.findIndex((s) => s.id === browse),
  );
  const step = (d: number) => {
    const next = SKETCH_LIST[idx + d];
    if (next) setBrowse(next.id);
  };
  const prev = SKETCH_LIST[idx - 1];
  const next = SKETCH_LIST[idx + 1];
  const pick = (id: string) => {
    const res = pickSketch(id);
    if (!res.ok && res.code === "tray_full") ui.notice(FULL_NOTICE);
  };
  return (
    <div className="mbrowse">
      <Swipe
        ariaLabel="Pictures"
        page
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
        onPick={pick}
        onCenter={(id) => setBrowse(id)}
      />
      {prev && (
        <button
          type="button"
          className="mbrowse__side mbrowse__side--prev"
          aria-label={`Previous: ${prev.title}`}
          onClick={() => step(-1)}
        >
          <span className="mbrowse__ghost">
            <SketchSurface sketch={prev} paint={EMPTY_PAINT} />
          </span>
          <svg className="mbrowse__tri" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16 4 L5 12 L16 20 Z" />
          </svg>
        </button>
      )}
      {next && (
        <button
          type="button"
          className="mbrowse__side mbrowse__side--next"
          aria-label={`Next: ${next.title}`}
          onClick={() => step(1)}
        >
          <span className="mbrowse__ghost">
            <SketchSurface sketch={next} paint={EMPTY_PAINT} />
          </span>
          <svg className="mbrowse__tri" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 4 L19 12 L8 20 Z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function MobileDock() {
  const phone = usePhone();
  const mode = useStudio((s) => s.mode);
  const place = useStudio((s) => s.scene.place);
  const tool = useStudio((s) => s.tool);
  const canPlay = useStudio((s) => coloredCharacters(s).length > 0);
  const hasActive = useStudio((s) => s.activeCharacterId !== null);
  const [open, setOpen] = useState(
    () => import.meta.env.DEV && new URLSearchParams(window.location.search).get("sheet") === "1",
  );
  const modeRef = useRef(mode);
  useEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    setOpen(false);
  }, [mode]);
  if (!phone) return null;
  const coloring = mode === "color";
  const close = () => setOpen(false);
  return (
    <>
      <button
        type="button"
        className={`mdock-fab${coloring ? "" : " mdock-fab--play"}`}
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
          </div>
        </div>
      )}
      {open && (
        <div className="msheet">
          <button type="button" className="msheet__scrim" aria-label="Close" onClick={close} />
          <div className={`msheet__panel${coloring ? " msheet__panel--tools" : ""}`}>
            {coloring ? <ToolSections /> : <ScenePanel />}
          </div>
        </div>
      )}
    </>
  );
}
