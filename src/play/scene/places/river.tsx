import { Duck, Group, Pine, Rock } from "../shapes";
import type { PlaceArt } from "./types";

const POSTS = [320, 560, 800, 1040, 1280];

export const river: PlaceArt = {
  far: () => (
    <>
      <path d="M-100 936 L120 520 L360 700 L560 560 L760 760 V936 Z" fill="#B9CFE0" />
      <path d="M840 936 V760 L1040 560 L1240 700 L1480 520 L1700 936 Z" fill="#B9CFE0" />
      <path d="M-100 936 L80 700 L300 820 L520 680 L700 860 V936 Z" fill="#8FB7A6" />
      <path d="M900 936 V860 L1080 680 L1300 820 L1520 700 L1700 936 Z" fill="#8FB7A6" />
      <path d="M700 700 H900 L1040 936 H560 Z" fill="#7CC4EA" />
      <path d="M760 720 H840 L860 936 H740 Z" fill="#A9DBF5" opacity="0.7" />
      <path
        d="M1300 820 C1320 760 1340 720 1330 660 L1370 660 C1380 720 1360 780 1360 830 Z"
        fill="#FFFFFF"
        opacity="0.85"
      />
      <path
        d="M1310 830 C1300 870 1290 900 1300 936 H1380 C1370 900 1370 860 1360 830 Z"
        fill="#FFFFFF"
        opacity="0.7"
        className="shimmer"
      />
      {[60, 200, 420, 1180, 1400, 1560].map((x, i) => (
        <Pine key={x} x={x} y={936} s={0.5 + (i % 2) * 0.15} dark="#5E9E62" light="#71B074" trunk="#7C5A3A" />
      ))}
    </>
  ),
  near: () => (
    <>
      {POSTS.map((x) => (
        <g key={x}>
          <rect x={x - 12} y="800" width="24" height="136" rx="4" fill="#A26A3D" />
          <rect x={x - 16} y="792" width="32" height="14" rx="4" fill="#8B5A2B" />
        </g>
      ))}
      <rect x="300" y="820" width="1000" height="16" rx="6" fill="#B8784A" />
      <rect x="300" y="872" width="1000" height="14" rx="6" fill="#B8784A" />
      <rect x="290" y="920" width="1020" height="16" rx="4" fill="#8B5A2B" />
      <Rock x={120} y={936} s={0.7} />
      <Rock x={1500} y={936} s={0.9} />
      <Pine x={60} y={936} s={1.1} />
      <Pine x={1560} y={936} s={1.2} />
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#7CC4EA" />
      <rect y="0" width="1600" height="24" fill="#A26A3D" />
      <rect y="18" width="1600" height="10" fill="#7C4E2A" />
      {[40, 90, 140, 190, 240].map((y, i) => (
        <g key={y} className="flow" style={{ animationDelay: `${-i * 0.6}s` }}>
          {[80, 420, 780, 1120, 1460].map((x) => (
            <path
              key={x}
              d={`M${x + (i % 2) * 120} ${y} q40 -10 80 0`}
              stroke="#FFFFFF"
              strokeWidth="5"
              fill="none"
              opacity="0.55"
              strokeLinecap="round"
            />
          ))}
        </g>
      ))}
      <ellipse cx="240" cy="180" rx="44" ry="20" fill="#9AA7BF" />
      <ellipse cx="1380" cy="150" rx="40" ry="18" fill="#9AA7BF" />
      <Duck x={600} y={150} delay="0s" />
      <Duck x={1080} y={200} delay="-1.6s" />
      <path d="M0 264 V230 Q800 214 1600 230 V264 Z" fill="#5FB0DF" />
    </>
  ),
  fore: () => (
    <>
      <path d="M0 120 V80 Q400 60 800 80 T1600 80 V120 Z" fill="#5FB0DF" />
      {[60, 110, 1490, 1540].map((x, i) => (
        <Group key={x} x={x} y={120} className="sway" style={{ animationDelay: `${-i * 0.8}s` }}>
          <path d="M0 0 V-100" stroke="#5FAE4B" strokeWidth="6" strokeLinecap="round" />
          <rect x="-8" y="-118" width="16" height="36" rx="8" fill="#8B5A2B" />
        </Group>
      ))}
    </>
  ),
  glow: () => (
    <>
      {[320, 1280].map((x) => (
        <g key={x}>
          <circle cx={x} cy="780" r="46" fill="#FFD866" opacity="0.28" />
          <rect x={x - 12} y="766" width="24" height="30" rx="6" fill="#FFE9A0" />
        </g>
      ))}
    </>
  ),
};
