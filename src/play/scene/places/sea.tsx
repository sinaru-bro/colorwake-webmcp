import { Bubbles, Group, Seaweed } from "../shapes";
import type { PlaceArt } from "./types";

const SURFACE = `M-200 46 ${Array.from({ length: 10 }, (_, i) => `Q${-100 + i * 200} 6 ${i * 200} 46`).join(" ")} V-60 H-200 Z`;
const FISH = [
  [0, 0],
  [60, -22],
  [120, 10],
  [180, -30],
  [240, -2],
  [90, 40],
  [200, 42],
];

export const sea: PlaceArt = {
  far: () => (
    <>
      <defs>
        <linearGradient id="sea-depth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5FB8F0" stopOpacity="0.42" />
          <stop offset="1" stopColor="#1F6FC4" stopOpacity="0.62" />
        </linearGradient>
      </defs>
      <rect width="1600" height="936" fill="url(#sea-depth)" />
      <path d={SURFACE} fill="#FFFFFF" opacity="0.28" className="lap" />
      <g className="shimmer">
        <path d="M300 -50 L420 -50 L620 936 L380 936 Z" fill="#FFFFFF" opacity="0.12" />
        <path d="M900 -50 L980 -50 L1240 936 L1040 936 Z" fill="#FFFFFF" opacity="0.1" />
        <path d="M1300 -50 L1380 -50 L1560 936 L1400 936 Z" fill="#FFFFFF" opacity="0.08" />
      </g>
      <g fill="#2D6DB4" opacity="0.32">
        <ellipse cx="180" cy="936" rx="220" ry="120" />
        <ellipse cx="1420" cy="936" rx="260" ry="150" />
        <path d="M700 936 C690 860 730 820 720 720 C750 800 730 860 740 936 Z" />
        <path d="M1130 936 C1110 840 1160 800 1150 680 C1190 780 1160 850 1170 936 Z" />
        <path d="M420 936 C410 880 440 850 430 780 C460 840 440 880 450 936 Z" />
      </g>
      <g className="school" fill="#FFFFFF" opacity="0.55" style={{ animationDelay: "-20s" }}>
        {FISH.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse cx="0" cy="0" rx="16" ry="8" />
            <path d="M-14 0 L-30 -10 L-30 10 Z" />
          </g>
        ))}
      </g>
      <Bubbles n={8} y={900} salt={197} />
    </>
  ),
  near: () => (
    <>
      <Seaweed x={250} />
      <Seaweed x={940} s={0.7} delay={-1.1} />
      <Seaweed x={1440} s={1.1} delay={-2} />
      <Group x={440} y={936}>
        {[-50, -25, 0, 25, 50].map((a) => (
          <ellipse key={a} cx="0" cy="-90" rx="26" ry="90" fill="#F6A45A" transform={`rotate(${a} 0 0)`} />
        ))}
        <ellipse cx="0" cy="0" rx="60" ry="20" fill="#E8935A" />
      </Group>
      <Group x={640} y={936}>
        <ellipse cx="0" cy="-10" rx="110" ry="60" fill="#7E93B8" />
        <ellipse cx="-30" cy="-40" rx="50" ry="24" fill="#95A9CC" />
        <Group x={10} y={-62} className="sway-slow">
          {[-60, -40, -20, 0, 20, 40, 60].map((a) => (
            <path
              key={a}
              d="M0 0 L0 -70"
              stroke="#F5A3C0"
              strokeWidth="18"
              strokeLinecap="round"
              transform={`rotate(${a})`}
            />
          ))}
        </Group>
      </Group>
      <Group x={1120} y={936}>
        <rect x="-60" y="-70" width="120" height="70" rx="8" fill="#A26A3D" />
        <path d="M-60 -70 Q0 -124 60 -70 Z" fill="#B8784A" />
        <rect x="-60" y="-76" width="120" height="10" fill="#FFD166" />
        <rect x="-9" y="-98" width="18" height="98" fill="#FFD166" />
      </Group>
      <Group x={1300} y={936}>
        <path
          d="M0 0 V-150 M0 -80 L-56 -170 M0 -60 L60 -160 M-56 -170 L-70 -230 M60 -160 L86 -226"
          stroke="#F28BAA"
          strokeWidth="30"
          strokeLinecap="round"
          fill="none"
        />
      </Group>
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#EBD9A6" />
      <path d="M0 0 H1600 V22 Q800 40 0 22 Z" fill="#F3E6BC" />
      {[
        [120, 70],
        [420, 150],
        [700, 90],
        [960, 170],
        [1240, 80],
        [1500, 150],
        [280, 210],
        [1100, 230],
      ].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y} q40 -14 80 0`}
          stroke="#DBC58C"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path d="M0 264 V200 Q800 170 1600 200 V264 Z" fill="#DDC58A" />
      <Group x={420} y={96} s={1.2}>
        <path d="M0 -30 L9 -9 L30 -6 L14 8 L18 30 L0 18 L-18 30 L-14 8 L-30 -6 L-9 -9 Z" fill="#F6A45A" />
      </Group>
      <path d="M1180 84 a18 18 0 0 1 36 0 Z" fill="#FFFFFF" />
      <path d="M860 60 a14 14 0 0 1 28 0 Z" fill="#FFFFFF" />
      <path d="M770 200 a18 18 0 0 1 36 0 Z" fill="#F5A3C0" />
      <rect width="1600" height="264" fill="#2B78C8" opacity="0.28" />
    </>
  ),
  fore: () => (
    <>
      <path d="M0 120 V70 Q200 40 400 70 T800 70 T1200 70 T1600 70 V120 Z" fill="#DEC58A" />
      <Group x={80} y={120} className="sway">
        <path
          d="M0 0 C-20 -40 20 -70 0 -110"
          stroke="#3FA36A"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
        />
      </Group>
      <Group x={1500} y={120} className="sway" style={{ animationDelay: "-1.5s" }}>
        <path
          d="M0 0 C-20 -40 20 -70 0 -110"
          stroke="#3FA36A"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
        />
      </Group>
      <rect width="1600" height="120" fill="#2B78C8" opacity="0.28" />
    </>
  ),
};
