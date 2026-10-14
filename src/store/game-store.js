import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * @typedef {Object} PlayerData
 * @property {number} score
 */

const DEFAULT_PLAYER_DATA = { score: 0 };

const useGameStore = create(
  persist(
    (set) => ({
      players: {},
      currentUser: null,

      login: (name) =>
        set((state) => ({
          currentUser: name,
          players: {
            ...state.players,
            [name]: state.players[name] || { ...DEFAULT_PLAYER_DATA },
          },
        })),

      logout: () => set({ currentUser: null }),

      addWin: () =>
        set((state) => {
          const user = state.currentUser;
          if (!user) return state; // Safety check

          return {
            players: {
              ...state.players,
              [user]: { score: state.players[user].score + 1 },
            },
          };
        }),
    }),
    { name: "rock-paper-scissors-storage" }
  )
);

/** Hook for authentication state and actions */
export const useAuth = () => {
  const currentUser = useGameStore((state) => state.currentUser);
  const login = useGameStore((state) => state.login);
  const logout = useGameStore((state) => state.logout);

  return { currentUser, login, logout };
};

/** Hook for gameplay data and scoring */
export const useGameStats = () => {
  const players = useGameStore((state) => state.players);
  const addWin = useGameStore((state) => state.addWin);

  const currentUserScore = useGameStore((state) =>
    state.currentUser && state.players[state.currentUser]
      ? state.players[state.currentUser].score
      : 0
  );

  return { players, addWin, currentUserScore };
};
