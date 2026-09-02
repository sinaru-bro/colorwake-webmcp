import { studioStore } from "../state/store";
import { flyingCharacter, stashedCharacter } from "../state/transition";
import { ui, type Rect } from "../state/ui";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const LEAVE_MS = 550;

export function relativeRect(el: Element, root: Element): Rect {
  const a = el.getBoundingClientRect();
  const b = root.getBoundingClientRect();
  return { left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height };
}

export function viewportRect(el: Element): Rect {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { left, top, width, height };
}

/**
 * Starts the screen transitions: the picture flight from canvas to stage when the studio enters play,
 * the fade back to the canvas when it leaves play, and the flight into a My friends tile when a
 * finished picture is put away.
 */
export function installTransitionTrigger(): () => void {
  let leaveTimer = 0;
  const unsubscribe = studioStore.subscribe((next, prev) => {
    if (window.matchMedia(REDUCED_MOTION).matches) return;
    if (prev.mode === "play" && next.mode === "color") {
      ui.setLeaving(true);
      clearTimeout(leaveTimer);
      leaveTimer = window.setTimeout(() => ui.setLeaving(false), LEAVE_MS);
      return;
    }
    const picture = document.querySelector(".stage .canvas")?.firstElementChild;
    if (!picture) return;
    const flying = flyingCharacter(prev, next);
    if (flying) {
      const stage = document.querySelector(".stage");
      const paper = picture.parentElement;
      if (!stage || !paper) return;
      ui.startTransition({
        characterId: flying,
        paper: relativeRect(paper, stage),
        picture: relativeRect(picture, stage),
      });
      return;
    }
    const stashed = stashedCharacter(prev, next);
    if (stashed) ui.startStash({ characterId: stashed, from: viewportRect(picture) });
  });
  return () => {
    clearTimeout(leaveTimer);
    unsubscribe();
  };
}
