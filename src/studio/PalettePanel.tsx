import { useEffect, useState, type CSSProperties } from "react";
import { MyFriends } from "../app/MyFriends";
import { PALETTE } from "../content/palette";
import { colorHex, isCustomColor, isLightColor } from "../lib/color";
import { ToolIcon } from "../render/icons";
import { enterPlay, setTool } from "../state/actions";
import { coloredCharacters } from "../state/selectors";
import { useStudio } from "../state/store";
import type { StrokeSize, ToolId } from "../state/types";
import { useUi } from "../state/ui";

const TOOLS: { id: ToolId; label: string }[] = [
  { id: "brush", label: "Brush" },
  { id: "pencil", label: "Pencil" },
  { id: "pen", label: "Marker" },
  { id: "fill", label: "Fill" },
];
const SIZES: { id: StrokeSize; dot: number }[] = [
  { id: "s", dot: 8 },
  { id: "m", dot: 14 },
  { id: "l", dot: 20 },
];
const HELPER_CHIP_MS = 1500;
const CUSTOM_START = "#ff8a5b";
const DARK_INK = "#2e2a26";

const vars = (v: Record<string, string>) => v as CSSProperties;
const swatchVars = (hex: string) => vars({ "--c": hex, "--ck": isLightColor(hex) ? DARK_INK : "#fff" });

/** Rainbow swatch that opens the system color picker for any color outside the palette. */
function CustomSwatch({ color, pulse }: { color: string; pulse: boolean }) {
  const on = isCustomColor(color);
  const [last, setLast] = useState(on ? color : CUSTOM_START);
  const value = on ? color : last;
  return (
    <label
      className={`swatch swatch--custom${on ? " swatch--on" : ""}${on && pulse ? " swatch--pulse" : ""}`}
      style={swatchVars(value)}
      title="Any color"
    >
      <input
        type="color"
        className="swatch__input"
        aria-label="Any color"
        value={value}
        onChange={(e) => {
          const hex = e.target.value.toLowerCase();
          setLast(hex);
          setTool({ color: hex });
        }}
      />
    </label>
  );
}

export function PalettePanel() {
  const tool = useStudio((s) => s.tool);
  const canPlay = useStudio((s) => coloredCharacters(s).length > 0);
  const pulse = useUi((s) => s.helperPulse);
  const [seen, setSeen] = useState(pulse);
  const chip = pulse > 0 && pulse !== seen;
  useEffect(() => {
    if (pulse === seen) return;
    const t = setTimeout(() => setSeen(pulse), HELPER_CHIP_MS);
    return () => clearTimeout(t);
  }, [pulse, seen]);

  return (
    <>
      {chip && <span className="helper-chip">✨ Helper picked this</span>}
      <section className="side__sec">
        <span className="side__label">Tools</span>
        <div className="tools">
          {TOOLS.map((t) => {
            const on = tool.tool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`tool${on ? " tool--on" : ""}${on && chip ? " tool--pulse" : ""}`}
                aria-pressed={on}
                onClick={() => setTool({ tool: t.id })}
              >
                <ToolIcon name={t.id} size={44} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="side__sec">
        <span className="side__label">Size</span>
        <div className="sizes">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`size${tool.size === s.id ? " size--on" : ""}`}
              aria-label={`Size ${s.id}`}
              aria-pressed={tool.size === s.id}
              onClick={() => setTool({ size: s.id })}
            >
              <i style={{ width: s.dot, height: s.dot }} />
            </button>
          ))}
        </div>
      </section>
      <section className="side__sec">
        <span className="side__label">Colors</span>
        <div className="swgrid">
          {PALETTE.map((c) => {
            const on = tool.color === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className={`swatch${on ? " swatch--on" : ""}${on && chip ? " swatch--pulse" : ""}`}
                style={swatchVars(c.hex)}
                aria-label={c.label}
                aria-pressed={on}
                title={c.label}
                onClick={() => setTool({ color: c.id })}
              />
            );
          })}
          <CustomSwatch color={tool.color} pulse={chip} />
        </div>
      </section>
      <MyFriends />
      <button type="button" className="play-cta" disabled={!canPlay} onClick={() => enterPlay()}>
        Let&apos;s play with my friends!
      </button>
    </>
  );
}

export function PaletteRail() {
  const tool = useStudio((s) => s.tool);
  return (
    <>
      <span className="rail__tool">
        <ToolIcon name={tool.tool} size={32} />
      </span>
      <span className="rail__color" style={{ background: colorHex(tool.color) }} />
    </>
  );
}
