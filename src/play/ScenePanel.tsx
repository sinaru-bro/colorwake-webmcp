import { MyFriends } from "../app/MyFriends";
import { PLACES, TIMES, WEATHERS } from "../content/scenes";
import { arrangeScene } from "../state/actions";
import { useStudio } from "../state/store";
import type { PlaceId, TimeId, WeatherId } from "../state/types";
import { SceneChip } from "./Chip";
import { SCENE_ICONS } from "./sceneIcons";

export function ScenePanel() {
  const scene = useStudio((s) => s.scene);
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
      <MyFriends />
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
