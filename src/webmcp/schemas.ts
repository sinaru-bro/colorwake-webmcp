import { z } from "zod";

export const GetStudioStateInput = z.strictObject({});

export const ListSketchesInput = z.strictObject({
  rig: z
    .enum(["quadruped", "swimmer", "winged", "biped", "object"])
    .optional()
    .describe("Filter by body type"),
  level: z.enum(["easy", "normal"]).optional().describe("easy = big regions for younger children"),
});

export const ListMotionsInput = z.strictObject({
  character: z.string().optional().describe("Character id or sketch id; defaults to the active character"),
  all: z.boolean().optional().describe("true = presets for every body type (larger answer)"),
});

export const SetModeInput = z.strictObject({ mode: z.enum(["play", "color"]) });

export const PickSketchInput = z.strictObject({
  sketch: z.string().describe('Sketch id from list_sketches, e.g. "cat"'),
});

export const SetToolInput = z.strictObject({
  tool: z.enum(["fill", "pen", "brush", "pencil"]).optional().describe("Omit to keep the current tool"),
  color: z
    .string()
    .optional()
    .describe('Palette id like "red" or "sky"; other names/hex are mapped to the nearest palette color'),
  size: z.enum(["s", "m", "l"]).optional().describe("Stroke size for pen/brush/pencil"),
});

export const StepInput = z.strictObject({
  primitive: z.enum(["move", "rotate", "scale", "bounce", "shake", "spin", "flip", "tilt", "fade", "wave"]),
  part: z.string().optional().describe("Body part id from list_motions; omit = whole character"),
  params: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])).optional(),
  durationMs: z.number().optional().describe("100-8000"),
  delayMs: z.number().optional().describe("0-4000"),
  ease: z.enum(["linear", "ease-in-out", "ease-in", "ease-out"]).optional(),
});

export const ApplyMotionInput = z.strictObject({
  character: z
    .string()
    .describe("Character id from get_studio_state (or the sketch id if only one such character)"),
  motion: z.string().optional().describe('Preset id from list_motions, or "stop"'),
  steps: z.array(StepInput).min(1).max(8).optional().describe("Custom motion; used when motion is omitted"),
  mode: z.enum(["sequence", "parallel"]).optional().describe("How steps combine; default parallel"),
  speed: z.number().optional().describe("0.5-2, default 1"),
  loop: z
    .union([z.boolean(), z.number().int()])
    .optional()
    .describe("true = until stopped, number = times; default from preset"),
});

export const PlacementInput = z.strictObject({
  character: z.string(),
  at: z.union([
    z.enum(["left", "center", "right", "sky"]),
    z.strictObject({ x: z.number(), y: z.number() }).describe("0-1 of the play screen, y = feet"),
  ]),
  scale: z.number().optional().describe("0.5-2, default 1"),
});

export const ArrangeSceneInput = z.strictObject({
  place: z.string().optional().describe("Place id from list_motions, e.g. home, sea, sky (blank = none)"),
  time: z.enum(["day", "night"]).optional(),
  weather: z.string().optional().describe("Weather id from list_motions, e.g. clear, rain, snow, cloudy"),
  placements: z.array(PlacementInput).max(4).optional(),
});

export const AddEffectInput = z.strictObject({
  effect: z.string().describe('stars | hearts | bubbles, or "none" to clear all'),
  on: z.boolean().optional().describe("Default true; false removes this effect"),
  intensity: z.enum(["light", "normal", "heavy"]).optional().describe("Default normal"),
  character: z.string().optional().describe("hearts/bubbles only: attach to one character"),
});

export function toInputSchema(schema: z.ZodType): Record<string, unknown> {
  const { $schema: _omit, ...rest } = z.toJSONSchema(schema) as Record<string, unknown>;
  return { ...rest, type: "object", additionalProperties: false };
}
