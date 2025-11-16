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
  isPlayerVisible: boolean;
  setCurrentStation: (station: RadioStation | null) => void;
  showPlayer: () => void;
  hidePlayer: () => void;
  togglePlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentStation: null,
  isPlayerVisible: false,

  setCurrentStation: (station) =>
    set({
      currentStation: station,
      isPlayerVisible: station !== null,
    }),

  showPlayer: () => set({ isPlayerVisible: true }),

  hidePlayer: () => set({ isPlayerVisible: false }),

  togglePlayer: () =>
    set((state) => ({ isPlayerVisible: !state.isPlayerVisible })),
}));

