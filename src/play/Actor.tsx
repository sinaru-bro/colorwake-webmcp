import { useEffect, useLayoutEffect, useRef, type CSSProperties } from "react";
import { sketchById } from "../content/sketches/catalog";
import { SketchSurface } from "../render/SketchSurface";
import { displayName } from "../state/selectors";
import type { Character } from "../state/types";
import { useUi } from "../state/ui";
import { registerActor, unregisterActor, updateActorLayout } from "./engine";

const DEFAULT_BASELINE = 420;
const SKETCH_UNITS = 512;

interface Props {
  character: Character;
  baseHeight: number;
  windy: boolean;
}

export function Actor({ character, baseHeight, windy }: Props) {
  const inner = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const sketch = sketchById(character.sketchId);
  const heightPx = Math.round(baseHeight * character.scale);
  const baseline = (sketch?.baseline ?? DEFAULT_BASELINE) / SKETCH_UNITS;
  const layoutRef = useRef({ heightPx, x: character.position.x, y: character.position.y });
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
  return (
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
      role="img"
      aria-label={displayName(character)}
    >
      <div ref={inner} className="actor__inner">
        <div className="actor__facing">
          <SketchSurface sketch={sketch} paint={character.paint} />
        </div>
      </div>
    </div>
  );
}
