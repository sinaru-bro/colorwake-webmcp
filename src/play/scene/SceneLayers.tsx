import type { PlaceId, Scene, TimeId } from "../../state/types";
import "./scene.css";

export const SCENE_W = 1600;
export const SCENE_H = 1200;
export const HORIZON_Y = 936;

const SKY: Record<TimeId, { top: string; bottom: string }> = {
  day: { top: "#BFE6FF", bottom: "#EAF7FF" },
  night: { top: "#0F1C3F", bottom: "#2B3A6B" },
};
const NEUTRAL_SKY = { top: "#EAF2F8", bottom: "#FDFBF5" };

const GROUND: Record<PlaceId, string> = {
  blank: "#F1E7D2",
  home: "#9CCB6B",
  sea: "#E8D8A8",
  sky: "#F7FBFF",
  playground: "#B7D98A",
  park: "#A9D687",
  mountain: "#8FB36A",
};

function Cloud({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#FFFFFF" opacity="0.92">
      <ellipse cx="0" cy="0" rx="90" ry="46" />
      <ellipse cx="-60" cy="12" rx="60" ry="36" />
      <ellipse cx="66" cy="14" rx="66" ry="38" />
    </g>
  );
}

function Place({ place, time }: { place: PlaceId | null; time: TimeId | null }) {
  const dim = time === "night" ? 0.7 : 1;
  const style = { filter: `brightness(${dim})` };
  switch (place) {
    case "home":
      return (
        <g style={style}>
          <ellipse cx="800" cy="1080" rx="1100" ry="260" fill={GROUND.home} />
          <rect x="220" y="560" width="360" height="376" fill="#F5D7A1" stroke="#2B2B2B" strokeWidth="8" />
          <path
            d="M180 580 L400 380 L620 580 Z"
            fill="#D9534F"
            stroke="#2B2B2B"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <rect x="330" y="760" width="110" height="176" fill="#8B5A2B" stroke="#2B2B2B" strokeWidth="8" />
          <rect x="470" y="640" width="80" height="80" fill="#BFE6FF" stroke="#2B2B2B" strokeWidth="8" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect
              key={i}
              x={760 + i * 110}
              y="820"
              width="30"
              height="116"
              fill="#FFFFFF"
              stroke="#2B2B2B"
              strokeWidth="6"
            />
          ))}
          <rect x="740" y="860" width="770" height="22" fill="#FFFFFF" stroke="#2B2B2B" strokeWidth="6" />
        </g>
      );
    case "sea":
      return (
        <g style={style}>
          <ellipse cx="800" cy="1120" rx="1200" ry="300" fill={GROUND.sea} />
          {[300, 700, 1200].map((x, i) => (
            <path
              key={i}
              d={`M${x} 936 q40 -120 0 -240 q-40 -120 0 -240`}
              fill="none"
              stroke="#3E9F5A"
              strokeWidth="18"
              strokeLinecap="round"
              className="sea-weed"
              style={{ animationDelay: `${i * 0.7}s` }}
            />
          ))}
          <rect x="0" y="0" width={SCENE_W} height={SCENE_H} fill="#2F80ED" opacity="0.28" />
          {[200, 520, 900, 1300].map((x, i) => (
            <path
              key={i}
              d={`M${x} 0 L${x + 120} 0 L${x + 40} 936 L${x - 10} 936 Z`}
              fill="#FFFFFF"
              opacity="0.07"
            />
          ))}
        </g>
      );
    case "sky":
      return (
        <g style={style}>
          <Cloud x={260} y={990} s={2.2} />
          <Cloud x={820} y={1010} s={2.6} />
          <Cloud x={1380} y={990} s={2.2} />
          <Cloud x={1150} y={300} s={0.9} />
          <Cloud x={400} y={220} s={0.7} />
        </g>
      );
    case "playground":
      return (
        <g style={style}>
          <ellipse cx="800" cy="1080" rx="1100" ry="260" fill={GROUND.playground} />
          <path
            d="M300 936 L420 560 L540 936"
            fill="none"
            stroke="#F2A71B"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path d="M540 936 L1000 700" fill="none" stroke="#D9534F" strokeWidth="26" strokeLinecap="round" />
          <rect x="1150" y="560" width="20" height="376" fill="#2B2B2B" />
          <rect x="1450" y="560" width="20" height="376" fill="#2B2B2B" />
          <rect x="1150" y="540" width="320" height="20" fill="#2B2B2B" />
          <rect x="1280" y="860" width="80" height="16" fill="#F2A71B" />
        </g>
      );
    case "park":
      return (
        <g style={style}>
          <ellipse cx="800" cy="1080" rx="1100" ry="260" fill={GROUND.park} />
          <circle cx="1150" cy="560" r="300" fill="none" stroke="#2B2B2B" strokeWidth="16" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <g key={deg} transform={`rotate(${deg} 1150 560)`}>
              <line x1="1150" y1="560" x2="1150" y2="260" stroke="#2B2B2B" strokeWidth="10" />
              <rect
                x="1120"
                y="230"
                width="60"
                height="50"
                rx="10"
                fill="#F27DA8"
                stroke="#2B2B2B"
                strokeWidth="6"
              />
            </g>
          ))}
          <path d="M1150 560 L1000 936 M1150 560 L1300 936" stroke="#2B2B2B" strokeWidth="14" />
        </g>
      );
    case "mountain":
      return (
        <g style={style}>
          <path
            d="M-100 936 L400 380 L700 700 L1000 300 L1400 760 L1700 936 Z"
            fill="#7FA35A"
            stroke="#2B2B2B"
            strokeWidth="8"
          />
          <path d="M1000 300 L1080 420 L920 420 Z" fill="#FFFFFF" />
          <path d="M400 380 L470 480 L330 480 Z" fill="#FFFFFF" />
          <ellipse cx="800" cy="1080" rx="1100" ry="260" fill={GROUND.mountain} />
        </g>
      );
    case "blank":
      return <ellipse cx="800" cy="1100" rx="1200" ry="280" fill={GROUND.blank} />;
    default:
      return (
        <g>
          <rect x="0" y={HORIZON_Y} width={SCENE_W} height={SCENE_H - HORIZON_Y} fill="#F3EBDA" />
          <line x1="0" y1={HORIZON_Y} x2={SCENE_W} y2={HORIZON_Y} stroke="#D9C9A8" strokeWidth="4" />
        </g>
      );
  }
}

