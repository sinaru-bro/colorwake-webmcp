import { arrangeScene, enterPlay, fillRegion, pickSketch, resetAll } from "../state/actions";
import type { PlaceId, TimeId, WeatherId } from "../state/types";

export interface SeedScene {
  place?: PlaceId;
  time?: TimeId;
  weather?: WeatherId;
}

export function parseSeedScene(raw: string | null): SeedScene | null {
  if (raw === null) return { place: "sea", time: "day", weather: "rain" };
  if (raw === "0") return null;
  const [place, time, weather] = raw.split(",");
  return {
    ...(place ? { place: place as PlaceId } : {}),
    ...(time ? { time: time as TimeId } : {}),
    ...(weather ? { weather: weather as WeatherId } : {}),
  };
}

const DEMO: Array<{ sketch: string; fills: Record<string, string> }> = [
  {
    sketch: "cat",
    fills: {
      head: "orange",
      body: "orange",
      belly: "peach",
      "ear-l": "#f27da8",
      "ear-r": "#f27da8",
      tail: "orange",
    },
  },
  {
    sketch: "fish",
    fills: { head: "red", body: "red", belly: "yellow", "tail-fin": "yellow", "top-fin": "red" },
  },
  {
    sketch: "rocket",
    fills: { nose: "red", body: "white", window: "sky", stripe: "blue", "fin-l": "red", "fin-r": "red" },
  },
];

const MORE: typeof DEMO = [
  {
    sketch: "bird",
    fills: {
      head: "yellow",
      beak: "orange",
      crest: "red",
      body: "yellow",
      belly: "white",
      "wing-l": "orange",
      "wing-r": "orange",
      tail: "red",
      feet: "orange",
    },
  },
  {
    sketch: "robot",
    fills: {
      head: "sky",
      antenna: "red",
      body: "blue",
      chest: "yellow",
      "arm-l": "sky",
      "arm-r": "sky",
      "hand-l": "white",
      "hand-r": "white",
      "leg-l": "blue",
      "leg-r": "blue",
      "foot-l": "black",
      "foot-r": "black",
    },
  },
];

export function seedDemo(play = true, scene: SeedScene | null = parseSeedScene(null), all = false): void {
  resetAll();
  for (const item of all ? [...DEMO, ...MORE] : DEMO) {
    if (!pickSketch(item.sketch).ok) continue;
    for (const [region, color] of Object.entries(item.fills)) fillRegion(region, color);
  }
  if (play) {
    enterPlay();
    if (scene) arrangeScene(scene);
  }
}
