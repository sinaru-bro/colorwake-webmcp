import { EFFECTS, MAX_EFFECTS } from "../content/effects";
import { PLACES, TIMES, WEATHERS } from "../content/scenes";
import { arrangeScene, setEffect } from "../state/actions";
import { useStudio } from "../state/store";
import type { EffectId, PlaceId, TimeId, WeatherId } from "../state/types";
import { SceneChip } from "./Chip";
import { SCENE_ICONS } from "./sceneIcons";

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
            <SceneChip
              key={p.id}
              id={p.id}
              label={p.label}
              on={scene.place === p.id}
              flashKey={`place:${p.id}`}
              onClick={() => arrangeScene({ place: p.id as PlaceId })}
            />
          ))}
        </div>
      </section>
      <section className="side__sec">
        <span className="side__label">When</span>
        <div className="chips">
          {TIMES.map((t) => (
            <SceneChip
              key={t.id}
              id={t.id}
              label={t.label}
              on={scene.time === t.id}
              flashKey={`time:${t.id}`}
              onClick={() => arrangeScene({ time: t.id as TimeId })}
            />
          ))}
        </div>
      </section>
      <section className="side__sec">
        <span className="side__label">Weather</span>
        <div className="chips">
          {WEATHERS.map((w) => (
            <SceneChip
              key={w.id}
              id={w.id}
              label={w.label}
              on={scene.weather === w.id}
              flashKey={`weather:${w.id}`}
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
              <SceneChip
                key={e.id}
                id={e.id}
                label={e.label}
                on={on}
                disabled={!on && full}
                flashKey={`effect:${e.id}`}
                onClick={() => setEffect(e.id as EffectId, !on)}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}

export function SceneRail() {
  const place = useStudio((s) => s.scene.place);
  return (
    <span className="rail__tool rail__tool--emoji" aria-hidden="true">
      {place ? SCENE_ICONS[place] : "▢"}
    </span>
  );
}
