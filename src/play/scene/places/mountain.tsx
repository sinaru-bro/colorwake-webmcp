import { Flower, Group, Pine, Rock, Tuft } from "../shapes";
import { bladeStrip } from "../geometry";
import type { PlaceArt } from "./types";

export const mountain: PlaceArt = {
  far: () => (
    <>
      <path
        d="M-100 936 L200 480 L420 700 L640 400 L860 660 L1050 420 L1300 700 L1500 500 L1700 936 Z"
        fill="#B9CFE0"
      />
      <path
        d="M640 400 L700 482 L580 482 Z M1050 420 L1104 494 L996 494 Z M200 480 L246 542 L154 542 Z M1500 500 L1544 560 L1456 560 Z"
        fill="#FFFFFF"
      />
      <path
        d="M-100 936 L150 660 L400 860 L700 600 L1000 820 L1250 620 L1500 800 L1700 936 Z"
        fill="#8FB7A6"
      />
      <path d="M-100 936 C200 780 500 860 800 800 S1300 860 1700 820 V936 Z" fill="#7FB36C" />
      {[80, 360, 620, 980, 1260, 1520].map((x, i) => (
        <Pine key={x} x={x} y={936} s={0.4 + (i % 2) * 0.1} dark="#5E9E62" light="#71B074" trunk="#7C5A3A" />
      ))}
    </>
  ),
  near: () => (
    <>
      <Pine x={120} y={936} s={0.8} />
      <Pine x={240} y={936} s={1.2} />
      <Group x={560} y={936}>
        <rect x="-8" y="-220" width="16" height="220" fill="#8B5A2B" />
        <path d="M-70 -220 H60 L90 -190 L60 -160 H-70 Z" fill="#D8A96C" />
        <rect x="-60" y="-146" width="100" height="40" rx="6" fill="#D8A96C" />
      </Group>
      <Rock x={720} y={936} s={0.8} />
      <Group x={1000} y={936}>
        <path d="M-130 0 L0 -180 L130 0 Z" fill="#F6A45A" />
        <path d="M-40 0 L0 -70 L40 0 Z" fill="#8A4A2B" />
        <path d="M0 -180 L130 0 H90 L0 -130 Z" fill="#E8935A" />
      </Group>
      <Group x={1130} y={936}>
        <path d="M-40 -6 L40 -22 M-40 -22 L40 -6" stroke="#8B5A2B" strokeWidth="12" strokeLinecap="round" />
        <Group x={0} y={-20} className="flame">
          <path d="M0 0 C-30 -20 -26 -60 0 -90 C26 -60 30 -20 0 0 Z" fill="#F6A45A" />
          <path d="M0 -6 C-14 -20 -12 -44 0 -60 C12 -44 14 -20 0 -6 Z" fill="#FFD166" />
        </Group>
      </Group>
      <Pine x={1290} y={936} s={0.9} />
      <Pine x={1440} y={936} s={1.35} />
      <Rock x={1560} y={936} s={0.6} />
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#8FBF6A" />
      <path d="M0 0 H1600 V30 C1200 52 800 20 400 44 S100 30 0 40 Z" fill="#A6CF82" />
      <path d="M700 264 C760 200 700 120 740 60 L780 0 H820 C800 80 860 160 900 264 Z" fill="#D8B98A" />
      {[
        [760, 200],
        [800, 120],
        [830, 240],
        [770, 60],
      ].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="9" ry="6" fill="#C2A377" />
      ))}
      {[160, 420, 1060, 1320, 1520].map((x, i) => (
        <Tuft key={x} x={x} y={110 + (i % 3) * 40} s={1.2} fill="#6FA85E" />
      ))}
      <Flower x={300} y={190} s={1.3} petal="#FFFFFF" />
      <Flower x={540} y={150} s={1.3} petal="#B49BE0" />
      <Flower x={1180} y={200} s={1.3} petal="#FFD166" />
      <Flower x={1440} y={160} s={1.3} petal="#FFFFFF" />
      <path d="M0 264 V200 Q400 176 700 200 M900 200 Q1300 176 1600 200 V264 Z" fill="#7FB35E" />
    </>
  ),
  fore: () => (
    <>
      <path d={bladeStrip(50, 120, 40, 5)} fill="#6FA85E" />
      <Rock x={120} y={120} s={0.7} fill="#8C99B0" light="#A9B4C8" />
      <Rock x={1440} y={118} s={0.5} fill="#8C99B0" light="#A9B4C8" />
      <Flower x={640} y={84} s={2} petal="#B49BE0" />
    </>
  ),
  glow: () => (
    <>
      <circle cx="1130" cy="880" r="90" fill="#FFB347" opacity="0.28" />
      <Group x={1130} y={916} className="flame">
        <path d="M0 0 C-30 -20 -26 -60 0 -90 C26 -60 30 -20 0 0 Z" fill="#FFB347" />
        <path d="M0 -6 C-14 -20 -12 -44 0 -60 C12 -44 14 -20 0 -6 Z" fill="#FFE27A" />
      </Group>
      <path d="M-40 0 L0 -70 L40 0 Z" transform="translate(1000 936)" fill="#FFD866" opacity="0.7" />
    </>
  ),
};
