import { RIGS } from "../content/rigs";
import { SKETCH_LIST } from "../content/sketches/catalog";
import { SketchSurface } from "../render/SketchSurface";
import { pickSketch } from "../state/actions";
import { useStudio } from "../state/store";
import { LIMITS, type Paint } from "../state/types";
import { ui } from "../state/ui";

const EMPTY_PAINT: Paint = { fills: {}, strokes: [] };
const GROUP_LABELS: Record<string, string> = {
  quadruped: "Runs",
  swimmer: "Swims",
  winged: "Flies",
  biped: "Walks",
  object: "Things",
};
export const TRAY_FULL_MESSAGE = "Tray is full — hold a picture in the tray to remove it";

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
            <span className="strip__label">{GROUP_LABELS[rig.id] ?? rig.label}</span>
            <div className="strip__cards">
              {sketches.map((sketch) => (
                <button
                  key={sketch.id}
                  type="button"
                  className={`card${activeSketch === sketch.id ? " card--on" : ""}${full ? " card--dim" : ""}`}
                  onClick={() => {
                    const res = pickSketch(sketch.id);
                    if (!res.ok && res.code === "tray_full") ui.toast(TRAY_FULL_MESSAGE);
                  }}
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
