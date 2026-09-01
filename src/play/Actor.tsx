import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sketchById } from "../content/sketches/catalog";
import { SketchSurface } from "../render/SketchSurface";
import { removeCharacter, selectCharacter } from "../state/actions";
import { displayName } from "../state/selectors";
import type { Character } from "../state/types";
import { registerActor, unregisterActor, updateActorHeight } from "./engine";

const REMOVE_HOLD_MS = 1000;

interface Props {
  character: Character;
  baseHeight: number;
  windy: boolean;
  open: boolean;
  onOpen: (id: string | null) => void;
}

export function Actor({ character, baseHeight, windy, open, onOpen }: Props) {
  const inner = useRef<HTMLDivElement>(null);
  const sketch = sketchById(character.sketchId);
  const heightPx = Math.round(baseHeight * character.scale);
  const heightRef = useRef(heightPx);
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = inner.current;
    if (!el || !sketch) return;
    const parts = new Map<string, SVGGElement>();
    for (const g of el.querySelectorAll<SVGGElement>("g[data-part]")) parts.set(g.dataset.part ?? "", g);
    registerActor(character.id, { root: el, parts, heightPx: heightRef.current, rig: sketch.rig });
    return () => unregisterActor(character.id);
  }, [character.id, character.sketchId, sketch]);

  useLayoutEffect(() => {
    heightRef.current = heightPx;
    updateActorHeight(character.id, heightPx);
  }, [character.id, heightPx]);

  if (!sketch) return null;
  const cancelHold = () => {
    setHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };
  return (
    <>
      <div
        className={`actor${windy ? " actor--wind" : ""}`}
        style={{
          left: `${character.position.x * 100}%`,
          top: `${character.position.y * 100}%`,
          height: heightPx,
          width: heightPx,
        }}
        onClick={() => onOpen(open ? null : character.id)}
        role="button"
        aria-label={displayName(character)}
      >
        <div ref={inner} className="actor__inner">
          <SketchSurface sketch={sketch} paint={character.paint} />
        </div>
      </div>
      {open && (
        <div
          className="popover"
          style={{
            left: `${character.position.x * 100}%`,
            top: `calc(${character.position.y * 100}% - ${heightPx + 12}px)`,
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
