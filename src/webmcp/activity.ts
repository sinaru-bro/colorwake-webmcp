import { EFFECTS } from "../content/effects";
import { findPreset } from "../content/motions/presets";
import { placeById, weatherById } from "../content/scenes";
import { sketchById } from "../content/sketches/catalog";
import { activeCharacter, displayName, findCharacter } from "../state/selectors";
import type { Character, StudioState } from "../state/types";

export interface ActivityNote {
  kid: string | null;
  tag: string;
  flash: string[];
}

const READ_TOOLS = new Set(["get_studio_state", "list_sketches", "list_motions"]);
const TOOL_LABELS: Record<string, string> = { fill: "Fill", pen: "Marker", brush: "Brush", pencil: "Pencil" };

const cap = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

function subject(ref: string | null, s: StudioState): Character | null {
  if (ref) {
    const found = findCharacter(s, ref);
    return found.kind === "found" ? found.character : null;
  }
  return activeCharacter(s);
}

function motionLabel(id: string, c: Character | null): string | null {
  const rig = c ? sketchById(c.sketchId)?.rig : undefined;
  return rig ? (findPreset(id, rig)?.preset.label ?? id) : id;
}

/** Turns a finished tool call into the on-screen caption (for the child) and tag (for grown-ups). */
export function describeActivity(
  tool: string,
  input: unknown,
  result: unknown,
  before: StudioState,
  after: StudioState,
): ActivityNote {
  const res = (result && typeof result === "object" ? result : {}) as Record<string, unknown>;
  const args = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  if (res.ok !== true) {
    return {
      kid: READ_TOOLS.has(tool) ? null : "Hmm, try again",
      tag: `${tool} · ${str(res.code) ?? "error"}`,
      flash: [],
    };
  }
  switch (tool) {
    case "pick_sketch": {
      const c = activeCharacter(after);
      const title = c ? (sketchById(c.sketchId)?.title ?? c.sketchId) : null;
      return {
        kid: title ? `Here comes a ${title}!` : null,
        tag: `pick_sketch · ${c?.sketchId ?? ""}`,
        flash: [],
      };
    }
    case "set_tool": {
      const t = after.tool;
      return {
        kid: `${TOOL_LABELS[t.tool] ?? cap(t.tool)}, ${t.color}!`,
        tag: `set_tool · ${t.tool} · ${t.color}`,
        flash: [`tool:${t.tool}`, `color:${t.color}`],
      };
    }
    case "set_mode":
      return {
        kid: after.mode === "play" ? "Let's play!" : "Back to coloring",
        tag: `set_mode · ${after.mode}`,
        flash: [],
      };
    case "apply_motion": {
      const c = subject(str(args.character), after);
      const name = c ? cap(displayName(c)) : null;
      const motion = str(args.motion);
      const label = motion ? motionLabel(motion, c) : null;
      const kid = !name
        ? null
        : motion === "stop"
          ? `${name} stops`
          : label
            ? `${name}, ${label.toLowerCase()}!`
            : `${name} moves!`;
      return {
        kid,
        tag: `apply_motion · ${c?.sketchId ?? str(args.character) ?? ""} · ${motion ?? "steps"}`,
        flash: [],
      };
    }
    case "arrange_scene": {
      const parts: string[] = [];
      const flash: string[] = [];
      const tags: string[] = [];
      const { place, time, weather } = after.scene;
      if (place && place !== before.scene.place) {
        parts.push(
          place === "blank"
            ? "A plain stage!"
            : `Off to the ${(placeById(place)?.label ?? place).toLowerCase()}!`,
        );
        flash.push(`place:${place}`);
        tags.push(place);
      }
      if (time && time !== before.scene.time) {
        parts.push(`${cap(time)} time!`);
        flash.push(`time:${time}`);
        tags.push(time);
      }
      if (weather && weather !== before.scene.weather) {
        parts.push(`${cap(weatherById(weather)?.label ?? weather)}!`);
        flash.push(`weather:${weather}`);
        tags.push(weather);
      }
      let kid = parts.join(" ");
      if (!kid) {
        const placements = Array.isArray(args.placements)
          ? (args.placements as Array<Record<string, unknown>>)
          : [];
        const first = placements[0] ? subject(str(placements[0].character), after) : null;
        kid = first ? `${cap(displayName(first))} moves over` : "Scene set";
        tags.push("placements");
      }
      return { kid, tag: `arrange_scene · ${tags.join(" · ")}`, flash };
    }
    case "add_effect": {
      const id = str(args.effect) ?? "";
      const on = args.on !== false && id !== "none";
      const label = EFFECTS.find((e) => e.id === id)?.label ?? cap(id);
      const kid = id === "none" ? "All clear" : on ? `${label}!` : `No more ${label.toLowerCase()}`;
      return { kid, tag: `add_effect · ${id} · ${on ? "on" : "off"}`, flash: on ? [`effect:${id}`] : [] };
    }
    default:
      return { kid: null, tag: tool, flash: [] };
  }
}
