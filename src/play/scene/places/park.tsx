import { CarouselHorse, Group, Tuft } from "../shapes";
import type { PlaceArt } from "./types";

const PASTEL = ["#FFD166", "#7BD3EA", "#F5A3C0", "#9BE38A"];
const WHEEL = { x: 1120, y: 500, r: 300 };
const SEATS = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return { x: Math.cos(a) * WHEEL.r, y: Math.sin(a) * WHEEL.r, c: PASTEL[i % 4] };
});
const FLAGS = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  const u = 1 - t;
  return {
    x: u * u * -20 + 2 * u * t * 800 + t * t * 1620,
    y: u * u * 150 + 2 * u * t * 290 + t * t * 150,
    c: PASTEL[i % 4],
  };
});

export const park: PlaceArt = {
  far: () => (
    <>
      <path d="M660 936 L740 800 L820 936 Z" fill="#F5A3C0" />
      <path d="M712 936 L740 800 L768 936 Z" fill="#FFFFFF" opacity="0.8" />
      <path d="M840 936 L900 830 L960 936 Z" fill="#7BD3EA" />
      <path d="M880 936 L900 830 L920 936 Z" fill="#FFFFFF" opacity="0.8" />
      <g stroke="#D97AA0" strokeWidth="16" strokeLinecap="round">
        <path d={`M${WHEEL.x} ${WHEEL.y} L980 936 M${WHEEL.x} ${WHEEL.y} L1260 936`} />
      </g>
      <rect x="940" y="920" width="360" height="16" rx="8" fill="#D97AA0" />
      <Group x={WHEEL.x} y={WHEEL.y} className="wheel">
        <circle r={WHEEL.r} fill="none" stroke="#F28CB0" strokeWidth="14" />
        <circle r={WHEEL.r - 70} fill="none" stroke="#F6B7CE" strokeWidth="6" />
        {SEATS.map((s, i) => (
          <path key={i} d={`M0 0 L${s.x} ${s.y}`} stroke="#F6B7CE" strokeWidth="8" />
        ))}
        {SEATS.map((s, i) => (
          <Group key={i} x={s.x} y={s.y} className="counter">
            <path d="M0 0 V14" stroke="#D97AA0" strokeWidth="6" />
            <rect x="-28" y="14" width="56" height="46" rx="14" fill={s.c} />
          </Group>
        ))}
        <circle r="34" fill="#F28CB0" />
        <circle r="14" fill="#FFFFFF" />
      </Group>
    </>
  ),
  near: () => (
    <>
      <path d="M-20 150 Q800 290 1620 150" stroke="#8B5A2B" strokeWidth="4" fill="none" />
      {FLAGS.map((f, i) => (
        <Group key={i} x={f.x} y={f.y} className="flutter" style={{ animationDelay: `${-i * 0.23}s` }}>
          <path d="M-18 0 H18 L0 40 Z" fill={f.c} />
        </Group>
      ))}
      <Group x={380} y={936}>
        {[-160, -60, 60, 160].map((x) => (
          <rect key={x} x={x - 6} y="-290" width="12" height="290" fill="#F6C85F" />
        ))}
        <CarouselHorse x={-100} y={-120} delay="0s" />
        <CarouselHorse x={110} y={-100} delay="-1.4s" />
        <ellipse cx="0" cy="0" rx="220" ry="32" fill="#E58AAB" />
        <ellipse cx="0" cy="-10" rx="220" ry="32" fill="#FFC9DA" />
        <path d="M-230 -290 L0 -470 L230 -290 Z" fill="#F28CB0" />
        <path d="M-140 -290 L0 -470 L-60 -290 Z" fill="#FFFFFF" opacity="0.85" />
        <path d="M60 -290 L0 -470 L140 -290 Z" fill="#FFFFFF" opacity="0.85" />
        {[-200, -120, -40, 40, 120, 200].map((x) => (
          <circle key={x} cx={x} cy="-290" r="22" fill="#F28CB0" />
        ))}
        <path d="M0 -470 V-540" stroke="#8B5A2B" strokeWidth="6" />
        <path d="M0 -544 L48 -528 L0 -512 Z" fill="#FFD166" />
      </Group>
      <Group x={1380} y={936}>
        <rect x="-90" y="-236" width="180" height="236" rx="10" fill="#FFF6E5" />
        <rect x="-70" y="-216" width="140" height="70" rx="8" fill="#7BD3EA" />
        <rect x="-90" y="-150" width="180" height="14" fill="#F5A3C0" />
        <path
          d="M-110 -246 H110 V-206 Q95 -190 80 -206 Q65 -190 50 -206 Q35 -190 20 -206 Q5 -190 -10 -206 Q-25 -190 -40 -206 Q-55 -190 -70 -206 Q-85 -190 -100 -206 L-110 -206 Z"
          fill="#E8735A"
        />
        {[-90, -50, -10, 30, 70].map((x) => (
          <rect key={x} x={x} y="-246" width="20" height="40" fill="#FFFFFF" opacity="0.8" />
        ))}
        <path
          d="M80 -236 L120 -380 M80 -236 L60 -400 M80 -236 L150 -420"
          stroke="#8B5A2B"
          strokeWidth="3"
          fill="none"
        />
        <Group x={0} y={0} className="bob">
          <ellipse cx="120" cy="-410" rx="30" ry="36" fill="#FFD166" />
          <ellipse cx="60" cy="-430" rx="30" ry="36" fill="#7BD3EA" />
          <ellipse cx="150" cy="-450" rx="30" ry="36" fill="#F5A3C0" />
        </Group>
      </Group>
    </>
  ),
  ground: () => (
    <>
      <rect width="1600" height="264" fill="#A9D687" />
      <path d="M0 0 H1600 V30 C1200 52 800 20 400 44 S100 30 0 40 Z" fill="#BFE09C" />
      <path d="M0 70 C400 50 800 90 1600 60 V150 C1200 170 600 130 0 160 Z" fill="#F1E6D2" />
      {[200, 460, 760, 1040, 1380].map((x, i) => (
        <circle key={x} cx={x} cy={90 + (i % 3) * 22} r="7" fill={PASTEL[i % 4]} />
      ))}
      {[120, 640, 1180, 1500].map((x, i) => (
        <Tuft key={x} x={x} y={210 + (i % 2) * 20} s={1.2} fill="#86C65C" />
      ))}
      <path d="M0 264 V212 Q800 180 1600 212 V264 Z" fill="#93C972" />
    </>
  ),
  fore: () => (
    <>
      <Group x={150} y={120}>
        <path d="M-40 -90 H40 L32 0 H-32 Z" fill="#E8735A" />
        {[-28, -4, 20].map((x) => (
          <rect key={x} x={x} y="-88" width="10" height="86" fill="#FFFFFF" opacity="0.85" />
        ))}
        {[-26, -6, 14, 30, -14, 6].map((x, i) => (
          <circle key={i} cx={x} cy={-96 - (i % 2) * 12} r="12" fill="#FFF6E5" />
        ))}
      </Group>
      <Tuft x={600} y={118} s={2} fill="#86C65C" />
      <Tuft x={1380} y={116} s={2} fill="#86C65C" />
    </>
  ),
  glow: () => (
    <>
      <Group x={WHEEL.x} y={WHEEL.y} className="wheel">
        {SEATS.map((s, i) => (
          <g key={i}>
            <circle cx={s.x} cy={s.y} r="24" fill={s.c} opacity="0.35" />
            <circle cx={s.x} cy={s.y} r="10" fill="#FFF6C8" />
          </g>
        ))}
        <circle r="40" fill="#FFF6C8" opacity="0.35" />
        <circle r="14" fill="#FFF6C8" />
      </Group>
      {[-200, -120, -40, 40, 120, 200].map((x) => (
        <circle key={x} cx={380 + x} cy="646" r="9" fill="#FFF6C8" />
      ))}
      <rect x="1310" y="720" width="140" height="70" rx="8" fill="#FFD866" />
    </>
  ),
};
