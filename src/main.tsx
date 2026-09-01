import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { hydrate } from "./state/actions";
import { loadSaved, startAutosave } from "./state/persistence";
import { ui } from "./state/ui";
import { engine } from "./play/engine";
import { setEngine } from "./webmcp/engineBridge";
import { registerAll } from "./webmcp/register";
import { seedDemo } from "./app/devSeed";
import { callTool } from "./webmcp/devPanel";

const params = new URLSearchParams(window.location.search);
const seed = import.meta.env.DEV && params.get("dev") === "1" ? params.get("seed") : null;
const saved = seed ? null : loadSaved();
if (saved) {
  hydrate(saved);
  if (saved.characters.length > 0) ui.setResumePending(true);
}
if (seed) seedDemo(seed === "play", params.get("scene") !== "0");
const motion = seed ? params.get("motion") : null;
if (motion) setTimeout(() => void callTool("apply_motion", { character: "cat", motion }), 400);
startAutosave();
setEngine(engine);

const controller = new AbortController();
void registerAll(controller.signal);
if (import.meta.hot) import.meta.hot.dispose(() => controller.abort());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
