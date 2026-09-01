import { PLACES } from "./places";
import { TIMES } from "./skies";
import { WEATHERS } from "./weather";

export { HORIZON, PLACES, placeById, type PlaceDef } from "./places";
export { TIMES, timeById, type SkyDef } from "./skies";
export { WEATHERS, weatherById, type WeatherDef, type ParticleKind } from "./weather";

export interface SceneOptions {
  places: string[];
  times: string[];
  weathers: string[];
}

export function sceneOptions(): SceneOptions {
  return {
    places: PLACES.map((p) => p.id),
    times: TIMES.map((t) => t.id),
    weathers: WEATHERS.map((w) => w.id),
  };
}
