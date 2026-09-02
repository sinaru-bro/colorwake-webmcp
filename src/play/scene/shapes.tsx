import type { CSSProperties, ReactNode } from "react";

interface Placed {
  x: number;
  y: number;
  s?: number;
  className?: string;
  style?: CSSProperties;
}

/** Positions children; an animated class goes on an inner group so CSS transforms do not replace the placement. */
export function Group({ x, y, s = 1, className, style, children }: Placed & { children: ReactNode }) {
  const inner =
    className || style ? (
      <g className={className} style={style}>
        {children}
      </g>
    ) : (
      children
    );
  return <g transform={`translate(${x} ${y})${s === 1 ? "" : ` scale(${s})`}`}>{inner}</g>;
}

export function Cloud({
  fill = "#FFFFFF",
  shade = "#DCEBFA",
  ...at
}: Placed & { fill?: string; shade?: string }) {
  return (
    <Group {...at}>
      <ellipse cx="0" cy="12" rx="92" ry="44" fill={shade} />
      <ellipse cx="-62" cy="22" rx="58" ry="34" fill={shade} />
      <ellipse cx="66" cy="24" rx="62" ry="36" fill={shade} />
      <ellipse cx="0" cy="0" rx="92" ry="44" fill={fill} />
      <ellipse cx="-62" cy="12" rx="58" ry="34" fill={fill} />
      <ellipse cx="66" cy="14" rx="62" ry="36" fill={fill} />
    </Group>
  );
}

export function Tree({
  leaf = "#6FBF63",
  light = "#8ED07A",
  trunk = "#8B5A2B",
  ...at
}: Placed & { leaf?: string; light?: string; trunk?: string }) {
  return (
    <Group {...at}>
      <rect x="-14" y="-130" width="28" height="130" rx="8" fill={trunk} />
      <circle cx="-60" cy="-150" r="62" fill={leaf} />
      <circle cx="60" cy="-150" r="62" fill={leaf} />
      <circle cx="0" cy="-196" r="88" fill={leaf} />
      <circle cx="-26" cy="-210" r="50" fill={light} />
    </Group>
  );
}

export function Pine({
  dark = "#3F8F55",
  light = "#57A86A",
  trunk = "#8B5A2B",
  ...at
}: Placed & { dark?: string; light?: string; trunk?: string }) {
  return (
    <Group {...at}>
      <rect x="-12" y="-70" width="24" height="70" rx="6" fill={trunk} />
      <path d="M0 -200 L118 -50 L-118 -50 Z" fill={dark} />
      <path d="M0 -270 L96 -130 L-96 -130 Z" fill={light} />
      <path d="M0 -330 L70 -220 L-70 -220 Z" fill={dark} />
    </Group>
  );
}

export function Palm({
  leaf = "#4FB06A",
  trunk = "#B0804C",
  ...at
}: Placed & { leaf?: string; trunk?: string }) {
  return (
    <Group {...at}>
      <path
        d="M0 0 C-10 -120 10 -240 40 -340"
        stroke={trunk}
        strokeWidth="26"
        strokeLinecap="round"
        fill="none"
      />
      <g fill={leaf}>
        <path d="M40 -340 C-40 -380 -120 -360 -170 -300 C-90 -320 -20 -320 40 -340 Z" />
        <path d="M40 -340 C120 -390 200 -370 250 -310 C170 -330 100 -320 40 -340 Z" />
        <path d="M40 -340 C0 -420 20 -480 60 -520 C50 -450 60 -400 40 -340 Z" />
        <path d="M40 -340 C-60 -300 -110 -240 -120 -170 C-70 -230 -20 -280 40 -340 Z" />
        <path d="M40 -340 C140 -300 190 -240 200 -170 C150 -230 100 -280 40 -340 Z" />
      </g>
      <circle cx="30" cy="-330" r="14" fill="#8B5A2B" />
      <circle cx="56" cy="-326" r="14" fill="#8B5A2B" />
    </Group>
  );
}

export function Bush({
  fill = "#7DBF57",
  light = "#9CD46F",
  ...at
}: Placed & { fill?: string; light?: string }) {
  return (
    <Group {...at}>
      <circle cx="-44" cy="-30" r="40" fill={fill} />
      <circle cx="44" cy="-30" r="40" fill={fill} />
      <circle cx="0" cy="-48" r="50" fill={fill} />
      <circle cx="-10" cy="-58" r="26" fill={light} />
    </Group>
  );
}

export function Fern({ fill = "#4FA36B", ...at }: Placed & { fill?: string }) {
  return (
    <Group {...at}>
      <g fill={fill}>
        <path d="M0 0 C-20 -60 -90 -90 -150 -80 C-100 -60 -60 -40 0 0 Z" />
        <path d="M0 0 C20 -60 90 -90 150 -80 C100 -60 60 -40 0 0 Z" />
        <path d="M0 0 C-30 -80 -40 -140 -20 -190 C-10 -140 0 -80 0 0 Z" />
        <path d="M0 0 C30 -80 40 -140 20 -190 C10 -140 0 -80 0 0 Z" />
        <path d="M0 0 C-8 -90 -4 -160 0 -220 C4 -160 8 -90 0 0 Z" />
      </g>
    </Group>
  );
}

