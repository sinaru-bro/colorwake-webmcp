import { useState } from "react";
import { useUi } from "../state/ui";
import { useLandscape, usePad, usePadLandscape, usePhone } from "../studio/phone";
import { TOOL_NAMES } from "../webmcp/toolNames";

function AgentBadge() {
  const agent = useUi((s) => s.agent);
  const activity = useUi((s) => s.activity);
  const storageError = useUi((s) => s.storageError);
  const [open, setOpen] = useState(false);
  const phone = usePhone();
  const pad = usePad();
  const land = useLandscape();
  const padLand = usePadLandscape();
  const compact = phone || pad || land || padLand;
  const status = storageError
    ? { cls: " badge--warn", text: "Not saving", detail: "Storage is full — new changes may be lost" }
    : agent.support === "native"
      ? { cls: "", text: compact ? "WebMCP" : "WebMCP ready", detail: `${TOOL_NAMES.length} site tools` }
      : {
          cls: " badge--none",
          text: "WebMCP",
          detail: "This device can't connect yet — use ChatGPT desktop or Chrome 149+",
        };
  return (
    <button
      type="button"
      className={`badge${status.cls}`}
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
    >
      <span className="badge__dot" aria-hidden="true" />
      {status.text}
      {open && (
        <span className="badge__pop" role="dialog">
          <strong>{status.detail}</strong>
          <br />
          {TOOL_NAMES.map((n) => (
            <span key={n}>
              <code>{n}</code>
              <br />
            </span>
          ))}
          {activity.length > 0 && (
            <span className="badge__log">
              <strong>Recent</strong>
              <br />
              {activity
                .slice(-6)
                .reverse()
                .map((a) => (
                  <span key={a.id}>
                    <code>{a.tag}</code>
                    {a.kid ? ` — ${a.kid}` : ""}
                    <br />
                  </span>
                ))}
            </span>
          )}
        </span>
      )}
    </button>
  );
}

export function Header() {
  return (
    <header className="header">
      <span className="logo">colorwake</span>
      <span className="header__spacer" />
      <AgentBadge />
    </header>
  );
}
