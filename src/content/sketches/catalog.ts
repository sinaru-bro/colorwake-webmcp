import type { Sketch, SketchMeta } from "../../state/types";

export const SKETCHES: SketchMeta[] = [
  {
    id: "cat",
    title: "Cat",
    rig: "quadruped",
    level: "normal",
    regions: [
      { id: "head", label: "head" },
      { id: "ear-l", label: "left ear" },
      { id: "ear-r", label: "right ear" },
      { id: "body", label: "body" },
      { id: "belly", label: "belly" },
      { id: "leg-fl", label: "front left leg" },
      { id: "leg-fr", label: "front right leg" },
      { id: "leg-bl", label: "back left leg" },
      { id: "leg-br", label: "back right leg" },
      { id: "tail", label: "tail" },
    ],
    sayings: ["kitty", "kitten", "cat"],
  },
  {
    id: "fish",
    title: "Fish",
    rig: "swimmer",
    level: "normal",
    regions: [
      { id: "head", label: "head" },
      { id: "body", label: "body" },
      { id: "belly", label: "belly" },
      { id: "tail-fin", label: "tail fin" },
      { id: "top-fin", label: "top fin" },
      { id: "side-fin", label: "side fin" },
      { id: "stripe-1", label: "stripe" },
      { id: "stripe-2", label: "stripe" },
    ],
    sayings: ["fish", "goldfish", "fishy"],
  },
  {
    id: "bird",
    title: "Bird",
    rig: "winged",
    level: "normal",
    regions: [
      { id: "head", label: "head" },
      { id: "beak", label: "beak" },
      { id: "crest", label: "crest" },
      { id: "body", label: "body" },
      { id: "belly", label: "belly" },
      { id: "wing-l", label: "near wing" },
      { id: "wing-r", label: "far wing" },
      { id: "tail", label: "tail" },
      { id: "feet", label: "feet" },
    ],
    sayings: ["bird", "birdie", "chick"],
  },
  {
    id: "robot",
    title: "Robot",
    rig: "biped",
    level: "normal",
    regions: [
      { id: "head", label: "head" },
      { id: "antenna", label: "antenna" },
      { id: "body", label: "body" },
      { id: "chest", label: "chest panel" },
      { id: "arm-l", label: "left arm" },
      { id: "arm-r", label: "right arm" },
      { id: "hand-l", label: "left hand" },
      { id: "hand-r", label: "right hand" },
      { id: "leg-l", label: "left leg" },
      { id: "leg-r", label: "right leg" },
      { id: "foot-l", label: "left foot" },
      { id: "foot-r", label: "right foot" },
    ],
    sayings: ["robot", "bot", "machine"],
  },
  {
    id: "rocket",
    title: "Rocket",
    rig: "object",
    level: "normal",
    regions: [
      { id: "nose", label: "nose cone" },
      { id: "body", label: "body" },
      { id: "window", label: "window" },
      { id: "stripe", label: "stripe" },
      { id: "fin-l", label: "left fin" },
      { id: "fin-r", label: "right fin" },
      { id: "flame-outer", label: "flame" },
      { id: "flame-inner", label: "inner flame" },
    ],
    accents: [
      { id: "accent-1", label: "flames" },
      { id: "accent-2", label: "window" },
    ],
    sayings: ["rocket", "spaceship", "space rocket"],
  },
];

const svgs = import.meta.glob("./svg/*.svg", { query: "?raw", eager: true, import: "default" }) as Record<
  string,
  string
>;

export const SKETCH_LIST: Sketch[] = SKETCHES.map((meta) => ({
  ...meta,
  svg: svgs[`./svg/${meta.id}.svg`] ?? "",
}));

export function sketchById(id: string): Sketch | undefined {
  return SKETCH_LIST.find((s) => s.id === id);
}
