import { addEffect } from "./add_effect";
import { applyMotion } from "./apply_motion";
import { arrangeScene } from "./arrange_scene";
import { getStudioState } from "./get_studio_state";
import { listMotions } from "./list_motions";
import { listSketches } from "./list_sketches";
import { pickSketch } from "./pick_sketch";
import { setMode } from "./set_mode";
import { setTool } from "./set_tool";
import type { ToolDef } from "./shared";

export const TOOLS: ToolDef[] = [
  getStudioState,
  listSketches,
  listMotions,
  setMode,
  pickSketch,
  setTool,
  applyMotion,
  arrangeScene,
  addEffect,
];

export function toolByName(name: string): ToolDef | undefined {
  return TOOLS.find((t) => t.name === name);
}

export type { ToolDef } from "./shared";
