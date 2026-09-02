import "./app/app.css";
import { DevPanel } from "./app/DevPanel";
import { Notice, ResumeDialog } from "./app/Dialogs";
import { Header } from "./app/Header";
import { Hud } from "./app/Hud";
import { Sidebar } from "./app/Sidebar";
import { Stash } from "./app/Stash";
import { Transition } from "./app/Transition";
import { PlayArea } from "./play/PlayArea";
import { ScenePanel, SceneRail } from "./play/ScenePanel";
import { useStudio } from "./state/store";
import { useUi } from "./state/ui";
import { Canvas } from "./studio/Canvas";
import { PalettePanel, PaletteRail } from "./studio/PalettePanel";
import { SketchStrip } from "./studio/SketchStrip";

const params = new URLSearchParams(window.location.search);
const DEV = import.meta.env.DEV && params.get("dev") === "1" && params.get("panel") !== "0";

export default function App() {
  const mode = useStudio((s) => s.mode);
  const coloring = mode === "color";
  const entering = useUi((s) => s.transition !== null);
  const leaving = useUi((s) => s.leaving);
  return (
    <div className={`shell${entering ? " shell--enter" : ""}${leaving ? " shell--leave" : ""}`}>
      <Header />
      <div className="body">
        <div className="stage">
          {coloring ? <Canvas /> : <PlayArea />}
          <Hud />
          <Notice />
          <Transition />
        </div>
        <Sidebar
          label={coloring ? "Tools" : "Scene"}
          rail={coloring ? <PaletteRail /> : <SceneRail />}
          className={coloring ? undefined : "side--play"}
        >
          {coloring ? <PalettePanel /> : <ScenePanel />}
        </Sidebar>
      </div>
      <SketchStrip />
      <ResumeDialog />
      <Stash />
      {DEV && <DevPanel />}
    </div>
  );
}
