import { PLACES, WEATHERS } from "../../content/scenes";
import { arrangeScene as arrange, type Placement } from "../../state/actions";
import { nearestAnchor, nextQuestion } from "../../state/selectors";
import { getState } from "../../state/store";
import { uiStore } from "../../state/ui";
import { ANCHORS, type Anchor, type PlaceId, type WeatherId } from "../../state/types";
import { summarize } from "../describe";
import { fail, ok } from "../results";
import { ArrangeSceneInput } from "../schemas";
import { clampNumber, defineTool, ensurePlayMode, parseInput, resolveCharacter } from "./shared";

export const arrangeScene = defineTool({
  name: "arrange_scene",
  title: "Set the scene",
  description:
    'Compose the play screen: choose the place (home, sea, sky …), day or night, the weather (clear, rain, snow, cloudy …) and where colored pictures stand (left, center, right, sky or exact x/y). Use when the child answers "where are we? day or night? what\'s the weather?" or wants characters to go somewhere or meet. Anything goes — a fish on land is fine. Only what you pass changes; nextQuestion in the result is what to ask next. Does not change colors or motions.',
  schema: ArrangeSceneInput,
  execute(input) {
    const parsed = parseInput(ArrangeSceneInput, input);
    if (!parsed.ok) return parsed;
    const { place, time, weather, placements } = parsed.data;
    if (!place && !time && !weather && !placements?.length) {
      return fail("nothing_to_change", "Pass a place, time, weather or placements.");
    }
    const places = PLACES.map((p) => p.id);
    const weathers = WEATHERS.map((w) => w.id);
    if (place && !places.includes(place as PlaceId)) {
      return fail("unknown_place", `No place "${place}".`, { options: places });
    }
    if (weather && !weathers.includes(weather as WeatherId)) {
      return fail("unknown_weather", `No weather "${weather}".`, { options: weathers });
    }
    const clamped: Record<string, unknown> = {};
    const resolvedPlacements: Placement[] = [];
    for (const [i, p] of (placements ?? []).entries()) {
      const target = resolveCharacter(p.character);
      if (!target.ok) return target;
      const position = typeof p.at === "string" ? { ...ANCHORS[p.at as Anchor] } : { x: p.at.x, y: p.at.y };
      const x = clampNumber(position.x, 0, 1);
      const y = clampNumber(position.y, 0, 1);
      if (x !== position.x || y !== position.y) clamped[`placements[${i}].at`] = { x, y };
      let scale = p.scale;
      if (scale !== undefined) {
        const s = clampNumber(scale, 0.5, 2);
        if (s !== scale) clamped[`placements[${i}].scale`] = s;
        scale = s;
      }
      resolvedPlacements.push({ characterId: target.character.id, position: { x, y }, scale });
    }
    const switched = ensurePlayMode();
    if (!switched.ok) return switched;
    const scene = arrange({
      place: place as PlaceId | undefined,
      time,
      weather: weather as WeatherId | undefined,
      placements: resolvedPlacements,
    });
    const characters = getState().characters.map((c) => ({
      ...summarize(c),
      position: c.position,
      anchor: nearestAnchor(c.position),
    }));
    return ok({
      scene: { place: scene.place, time: scene.time, weather: scene.weather },
      nextQuestion: nextQuestion(scene, uiStore.getState().skipped),
      characters,
      clamped: Object.keys(clamped).length ? clamped : null,
      switchedTo: switched.switchedTo,
    });
  },
});
