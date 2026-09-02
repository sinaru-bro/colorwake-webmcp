import { useEffect, useRef } from "react";
import { sketchById } from "../content/sketches/catalog";
import { SketchSurface } from "../render/SketchSurface";
import { useStudio } from "../state/store";
import type { Paint } from "../state/types";
import { ui, useUi, type Rect } from "../state/ui";
import { relativeRect } from "./flight";

const LIFT_MS = 250;
const PAPER_MS = 450;
const LAND_MS = 600;
const SETTLE_MS = 200;
const EASE_LAND = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const SHADOW_NONE = "drop-shadow(0 0 0 rgba(0, 0, 0, 0))";
const SHADOW_HIGH = "drop-shadow(0 18px 14px rgba(0, 0, 0, 0.18))";
const SHADOW_LOW = "drop-shadow(0 4px 4px rgba(0, 0, 0, 0.12))";

type Sketch = NonNullable<ReturnType<typeof sketchById>>;

function boxStyle(r: Rect) {
  return { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` };
}

function animate(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation {
  return el.animate(keyframes, { fill: "forwards", easing: "ease-out", ...options });
}

interface FlightProps {
  characterId: string;
  paper: Rect;
  picture: Rect;
  sketch: Sketch;
  paint: Paint;
}

function Flight({ characterId, paper, picture, sketch, paint }: FlightProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const stage = el?.parentElement;
    const paperEl = el?.querySelector<HTMLElement>(".fly__paper");
    const picEl = el?.querySelector<HTMLElement>(".fly__pic");
    const dust = Array.from(el?.querySelectorAll<HTMLElement>(".fly__dust") ?? []);
    if (!el || !stage || !paperEl || !picEl) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    animate(
      picEl,
      [
        { transform: "translateY(0) scale(1)", filter: SHADOW_NONE },
        { transform: "translateY(-24px) scale(1.05)", filter: SHADOW_HIGH },
      ],
      { duration: LIFT_MS },
    );
    animate(paperEl, [{ transform: "none" }, { transform: "translateY(-6px) scale(1.02)" }], {
      duration: 200,
    });

    at(LIFT_MS, () => {
      animate(
        paperEl,
        [
          { opacity: 1, transform: "translateY(-6px) scale(1.02)" },
          { opacity: 0, transform: "translateY(10px) scale(0.96)" },
        ],
        { duration: PAPER_MS, easing: "ease-in" },
      );
    });

    at(LIFT_MS + PAPER_MS, () => {
      const target = stage.querySelector(`[data-actor-id="${CSS.escape(characterId)}"]`);
      if (!target) {
        ui.endTransition();
        return;
      }
      const to = relativeRect(target, stage);
      const from = relativeRect(picEl, stage);
      for (const a of picEl.getAnimations()) a.cancel();
      Object.assign(picEl.style, boxStyle(from), { transformOrigin: "0 0", filter: SHADOW_HIGH });
      const scale = to.width / from.width;
      animate(
        picEl,
        [
          { transform: "translate(0, 0) scale(1)", filter: SHADOW_HIGH },
          {
            transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${scale})`,
            filter: SHADOW_LOW,
          },
        ],
        { duration: LAND_MS, easing: EASE_LAND },
      );

      at(LAND_MS, () => {
        ui.landTransition();
        picEl.style.visibility = "hidden";
        const cx = to.left + to.width / 2;
        const floor = to.top + to.height - 6;
        dust.forEach((d, i) => {
          const dir = i === 0 ? -1 : 1;
          Object.assign(d.style, { left: `${cx + dir * to.width * 0.3}px`, top: `${floor}px` });
          animate(
            d,
            [
              { opacity: 0.7, transform: "translate(-50%, -50%) scale(0.6)" },
              {
                opacity: 0,
                transform: `translate(calc(-50% + ${dir * 22}px), calc(-50% - 10px)) scale(1.4)`,
              },
            ],
            { duration: 380 },
          );
        });
        at(SETTLE_MS, () => ui.endTransition());
      });
    });

    return () => {
      for (const id of timers) clearTimeout(id);
      for (const node of [paperEl, picEl, ...dust]) for (const a of node.getAnimations()) a.cancel();
    };
  }, [characterId]);

  return (
    <div ref={root} className="fly" aria-hidden="true">
      <div className="fly__paper" style={boxStyle(paper)} />
      <div className="fly__pic" style={boxStyle(picture)}>
        <SketchSurface sketch={sketch} paint={paint} />
      </div>
      <span className="fly__dust" />
      <span className="fly__dust" />
    </div>
  );
}

/** Carries the finished picture off its paper and onto the play screen. */
export function Transition() {
  const transition = useUi((s) => s.transition);
  const mode = useStudio((s) => s.mode);
  const character = useStudio((s) => s.characters.find((c) => c.id === transition?.characterId));
  const sketch = character ? sketchById(character.sketchId) : undefined;
  const alive = transition !== null && mode === "play" && character !== undefined && sketch !== undefined;

  useEffect(() => {
    if (transition && !alive) ui.endTransition();
  }, [transition, alive]);

  if (!transition || mode !== "play" || !character || !sketch) return null;
  return (
    <Flight
      key={transition.characterId}
      characterId={transition.characterId}
      paper={transition.paper}
      picture={transition.picture}
      sketch={sketch}
      paint={character.paint}
    />
  );
}
