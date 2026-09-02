import type { ComponentType } from "react";
import type { TimeId } from "../../../state/types";

export interface LayerProps {
  time: TimeId | null;
}

export type Layer = ComponentType<LayerProps>;

/** Horizon-anchored layers of one place. Far/near/glow end at the horizon; ground starts there. */
export interface PlaceArt {
  far?: Layer;
  near?: Layer;
  ground: Layer;
  fore?: Layer;
  glow?: Layer;
}
