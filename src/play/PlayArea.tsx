import { useEffect, useRef, useState } from "react";
import { Icon } from "../render/icons";
import { coloredCharacters } from "../state/selectors";
import { useStudio } from "../state/store";
import { Actor } from "./Actor";
import { EffectsLayer } from "./effects/EffectsLayer";
import { stopAll } from "./engine";
import { BackLayers, WeatherLayer } from "./scene/SceneLayers";

const SINGLE_HEIGHT = 0.5;
const GROUP_HEIGHT = 0.4;

export function PlayArea() {
  const host = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const state = useStudio((s) => s);
  const characters = coloredCharacters(state);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const shownOpen = openId && characters.some((c) => c.id === openId) ? openId : null;
  const baseHeight = height * (characters.length <= 1 ? SINGLE_HEIGHT : GROUP_HEIGHT);
  return (
    <div ref={host} className="main" onClick={(e) => e.target === e.currentTarget && setOpenId(null)}>
      <div className="play">
        <BackLayers scene={state.scene} />
        {characters.map((c) => (
          <Actor
            key={c.id}
            character={c}
            baseHeight={baseHeight}
            windy={state.scene.weather === "wind"}
            open={shownOpen === c.id}
            onOpen={setOpenId}
          />
        ))}
        <WeatherLayer scene={state.scene} />
        <EffectsLayer effects={state.scene.effects} characters={characters} />
        {characters.length === 0 && (
          <div className="canvas__empty">Color a picture — it will show up here</div>
        )}
      </div>
      <button
        type="button"
        className="done done--stop"
        onClick={() => stopAll()}
        aria-label="Stop all motion"
      >
        <Icon name="stop" size={24} />
        <span>Stop</span>
      </button>
    </div>
  );
}
