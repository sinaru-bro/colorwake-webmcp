import type { ActiveEffect, Character, Intensity } from "../../state/types";
import "./effects.css";

const COUNT: Record<Intensity, number> = { light: 6, normal: 12, heavy: 22 };

interface Props {
  effects: ActiveEffect[];
  characters: Character[];
}

function origin(effect: ActiveEffect, characters: Character[]): { x: number; y: number; spread: number } {
  const target = effect.target ? characters.find((c) => c.id === effect.target) : undefined;
  if (target) return { x: target.position.x * 100, y: (target.position.y - 0.25) * 100, spread: 8 };
  return { x: 50, y: 95, spread: 46 };
}

export function EffectsLayer({ effects, characters }: Props) {
  return (
    <div className="effects-layer" aria-hidden="true">
      {effects.map((effect, ei) => {
        const n = COUNT[effect.intensity];
        const o = origin(effect, characters);
        return Array.from({ length: n }, (_, i) => {
          const dx = ((i * 71) % (o.spread * 2)) - o.spread;
          const delay = `${-((i * 53) % 40) / 10}s`;
          const key = `${effect.id}-${effect.target ?? "scene"}-${ei}-${i}`;
          if (effect.id === "stars") {
            return (
              <span
                key={key}
                className="fx fx-star"
                style={{ left: `${(i * 89) % 100}%`, top: `${4 + ((i * 41) % 38)}%`, animationDelay: delay }}
              >
                ✦
              </span>
            );
          }
          return (
            <span
              key={key}
              className={`fx ${effect.id === "hearts" ? "fx-heart" : "fx-bubble"}`}
              style={{
                left: `${o.x + dx}%`,
                top: `${o.y}%`,
                animationDelay: delay,
                fontSize: `${14 + (i % 3) * 8}px`,
              }}
            >
              {effect.id === "hearts" ? "♥" : "○"}
            </span>
          );
        });
      })}
    </div>
  );
}
