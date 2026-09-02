import { Fern, Group, Palm, Rock } from "../shapes";
import type { PlaceArt } from "./types";

export const dino: PlaceArt = {
  far: () => (
    <>
      <path d="M-100 936 L100 620 H400 L520 936 Z" fill="#B9A58C" />
      <path d="M100 620 H400 L380 660 H120 Z" fill="#CBB79C" />
      <path d="M980 936 L1260 380 L1540 936 Z" fill="#8A6A5C" />
      <path d="M1220 400 L1260 380 L1300 400 L1280 440 H1240 Z" fill="#E8735A" />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx="1260"
          cy="360"
          r={22 + i * 6}
          fill="#B9B4C0"
          opacity="0.7"
          className="smoke"
          style={{ animationDelay: `${-i * 1.6}s`, animationDuration: "5s" }}
        />
      ))}
      <path d="M-100 936 C200 820 500 880 800 840 S1300 880 1700 850 V936 Z" fill="#7FA95C" />
      {[200, 460, 700, 900, 1500].map((x, i) => (
        <Fern key={x} x={x} y={936} s={0.5 + (i % 2) * 0.2} fill="#6A9E5A" />
      ))}
      <Group x={0} y={0} className="glide" style={{ animationDelay: "-12s" }}>
        <path d="M-70 0 Q-30 -30 0 -10 Q30 -30 70 0 Q30 -14 0 6 Q-30 -14 -70 0 Z" fill="#6B5B63" />
        <path d="M0 -10 L28 -6 L40 -14 L26 -20 Z" fill="#6B5B63" />
      </Group>
    </>
  ),
  near: () => (
    <>
      <Palm x={200} y={936} s={1} leaf="#4FA36B" />
      <Fern x={360} y={936} s={1.2} />
      <Rock x={560} y={936} s={0.9} fill="#8C7B6A" light="#A79684" />
      <Fern x={1050} y={936} s={1} fill="#5DAE6A" />
      <Group x={1180} y={936}>
        <ellipse cx="0" cy="0" rx="120" ry="34" fill="#A26A3D" />
        <ellipse cx="0" cy="-8" rx="110" ry="28" fill="#C48A55" />
        {[-56, 0, 56].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy={-40 - (i % 2) * 8} rx="30" ry="40" fill="#F7F1DC" />
            <circle cx={x - 8} cy={-52 - (i % 2) * 8} r="6" fill="#9BE38A" />
            <circle cx={x + 10} cy={-32 - (i % 2) * 8} r="5" fill="#9BE38A" />
          </g>
        ))}
      </Group>
      <Palm x={1420} y={936} s={1.15} leaf="#5DAE6A" />
      <Fern x={1540} y={936} s={0.9} />
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#C9A86A" />
      <path d="M0 0 H1600 V28 C1200 48 800 18 400 40 S100 26 0 36 Z" fill="#D9BC82" />
      <path d="M200 90 C300 60 420 110 520 80 V130 C420 160 300 110 200 140 Z" fill="#8FBF6A" />
      <path d="M1000 160 C1100 130 1250 180 1380 150 V200 C1250 230 1100 180 1000 210 Z" fill="#8FBF6A" />
      {[
        [640, 100],
        [760, 170],
        [880, 110],
      ].map(([x, y]) => (
        <Group key={`${x}-${y}`} x={x} y={y}>
          <ellipse cx="0" cy="0" rx="20" ry="14" fill="#B08E52" />
          <ellipse cx="-16" cy="-18" rx="7" ry="12" fill="#B08E52" transform="rotate(-25 -16 -18)" />
          <ellipse cx="0" cy="-22" rx="7" ry="12" fill="#B08E52" />
          <ellipse cx="16" cy="-18" rx="7" ry="12" fill="#B08E52" transform="rotate(25 16 -18)" />
        </Group>
      ))}
      <ellipse cx="1500" cy="120" rx="30" ry="12" fill="#B08E52" />
      <path d="M0 264 V206 Q800 180 1600 206 V264 Z" fill="#B99657" />
    </>
  ),
  fore: () => (
    <>
      <Fern x={120} y={120} s={0.9} fill="#4FA36B" />
      <Fern x={1480} y={120} s={1} fill="#4FA36B" />
      <Rock x={760} y={120} s={0.4} fill="#8C7B6A" light="#A79684" />
    </>
  ),
  glow: () => (
    <>
      <circle cx="1260" cy="400" r="90" fill="#FF8A3D" opacity="0.3" />
      <path d="M1220 400 L1260 380 L1300 400 L1280 440 H1240 Z" fill="#FF8A3D" />
      <path
        d="M1240 440 C1230 520 1250 600 1230 700 L1250 700 C1270 600 1250 520 1260 440 Z"
        fill="#FF8A3D"
        opacity="0.8"
      />
    </>
  ),
};
