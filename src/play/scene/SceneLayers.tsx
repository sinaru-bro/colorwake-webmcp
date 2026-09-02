import type { Scene, TimeId } from "../../state/types";
import { ABOVE, BELOW, FRONT, W } from "./geometry";
import { PLACE_ART } from "./places";
import type { Layer } from "./places/types";
import { SkyLayer } from "./Sky";
import "./scene.css";

export { WeatherLayer } from "./Weather";

const ABOVE_VB = `0 0 ${W} ${ABOVE}`;
const BELOW_VB = `0 0 ${W} ${BELOW}`;
const FRONT_VB = `0 0 ${W} ${FRONT}`;

/** Backdrops bleed to the edges; props above the horizon always stay fully in view. */
const FIT: Record<BandProps["kind"], string> = {
  far: "xMidYMax slice",
  ground: "xMidYMin slice",
  near: "xMidYMax meet",
  glow: "xMidYMax meet",
  fore: "xMidYMax slice",
};

interface BandProps {
  kind: "far" | "ground" | "near" | "glow" | "fore";
  layer: Layer | undefined;
  time: TimeId | null;
}

function Band({ kind, layer: Art, time }: BandProps) {
  if (!Art) return null;
  const above = kind !== "ground" && kind !== "fore";
  return (
    <svg
      className={`scene-band band--${kind}`}
      viewBox={above ? ABOVE_VB : kind === "ground" ? BELOW_VB : FRONT_VB}
      preserveAspectRatio={FIT[kind]}
      aria-hidden="true"
    >
      <Art time={time} />
    </svg>
  );
}

function UnsetGround() {
  return (
    <>
      <rect width={W} height={BELOW} fill="#F3EBDA" />
      <rect width={W} height="4" fill="#D9C9A8" />
    </>
  );
}

export function BackLayers({ scene }: { scene: Scene }) {
  const art = scene.place ? PLACE_ART[scene.place] : null;
  const time = scene.time;
  return (
    <>
      <SkyLayer scene={scene} />
      <div
        key={scene.place ?? "unset"}
        className={`place layer-in${time === "night" ? " place--night" : ""}`}
      >
        <Band kind="far" layer={art?.far} time={time} />
        <Band kind="ground" layer={art?.ground ?? UnsetGround} time={time} />
        <Band kind="near" layer={art?.near} time={time} />
      </div>
      {time === "night" && art?.glow && (
        <div key={`glow-${scene.place}`} className="place layer-in">
          <Band kind="glow" layer={art.glow} time={time} />
        </div>
      )}
    </>
  );
}

export function ForeLayer({ scene }: { scene: Scene }) {
  const art = scene.place ? PLACE_ART[scene.place] : null;
  if (!art?.fore) return null;
  return (
    <div key={scene.place} className="place layer-in">
      <Band kind="fore" layer={art.fore} time={scene.time} />
    </div>
  );
}
