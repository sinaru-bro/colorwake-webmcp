import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import type { Paint, Position, SceneAxis } from "./types";

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

export interface UiState {
  undo: Record<string, Paint[]>;
  zoom: { scale: number; pan: Position };
  sidebarOpen: boolean;
  doneSheetOpen: boolean;
  resumePending: boolean;
  agent: { support: AgentSupport };
  activity: Activity[];
  skipped: SceneAxis[];
  flash: { keys: string[]; n: number } | null;
  storageError: boolean;
  toast: string | null;
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
  doneSheetOpen: false,
  resumePending: false,
  agent: { support: "none" },
  activity: [],
  skipped: [],
  flash: null,
  storageError: false,
  toast: null,
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
  setDoneSheet(open: boolean): void {
    uiStore.setState({ doneSheetOpen: open });
  },
  setResumePending(pending: boolean): void {
    uiStore.setState({ resumePending: pending });
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
  skipQuestion(axis: SceneAxis): void {
    uiStore.setState((s) => ({ skipped: s.skipped.includes(axis) ? s.skipped : [...s.skipped, axis] }));
  },
  clearSkipped(): void {
    uiStore.setState({ skipped: [] });
  },
  flash(keys: string[]): void {
    const n = (uiStore.getState().flash?.n ?? 0) + 1;
    uiStore.setState({ flash: { keys, n } });
    setTimeout(() => {
      if (uiStore.getState().flash?.n === n) uiStore.setState({ flash: null });
    }, FLASH_MS);
  },
  setStorageError(error: boolean): void {
    uiStore.setState({ storageError: error });
  },
  toast(message: string | null): void {
    uiStore.setState({ toast: message });
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
