import { MyFriends } from "../app/MyFriends";
import { PLACES, TIMES, WEATHERS } from "../content/scenes";
import { arrangeScene, colorAnother } from "../state/actions";
import { useStudio } from "../state/store";
import type { PlaceId, TimeId, WeatherId } from "../state/types";
import { useUi } from "../state/ui";
import { usePhone } from "../studio/phone";
import { Swipe } from "../studio/Swipe";
import { SceneChip } from "./Chip";
import { SCENE_ICONS } from "./sceneIcons";

/** Labels too long for one line in the fixed swipe box. */
const SPLIT_LABELS: Record<string, [string, string]> = { Thunderstorm: ["Thunder", "Storm"] };

/** One scene axis as a swipe row for small screens: neighbours peek, the centred one is picked. */
function SceneSwipe({
  label,
  options,
  selected,
  onPick,
}: {
  label: string;
  options: { id: string; label: string }[];
  selected: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <section className="side__sec">
      <span className="side__label">{label}</span>
      <Swipe
        ariaLabel={label}
        half={36}
        start
        selected={selected}
        items={options.map((o) => ({
          id: o.id,
          label: o.label,
          on: selected === o.id,
          node: (
            <>
              <span className="mswipe__scene" aria-hidden="true">
                {SCENE_ICONS[o.id] ?? "\u2022"}
              </span>
              <span>
                {SPLIT_LABELS[o.label] ? (
                  <>
                    {SPLIT_LABELS[o.label][0]}
                    <br />
                    {SPLIT_LABELS[o.label][1]}
                  </>
                ) : (
                  o.label
                )}
              </span>
            </>
          ),
        }))}
        onPick={onPick}
        onCenter={onPick}
      />
    </section>
  );
}

export function ScenePanel() {
  const scene = useStudio((s) => s.scene);
  const agent = useUi((s) => s.agent);
  const phone = usePhone();
  return (
    <>
      {phone ? (
        <>
          <SceneSwipe
            label="Where"
            options={PLACES}
            selected={scene.place}
            onPick={(id) => arrangeScene({ place: id as PlaceId })}
          />
          <SceneSwipe
            label="When"
            options={TIMES}
            selected={scene.time}
            onPick={(id) => arrangeScene({ time: id as TimeId })}
          />
          <SceneSwipe
            label="Weather"
            options={WEATHERS}
            selected={scene.weather}
            onPick={(id) => arrangeScene({ weather: id as WeatherId })}
          />
        </>
      ) : (
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
        </>
      )}
      <MyFriends />
      <div className="play-dock">
        <button type="button" className="play-cta" onClick={() => colorAnother()}>
          Let&apos;s color another!
        </button>
        {!phone && agent.support === "native" && (
          <span className="play-dock__hint">or just tell your AI &quot;Let&apos;s color!&quot;</span>
        )}
      </div>
    </>
  );
}

export function SceneRail() {
  const scene = useStudio((s) => s.scene);
  const icon = (id: string | null) => (id ? SCENE_ICONS[id] : "\u25a2");
  return (
    <>
      <span className="rail__tool rail__tool--emoji" aria-hidden="true">
        {icon(scene.place)}
      </span>
      <span className="rail__tool rail__tool--emoji" aria-hidden="true">
        {icon(scene.time)}
      </span>
      <span className="rail__tool rail__tool--emoji" aria-hidden="true">
        {icon(scene.weather)}
      </span>
    </>
  );
}
