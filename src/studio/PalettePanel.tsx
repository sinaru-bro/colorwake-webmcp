import { useEffect, useState, type CSSProperties } from "react";
import { PALETTE, paletteColor } from "../content/palette";
import { Icon, type IconName } from "../render/icons";
import { setTool, undo } from "../state/actions";
import { useStudio } from "../state/store";
import type { ColorId, StrokeSize, ToolId } from "../state/types";
import { useUi } from "../state/ui";

const TOOLS: { id: ToolId; label: string; icon: IconName; color: string }[] = [
  { id: "fill", label: "Fill", icon: "fill", color: "#ff7a1a" },
  { id: "pen", label: "Marker", icon: "pen", color: "#3e63dd" },
  { id: "brush", label: "Brush", icon: "brush", color: "#f27da8" },
  { id: "pencil", label: "Pencil", icon: "pencil", color: "#46a758" },
];
const SIZES: { id: StrokeSize; dot: number }[] = [
  { id: "s", dot: 8 },
  { id: "m", dot: 14 },
  { id: "l", dot: 20 },
];
const LIGHT_COLORS = new Set<ColorId>(["yellow", "sky", "peach", "white"]);
const HELPER_CHIP_MS = 1500;

const vars = (v: Record<string, string>) => v as CSSProperties;

export function PalettePanel() {
  const tool = useStudio((s) => s.tool);
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
                style={vars({ "--tc": t.color })}
                aria-pressed={on}
                onClick={() => setTool({ tool: t.id })}
              >
                <Icon name={t.icon} size={30} />
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
              disabled={tool.tool === "fill"}
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
                style={vars({ "--c": c.hex, "--ck": LIGHT_COLORS.has(c.id) ? "#2e2a26" : "#fff" })}
                aria-label={c.label}
                aria-pressed={on}
                title={c.label}
                onClick={() => setTool({ color: c.id })}
              />
            );
          })}
        </div>
      </section>
      <div className="side__actions">
        <button type="button" className="act" aria-label="Undo" title="Undo" onClick={() => undo()}>
          <Icon name="undo" size={26} />
        </button>
      </div>
    </>
  );
}

export function PaletteRail() {
  const tool = useStudio((s) => s.tool);
  const current = TOOLS.find((t) => t.id === tool.tool) ?? TOOLS[0];
  return (
    <>
      <span className="rail__tool" style={{ color: current.color }}>
        <Icon name={current.icon} size={26} />
      </span>
      <span className="rail__color" style={{ background: paletteColor(tool.color)?.hex }} />
    </>
  );
}