export function Flower({
  petal = "#F5A3C0",
  stem = "#5FAE4B",
  ...at
}: Placed & { petal?: string; stem?: string }) {
  return (
    <Group {...at}>
      <path d="M0 0 L0 -26" stroke={stem} strokeWidth="4" strokeLinecap="round" />
      <circle cx="0" cy="-32" r="10" fill={petal} />
      <circle cx="0" cy="-32" r="4" fill="#FFE27A" />
    </Group>
  );
}

export function Tuft({ fill = "#7DBF57", ...at }: Placed & { fill?: string }) {
  return (
    <Group {...at}>
      <path
        d="M-14 0 L-10 -22 M0 0 L0 -30 M14 0 L10 -22"
        stroke={fill}
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </Group>
  );
}

export function Rock({
  fill = "#9AA7BF",
  light = "#B7C2D6",
  ...at
}: Placed & { fill?: string; light?: string }) {
  return (
    <Group {...at}>
      <path d="M-60 0 C-70 -40 -40 -70 0 -66 C40 -70 70 -40 60 0 Z" fill={fill} />
      <path d="M-30 -30 C-20 -52 10 -58 30 -44 C10 -46 -10 -40 -30 -30 Z" fill={light} />
    </Group>
  );
}

export function Bird({ stroke = "#6B7A99", ...at }: Placed & { stroke?: string }) {
  return (
    <Group {...at}>
      <path
        d="M-22 0 q11 -12 22 0 q11 -12 22 0"
        fill="none"
        stroke={stroke}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </Group>
  );
}

export function Star4({ fill = "#FFFFFF", ...at }: Placed & { fill?: string }) {
  return (
    <Group {...at}>
      <path d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12 Z" fill={fill} />
    </Group>
  );
}

export function Window({
  x,
  y,
  w = 96,
  h = 96,
  glass = "#BFE6FF",
  frame = "#FFFFFF",
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  glass?: string;
  frame?: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill={glass} />
      <rect x={x} y={y} width={w} height={h} rx="6" fill="none" stroke={frame} strokeWidth="8" />
      <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} stroke={frame} strokeWidth="6" />
    </g>
  );
}

export function Seaweed({ x, s = 1, delay = 0 }: { x: number; s?: number; delay?: number }) {
  return (
    <Group x={x} y={936} s={s} className="sway" style={{ animationDelay: `${delay}s` }}>
      <path
        d="M0 0 C-40 -100 40 -200 0 -300 C-30 -360 20 -400 0 -430"
        stroke="#3FA36A"
        strokeWidth="28"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M-4 0 C-44 -100 36 -200 -4 -300"
        stroke="#6BC48B"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 0 C84 -80 34 -160 64 -250"
        stroke="#3FA36A"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />
    </Group>
  );
}

export function Bubbles({ n, y, salt }: { n: number; y: number; salt: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={(i * salt + 90) % 1600}
          cy={y}
          r={5 + (i % 3) * 3}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          opacity="0.6"
          className="bubble"
          style={{ animationDelay: `${-i * 1.3}s`, animationDuration: `${9 + (i % 4) * 2}s` }}
        />
      ))}
    </>
  );
}

export function CarouselHorse({ x, y, delay }: { x: number; y: number; delay: string }) {
  return (
    <Group x={x} y={y} className="bob" style={{ animationDelay: delay }}>
      <rect x="-4" y="-160" width="8" height="200" fill="#F6C85F" />
      <rect x="-30" y="0" width="12" height="40" rx="4" fill="#FFFFFF" />
      <rect x="18" y="0" width="12" height="40" rx="4" fill="#FFFFFF" />
      <ellipse cx="0" cy="0" rx="46" ry="24" fill="#FFFFFF" />
      <circle cx="44" cy="-24" r="18" fill="#FFFFFF" />
      <ellipse cx="0" cy="-16" rx="16" ry="8" fill="#F28CB0" />
      <circle cx="50" cy="-28" r="3" fill="#3B3B3B" />
    </Group>
  );
}

export function Duck({ x, y, delay }: { x: number; y: number; delay: string }) {
  return (
    <Group x={x} y={y} className="bob" style={{ animationDelay: delay }}>
      <ellipse cx="0" cy="0" rx="26" ry="16" fill="#FFD166" />
      <circle cx="20" cy="-18" r="12" fill="#FFD166" />
      <path d="M30 -18 L44 -14 L30 -10 Z" fill="#F6A45A" />
      <circle cx="24" cy="-20" r="2.5" fill="#3B3B3B" />
    </Group>
  );
}
