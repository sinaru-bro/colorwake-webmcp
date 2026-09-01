import { useUi } from "../state/ui";
import { SCENE_ICONS } from "./sceneIcons";

const SHORT_LABELS: Record<string, string> = { park: "Park", thunder: "Thunder" };

interface Props {
  id: string;
  label: string;
  on: boolean;
  disabled?: boolean;
  flashKey?: string;
  onClick: () => void;
}

export function SceneChip({ id, label, on, disabled, flashKey, onClick }: Props) {
  const flash = useUi((s) => s.flash);
  const flashing = flashKey !== undefined && flash !== null && flash.keys.includes(flashKey);
  return (
    <button
      type="button"
      className={`chip${on ? " chip--on" : ""}${flashing ? " chip--flash" : ""}`}
      disabled={disabled}
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
    >
      <span aria-hidden="true">{SCENE_ICONS[id] ?? "•"}</span>
      <small>{SHORT_LABELS[id] ?? label}</small>
    </button>
  );
}
