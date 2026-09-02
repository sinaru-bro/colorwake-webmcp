import { timeById } from "../../content/scenes";
import type { Scene } from "../../state/types";
import { Star4 } from "./shapes";

const NEUTRAL = { top: "#EAF2F8", horizon: "#FDFBF5" };
const SUN = { x: 1340, y: 190 };
const MOON = { x: 270, y: 200 };
const STARS = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 331 + 40) % 1600,
  y: 40 + ((i * 197) % 640),
  big: i % 4 === 0,
  r: 2 + (i % 3),
}));

function Sun({ rays }: { rays: boolean }) {
  return (
    <g>
      <circle cx={SUN.x} cy={SUN.y} r="170" fill="#FFE680" opacity="0.28" className="sun-halo" />
      {rays && (
        <g className="sun-rays layer-in">
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d={`M${SUN.x} ${SUN.y - 118} l-16 -64 h32 Z`}
              fill="#FFE9A0"
              opacity="0.9"
              transform={`rotate(${i * 30} ${SUN.x} ${SUN.y})`}
            />
          ))}
        </g>
      )}
      <circle cx={SUN.x} cy={SUN.y} r="112" fill="#FFE680" opacity="0.55" />
      <circle cx={SUN.x} cy={SUN.y} r="88" fill="#FFD23F" />
      <circle cx={SUN.x - 28} cy={SUN.y - 30} r="26" fill="#FFE27A" />
    </g>
  );
}

function Moon() {
  return (
    <g>
      <defs>
        <mask id="moon-cut">
          <rect width="1600" height="1200" fill="#FFFFFF" />
          <circle cx={MOON.x + 34} cy={MOON.y - 26} r="72" fill="#000000" />
        </mask>
      </defs>
      <circle cx={MOON.x} cy={MOON.y} r="130" fill="#FFF1B8" opacity="0.14" />
      <g mask="url(#moon-cut)">
        <circle cx={MOON.x} cy={MOON.y} r="84" fill="#FFF1B8" />
        <circle cx={MOON.x - 30} cy={MOON.y + 10} r="11" fill="#F1DF98" />
        <circle cx={MOON.x - 6} cy={MOON.y + 48} r="8" fill="#F1DF98" />
        <circle cx={MOON.x - 44} cy={MOON.y - 32} r="6" fill="#F1DF98" />
      </g>
    </g>
  );
}

function Stars() {
  return (
    <g>
      {STARS.map((s, i) => {
        const style = { animationDelay: `${-((i * 0.7) % 3)}s` };
        return s.big ? (
          <Star4 key={i} x={s.x} y={s.y} s={0.9 + (i % 3) * 0.3} className="twinkle" style={style} />
        ) : (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#FFFFFF"
            opacity="0.85"
            className={i % 3 === 0 ? "twinkle" : undefined}
            style={style}
          />
        );
      })}
    </g>
  );
}

export function SkyLayer({ scene }: { scene: Scene }) {
  const g = (scene.time ? timeById(scene.time)?.gradient : undefined) ?? NEUTRAL;
  return (
    <div
      key={scene.time ?? "unset"}
      className="sky layer-in"
      style={{
        background: `linear-gradient(180deg, ${g.top} 0%, ${g.horizon} var(--horizon), ${g.horizon} 100%)`,
      }}
    >
      {scene.time && (
        <svg
          className="scene-layer"
          viewBox="0 0 1600 1200"
          preserveAspectRatio="xMidYMin slice"
          aria-hidden="true"
        >
          {scene.time === "night" ? (
            <>
              <Stars />
              <Moon />
            </>
          ) : (
            <Sun rays={scene.weather === "clear"} />
          )}
        </svg>
      )}
    </div>
  );
}
