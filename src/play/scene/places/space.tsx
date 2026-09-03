import { Group, Rock, Star4 } from "../shapes";
import type { PlaceArt } from "./types";

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: (i * 431 + 60) % 1600,
  y: (i * 277 + 30) % 900,
  r: 1.5 + (i % 3),
}));

export const space: PlaceArt = {
  far: () => (
    <>
      <defs>
        <linearGradient id="space-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B1030" />
          <stop offset="1" stopColor="#1E2A5A" />
        </linearGradient>
      </defs>
      <rect width="1600" height="936" fill="url(#space-deep)" />
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#FFFFFF"
          opacity="0.85"
          className={i % 4 === 0 ? "twinkle" : undefined}
          style={{ animationDelay: `${-((i * 0.9) % 3)}s` }}
        />
      ))}
      {[
        [220, 160],
        [900, 90],
        [1380, 300],
      ].map(([x, y], i) => (
        <Star4 key={i} x={x} y={y} s={1.2} className="twinkle" style={{ animationDelay: `${-i}s` }} />
      ))}
      <Group x={320} y={260}>
        <ellipse
          cx="0"
          cy="0"
          rx="200"
          ry="44"
          fill="none"
          stroke="#F5A3C0"
          strokeWidth="18"
          transform="rotate(-18)"
        />
        <circle r="96" fill="#F6C85F" />
        <path d="M-96 0 A96 96 0 0 0 96 0 Z" fill="#E8A83E" opacity="0.6" />
        <path d="M-80 -30 Q0 -10 80 -30" stroke="#E8A83E" strokeWidth="10" fill="none" opacity="0.6" />
        <path
          d="M-200 44 A200 44 0 0 0 200 44"
          fill="none"
          stroke="#F5A3C0"
          strokeWidth="18"
          transform="rotate(-18)"
          opacity="0"
        />
      </Group>
      <Group x={1250} y={180}>
        <g className="spin-slow">
          <circle r="70" fill="#5AA9E6" />
          <path
            d="M-40 -30 C-10 -50 20 -30 10 -5 C0 15 -40 10 -40 -30 Z M20 20 C40 10 60 30 40 50 C25 55 15 35 20 20 Z"
            fill="#9BE38A"
          />
        </g>
        <circle r="70" fill="none" stroke="#FFFFFF" strokeWidth="6" opacity="0.4" />
      </Group>
      <Group x={1420} y={110}>
        <g className="comet">
          <path d="M260 -150 L0 0" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
          <circle r="9" fill="#FFF6C8" />
        </g>
      </Group>
      <Group x={720} y={50}>
        <g className="comet comet--far">
          <path d="M90 -60 L0 0" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
          <circle r="5" fill="#FFF6C8" />
        </g>
      </Group>
      <Group x={800} y={300} className="ufo-drift">
        <g className="bob">
          <ellipse cx="0" cy="0" rx="70" ry="20" fill="#B9C4D8" />
          <path d="M-40 -8 A40 30 0 0 1 40 -8 Z" fill="#9BE38A" opacity="0.9" />
          {[-40, 0, 40].map((x) => (
            <circle key={x} cx={x} cy="4" r="5" fill="#FFD166" />
          ))}
        </g>
      </Group>
    </>
  ),
  near: () => (
    <>
      <Rock x={360} y={936} s={0.8} fill="#A7ADBD" light="#C7CCD8" />
      <Rock x={1520} y={936} s={0.6} fill="#A7ADBD" light="#C7CCD8" />
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#C9CCD6" />
      <path d="M0 0 H1600 V22 Q800 38 0 22 Z" fill="#DADDE5" />
      {[
        [260, 110, 90, 26],
        [760, 170, 110, 32],
        [1200, 90, 70, 22],
        [1480, 200, 90, 26],
      ].map(([x, y, rx, ry]) => (
        <g key={`${x}-${y}`}>
          <ellipse cx={x} cy={y - 6} rx={rx} ry={ry} fill="#E3E6EC" />
          <ellipse cx={x} cy={y} rx={rx - 10} ry={ry - 8} fill="#A9AEBD" />
        </g>
      ))}
      <path d="M0 264 V212 Q800 190 1600 212 V264 Z" fill="#B7BBC7" />
    </>
  ),
  fore: () => (
    <>
      <path d="M0 120 V70 Q300 46 600 74 T1200 70 T1600 64 V120 Z" fill="#B7BBC7" />
      <Rock x={180} y={110} s={0.6} fill="#A7ADBD" light="#C7CCD8" />
      <Rock x={1400} y={112} s={0.5} fill="#A7ADBD" light="#C7CCD8" />
    </>
  ),
};
