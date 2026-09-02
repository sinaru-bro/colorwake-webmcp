import { Bush, Flower, Tree, Tuft, Window } from "../shapes";
import { bladeStrip } from "../geometry";
import type { PlaceArt } from "./types";

const PICKETS = Array.from({ length: 9 }, (_, i) => 700 + i * 64);

export const home: PlaceArt = {
  far: () => (
    <>
      <path d="M-100 936 C200 700 500 720 800 780 S1400 720 1700 800 V936 Z" fill="#CFE8B3" />
      <Tree x={300} y={770} s={0.32} leaf="#B7DB9A" light="#CBE6B0" trunk="#A98564" />
      <Tree x={1110} y={790} s={0.3} leaf="#B7DB9A" light="#CBE6B0" trunk="#A98564" />
      <Tree x={1190} y={800} s={0.36} leaf="#B7DB9A" light="#CBE6B0" trunk="#A98564" />
      <path d="M-100 936 C300 800 600 760 1000 830 S1500 800 1700 860 V936 Z" fill="#B5DB93" />
    </>
  ),
  near: () => (
    <>
      <rect x="468" y="380" width="58" height="150" rx="6" fill="#C9705A" />
      <rect x="460" y="372" width="74" height="22" rx="6" fill="#B8604B" />
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx="497"
          cy="350"
          r={14 + i * 3}
          fill="#FFFFFF"
          opacity="0.7"
          className="smoke"
          style={{ animationDelay: `${-i * 1.4}s` }}
        />
      ))}
      <rect x="200" y="520" width="380" height="416" fill="#FBE7BF" />
      <path d="M164 548 L390 322 L616 548 Z" fill="#E8735A" />
      <rect x="150" y="536" width="480" height="26" rx="8" fill="#D9634C" />
      <circle cx="390" cy="450" r="30" fill="#BFE6FF" />
      <circle cx="390" cy="450" r="30" fill="none" stroke="#FFFFFF" strokeWidth="8" />
      <Window x={236} y={600} />
      <Window x={456} y={600} />
      <rect x="342" y="760" width="96" height="176" rx="12" fill="#A26A3D" />
      <circle cx="420" cy="852" r="7" fill="#FFD166" />
      <rect x="322" y="922" width="136" height="14" rx="4" fill="#D9CBB0" />
      <Bush x={196} y={936} s={0.7} />
      <Bush x={598} y={936} s={0.6} />
      {PICKETS.map((x) => (
        <path key={x} d={`M${x} 936 V846 L${x + 13} 826 L${x + 26} 846 V936 Z`} fill="#FFFFFF" />
      ))}
      <rect x="690" y="858" width="546" height="14" rx="5" fill="#F1F1EC" />
      <rect x="690" y="902" width="546" height="14" rx="5" fill="#F1F1EC" />
      <Flower x={740} y={936} s={1.6} />
      <Flower x={900} y={936} s={1.6} petal="#FFFFFF" />
      <Flower x={1060} y={936} s={1.6} petal="#FFD166" />
      <Flower x={1190} y={936} s={1.6} />
      <rect x="1258" y="800" width="14" height="136" fill="#8B5A2B" />
      <rect x="1226" y="758" width="78" height="50" rx="22" fill="#E8534A" />
      <rect x="1298" y="748" width="8" height="30" fill="#FFD166" />
      <Tree x={1420} y={936} s={1.15} />
      <circle cx="1380" cy="760" r="12" fill="#E8534A" />
      <circle cx="1452" cy="720" r="12" fill="#E8534A" />
      <circle cx="1428" cy="792" r="12" fill="#E8534A" />
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#9CD46F" />
      <path d="M0 0 H1600 V30 C1200 52 800 20 400 44 S100 30 0 40 Z" fill="#B8E38F" />
      <path d="M0 264 V170 C400 130 700 200 1000 160 S1400 140 1600 176 V264 Z" fill="#86C65C" />
      {[120, 380, 640, 900, 1180, 1460].map((x, i) => (
        <Tuft key={x} x={x} y={110 + (i % 3) * 22} s={1.2} fill="#6FB34E" />
      ))}
      <Flower x={240} y={160} s={1.3} />
      <Flower x={520} y={200} s={1.3} petal="#FFFFFF" />
      <Flower x={760} y={120} s={1.3} petal="#FFD166" />
      <Flower x={1040} y={200} s={1.3} />
      <Flower x={1320} y={190} s={1.3} petal="#FFFFFF" />
    </>
  ),
  fore: () => (
    <>
      <path d={bladeStrip(44, 120)} fill="#7DBF57" />
      <Flower x={140} y={74} s={2} />
      <Flower x={760} y={82} s={2} petal="#FFD166" />
      <Flower x={1330} y={78} s={2} petal="#FFFFFF" />
    </>
  ),
  glow: () => (
    <>
      <ellipse cx="284" cy="648" rx="110" ry="92" fill="#FFD866" opacity="0.2" />
      <ellipse cx="504" cy="648" rx="110" ry="92" fill="#FFD866" opacity="0.2" />
      <Window x={236} y={600} glass="#FFD866" />
      <Window x={456} y={600} glass="#FFD866" />
      <circle cx="390" cy="450" r="30" fill="#FFD866" />
      <circle cx="390" cy="450" r="30" fill="none" stroke="#FFFFFF" strokeWidth="8" />
      <circle cx="390" cy="740" r="26" fill="#FFE9A0" opacity="0.3" />
      <circle cx="390" cy="740" r="9" fill="#FFF3B0" />
    </>
  ),
};
