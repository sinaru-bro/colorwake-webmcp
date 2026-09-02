import { useEffect, useRef, useState } from "react";
import { sketchById } from "../content/sketches/catalog";
import { SketchSurface } from "../render/SketchSurface";
import { colorAnother, removeCharacter, selectCharacter, toggleOnStage } from "../state/actions";
import { displayName } from "../state/selectors";
import { useStudio } from "../state/store";
import { LIMITS } from "../state/types";
import { useUi } from "../state/ui";
import { useHold } from "./useHold";

const ARM_HOLD_MS = 500;
const ARM_TIMEOUT_MS = 5000;

/**
 * The child's finished pictures, newest first. While coloring, a tap puts one back on the canvas;
 * while playing, a tap puts a friend on or off the play screen and the trailing + starts a new picture.
 * Hold any tile for ×. An empty list shows one dashed slot.
 */
export function MyFriends() {
  const characters = useStudio((s) => s.characters);
  const activeId = useStudio((s) => s.activeCharacterId);
  const cast = useStudio((s) => s.cast);
  const mode = useStudio((s) => s.mode);
  const pulse = useUi((s) => s.notice?.at === "friends");
  const playing = mode === "play";
  const saved = playing ? characters : characters.filter((c) => c.id !== activeId);
  const total = characters.length;
  const newestFirst = [...saved].reverse().sort((a, b) => b.createdAt - a.createdAt);
  const [armed, setArmed] = useState<string | null>(null);
  const holdId = useRef<string | null>(null);
  const swallowClick = useRef(false);
  const hold = useHold(ARM_HOLD_MS, () => {
    swallowClick.current = true;
    setArmed(holdId.current);
  });

  const armedId = armed && saved.some((c) => c.id === armed) ? armed : null;

  useEffect(() => {
    if (!armedId) return;
    const outside = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest(`[data-work="${armedId}"]`)) setArmed(null);
    };
    document.addEventListener("pointerdown", outside, true);
    const timer = setTimeout(() => setArmed(null), ARM_TIMEOUT_MS);
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      clearTimeout(timer);
    };
  }, [armedId]);

  const add = playing && total < LIMITS.maxCharacters;
  const blank = newestFirst.length === 0 && !add;
  return (
    <section className={`side__sec side__sec--works${pulse ? " side__sec--pulse" : ""}`}>
      <div className="side__row">
        <span className="side__label">
          My friends ({saved.length}/{LIMITS.maxCharacters})
        </span>
        {playing && <span className="works__hint">{LIMITS.maxOnStage} friends at a time — tap to swap</span>}
      </div>
      <div className="works" aria-label="My friends">
        {newestFirst.map((c) => {
          const sketch = sketchById(c.sketchId);
          if (!sketch) return null;
          const on = playing && cast.includes(c.id);
          const name = displayName(c);
          return (
            <div
              key={c.id}
              className={`work${on ? " work--on" : ""}${armedId === c.id ? " work--armed" : ""}`}
              data-work={c.id}
            >
              <button
                type="button"
                className="work__pick"
                title={`${name} — ${playing ? "tap to swap in or out" : "tap to color"}, hold to remove`}
                aria-pressed={playing ? on : undefined}
                onClick={() => {
                  if (swallowClick.current) {
                    swallowClick.current = false;
                    return;
                  }
                  if (playing) toggleOnStage(c.id);
                  else selectCharacter(c.id);
                }}
                onPointerDown={() => {
                  swallowClick.current = false;
                  holdId.current = c.id;
                  hold.start();
                }}
                onPointerUp={hold.cancel}
                onPointerLeave={hold.cancel}
                onPointerCancel={hold.cancel}
                onContextMenu={(e) => e.preventDefault()}
              >
                <SketchSurface sketch={sketch} paint={c.paint} />
              </button>
              {armedId === c.id && (
                <button
                  type="button"
                  className="work__x"
                  aria-label={`Remove ${name}`}
                  title="Remove"
                  onClick={() => {
                    setArmed(null);
                    removeCharacter(c.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        {add && (
          <button
            type="button"
            className="work work--add"
            aria-label="Color another"
            title="Color another"
            onClick={() => colorAnother()}
          >
            +
          </button>
        )}
        {blank && <span className="work work--empty" aria-hidden="true" />}
      </div>
    </section>
  );
}
