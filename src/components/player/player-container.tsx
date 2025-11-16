/**
 * Player Container
 *
 * Wraps the radio player and manages global player state.
 */

"use client";

import { RadioPlayer } from "./radio-player";
import { usePlayerStore } from "~/lib/store/player-store";

export function PlayerContainer() {
  const { currentStation, isPlayerVisible, hidePlayer, setCurrentStation } =
    usePlayerStore();

  if (!isPlayerVisible || !currentStation) {
    return null;
  }

  return (
    <RadioPlayer
      station={currentStation}
      onClose={() => {
        hidePlayer();
        setCurrentStation(null);
      }}
    />
  );
}

