import { useEffect, useRef, useState } from "react";
import { castCharacters, coloredCharacters } from "../state/selectors";
import { useStudio } from "../state/store";
import { Actor } from "./Actor";
import { setStage } from "./engine";
import { HORIZON_STYLE } from "./scene/geometry";
import { BackLayers, ForeLayer, WeatherLayer } from "./scene/SceneLayers";

const SINGLE_HEIGHT = 0.38;
const GROUP_HEIGHT = 0.28;
/** Cap by stage width so the outer stage spots stay fully on narrow screens. */
const WIDTH_CAP = 0.5;

export function PlayArea() {
  const host = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const state = useStudio((s) => s);
  const characters = castCharacters(state);
  const anyColored = coloredCharacters(state).length > 0;

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStage(width, height);
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const baseHeight = Math.min(
    size.h * (characters.length <= 1 ? SINGLE_HEIGHT : GROUP_HEIGHT),
    size.w * WIDTH_CAP,
  );
  return (
    <div ref={host} className="main">
      <div className="play" style={HORIZON_STYLE}>
        <BackLayers scene={state.scene} />
        {characters.map((c) => (
          <Actor key={c.id} character={c} baseHeight={baseHeight} windy={state.scene.weather === "wind"} />
        ))}
        <ForeLayer scene={state.scene} />
        <WeatherLayer scene={state.scene} />
        {characters.length === 0 && (
          <div className="canvas__empty">
            {anyColored ? "Tap a friend to bring them out to play" : "Color a picture — it will show up here"}
          </div>
        )}
      </div>
    </div>
  );
}
