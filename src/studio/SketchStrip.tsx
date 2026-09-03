import { RIGS } from "../content/rigs";
import { SKETCH_LIST } from "../content/sketches/catalog";
import { SketchSurface } from "../render/SketchSurface";
import { pickSketchOrNotice } from "../state/actions";
import { useStudio } from "../state/store";
import { EMPTY_PAINT, LIMITS } from "../state/types";

export function SketchStrip() {
  const mode = useStudio((s) => s.mode);
  const activeSketch = useStudio(
    (s) => s.characters.find((c) => c.id === s.activeCharacterId)?.sketchId ?? null,
  );
  const full = useStudio((s) => s.characters.length >= LIMITS.maxCharacters && s.activeCharacterId !== null);
  return (
    <nav className={`strip${mode === "play" ? " strip--hidden" : ""}`} aria-label="Sketches">
      {RIGS.map((rig) => {
        const sketches = SKETCH_LIST.filter((s) => s.rig === rig.id);
        if (sketches.length === 0) return null;
        return (
          <div key={rig.id} className="strip__group">
            <div className="strip__cards">
              {sketches.map((sketch) => (
                <button
                  key={sketch.id}
                  type="button"
                  className={`card${activeSketch === sketch.id ? " card--on" : ""}${full ? " card--dim" : ""}`}
                  onClick={() => pickSketchOrNotice(sketch.id)}
                  aria-label={sketch.title}
                >
                  <span className="card__thumb">
                    <SketchSurface sketch={sketch} paint={EMPTY_PAINT} />
                  </span>
                  <span>{sketch.title}</span>
                  {sketch.level === "easy" && <span className="card__easy">Easy</span>}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
