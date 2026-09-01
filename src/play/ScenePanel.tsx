import { EFFECTS, MAX_EFFECTS } from "../content/effects";
import { PLACES, TIMES, WEATHERS } from "../content/scenes";
import { arrangeScene, setEffect } from "../state/actions";
import { useStudio } from "../state/store";
import type { EffectId, PlaceId, TimeId, WeatherId } from "../state/types";

const ICONS: Record<string, string> = {
  blank: "▢",
  home: "🏠",
  sea: "🌊",
  sky: "🎈",
  playground: "🛝",
  park: "🎡",
  mountain: "⛰️",
  day: "☀️",
  night: "🌙",
  clear: "🌤",
  rain: "🌧",
  snow: "❄️",
  cloudy: "☁️",
  wind: "🌬",
  thunder: "⚡",
  stars: "✦",
  hearts: "♥",
  bubbles: "○",
};
const SHORT_LABELS: Record<string, string> = { park: "Park", thunder: "Thunder" };

function Chip({
  id,
  label,
  on,
  disabled,
  onClick,
}: {
  id: string;
  label: string;
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`chip${on ? " chip--on" : ""}`}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
    >
      <span aria-hidden="true">{ICONS[id] ?? "•"}</span>
      <small>{SHORT_LABELS[id] ?? label}</small>
    </button>
  );
}

export function ScenePanel() {
  const scene = useStudio((s) => s.scene);
  const sceneEffects = scene.effects.filter((e) => !e.target);
  const full = scene.effects.length >= MAX_EFFECTS;
  return (
    <>
      <section className="side__sec">
        <span className="side__label">Where</span>
        <div className="chips">
          {PLACES.map((p) => (
            <Chip
              key={p.id}
              id={p.id}
              label={p.label}
              on={scene.place === p.id}
              onClick={() => arrangeScene({ place: p.id as PlaceId })}
            />
          ))}
        </div>
      </section>
      <section className="side__sec">
        <span className="side__label">When</span>
        <div className="chips">
          {TIMES.map((t) => (
            <Chip
              key={t.id}
              id={t.id}
              label={t.label}
              on={scene.time === t.id}
              onClick={() => arrangeScene({ time: t.id as TimeId })}
            />
          ))}
        </div>
      </section>
      <section className="side__sec">
        <span className="side__label">Weather</span>
        <div className="chips">
          {WEATHERS.map((w) => (
            <Chip
              key={w.id}
              id={w.id}
              label={w.label}
              on={scene.weather === w.id}
              onClick={() => arrangeScene({ weather: w.id as WeatherId })}
            />
          ))}
        </div>
      </section>
      <section className="side__sec">
        <span className="side__label">Effects</span>
        <div className="chips">
          {EFFECTS.map((e) => {
            const on = sceneEffects.some((a) => a.id === e.id);
            return (
              <Chip
                key={e.id}
                id={e.id}
                label={e.label}
                on={on}
                disabled={!on && full}
                onClick={() => setEffect(e.id as EffectId, !on)}
              />
            );
          })}
        </div>
      </section>
      <p className="ask">
        <span aria-hidden="true">💬</span>
        <span>
          <b>Ask:</b> Where are we? Day or night? What&apos;s the weather?
        </span>
      </p>
    </>
  );
}

export function SceneRail() {
  const place = useStudio((s) => s.scene.place);
  return (
    <span className="rail__tool rail__tool--emoji" aria-hidden="true">
      {ICONS[place]}
    </span>
  );
}