export function BackLayers({ scene }: { scene: Scene }) {
  const sky = scene.time ? SKY[scene.time] : NEUTRAL_SKY;
  const stars = scene.time === "night" ? [120, 340, 560, 780, 1000, 1220, 1440, 260, 900, 1300] : [];
  return (
    <svg
      className="scene-layer"
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="scene-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
      </defs>
      <g key={scene.time ?? "unset"} className="layer-in">
        <rect width={SCENE_W} height={SCENE_H} fill="url(#scene-sky)" />
        {scene.time === "day" && <circle cx="1380" cy="180" r="90" fill="#FFD60A" />}
        {scene.time === "night" && (
          <>
            <circle cx="1380" cy="180" r="80" fill="#FFF3B0" />
            {stars.map((x, i) => (
              <circle
                key={i}
                cx={x}
                cy={80 + ((i * 137) % 400)}
                r={i % 3 === 0 ? 5 : 3}
                fill="#FFFFFF"
                opacity="0.9"
              />
            ))}
          </>
        )}
      </g>
      <g key={scene.place ?? "unset"} className="layer-in">
        <Place place={scene.place} time={scene.time} />
      </g>
    </svg>
  );
}

const PARTICLES: Record<"rain" | "snow" | "cloudy", number> = {
  rain: 60,
  snow: 40,
  cloudy: 5,
};

export function WeatherLayer({ scene }: { scene: Scene }) {
  const w = scene.weather;
  if (w === null) return null;
  if (w === "clear") {
    return (
      <svg
        key={w}
        className="scene-layer layer-in"
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {scene.time === "day" &&
          [0, 30, 60, 90, 120, 150].map((deg) => (
            <line
              key={deg}
              x1="1380"
              y1="180"
              x2={1380 + Math.cos((deg * Math.PI) / 180) * 1800}
              y2={180 + Math.sin((deg * Math.PI) / 180) * 1800}
              stroke="#FFF3B0"
              strokeWidth="60"
              opacity="0.18"
              className="sun-ray"
            />
          ))}
      </svg>
    );
  }
  if (w === "cloudy") {
    return (
      <svg
        key={w}
        className="scene-layer layer-in"
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width={SCENE_W} height={SCENE_H} fill="#000000" opacity="0.12" />
        {Array.from({ length: PARTICLES.cloudy }, (_, i) => (
          <g
            key={i}
            className="cloud-drift"
            style={{ animationDelay: `${-i * 7}s`, animationDuration: `${34 + i * 5}s` }}
          >
            <Cloud x={-300} y={120 + i * 110} s={1 + (i % 3) * 0.4} />
          </g>
        ))}
      </svg>
    );
  }
  if (w === "thunder") {
    return (
      <svg
        key={w}
        className="scene-layer layer-in"
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width={SCENE_W} height={SCENE_H} fill="#000000" opacity="0.28" />
        <rect width={SCENE_W} height={SCENE_H} fill="#FFFFFF" className="lightning" />
        <path
          d="M700 120 L620 420 L740 400 L640 760"
          fill="none"
          stroke="#FFF3B0"
          strokeWidth="14"
          strokeLinejoin="round"
          className="lightning-bolt"
        />
      </svg>
    );
  }
  if (w === "wind") {
    return (
      <svg
        key={w}
        className="scene-layer layer-in"
        viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d={`M-200 ${140 + i * 80} q120 -40 240 0 t240 0 t240 0`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="6"
            opacity="0.5"
            className="wind-line"
            style={{ animationDelay: `${-i * 0.9}s` }}
          />
        ))}
      </svg>
    );
  }
  const count = PARTICLES[w];
  return (
    <svg
      key={w}
      className="scene-layer layer-in"
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => {
        const x = (i * 263) % SCENE_W;
        const delay = `${-((i * 37) % 30) / 10}s`;
        return w === "rain" ? (
          <line
            key={i}
            x1={x}
            y1={-60}
            x2={x - 14}
            y2={-10}
            stroke="#6FA8DC"
            strokeWidth="5"
            strokeLinecap="round"
            className="drop"
            style={{ animationDelay: delay }}
          />
        ) : (
          <circle
            key={i}
            cx={x}
            cy={-20}
            r={6 + (i % 3) * 3}
            fill="#FFFFFF"
            opacity="0.9"
            className="flake"
            style={{ animationDelay: delay, animationDuration: `${6 + (i % 4)}s` }}
          />
        );
      })}
    </svg>
  );
}
