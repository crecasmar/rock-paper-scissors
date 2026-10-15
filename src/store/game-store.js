import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_GAME_MODE, SCORE_KEYS } from "@/utils/game-rules";

/**
 * A player only has the score of the game modes they have played.
 * @typedef {Object} PlayerData
 * @property {number} [classicScore]
 * @property {number} [expandedScore]
 */

const STORE_VERSION = 1;

/**
 * Version 0 kept a single `score`, which belonged to the classic mode.
 * @param {any} persistedState
 * @param {number} version
 */
const migrate = (persistedState, version) => {
  if (version === 0) {
    const players = Object.fromEntries(
      Object.entries(persistedState.players ?? {}).map(([name, { score }]) => [
        name,
        { [SCORE_KEYS.classic]: score ?? 0 },
      ])
    );
    return { ...persistedState, players, gameMode: DEFAULT_GAME_MODE };
  }
  return persistedState;
};

const useGameStore = create(
  persist(
    (set) => ({
      players: {},
      currentUser: null,
      gameMode: DEFAULT_GAME_MODE,

      setGameMode: (gameMode) => set({ gameMode }),

      login: (name) =>
        set((state) => {
          const scoreKey = SCORE_KEYS[state.gameMode];
          const player = state.players[name] ?? {};

          return {
            currentUser: name,
            players: {
              ...state.players,
              [name]: { ...player, [scoreKey]: player[scoreKey] ?? 0 },
            },
          };
        }),

      // Every new session starts in the default mode
      logout: () => set({ currentUser: null, gameMode: DEFAULT_GAME_MODE }),

      addWin: () =>
        set((state) => {
          const user = state.currentUser;
          if (!user) return state; // Safety check

          const scoreKey = SCORE_KEYS[state.gameMode];
          const player = state.players[user];

          return {
            players: {
              ...state.players,
              [user]: { ...player, [scoreKey]: (player[scoreKey] ?? 0) + 1 },
            },
          };
        }),
    }),
    { name: "rock-paper-scissors-storage", version: STORE_VERSION, migrate }
  )
);

/** Hook for authentication state and actions */
export const useAuth = () => {
  const currentUser = useGameStore((state) => state.currentUser);
  const login = useGameStore((state) => state.login);
  const logout = useGameStore((state) => state.logout);

  return { currentUser, login, logout };
};

/** Hook for the selected game mode */
export const useGameMode = () => {
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);

  return { gameMode, setGameMode };
};

/** Hook for gameplay data and scoring in the selected game mode */
export const useGameStats = () => {
  const players = useGameStore((state) => state.players);
  const addWin = useGameStore((state) => state.addWin);

  const currentUserScore = useGameStore(
    (state) =>
      state.players[state.currentUser]?.[SCORE_KEYS[state.gameMode]] ?? 0
  );

  return { players, addWin, currentUserScore };
};
