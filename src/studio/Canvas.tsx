import { useEffect, useRef, useState } from "react";
import { sketchById } from "../content/sketches/catalog";
import { Icon } from "../render/icons";
import { SketchSurface } from "../render/SketchSurface";
import { addStroke, fillRegion } from "../state/actions";
import { activeCharacter, coloredCharacters, isColored, progress } from "../state/selectors";
import { useStudio } from "../state/store";
import { ui } from "../state/ui";
import { DoneSheet } from "../app/Dialogs";

const RING_R = 37;
const CIRC = 2 * Math.PI * RING_R;

function useSquareSize(ref: React.RefObject<HTMLDivElement | null>): number {
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

export function Canvas() {
  const host = useRef<HTMLDivElement>(null);
  const size = useSquareSize(host);
  const state = useStudio((s) => s);
  const active = activeCharacter(state);
  const sketch = active ? sketchById(active.sketchId) : undefined;
  const pct = active ? progress(active) : 0;
  const othersColored = coloredCharacters(state).some((c) => c.id !== active?.id);
  const canPlay = (active ? isColored(active) : false) || othersColored;

  return (
    <div ref={host} className="main">
      <div className="canvas" style={{ width: size, height: size }}>
        {active && sketch ? (
          <SketchSurface
            sketch={sketch}
            paint={active.paint}
            interactive
            tool={state.tool}
            onFill={(region) => fillRegion(region)}
            onStroke={(stroke) => addStroke(stroke)}
          />
        ) : (
          <div className="canvas__empty">
            <div>
              Pick a picture below
              <br />
              <span style={{ fontSize: 32 }}>↓</span>
            </div>
          </div>
        )}
      </div>
      {active && sketch && (
        <>
          {!canPlay && <div className="done__tip">Add some color first</div>}
          <button
            type="button"
            className="done"
            disabled={!canPlay}
            aria-label="Done"
            onClick={() => ui.setDoneSheet(true)}
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
          <DoneSheet />
        </>
      )}
    </div>
  );
}
