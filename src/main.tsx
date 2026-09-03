import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { hydrate } from "./state/actions";
import { loadSaved, startAutosave } from "./state/persistence";
import { engine } from "./play/engine";
import { setEngine } from "./webmcp/engineBridge";
import { registerAll } from "./webmcp/register";
import { parseSeedScene, seedDemo } from "./app/devSeed";
import { installTransitionTrigger } from "./app/flight";
import { callTool } from "./webmcp/devPanel";

const params = new URLSearchParams(window.location.search);
const seed = import.meta.env.DEV && params.get("dev") === "1" ? params.get("seed") : null;
if (import.meta.env.DEV && params.get("dev") === "1")
  Object.assign(window, { colorwakeDev: { callTool, engine } });
const saved = seed ? null : loadSaved();
if (saved) hydrate(saved);
if (seed) seedDemo(seed === "play" || seed === "all", parseSeedScene(params.get("scene")), seed === "all");
const motion = seed ? params.get("motion") : null;
if (motion) {
  for (const item of motion.split(",")) {
    const [a, b] = item.split(":");
    const character = b ? a : "cat";
    const [motion, variant] = (b ?? a).split(".");
    setTimeout(
      () => void callTool("apply_motion", { character, motion, ...(variant ? { variant } : {}) }),
      400,
    );
  }
}
const fly = seed ? params.get("fly") : null;
if (fly) setTimeout(() => void callTool("set_mode", { mode: "play" }), Number(fly) || 400);
startAutosave();
setEngine(engine);

const controller = new AbortController();
void registerAll(controller.signal);
const uninstallTransition = installTransitionTrigger();
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    controller.abort();
    uninstallTransition();
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
