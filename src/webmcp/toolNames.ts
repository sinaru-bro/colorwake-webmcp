export const TOOL_NAMES = [
  "get_studio_state",
  "list_sketches",
  "list_motions",
  "set_mode",
  "pick_sketch",
  "set_tool",
  "apply_motion",
  "arrange_scene",
  "add_effect",
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];
