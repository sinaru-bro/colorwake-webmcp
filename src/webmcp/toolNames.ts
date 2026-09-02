export const TOOL_NAMES = [
  "get_studio_state",
  "list_sketches",
  "list_motions",
  "set_mode",
  "pick_sketch",
  "set_tool",
  "apply_motion",
  "apply_motions",
  "arrange_scene",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];
