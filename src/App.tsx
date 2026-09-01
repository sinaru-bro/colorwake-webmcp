import "./app/app.css";
import { DevPanel } from "./app/DevPanel";
import { ResumeDialog, Toast } from "./app/Dialogs";
import { Header } from "./app/Header";
import { Sidebar } from "./app/Sidebar";
import { PlayArea } from "./play/PlayArea";
import { ScenePanel, SceneRail } from "./play/ScenePanel";
import { useStudio } from "./state/store";
import { Canvas } from "./studio/Canvas";
import { PalettePanel, PaletteRail } from "./studio/PalettePanel";
import { SketchStrip } from "./studio/SketchStrip";

const params = new URLSearchParams(window.location.search);
const DEV = import.meta.env.DEV && params.get("dev") === "1" && params.get("panel") !== "0";

export default function App() {
  const mode = useStudio((s) => s.mode);
  const coloring = mode === "color";
  return (
    <div className="shell">
      <Header />
      <div className="body">
        {coloring ? <Canvas /> : <PlayArea />}
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
      <Toast />
      {DEV && <DevPanel />}
    </div>
  );
}
