import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { weatherById } from "../../content/scenes";
import type { Scene } from "../../state/types";
import { Cloud } from "./shapes";

const VIEW = "0 0 1600 1200";
const LEAF = ["#9BE38A", "#FFD166", "#F6A45A", "#E8735A"];
const BOLTS = [520, 900, 1250];

const at = (i: number, salt: number, span: number) => (i * salt + 131) % span;
const frac = (i: number, step: number) => (i * step) % 1;

function Sheet({ children }: { children: ReactNode }) {
  return (
    <svg
      className="scene-layer layer-in"
      viewBox={VIEW}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Rain({ count, cycleMs }: { count: number; cycleMs: number }) {
  return (
    <>
      <Sheet>
        {Array.from({ length: count }, (_, i) => {
          const near = i % 2 === 0;
          const x = at(i, 613, 1600);
          const dur = (near ? cycleMs : cycleMs * 1.5) / 1000;
          return (
            <line
              key={i}
              x1={x}
              y1={-90}
              x2={x - (near ? 10 : 6)}
              y2={near ? -20 : -50}
              stroke={near ? "#8CC4F0" : "#B9DBF5"}
              strokeWidth={near ? 5 : 3}
              strokeLinecap="round"
              opacity={near ? 0.85 : 0.55}
              className="drop"
              style={{ animationDuration: `${dur}s`, animationDelay: `${-frac(i, 0.137) * dur}s` }}
            />
          );
        })}
      </Sheet>
      <svg
        className="scene-band band--splash layer-in"
        viewBox="0 0 1600 40"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
      >
        {Array.from({ length: 16 }, (_, i) => {
          const x = at(i, 733, 1600);
          const delay = `${-frac(i, 0.29) * 0.9}s`;
          return (
            <g key={i}>
              <ellipse
                cx={x}
                cy={22}
                rx={12}
                ry={4}
                fill="none"
                stroke="#DCEEFB"
                strokeWidth={3}
                className="splash"
                style={{ animationDelay: delay }}
              />
              <circle
                cx={x - 6}
                cy={20}
                r={2.5}
                fill="#DCEEFB"
                className="splash-dot"
                style={{ animationDelay: delay }}
              />
              <circle
                cx={x + 7}
                cy={20}
                r={2}
                fill="#DCEEFB"
                className="splash-dot"
                style={{ animationDelay: delay, animationDuration: "0.8s" }}
              />
            </g>
          );
        })}
      </svg>
    </>
  );
}

function Snow({ count, cycleMs }: { count: number; cycleMs: number }) {
  return (
    <Sheet>
      {Array.from({ length: count }, (_, i) => {
        const depth = i % 3;
        const x = at(i, 613, 1600);
        const dur = (cycleMs / 1000) * (depth === 0 ? 1.6 : depth === 1 ? 1.25 : 1);
        const style = { animationDuration: `${dur}s`, animationDelay: `${-frac(i, 0.173) * dur}s` };
        if (depth === 2) {
          return (
            <g key={i} className="flake" style={style}>
              <path
                d={`M${x} -34 v28 M${x - 12} -27 l24 14 M${x - 12} -13 l24 -14`}
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.95"
              />
            </g>
          );
        }
        return (
          <circle
            key={i}
            cx={x}
            cy={-20}
            r={depth === 0 ? 4 : 7}
            fill="#FFFFFF"
            opacity={depth === 0 ? 0.55 : 0.85}
            className="flake"
            style={style}
          />
        );
      })}
    </Sheet>
  );
}

function Clouds({ count, cycleMs }: { count: number; cycleMs: number }) {
  return (
    <Sheet>
      {Array.from({ length: count }, (_, i) => {
        const front = i % 2 === 1;
        const dur = (cycleMs / 1000) * (front ? 0.8 : 1.3);
        return (
          <g
            key={i}
            className="drift"
            style={{ animationDuration: `${dur}s`, animationDelay: `${-(i / count) * dur}s` }}
          >
            <Cloud
              x={0}
              y={120 + at(i, 257, 360)}
              s={front ? 1.5 : 1}
              fill={front ? "#E8EDF3" : "#F3F6FA"}
              shade={front ? "#C5CFDB" : "#D8E0EA"}
            />
          </g>
        );
      })}
    </Sheet>
  );
}

function Wind({ count, cycleMs }: { count: number; cycleMs: number }) {
  return (
    <Sheet>
      {[0, 1, 2].map((i) => (
        <path
          key={`w${i}`}
          d={`M-300 ${200 + i * 260} q120 -40 240 0 t240 0 t240 0`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.5"
          className="wisp"
          style={{ animationDelay: `${-i * 1.1}s` }}
        />
      ))}
      {Array.from({ length: count }, (_, i) => {
        const dur = (cycleMs / 1000) * (1 + (i % 4) * 0.25);
        return (
          <g
            key={i}
            className="leaf"
            style={{ animationDuration: `${dur}s`, animationDelay: `${-frac(i, 0.211) * dur}s` }}
          >
            <path
              d="M0 0 C6 -14 18 -14 24 0 C18 14 6 14 0 0 Z"
              fill={LEAF[i % 4]}
              transform={`translate(-200 ${at(i, 449, 900) + 60}) scale(${1 + (i % 3) * 0.3})`}
            />
          </g>
        );
      })}
    </Sheet>
  );
}

function Lightning({
  minGapMs,
  maxGapMs,
  durationMs,
}: {
  minGapMs: number;
  maxGapMs: number;
  durationMs: number;
}) {
  const [bolt, setBolt] = useState<{ x: number; n: number } | null>(null);
  useEffect(() => {
    let alive = true;
    let n = 0;
    let timer: ReturnType<typeof setTimeout>;
    const strike = (gap: number) => {
      timer = setTimeout(() => {
        if (!alive) return;
        n += 1;
        setBolt({ x: BOLTS[n % BOLTS.length], n });
        timer = setTimeout(() => {
          if (!alive) return;
          setBolt(null);
          strike(minGapMs + Math.random() * (maxGapMs - minGapMs));
        }, durationMs + 260);
      }, gap);
    };
    strike(1200);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [minGapMs, maxGapMs, durationMs]);
  if (!bolt) return null;
  const d = `M${bolt.x} -20 L${bolt.x - 70} 330 L${bolt.x + 10} 310 L${bolt.x - 90} 700`;
  return (
    <svg
      key={bolt.n}
      className="scene-layer"
      viewBox={VIEW}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ "--flash-ms": `${durationMs}ms` } as CSSProperties}
    >
      <rect width="1600" height="1200" fill="#FFFFFF" className="flash" />
      <path
        d={d}
        fill="none"
        stroke="#FFF6C8"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
        className="bolt"
      />
      <path
        d={d}
        fill="none"
        stroke="#FFF6C8"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="bolt"
      />
    </svg>
  );
}

export function WeatherLayer({ scene }: { scene: Scene }) {
  const w = scene.weather;
  const def = w ? weatherById(w) : undefined;
  if (!w || !def) return null;
  const dim = Math.max(0, 1 - def.brightness) * 0.85;
  const p = def.particle;
  return (
    <div key={w} className="weather">
      {dim > 0 && (
        <div className="scene-dim layer-in" style={{ background: `rgba(30, 42, 68, ${dim.toFixed(3)})` }} />
      )}
      {p.kind === "drops" && <Rain count={p.count} cycleMs={p.cycleMs} />}
      {p.kind === "flakes" && <Snow count={p.count} cycleMs={p.cycleMs} />}
      {p.kind === "clouds" && <Clouds count={p.count} cycleMs={p.cycleMs} />}
      {p.kind === "leaves" && <Wind count={p.count} cycleMs={p.cycleMs} />}
      {def.flash && <Lightning {...def.flash} />}
    </div>
  );
}
