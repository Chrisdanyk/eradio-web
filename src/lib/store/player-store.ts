/**
 * Player Store (Zustand)
 *
 * Global state management for the radio player.
 *
 * SOLID: Single Responsibility - Only manages player state
 */

import { create } from "zustand";
import type { RadioStation } from "~/lib/types/api.types";

interface PlayerState {
  currentStation: RadioStation | null;
  stations: RadioStation[];
  isPlayerVisible: boolean;
  setCurrentStation: (station: RadioStation | null) => void;
  setStations: (stations: RadioStation[]) => void;
  showPlayer: () => void;
  hidePlayer: () => void;
  togglePlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentStation: null,
  stations: [],
  isPlayerVisible: false,

  setCurrentStation: (station) =>
    set({
      currentStation: station,
      isPlayerVisible: station !== null,
    }),

  setStations: (stations) => set({ stations }),

  showPlayer: () => set({ isPlayerVisible: true }),

  hidePlayer: () => set({ isPlayerVisible: false }),

  togglePlayer: () =>
    set((state) => ({ isPlayerVisible: !state.isPlayerVisible })),
}));

