import { Flower, Group, Tree, Tuft, Window } from "../shapes";
import { bladeStrip } from "../geometry";
import type { PlaceArt } from "./types";

const PASTEL = ["#FFD166", "#7BD3EA", "#F5A3C0", "#9BE38A"];
const WINDOWS = [180, 320, 560, 700];

export const school: PlaceArt = {
  far: () => (
    <>
      <path d="M-100 936 C300 760 700 800 1000 820 S1500 780 1700 830 V936 Z" fill="#CFE8B3" />
      {[
        [120, 830],
        [1240, 826],
        [1400, 840],
      ].map(([x, y], i) => (
        <g key={x}>
          <rect x={x - 40} y={y - 70} width="80" height="70" fill={i % 2 ? "#FBE7BF" : "#FFF6E5"} />
          <path
            d={`M${x - 50} ${y - 70} L${x} ${y - 110} L${x + 50} ${y - 70} Z`}
            fill={PASTEL[(i + 2) % 4]}
          />
        </g>
      ))}
      <Tree x={1000} y={900} s={0.5} leaf="#B7DB9A" light="#CBE6B0" trunk="#A98564" />
      <path d="M-100 936 C300 860 700 880 1100 900 S1500 880 1700 900 V936 Z" fill="#B5DB93" />
    </>
  ),
  near: () => (
    <>
      <rect x="120" y="560" width="760" height="376" rx="12" fill="#FFF1D6" />
      <path d="M90 570 H910 L880 500 H120 Z" fill="#7BD3EA" />
      <rect x="90" y="556" width="820" height="22" rx="8" fill="#5AA9E6" />
      {WINDOWS.map((x, i) => (
        <Window key={x} x={x} y={620} w={100} h={100} frame={PASTEL[i % 4]} />
      ))}
      <rect x="420" y="740" width="160" height="196" rx="16" fill="#F5A3C0" />
      <path d="M500 740 V936" stroke="#FFFFFF" strokeWidth="6" />
      <circle cx="484" cy="850" r="6" fill="#FFFFFF" />
      <circle cx="516" cy="850" r="6" fill="#FFFFFF" />
      <circle cx="500" cy="660" r="40" fill="#FFD166" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M500 606 l-8 -26 h16 Z" fill="#FFD166" transform={`rotate(${i * 45} 500 660)`} />
      ))}
      <circle cx="486" cy="654" r="4" fill="#3B3B3B" />
      <circle cx="514" cy="654" r="4" fill="#3B3B3B" />
      <path
        d="M486 672 Q500 684 514 672"
        stroke="#3B3B3B"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="40" y="480" width="8" height="456" fill="#D8DEE9" />
      <path d="M48 484 L108 500 L48 516 Z" fill="#E8735A" className="flutter" />
      <Tree x={990} y={936} s={1} />
      <Group x={1320} y={936} className="bus">
        <rect x="-190" y="-190" width="380" height="150" rx="18" fill="#FFD166" />
        <rect x="-190" y="-100" width="380" height="60" fill="#F6C85F" />
        <path d="M-190 -60 H190" stroke="#3B3B3B" strokeWidth="6" />
        {[-150, -70, 10, 90].map((x) => (
          <rect key={x} x={x} y="-172" width="62" height="56" rx="8" fill="#7BD3EA" />
        ))}
        <rect x="150" y="-172" width="34" height="90" rx="8" fill="#7BD3EA" />
        <circle cx="-110" cy="-20" r="30" fill="#3B3B3B" />
        <circle cx="-110" cy="-20" r="12" fill="#D8DEE9" />
        <circle cx="120" cy="-20" r="30" fill="#3B3B3B" />
        <circle cx="120" cy="-20" r="12" fill="#D8DEE9" />
        <rect x="-200" y="-150" width="14" height="40" rx="4" fill="#E8534A" />
      </Group>
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#9CD46F" />
      <path d="M0 0 H1600 V30 C1200 52 800 20 400 44 S100 30 0 40 Z" fill="#B8E38F" />
      <path d="M400 0 H600 L660 264 H340 Z" fill="#F1E6D2" />
      {[
        [470, 40, 60],
        [470, 110, 60],
        [440, 180, 56],
        [504, 180, 56],
      ].map(([x, y, w], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height="56"
          rx="6"
          fill="none"
          stroke={PASTEL[i % 4]}
          strokeWidth="5"
        />
      ))}
      {[120, 260, 900, 1180, 1460].map((x, i) => (
        <Tuft key={x} x={x} y={110 + (i % 3) * 40} s={1.2} fill="#6FB34E" />
      ))}
      <Flower x={200} y={200} s={1.3} />
      <Flower x={1040} y={190} s={1.3} petal="#FFD166" />
      <Flower x={1340} y={210} s={1.3} petal="#FFFFFF" />
      <path d="M0 264 V200 Q170 176 340 200 M660 200 Q1130 176 1600 200 V264 Z" fill="#86C65C" />
    </>
  ),
  fore: () => (
    <>
      <path d={bladeStrip(48, 120, 40, 7)} fill="#7DBF57" />
      <Group x={1320} y={112}>
        <circle cx="0" cy="-30" r="30" fill="#E8735A" />
        <path d="M-28 -40 Q0 -20 28 -40 Q0 -60 -28 -40 Z" fill="#FFFFFF" />
      </Group>
      <Flower x={180} y={80} s={2} petal="#B49BE0" />
    </>
  ),
  glow: () => (
    <>
      {WINDOWS.map((x, i) => (
        <g key={x}>
          <ellipse cx={x + 50} cy="670" rx="100" ry="90" fill="#FFD866" opacity="0.18" />
          <Window x={x} y={620} w={100} h={100} glass="#FFD866" frame={PASTEL[i % 4]} />
        </g>
      ))}
    </>
  ),
};
