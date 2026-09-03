import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import type { Paint, Position } from "./types";

export type AgentSupport = "native" | "none";

export interface Activity {
  id: number;
  tool: string;
  kid: string | null;
  tag: string;
  ok: boolean;
  read: boolean;
  at: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A finished picture flying from the canvas onto the play screen. */
export interface Transition {
  characterId: string;
  phase: "fly" | "land";
  paper: Rect;
  picture: Rect;
}

/** A short note for the grown-up, e.g. why a tap did nothing; `at` names the panel it points to. */
export interface Notice {
  title: string;
  hint: string;
  at?: "friends";
}

/** A finished picture leaving the canvas for its My friends tile, in viewport coordinates. */
export interface Stash {
  characterId: string;
  from: Rect;
}

export interface UiState {
  undo: Record<string, Paint[]>;
  zoom: { scale: number; pan: Position };
  sidebarOpen: boolean;
  agent: { support: AgentSupport };
  activity: Activity[];
  flash: { keys: string[]; n: number } | null;
  transition: Transition | null;
  stash: Stash | null;
  /** The play screen is giving way to the canvas. */
  leaving: boolean;
  mutedActivity: number;
  storageError: boolean;
  notice: Notice | null;
  helperPulse: number;
}

const UNDO_DEPTH = 20;
const ACTIVITY_DEPTH = 20;
const FLASH_MS = 900;
let activitySeq = 0;

export const uiStore = createStore<UiState>(() => ({
  undo: {},
  zoom: { scale: 1, pan: { x: 0, y: 0 } },
  sidebarOpen: typeof window === "undefined" || window.innerWidth >= 1000,
  agent: { support: "none" },
  activity: [],
  flash: null,
  transition: null,
  stash: null,
  leaving: false,
  mutedActivity: 0,
  storageError: false,
  notice: null,
  helperPulse: 0,
}));

export function useUi<T>(selector: (s: UiState) => T): T {
  return useStore(uiStore, selector);
}

export const ui = {
  pushUndo(characterId: string, paint: Paint): void {
    uiStore.setState((s) => {
      const stack = [...(s.undo[characterId] ?? []), structuredClone(paint)].slice(-UNDO_DEPTH);
      return { undo: { ...s.undo, [characterId]: stack } };
    });
  },
  popUndo(characterId: string): Paint | null {
    const stack = uiStore.getState().undo[characterId] ?? [];
    if (stack.length === 0) return null;
    const last = stack[stack.length - 1];
    uiStore.setState((s) => ({ undo: { ...s.undo, [characterId]: stack.slice(0, -1) } }));
    return last;
  },
  clearUndo(characterId?: string): void {
    uiStore.setState((s) => {
      if (!characterId) return { undo: {} };
      const { [characterId]: _dropped, ...rest } = s.undo;
      return { undo: rest };
    });
  },
  setSidebar(open: boolean): void {
    uiStore.setState({ sidebarOpen: open });
  },
  setAgent(support: AgentSupport): void {
    uiStore.setState({ agent: { support } });
  },
  noteActivity(entry: Omit<Activity, "id">): void {
    activitySeq += 1;
    uiStore.setState((s) => ({
      activity: [...s.activity, { ...entry, id: activitySeq }].slice(-ACTIVITY_DEPTH),
    }));
  },
  flash(keys: string[]): void {
    const n = (uiStore.getState().flash?.n ?? 0) + 1;
    uiStore.setState({ flash: { keys, n } });
    setTimeout(() => {
      if (uiStore.getState().flash?.n === n) uiStore.setState({ flash: null });
    }, FLASH_MS);
  },
  startTransition(t: Omit<Transition, "phase">): void {
    uiStore.setState({ transition: { ...t, phase: "fly" } });
  },
  landTransition(): void {
    uiStore.setState((s) => (s.transition ? { transition: { ...s.transition, phase: "land" } } : {}));
  },
  endTransition(): void {
    uiStore.setState((s) => ({ transition: null, mutedActivity: s.activity.at(-1)?.id ?? s.mutedActivity }));
  },
  setLeaving(leaving: boolean): void {
    uiStore.setState({ leaving });
  },
  startStash(stash: Stash): void {
    uiStore.setState({ stash });
  },
  endStash(): void {
    uiStore.setState({ stash: null });
  },
  setStorageError(error: boolean): void {
    uiStore.setState({ storageError: error });
  },
  notice(notice: Notice | null): void {
    uiStore.setState({ notice });
  },
  pulseHelper(): void {
    uiStore.setState((s) => ({ helperPulse: s.helperPulse + 1 }));
  },
  setZoom(scale: number, pan: Position): void {
    uiStore.setState({ zoom: { scale: Math.min(4, Math.max(1, scale)), pan } });
  },
  resetZoom(): void {
    uiStore.setState({ zoom: { scale: 1, pan: { x: 0, y: 0 } } });
  },
};
