import { useEffect, useRef } from "react";
import { sketchById } from "../content/sketches/catalog";
import { SketchSurface } from "../render/SketchSurface";
import { useStudio } from "../state/store";
import { ui, useUi, type Rect } from "../state/ui";
import { viewportRect } from "./flight";

const FLY_MS = 550;
const BUMP_MS = 360;
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const SHADOW_HIGH = "drop-shadow(0 12px 10px rgba(0, 0, 0, 0.16))";
const SHADOW_NONE = "drop-shadow(0 0 0 rgba(0, 0, 0, 0))";

function boxStyle(r: Rect) {
  return { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` };
}

/** Shrinks a finished picture from the canvas into its My friends tile, or the visible stack that keeps it, then bumps the target. */
export function Stash() {
  const stash = useUi((s) => s.stash);
  const character = useStudio((s) => s.characters.find((c) => c.id === stash?.characterId));
  const sketch = character ? sketchById(character.sketchId) : undefined;
  const pic = useRef<HTMLDivElement>(null);
  const alive = stash !== null && character !== undefined && sketch !== undefined;

  useEffect(() => {
    if (stash && !alive) ui.endStash();
  }, [stash, alive]);

  useEffect(() => {
    const el = pic.current;
    if (!el || !stash) return;
    const tile =
      Array.from(document.querySelectorAll(`[data-work="${CSS.escape(stash.characterId)}"]`)).find(
        (t) => t.getBoundingClientRect().width > 0,
      ) ??
      [".rail__stack", ".mdock-fab--friends", ".mdock-fab"]
        .map((sel) => document.querySelector(sel))
        .find((el) => el !== null && el.getBoundingClientRect().width > 0);
    const thumb =
      tile?.querySelector(".work__pick")?.firstElementChild ??
      tile?.querySelector(".rail__work--front, .mfab__card--front") ??
      tile?.firstElementChild;
    if (!thumb) {
      ui.endStash();
      return;
    }
    const { from } = stash;
    const to = viewportRect(thumb);
    const flight = el.animate(
      [
        { transform: "translate(0, 0) scale(1)", filter: SHADOW_HIGH },
        {
          transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})`,
          filter: SHADOW_NONE,
        },
      ],
      { duration: FLY_MS, easing: EASE, fill: "forwards" },
    );
    const timer = window.setTimeout(() => {
      tile?.animate(
        [{ transform: "scale(1)" }, { transform: "scale(1.18)", offset: 0.4 }, { transform: "scale(1)" }],
        { duration: BUMP_MS, easing: "ease-out" },
      );
      ui.endStash();
    }, FLY_MS);
    return () => {
      clearTimeout(timer);
      flight.cancel();
    };
  }, [stash]);

  if (!stash || !character || !sketch) return null;
  return (
    <div className="stash" aria-hidden="true">
      <div ref={pic} className="stash__pic" style={boxStyle(stash.from)}>
        <SketchSurface sketch={sketch} paint={character.paint} />
      </div>
    </div>
  );
}
