import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  DEFAULT_GAME_MODE,
  RESULTS,
  SCORE_KEYS,
  STATS_KEYS,
} from "@/utils/game-rules";

/**
 * Results of every round a player has played in one game mode.
 * @typedef {Object} PlayerStats
 * @property {number} wins
 * @property {number} losses
 * @property {number} ties
 * @property {number} currentStreak - wins in a row up to the last round
 * @property {number} longestStreak - most wins in a row ever
 */

/**
 * A player only has the score and statistics of the game modes they have played.
 * @typedef {Object} PlayerData
 * @property {number} [classicScore]
 * @property {number} [expandedScore]
 * @property {PlayerStats} [classicStats]
 * @property {PlayerStats} [expandedStats]
 */

/** @type {Readonly<PlayerStats>} */
export const EMPTY_STATS = Object.freeze({
  wins: 0,
  losses: 0,
  ties: 0,
  currentStreak: 0,
  longestStreak: 0,
});

/**
 * Adds the result of a round to the statistics. Losing or tying ends the
 * winning streak.
 * @param {PlayerStats} stats
 * @param {string} result - One of RESULTS
 * @returns {PlayerStats}
 */
export const addResultToStats = (stats, result) => {
  if (result === RESULTS.WIN) {
    const currentStreak = stats.currentStreak + 1;
    return {
      ...stats,
      wins: stats.wins + 1,
      currentStreak,
      longestStreak: Math.max(stats.longestStreak, currentStreak),
    };
  }
  if (result === RESULTS.LOSE) {
    return { ...stats, losses: stats.losses + 1, currentStreak: 0 };
  }
  return { ...stats, ties: stats.ties + 1, currentStreak: 0 };
};

const STORE_VERSION = 2;

/**
 * Version 0 kept a single `score`, which belonged to the classic mode.
 * Version 1 had no statistics: every point was a win, so the score becomes
 * the number of wins. Losses, ties and streaks were never saved.
 * @param {any} persistedState
 * @param {number} version
 */
const migrate = (persistedState, version) => {
  let state = persistedState;

  if (version === 0) {
    const players = Object.fromEntries(
      Object.entries(state.players ?? {}).map(([name, { score }]) => [
        name,
        { [SCORE_KEYS.classic]: score ?? 0 },
      ])
    );
    state = { ...state, players, gameMode: DEFAULT_GAME_MODE };
  }

  if (version <= 1) {
    const players = Object.fromEntries(
      Object.entries(state.players ?? {}).map(([name, player]) => {
        const stats = Object.entries(SCORE_KEYS)
          .filter(([, scoreKey]) => scoreKey in player)
          .map(([mode, scoreKey]) => [
            STATS_KEYS[mode],
            { ...EMPTY_STATS, wins: player[scoreKey] },
          ]);
        return [name, { ...player, ...Object.fromEntries(stats) }];
      })
    );
    state = { ...state, players };
  }

  return state;
};

const useGameStore = create(
  persist(
    (set) => ({
      players: {},
      currentUser: null,
      gameMode: DEFAULT_GAME_MODE,

      // A logged in player starts the new mode with a score, as on login
      setGameMode: (gameMode) =>
        set((state) => {
          const user = state.currentUser;
          if (!user) return { gameMode };

          const scoreKey = SCORE_KEYS[gameMode];
          const player = state.players[user] ?? {};

          return {
            gameMode,
            players: {
              ...state.players,
              [user]: { ...player, [scoreKey]: player[scoreKey] ?? 0 },
            },
          };
        }),

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

      // Saves a round of the selected game mode. Only wins add a point.
      recordResult: (result) =>
        set((state) => {
          const user = state.currentUser;
          if (!user) return state; // Safety check

          const scoreKey = SCORE_KEYS[state.gameMode];
          const statsKey = STATS_KEYS[state.gameMode];
          const player = state.players[user];
          const score = player[scoreKey] ?? 0;

          return {
            players: {
              ...state.players,
              [user]: {
                ...player,
                [scoreKey]: result === RESULTS.WIN ? score + 1 : score,
                [statsKey]: addResultToStats(
                  player[statsKey] ?? EMPTY_STATS,
                  result
                ),
              },
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

/** Hook for gameplay data, scoring and statistics in the selected game mode */
export const useGameStats = () => {
  const players = useGameStore((state) => state.players);
  const recordResult = useGameStore((state) => state.recordResult);

  const currentUserScore = useGameStore(
    (state) =>
      state.players[state.currentUser]?.[SCORE_KEYS[state.gameMode]] ?? 0
  );

  const currentUserStats = useGameStore(
    (state) =>
      state.players[state.currentUser]?.[STATS_KEYS[state.gameMode]] ??
      EMPTY_STATS
  );

  return { players, recordResult, currentUserScore, currentUserStats };
};
