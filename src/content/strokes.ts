import type { StrokeSize, ToolId } from "../state/types";

export interface StrokeStyle {
  width: number;
  opacity: number;
  dash?: string;
  blur?: number;
}

export type BrushTool = Exclude<ToolId, "fill">;

export const DEFAULT_STROKE_SIZE: StrokeSize = "m";

export const STROKE_PRESETS: Record<BrushTool, Record<StrokeSize, StrokeStyle>> = {
  pen: {
    s: { width: 6, opacity: 1 },
    m: { width: 10, opacity: 1 },
    l: { width: 16, opacity: 1 },
  },
  brush: {
    s: { width: 14, opacity: 0.85, blur: 0.8 },
    m: { width: 22, opacity: 0.85, blur: 0.8 },
    l: { width: 34, opacity: 0.85, blur: 0.8 },
  },
  pencil: {
    s: { width: 5, opacity: 0.6, dash: "3 1.5" },
    m: { width: 8, opacity: 0.6, dash: "3 1.5" },
    l: { width: 12, opacity: 0.6, dash: "3 1.5" },
  },
};
