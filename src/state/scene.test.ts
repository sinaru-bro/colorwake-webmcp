import { describe, expect, it } from "vitest";
import { parseSaved } from "./persistence";
import { nextQuestion } from "./selectors";
import { DEFAULT_SCENE } from "./types";

describe("scene questions", () => {
  it("asks in order and stops when everything is set", () => {
    expect(nextQuestion(DEFAULT_SCENE)?.axis).toBe("place");
    expect(nextQuestion({ ...DEFAULT_SCENE, place: "home" })?.axis).toBe("time");
    expect(nextQuestion({ ...DEFAULT_SCENE, place: "home", time: "day" })?.axis).toBe("weather");
    expect(nextQuestion({ ...DEFAULT_SCENE, place: "home", time: "day", weather: "rain" })).toBeNull();
    expect(nextQuestion(DEFAULT_SCENE, ["place", "time", "weather"])).toBeNull();
    expect(nextQuestion(DEFAULT_SCENE, ["place"])?.options).toEqual(["day", "night"]);
  });
});

describe("saved scenes", () => {
  const base = {
    version: 1,
    mode: "color",
    characters: [],
    activeCharacterId: null,
    tool: { tool: "fill", color: "red", size: "m" },
  };
  it("keeps unset axes as null", () => {
    const saved = parseSaved(
      JSON.stringify({ ...base, scene: { place: null, time: null, weather: null, effects: [] } }),
    );
    expect(saved?.scene).toEqual({ place: null, time: null, weather: null, effects: [] });
  });
  it("accepts scenes saved with every axis set", () => {
    const saved = parseSaved(
      JSON.stringify({ ...base, scene: { place: "sea", time: "day", weather: "clear" } }),
    );
    expect(saved?.scene).toEqual({ place: "sea", time: "day", weather: "clear", effects: [] });
  });
});
