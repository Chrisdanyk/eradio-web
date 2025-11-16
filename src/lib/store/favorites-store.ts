/**
 * Favorites Store
 *
 * Global state to track when favorites change.
 * Used to trigger refreshes in components.
 */

import { create } from "zustand";

interface FavoritesState {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));

