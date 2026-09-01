import { useState } from "react";
import { useUi } from "../state/ui";
import { callTool, listRegistered } from "../webmcp/devPanel";
import { TOOL_NAMES, type ToolName } from "../webmcp/toolNames";
import { seedDemo } from "./devSeed";

const SAMPLES: Record<ToolName, string> = {
  get_studio_state: "{}",
  list_sketches: "{}",
  list_motions: "{}",
  set_mode: '{ "mode": "play" }',
  pick_sketch: '{ "sketch": "cat" }',
  set_tool: '{ "tool": "brush", "color": "sky" }',
  apply_motion: '{ "character": "cat", "motion": "fly" }',
  arrange_scene: '{ "place": "sea", "time": "night", "weather": "snow" }',
  add_effect: '{ "effect": "hearts" }',
};

export function DevPanel() {
  const agent = useUi((s) => s.agent);
  const [name, setName] = useState<ToolName>("get_studio_state");
  const [input, setInput] = useState(SAMPLES.get_studio_state);
  const [output, setOutput] = useState("");
  const [open, setOpen] = useState(true);

  const run = async () => {
    try {
      const result = await callTool(name, JSON.parse(input || "{}"));
      setOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setOutput(String(err));
    }
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    right: 12,
    bottom: 12,
    width: open ? 420 : 140,
    maxHeight: "60vh",
    background: "#111",
    color: "#ddd",
    font: "12px/1.4 ui-monospace, Menlo, monospace",
    borderRadius: 10,
    padding: 10,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
  };

  return (
    <div style={panelStyle} aria-label="Developer panel">
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <strong style={{ flex: 1 }}>dev · {agent.support}</strong>
        <button type="button" onClick={() => seedDemo(true)}>
          seed
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)}>
          {open ? "–" : "+"}
        </button>
      </div>
      {open && (
        <>
          <div style={{ display: "flex", gap: 6 }}>
            <select
              value={name}
              onChange={(e) => {
                const n = e.target.value as ToolName;
                setName(n);
                setInput(SAMPLES[n]);
              }}
              style={{ flex: 1 }}
            >
              {TOOL_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => void run()}>
              run
            </button>
            <button
              type="button"
              onClick={() => void listRegistered().then((t) => setOutput(JSON.stringify(t, null, 2)))}
            >
              tools
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            style={{ width: "100%", font: "inherit" }}
          />
          <pre style={{ margin: 0, overflow: "auto", flex: 1, whiteSpace: "pre-wrap" }}>{output}</pre>
        </>
      )}
    </div>
  );
}
