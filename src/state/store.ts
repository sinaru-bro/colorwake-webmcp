import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { DEFAULT_SCENE, DEFAULT_TOOL, type StudioState } from "./types";

export function initialState(): StudioState {
  return {
    version: 1,
    mode: "color",
    characters: [],
    activeCharacterId: null,
    cast: [],
    tool: { ...DEFAULT_TOOL },
    scene: { ...DEFAULT_SCENE },
    updatedAt: Date.now(),
  };
}

export const studioStore = createStore<StudioState>(() => initialState());

export function getState(): StudioState {
  return studioStore.getState();
}

export function patch(update: (s: StudioState) => Partial<StudioState>): void {
  studioStore.setState((s) => ({ ...update(s), updatedAt: Date.now() }));
}

export function replaceState(next: StudioState): void {
  studioStore.setState(next, true);
}

export function useStudio<T>(selector: (s: StudioState) => T): T {
  return useStore(studioStore, selector);
}
