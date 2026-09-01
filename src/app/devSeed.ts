import { arrangeScene, enterPlay, fillRegion, pickSketch, resetAll } from "../state/actions";

const DEMO: Array<{ sketch: string; fills: Record<string, string> }> = [
  {
    sketch: "cat",
    fills: {
      head: "orange",
      body: "orange",
      belly: "peach",
      "ear-l": "pink",
      "ear-r": "pink",
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

export function seedDemo(play = true): void {
  resetAll();
  for (const item of DEMO) {
    if (!pickSketch(item.sketch).ok) continue;
    for (const [region, color] of Object.entries(item.fills)) fillRegion(region, color);
  }
  if (play) {
    enterPlay();
    arrangeScene({ place: "sea", time: "day", weather: "rain" });
  }
}
