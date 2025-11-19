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
  isPlaying: boolean;
  setCurrentStation: (station: RadioStation | null) => void;
  setStations: (stations: RadioStation[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  showPlayer: () => void;
  hidePlayer: () => void;
  togglePlayer: () => void;
  stopAudio: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentStation: null,
  stations: [],
  isPlayerVisible: false,
  isPlaying: false,

  setCurrentStation: (station) =>
    set({
      currentStation: station,
      isPlayerVisible: station !== null,
      isPlaying: false,
    }),

  setStations: (stations) => set({ stations }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  showPlayer: () => set({ isPlayerVisible: true }),

  hidePlayer: () => set({ isPlayerVisible: false }),

  togglePlayer: () =>
    set((state) => ({ isPlayerVisible: !state.isPlayerVisible })),

  stopAudio: () => {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.pause();
      audio.src = "";
    });
    set({ isPlaying: false, currentStation: null, isPlayerVisible: false });
  },
}));

