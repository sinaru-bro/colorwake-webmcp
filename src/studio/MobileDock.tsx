import { useEffect, useRef, useState } from "react";
import { MyFriends } from "../app/MyFriends";
import { SKETCH_LIST, sketchById } from "../content/sketches/catalog";
import { colorHex } from "../lib/color";
import { ScenePanel } from "../play/ScenePanel";
import { PalettePanel, ToolSections } from "./PalettePanel";
import { SCENE_ICONS } from "../play/sceneIcons";
import { ToolIcon } from "../render/icons";
import { SketchSurface } from "../render/SketchSurface";
import { enterPlay, pickSketch } from "../state/actions";
import { coloredCharacters } from "../state/selectors";
import { useStudio } from "../state/store";
import type { Paint } from "../state/types";
import { ui, useUi } from "../state/ui";
import { usePad, usePhone } from "./phone";
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
  const pad = usePad();
  const mode = useStudio((s) => s.mode);
  const place = useStudio((s) => s.scene.place);
  const tool = useStudio((s) => s.tool);
  const canPlay = useStudio((s) => coloredCharacters(s).length > 0);
  const hasActive = useStudio((s) => s.activeCharacterId !== null);
  const characters = useStudio((s) => s.characters);
  const friendsPulse = useUi((s) => s.notice?.at === "friends");
  const [open, setOpen] = useState(
    () => import.meta.env.DEV && new URLSearchParams(window.location.search).get("sheet") === "1",
  );
  const [friendsOpen, setFriendsOpen] = useState(false);
  const modeRef = useRef(mode);
  useEffect(() => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    setOpen(false);
    setFriendsOpen(false);
  }, [mode]);
  if (!phone && !pad) return null;
  const coloring = mode === "color";
  const close = () => setOpen(false);
  const stack = [...characters]
    .reverse()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 2)
    .flatMap((c) => {
      const sketch = sketchById(c.sketchId);
      return sketch ? [{ id: c.id, sketch, paint: c.paint }] : [];
    });
  const front = stack[0];
  const back = stack[1];
  return (
    <>
      <button
        type="button"
        className={`mdock-fab${coloring ? "" : " mdock-fab--play"}`}
        aria-label={coloring ? "Tools and colors" : "Scene and friends"}
        disabled={coloring && phone && !hasActive}
        onClick={() => setOpen(true)}
      >
        {coloring ? (
          <>
            <ToolIcon name={tool.tool} size={pad ? 34 : 26} />
            <span className="mdock-fab__color" style={{ background: colorHex(tool.color) }} />
          </>
        ) : (
          <span className="mdock-fab__emoji" aria-hidden="true">
            {place ? SCENE_ICONS[place] : "▢"}
          </span>
        )}
      </button>
      {coloring && phone && front && (
        <button
          type="button"
          className={`mdock-fab mdock-fab--friends${friendsPulse ? " mdock-fab--pulse" : ""}`}
          aria-label="My friends"
          onClick={() => setFriendsOpen(true)}
        >
          {back && (
            <span className="mfab__card mfab__card--back" aria-hidden="true">
              <SketchSurface sketch={back.sketch} paint={back.paint} />
            </span>
          )}
          <span className="mfab__card mfab__card--front" data-work={front.id} aria-hidden="true">
            <SketchSurface sketch={front.sketch} paint={front.paint} />
          </span>
        </button>
      )}
      {coloring && phone && (
        <div className="mbar">
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
            {coloring ? pad ? <PalettePanel /> : <ToolSections /> : <ScenePanel />}
          </div>
        </div>
      )}
      {coloring && phone && friendsOpen && (
        <div className="msheet">
          <button
            type="button"
            className="msheet__scrim"
            aria-label="Close"
            onClick={() => setFriendsOpen(false)}
          />
          <div
            className="msheet__panel msheet__panel--friends"
            onClickCapture={(e) => {
              if ((e.target as Element).closest(".work__pick, .work--add")) setFriendsOpen(false);
            }}
          >
            <MyFriends />
          </div>
        </div>
      )}
    </>
  );
}
