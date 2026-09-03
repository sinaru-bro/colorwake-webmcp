import type { PlaceId } from "../../state/types";

export interface PlaceDef {
  id: PlaceId;
  label: string;
  sayings: string[];
  horizon: number;
  elements: string[];
}

export const HORIZON = 0.78;

export const PLACES: PlaceDef[] = [
  {
    id: "blank",
    label: "Plain",
    sayings: ["plain", "nothing", "empty"],
    horizon: HORIZON,
    elements: ["cream ground band below the horizon"],
  },
  {
    id: "home",
    label: "Home",
    sayings: ["house", "front yard", "garden"],
    horizon: HORIZON,
    elements: [
      "grass ground",
      "house with roof, door and two windows (left 30%)",
      "fence",
      "tree",
      "mailbox",
    ],
  },
  {
    id: "sea",
    label: "Sea",
    sayings: ["ocean", "underwater", "under the sea"],
    horizon: HORIZON,
    elements: ["translucent water overlay", "sand floor", "three seaweeds", "two corals", "two light rays"],
  },
  {
    id: "sky",
    label: "Sky",
    sayings: ["clouds", "up high", "above the clouds"],
    horizon: HORIZON,
    elements: ["three cloud tops on the horizon", "four distant clouds", "rainbow (day only)"],
  },
  {
    id: "beach",
    label: "Beach",
    sayings: ["seaside", "sand", "sandcastle", "seashore"],
    horizon: HORIZON,
    elements: [
      "sea to the horizon with a sailboat and an island",
      "wet sand with lapping foam",
      "palm tree",
      "sandcastle",
      "umbrella and towel",
      "crab",
    ],
  },
  {
    id: "river",
    label: "River",
    sayings: ["stream", "valley", "bridge", "creek", "waterfall"],
    horizon: HORIZON,
    elements: [
      "valley hills with a waterfall",
      "wooden bridge to stand on",
      "flowing water with ducks",
      "reeds",
    ],
  },
  {
    id: "playground",
    label: "Playground",
    sayings: ["slide", "swings", "jungle gym"],
    horizon: HORIZON,
    elements: ["ground", "slide (right)", "swings (left)", "sandpit"],
  },
  {
    id: "park",
    label: "Amusement park",
    sayings: ["fair", "ferris wheel", "carousel"],
    horizon: HORIZON,
    elements: ["ground", "ferris wheel silhouette (back)", "carousel roof", "flag bunting"],
  },
  {
    id: "mountain",
    label: "Mountain",
    sayings: ["hills", "hiking", "forest"],
    horizon: HORIZON,
    elements: ["two mountain layers (back)", "three trees", "trail"],
  },
  {
    id: "dino",
    label: "Dinosaurs",
    sayings: ["dinosaur", "dino land", "jurassic", "long ago", "volcano"],
    horizon: HORIZON,
    elements: [
      "volcano with smoke",
      "mesa",
      "palms and ferns",
      "nest with spotted eggs",
      "footprints",
      "pterosaur gliding",
    ],
  },
  {
    id: "space",
    label: "Space",
    sayings: ["outer space", "moon", "planets", "stars", "galaxy"],
    horizon: HORIZON,
    elements: [
      "deep space with stars",
      "ringed planet",
      "spinning Earth",
      "drifting UFO",
      "shooting comet",
      "moon ground with craters",
    ],
  },
  {
    id: "school",
    label: "School",
    sayings: ["preschool", "kindergarten", "daycare", "classroom", "school bus"],
    horizon: HORIZON,
    elements: [
      "school building with colorful windows and a sun sign",
      "flag",
      "school bus",
      "hopscotch path",
      "tree",
    ],
  },
];

export function placeById(id: string): PlaceDef | undefined {
  return PLACES.find((p) => p.id === id);
}
