import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { sketchById } from "../content/sketches/catalog";
import { STROKE_PRESETS } from "../content/strokes";
import { colorHex } from "../lib/color";
import { Icon, ToolIcon } from "../render/icons";
import { SketchSurface } from "../render/SketchSurface";
import { addStroke, fillRegion, finishPicture, undo } from "../state/actions";
import { activeCharacter, isColored, progress } from "../state/selectors";
import { useStudio } from "../state/store";
import { LIMITS, type ToolState } from "../state/types";
import { useUi } from "../state/ui";
import { MobileSketchBrowser } from "./MobileDock";
import { useLandscape, usePhone } from "./phone";

const RING_R = 37;
const CIRC = 2 * Math.PI * RING_R;
const CANVAS_PAD = 10;
const SKETCH_UNITS = 512;
const MIN_CURSOR_PX = 6;
const CURSOR_GLYPH_PX = 40;

function useSquareSize(ref: RefObject<HTMLDivElement | null>): number {
  const [size, setSize] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(Math.max(0, Math.floor(Math.min(width, height) - 24)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/**
 * Follows a mouse or pen over the canvas: the tool itself, held at a diagonal with its tip on the pointer,
 * plus a ring at the true stroke size.
 */
function ToolCursor({
  canvas,
  tool,
  scale,
}: {
  canvas: RefObject<HTMLDivElement | null>;
  tool: ToolState;
  scale: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const host = canvas.current;
    const el = ref.current;
    if (!host || !el) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = host.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      host.classList.add("canvas--live");
      setShown(true);
      move(e);
    };
    const leave = () => {
      host.classList.remove("canvas--live");
      setShown(false);
    };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointercancel", leave);
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointercancel", leave);
      host.classList.remove("canvas--live");
      if (frame) cancelAnimationFrame(frame);
    };
  }, [canvas]);
  const d =
    tool.tool === "fill" ? 0 : Math.max(MIN_CURSOR_PX, STROKE_PRESETS[tool.tool][tool.size].width * scale);
  const strokes = d > 0;
  const style = {
    "--d": `${d.toFixed(1)}px`,
    "--c": colorHex(tool.color) ?? "#000",
  } as CSSProperties;
  return (
    <div ref={ref} className={`cursor cursor--${tool.tool}`} hidden={!shown} style={style} aria-hidden="true">
      {strokes ? <span className="cursor__ring" /> : <span className="cursor__dot" />}
      <span className="cursor__glyph">
        <ToolIcon name={tool.tool} size={CURSOR_GLYPH_PX} />
      </span>
    </div>
  );
}

export function Canvas() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const size = useSquareSize(host);
  const phone = usePhone();
  const land = useLandscape();
  const state = useStudio((s) => s);
  const active = activeCharacter(state);
  const sketch = active ? sketchById(active.sketchId) : undefined;
  const pct = active ? progress(active) : 0;
  const colored = active ? isColored(active) : false;
  const canUndo = useUi((s) => (active ? (s.undo[active.id]?.length ?? 0) : 0) > 0);
  const trayFull = state.characters.length >= LIMITS.maxCharacters;

  const doneUi = active && sketch && (
    <button
      type="button"
      className="done"
      disabled={!colored}
      aria-label="Done"
      title="Done"
      onClick={() => finishPicture()}
    >
      <Icon name="check" size={34} />
      <svg className="done__ring" viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r={RING_R} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="5" />
        <circle
          cx="42"
          cy="42"
          r={RING_R}
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(pct * CIRC).toFixed(1)} ${CIRC.toFixed(1)}`}
        />
      </svg>
    </button>
  );
  return (
    <div ref={host} className="main">
      <div className="board" style={{ width: size, height: size }}>
        {phone && !(active && sketch) && !trayFull && (
          <div className="mtitle">
            Pick a picture below
            <br />
            <span className="canvas__arrow">↓</span>
          </div>
        )}
        <div ref={canvas} className="canvas">
          {active && sketch ? (
            <>
              <SketchSurface
                key={active.id}
                className={phone || land ? "sketch-grow" : undefined}
                sketch={sketch}
                paint={active.paint}
                interactive
                tool={state.tool}
                onFill={(region) => fillRegion(region)}
                onStroke={(stroke) => addStroke(stroke)}
              />
              <ToolCursor canvas={canvas} tool={state.tool} scale={(size - CANVAS_PAD * 2) / SKETCH_UNITS} />
            </>
          ) : trayFull ? (
            <div className="canvas__empty canvas__empty--full">
              <div>
                My friends is full!
                <br />
                <span className="canvas__hint">Hold a picture there to make room</span>
              </div>
            </div>
          ) : phone || land ? (
            <MobileSketchBrowser />
          ) : (
            <div className="canvas__empty">
              <div>
                Pick a picture below
                <br />
                <span className="canvas__arrow">↓</span>
              </div>
            </div>
          )}
        </div>
        {active && sketch && (
          <button
            type="button"
            className="undo"
            disabled={!canUndo}
            aria-label="Undo"
            title="Undo"
            onClick={() => undo()}
          >
            <Icon name="undo" size={28} />
          </button>
        )}
        {(phone || land) && doneUi}
      </div>
      {!phone && !land && doneUi}
    </div>
  );
}
