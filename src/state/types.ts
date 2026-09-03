export type RigId = "quadruped" | "swimmer" | "winged" | "biped" | "object";
export type Level = "easy" | "normal";

export interface RigPart {
  id: string;
  label: string;
  required: boolean;
}

export interface Rig {
  id: RigId;
  label: string;
  parts: RigPart[];
}

export type Facing = "left" | "right" | "front";

export interface SketchMeta {
  id: string;
  title: string;
  rig: RigId;
  level: Level;
  /** Which way the drawing looks when unmirrored; the engine turns it to face travel. */
  facing: Facing;
  /** viewBox y of the ground contact line (feet, keel, base). Default 420. */
  baseline?: number;
  regions: { id: string; label: string }[];
  accents?: { id: "accent-1" | "accent-2"; label: string }[];
  sayings: string[];
}

export type Sketch = SketchMeta & { svg: string };

export type ColorId = string;
export type ToolId = "fill" | "pen" | "brush" | "pencil";
export type StrokeSize = "s" | "m" | "l";

export type Mode = "color" | "play";
export type Anchor = "left" | "center" | "right" | "sky";

export interface Position {
  x: number;
  y: number;
}

export const ANCHORS: Record<Anchor, Position> = {
  left: { x: 0.2, y: 0.78 },
  center: { x: 0.5, y: 0.78 },
  right: { x: 0.8, y: 0.78 },
  sky: { x: 0.5, y: 0.5 },
};

export type PlaceId =
  | "blank"
  | "home"
  | "sea"
  | "sky"
  | "beach"
  | "river"
  | "playground"
  | "park"
  | "mountain"
  | "dino"
  | "space"
  | "school";
export type TimeId = "day" | "night";
export type WeatherId = "clear" | "rain" | "snow" | "cloudy" | "wind" | "thunder";
export type SceneAxis = "place" | "time" | "weather";
export interface Scene {
  place: PlaceId | null;
  time: TimeId | null;
  weather: WeatherId | null;
}

export interface Stroke {
  id: string;
  region: string;
  tool: Exclude<ToolId, "fill">;
  color: ColorId;
  size: StrokeSize;
  points: number[];
}

export interface Paint {
  fills: Record<string, ColorId>;
  strokes: Stroke[];
}

/** A blank paint for rendering uncolored sketches. */
export const EMPTY_PAINT: Paint = { fills: {}, strokes: [] };

export interface Character {
  id: string;
  sketchId: string;
  paint: Paint;
  position: Position;
  placement: "auto" | "manual";
  scale: number;
  createdAt: number;
}

export interface ToolState {
  tool: ToolId;
  color: ColorId;
  size: StrokeSize;
}

export interface StudioState {
  version: 1;
  mode: Mode;
  characters: Character[];
  activeCharacterId: string | null;
  /** Characters on the play screen, longest-standing first. */
  cast: string[];
  tool: ToolState;
  scene: Scene;
  updatedAt: number;
}

export type Primitive =
  "move" | "rotate" | "scale" | "bounce" | "shake" | "spin" | "flip" | "tilt" | "fade" | "wave";

export type Ease = "linear" | "ease-in-out" | "ease-in" | "ease-out";

export interface Step {
  primitive: Primitive;
  part?: string;
  params?: Record<string, number | string | boolean>;
  durationMs?: number;
  delayMs?: number;
  ease?: Ease;
}

export type PlayMode = "sequence" | "parallel";

export interface MotionRequest {
  characterId: string;
  preset?: string;
  steps?: Step[];
  mode: PlayMode;
  speed: number;
  loop: boolean | number;
}

/** A body angle held for the whole motion, in degrees clockwise in the drawing's own frame. */
export interface Pose {
  rotate: number;
}

export interface Motion {
  steps: Step[];
  mode: PlayMode;
  loop: boolean | number;
  pose?: Pose;
}

/** One way of doing a preset; presets with several let the helper pick or the app vary them. */
export interface Variant extends Motion {
  id: string;
  label: string;
}

export interface Preset {
  id: string;
  rig: RigId | "any";
  label: string;
  sayings: string[];
  variants: Variant[];
}

export const LIMITS = {
  maxCharacters: 20,
  maxOnStage: 3,
  maxStrokesPerCharacter: 3000,
  maxSteps: 8,
  durationMs: { min: 100, max: 8000 },
  delayMs: { max: 4000 },
  loop: { max: 20 },
  speed: { min: 0.5, max: 2 },
  scale: { min: 0.5, max: 2 },
} as const;

export const DEFAULT_SCENE: Scene = { place: null, time: null, weather: null };
export const DEFAULT_TOOL: ToolState = { tool: "fill", color: "red", size: "m" };
