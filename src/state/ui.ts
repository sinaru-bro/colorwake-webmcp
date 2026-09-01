import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import type { Paint, Position } from "./types";

export type AgentSupport = "native" | "none";

export interface UiState {
  undo: Record<string, Paint[]>;
  zoom: { scale: number; pan: Position };
  sidebarOpen: boolean;
  doneSheetOpen: boolean;
  resumePending: boolean;
  agent: { support: AgentSupport; lastCall: string | null };
  storageError: boolean;
  toast: string | null;
  helperPulse: number;
}

const UNDO_DEPTH = 20;

export const uiStore = createStore<UiState>(() => ({
  undo: {},
  zoom: { scale: 1, pan: { x: 0, y: 0 } },
  sidebarOpen: typeof window === "undefined" || window.innerWidth >= 1000,
  doneSheetOpen: false,
  resumePending: false,
  agent: { support: "none", lastCall: null },
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
    uiStore.setState((s) => ({ agent: { ...s.agent, support } }));
  },
  noteToolCall(name: string): void {
    uiStore.setState((s) => ({ agent: { ...s.agent, lastCall: name } }));
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
