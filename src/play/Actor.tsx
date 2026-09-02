import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { sketchById } from "../content/sketches/catalog";
import { SketchSurface } from "../render/SketchSurface";
import { removeCharacter, selectCharacter } from "../state/actions";
import { displayName } from "../state/selectors";
import type { Character } from "../state/types";
import { useUi } from "../state/ui";
import { registerActor, unregisterActor, updateActorLayout } from "./engine";

const REMOVE_HOLD_MS = 1000;
const DEFAULT_BASELINE = 420;
const SKETCH_UNITS = 512;

interface Props {
  character: Character;
  baseHeight: number;
  windy: boolean;
  open: boolean;
  onOpen: (id: string | null) => void;
}

export function Actor({ character, baseHeight, windy, open, onOpen }: Props) {
  const inner = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const sketch = sketchById(character.sketchId);
  const heightPx = Math.round(baseHeight * character.scale);
  const baseline = (sketch?.baseline ?? DEFAULT_BASELINE) / SKETCH_UNITS;
  const layoutRef = useRef({ heightPx, x: character.position.x, y: character.position.y });
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const arrival = useUi((s) => (s.transition?.characterId === character.id ? s.transition.phase : null));

  useEffect(() => {
    const el = inner.current;
    const outer = box.current;
    if (!el || !outer || !sketch) return;
    const parts = new Map<string, SVGGElement>();
    for (const g of el.querySelectorAll<SVGGElement>("g[data-part]")) parts.set(g.dataset.part ?? "", g);
    registerActor(character.id, {
      root: el,
      box: outer,
      facing: el.querySelector<HTMLElement>(".actor__facing"),
      parts,
      rig: sketch.rig,
      faces: sketch.facing,
      baseline,
      sx: 1,
      lean: 0,
      ...layoutRef.current,
    });
    return () => unregisterActor(character.id);
  }, [character.id, character.sketchId, sketch, baseline]);

  useLayoutEffect(() => {
    layoutRef.current = { heightPx, x: character.position.x, y: character.position.y };
    updateActorLayout(character.id, layoutRef.current);
  }, [character.id, heightPx, character.position.x, character.position.y]);

  if (!sketch) return null;
  const cancelHold = () => {
    setHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };
  return (
    <>
      <div
        ref={box}
        className={`actor${windy ? " actor--wind" : ""}${arrival === "fly" ? " actor--hidden" : ""}${arrival === "land" ? " actor--land" : ""}`}
        data-actor-id={character.id}
        style={
          {
            left: `${character.position.x * 100}%`,
            top: `${character.position.y * 100}%`,
            height: heightPx,
            width: heightPx,
            "--base": `${(baseline * 100).toFixed(2)}%`,
          } as CSSProperties
        }
        onClick={() => onOpen(open ? null : character.id)}
        role="button"
        aria-label={displayName(character)}
      >
        <div ref={inner} className="actor__inner">
          <div className="actor__facing">
            <SketchSurface sketch={sketch} paint={character.paint} />
          </div>
        </div>
      </div>
      {open && (
        <div
          className="popover"
          style={{
            left: `${character.position.x * 100}%`,
            top: `calc(${character.position.y * 100}% - ${Math.round(heightPx * baseline) + 12}px)`,
          }}
        >
          <button type="button" className="popover__btn" onClick={() => selectCharacter(character.id)}>
            Color this
          </button>
          <button
            type="button"
            className={`popover__btn${holding ? " reset--holding" : ""}`}
            onPointerDown={() => {
              setHolding(true);
              holdTimer.current = setTimeout(() => {
                cancelHold();
                onOpen(null);
                removeCharacter(character.id);
              }, REMOVE_HOLD_MS);
            }}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
          >
            <span className="reset__fill" />
            🗑 Hold to remove
          </button>
        </div>
      )}
    </>
  );
}
