import { Bird, Cloud } from "../shapes";
import type { PlaceArt } from "./types";

const BOW = ["#F27D7D", "#F6A45A", "#FFD166", "#9BE38A", "#7BD3EA", "#B49BE0"];

export const sky: PlaceArt = {
  far: ({ time }) => (
    <>
      {time !== "night" && (
        <g opacity="0.55">
          {BOW.map((c, i) => (
            <path
              key={c}
              d={`M${200 - i * 22} 1000 A${600 + i * 22} ${600 + i * 22} 0 0 1 ${1400 + i * 22} 1000`}
              stroke={c}
              strokeWidth="22"
              fill="none"
            />
          ))}
        </g>
      )}
      {[0, 1, 2, 3].map((i) => (
        <g
          key={i}
          className="drift"
          style={{ animationDuration: `${120 + i * 25}s`, animationDelay: `${-i * 38}s` }}
        >
          <Cloud x={0} y={140 + i * 130} s={0.55 + (i % 2) * 0.25} />
        </g>
      ))}
      <Bird x={520} y={300} />
      <Bird x={590} y={262} s={0.8} />
      <Bird x={650} y={318} s={0.7} />
    </>
  ),
  near: () => (
    <>
      <Cloud x={160} y={890} s={2.4} />
      <Cloud x={560} y={912} s={2} />
      <Cloud x={840} y={880} s={2.8} />
      <Cloud x={1200} y={914} s={2.1} />
      <Cloud x={1480} y={886} s={2.4} />
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#F7FBFF" />
      {[
        [200, 60, 160, 28],
        [700, 120, 200, 30],
        [1200, 70, 170, 26],
        [450, 200, 180, 28],
        [1000, 220, 200, 30],
        [1500, 190, 150, 24],
      ].map(([x, y, rx, ry]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={rx} ry={ry} fill="#DCEBFA" opacity="0.8" />
      ))}
      <path d="M0 264 V210 Q800 176 1600 210 V264 Z" fill="#EAF3FC" />
    </>
  ),
  fore: () => (
    <>
      <Cloud x={200} y={120} s={1.6} shade="#E3EEFA" />
      <Cloud x={1400} y={124} s={1.8} shade="#E3EEFA" />
    </>
  ),
};
