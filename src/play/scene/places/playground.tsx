import { Bush, Flower, Group, Tree, Tuft } from "../shapes";
import { bladeStrip } from "../geometry";
import type { PlaceArt } from "./types";

export const playground: PlaceArt = {
  far: () => (
    <>
      <Tree x={300} y={936} s={0.9} leaf="#8ECB70" light="#A8D68A" trunk="#A98564" />
      <Tree x={1300} y={936} s={0.8} leaf="#8ECB70" light="#A8D68A" trunk="#A98564" />
      {Array.from({ length: 9 }, (_, i) => (
        <Bush key={i} x={i * 200} y={936} s={0.9} fill="#A8D68A" light="#BCE0A0" />
      ))}
    </>
  ),
  near: () => (
    <>
      <g stroke="#5AA9E6" strokeWidth="22" strokeLinecap="round" fill="none">
        <path d="M230 936 L320 560 L410 936" />
        <path d="M510 936 L600 560 L690 936" />
        <path d="M300 560 H620" />
      </g>
      {[400, 520].map((x, i) => (
        <Group key={x} x={x} y={560} className="swing" style={{ animationDelay: `${-i * 1.3}s` }}>
          <path d="M-24 0 V300 M24 0 V300" stroke="#9A5B34" strokeWidth="6" />
          <rect x="-40" y="298" width="80" height="16" rx="6" fill="#E8735A" />
        </Group>
      ))}
      <g stroke="#5AA9E6" strokeWidth="14" strokeLinecap="round">
        <path d="M1130 936 V560 M1180 936 V560" />
        {[620, 690, 760, 830, 900].map((y) => (
          <path key={y} d={`M1130 ${y} H1180`} />
        ))}
      </g>
      <rect x="1110" y="546" width="150" height="24" rx="8" fill="#5AA9E6" />
      <path
        d="M1250 574 C1380 590 1420 780 1530 930"
        stroke="#FFC94A"
        strokeWidth="46"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M1250 550 C1380 566 1420 756 1530 906"
        stroke="#E8735A"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="1440" y="800" width="14" height="136" fill="#5AA9E6" />
      <Group x={760} y={936}>
        <circle cx="0" cy="-40" r="40" fill="#F5A3C0" />
        <path d="M-38 -52 Q0 -30 38 -52 Q0 -74 -38 -52 Z" fill="#FFFFFF" />
      </Group>
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#B7D98A" />
      <path d="M0 0 H1600 V30 C1200 52 800 20 400 44 S100 30 0 40 Z" fill="#CBE4A4" />
      <ellipse cx="800" cy="120" rx="320" ry="72" fill="#E5CC90" />
      <ellipse cx="800" cy="112" rx="300" ry="62" fill="#F0DDA8" />
      <Group x={920} y={130}>
        <path d="M-26 -40 H26 L20 0 H-20 Z" fill="#5AA9E6" />
        <path d="M-22 -40 Q0 -70 22 -40" stroke="#5AA9E6" strokeWidth="5" fill="none" />
      </Group>
      <Group x={700} y={140}>
        <path d="M-30 -20 L20 6" stroke="#E8735A" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="28" cy="10" rx="16" ry="12" fill="#FFD166" transform="rotate(30 28 10)" />
      </Group>
      {[120, 380, 1180, 1460].map((x, i) => (
        <Tuft key={x} x={x} y={120 + (i % 2) * 40} s={1.2} fill="#8ECB70" />
      ))}
      <Flower x={240} y={200} s={1.3} petal="#FFD166" />
      <Flower x={1320} y={210} s={1.3} />
      <path d="M0 264 V190 C400 160 700 220 1000 180 S1400 170 1600 200 V264 Z" fill="#A3CF78" />
    </>
  ),
  fore: () => (
    <>
      <path d={bladeStrip(48, 120, 40, 3)} fill="#8ECB70" />
      <Flower x={220} y={78} s={2} />
      <Flower x={1240} y={84} s={2} petal="#FFFFFF" />
    </>
  ),
};
