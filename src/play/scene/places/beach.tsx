import { Bird, Group, Palm } from "../shapes";
import type { PlaceArt } from "./types";

const FOAM = `M-200 890 ${Array.from({ length: 10 }, (_, i) => `Q${-100 + i * 200} 866 ${i * 200} 890`).join(" ")} V860 H-200 Z`;

export const beach: PlaceArt = {
  far: () => (
    <>
      <defs>
        <linearGradient id="beach-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4FB6EA" />
          <stop offset="1" stopColor="#8AD4F4" />
        </linearGradient>
      </defs>
      <rect x="0" y="640" width="1600" height="296" fill="url(#beach-sea)" />
      <path d="M1180 640 C1220 600 1300 590 1340 640 Z" fill="#6FA85E" />
      <Palm x={1250} y={642} s={0.28} />
      <Group x={480} y={700} className="bob">
        <path d="M-70 0 H70 L50 30 H-50 Z" fill="#E8735A" />
        <path d="M0 -6 V-120" stroke="#8B5A2B" strokeWidth="6" />
        <path d="M6 -116 L70 -20 H6 Z" fill="#FFFFFF" />
        <path d="M-6 -100 L-56 -20 H-6 Z" fill="#FFD166" />
      </Group>
      {[
        [160, 700],
        [400, 760],
        [900, 720],
        [1300, 770],
        [640, 820],
        [1100, 850],
      ].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y} q30 -10 60 0`}
          stroke="#FFFFFF"
          strokeWidth="5"
          fill="none"
          opacity="0.6"
          strokeLinecap="round"
        />
      ))}
      <rect x="0" y="880" width="1600" height="56" fill="#E7D3A2" />
      <path d={FOAM} fill="#FFFFFF" opacity="0.9" className="lap" />
      <Bird x={300} y={420} />
      <Bird x={370} y={380} s={0.8} />
    </>
  ),
  near: () => (
    <>
      <Palm x={230} y={936} s={1.1} />
      <Group x={1040} y={936}>
        <path d="M-90 0 V-90 H90 V0 Z" fill="#F3D89A" />
        <path d="M-120 0 V-60 H-70 V0 Z M70 0 V-60 H120 V0 Z" fill="#F3D89A" />
        {[-90, -50, -10, 30, 70].map((x) => (
          <rect key={x} x={x} y="-110" width="20" height="24" fill="#F3D89A" />
        ))}
        <path d="M0 -110 V-170" stroke="#8B5A2B" strokeWidth="5" />
        <path d="M0 -172 L40 -158 L0 -144 Z" fill="#E8735A" />
        <path d="M-20 0 V-40 A20 20 0 0 1 20 -40 V0 Z" fill="#C9A86A" />
      </Group>
      <Group x={1320} y={936}>
        <path d="M0 0 V-330" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M-220 -300 A220 90 0 0 1 220 -300 Z" fill="#E8735A" />
        <path d="M-132 -300 A88 90 0 0 1 -44 -300 Z M44 -300 A88 90 0 0 1 132 -300 Z" fill="#FFFFFF" />
        <path d="M-220 -300 A220 90 0 0 1 220 -300" fill="none" stroke="#D9634C" strokeWidth="6" />
        <rect x="-160" y="-40" width="230" height="40" rx="10" fill="#7BD3EA" />
        <rect x="-160" y="-40" width="230" height="40" rx="10" fill="url(#towel)" />
        <circle cx="130" cy="-36" r="36" fill="#FFD166" />
        <path d="M94 -36 A36 36 0 0 1 166 -36 Z" fill="#E8735A" />
      </Group>
      <defs>
        <pattern id="towel" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="20" height="40" fill="#FFFFFF" opacity="0.55" />
        </pattern>
      </defs>
      <Group x={760} y={936}>
        <path d="M-22 -40 H22 L18 0 H-18 Z" fill="#F5A3C0" />
        <path d="M-18 -40 Q0 -64 18 -40" stroke="#F5A3C0" strokeWidth="5" fill="none" />
      </Group>
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#F3E3B4" />
      <path d="M0 0 H1600 V18 Q800 34 0 18 Z" fill="#FBF0CC" />
      {[
        [120, 70],
        [520, 150],
        [980, 90],
        [1400, 160],
        [300, 210],
        [1150, 230],
      ].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y} q40 -12 80 0`}
          stroke="#E4D09A"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      ))}
      <path d="M700 110 a16 16 0 0 1 32 0 Z" fill="#FFFFFF" />
      <path d="M1260 60 a14 14 0 0 1 28 0 Z" fill="#F5A3C0" />
      <Group x={380} y={120}>
        <path d="M0 -26 L8 -8 L26 -5 L12 7 L16 26 L0 16 L-16 26 L-12 7 L-26 -5 L-8 -8 Z" fill="#F6A45A" />
      </Group>
      <path d="M0 264 V206 Q800 180 1600 206 V264 Z" fill="#EAD7A4" />
    </>
  ),
  fore: () => (
    <>
      <path d="M0 120 V64 Q300 36 600 66 T1200 66 T1600 60 V120 Z" fill="#EAD7A4" />
      <Group x={200} y={110}>
        <ellipse cx="0" cy="0" rx="34" ry="22" fill="#E8534A" />
        <path d="M-26 -18 L-42 -40 M26 -18 L42 -40" stroke="#E8534A" strokeWidth="8" strokeLinecap="round" />
        <circle cx="-42" cy="-46" r="10" fill="#E8534A" />
        <circle cx="42" cy="-46" r="10" fill="#E8534A" />
        <path
          d="M-30 12 L-44 24 M-12 16 L-18 30 M12 16 L18 30 M30 12 L44 24"
          stroke="#E8534A"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="-10" cy="-6" r="4" fill="#3B3B3B" />
        <circle cx="10" cy="-6" r="4" fill="#3B3B3B" />
      </Group>
      <path d="M1180 90 a18 18 0 0 1 36 0 Z" fill="#FFFFFF" />
      <path d="M1300 100 a12 12 0 0 1 24 0 Z" fill="#F5A3C0" />
    </>
  ),
};
