import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { GAME_MODES, RESULTS } from "@/utils/game-rules";

const STORAGE_KEY = "rock-paper-scissors-storage";

/**
 * The store is a module-level singleton, so each test gets a fresh copy
 * by resetting the module registry and clearing persisted data.
 */
const loadStore = async () => {
  vi.resetModules();
  return import("./game-store");
};

const getPersistedState = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY)).state;

/** Statistics of a mode, with every value not given set to 0 */
const statsWith = (values = {}) => ({
  wins: 0,
  losses: 0,
  ties: 0,
  currentStreak: 0,
  longestStreak: 0,
  ...values,
});

/** Statistics after only winning `wins` rounds in a row */
const winsInARow = (wins) =>
  statsWith({ wins, currentStreak: wins, longestStreak: wins });

describe("game-store", () => {
  let useAuth;
  let useGameMode;
  let useGameStats;

  const renderStore = () =>
    renderHook(() => ({
      auth: useAuth(),
      mode: useGameMode(),
      stats: useGameStats(),
    }));

  beforeEach(async () => {
    localStorage.clear();
    ({ useAuth, useGameMode, useGameStats } = await loadStore());
  });

  describe("useAuth", () => {
    test("starts with no current user", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.currentUser).toBeNull();
    });

    test("login sets the current user", () => {
      const { result } = renderHook(() => useAuth());

      act(() => result.current.login("maria"));

      expect(result.current.currentUser).toBe("maria");
    });

    test("login creates a new player with a classic score of 0", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));

      expect(result.current.stats.players).toEqual({
        maria: { classicScore: 0 },
      });
      expect(result.current.stats.currentUserScore).toBe(0);
    });

    test("login in expanded mode creates an expanded score of 0", () => {
      const { result } = renderStore();

      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      act(() => result.current.auth.login("maria"));

      expect(result.current.stats.players).toEqual({
        maria: { expandedScore: 0 },
      });
    });

    test("login keeps the score of an existing player", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.recordResult(RESULTS.WIN));
      act(() => result.current.auth.logout());
      act(() => result.current.auth.login("maria"));

      expect(result.current.stats.currentUserScore).toBe(1);
    });

    test("login in another mode adds that score and keeps the other one", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.recordResult(RESULTS.WIN));
      act(() => result.current.auth.logout());
      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      act(() => result.current.auth.login("maria"));

      expect(result.current.stats.players).toEqual({
        maria: {
          classicScore: 1,
          classicStats: winsInARow(1),
          expandedScore: 0,
        },
      });
      expect(result.current.stats.currentUserScore).toBe(0);
    });

    test("logout clears the current user but keeps players", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.auth.logout());

      expect(result.current.auth.currentUser).toBeNull();
      expect(result.current.stats.players).toEqual({
        maria: { classicScore: 0 },
      });
    });
  });

  describe("useGameMode", () => {
    test("starts in classic mode", () => {
      const { result } = renderHook(() => useGameMode());
      expect(result.current.gameMode).toBe(GAME_MODES.CLASSIC);
    });

    test("setGameMode changes the mode", () => {
      const { result } = renderHook(() => useGameMode());

      act(() => result.current.setGameMode(GAME_MODES.EXPANDED));

      expect(result.current.gameMode).toBe(GAME_MODES.EXPANDED);
    });

    test("logout goes back to classic mode", () => {
      const { result } = renderStore();

      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      act(() => result.current.auth.login("maria"));
      act(() => result.current.auth.logout());

      expect(result.current.mode.gameMode).toBe(GAME_MODES.CLASSIC);
    });
  });

  describe("useGameStats", () => {
    test("starts with no players and a score of 0", () => {
      const { result } = renderHook(() => useGameStats());

      expect(result.current.players).toEqual({});
      expect(result.current.currentUserScore).toBe(0);
    });

    test("a win increments the current user's score", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.recordResult(RESULTS.WIN));
      act(() => result.current.stats.recordResult(RESULTS.WIN));

      expect(result.current.stats.currentUserScore).toBe(2);
      expect(result.current.stats.players.maria.classicScore).toBe(2);
    });

    test("a win in expanded mode only increments the expanded score", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.recordResult(RESULTS.WIN));
      act(() => result.current.auth.logout());
      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.recordResult(RESULTS.WIN));
      act(() => result.current.stats.recordResult(RESULTS.WIN));

      expect(result.current.stats.currentUserScore).toBe(2);
      expect(result.current.stats.players).toEqual({
        maria: {
          classicScore: 1,
          classicStats: winsInARow(1),
          expandedScore: 2,
          expandedStats: winsInARow(2),
        },
      });
    });

    test("a win only affects the current user", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.recordResult(RESULTS.WIN));
      act(() => result.current.auth.login("juan"));
      act(() => result.current.stats.recordResult(RESULTS.WIN));
      act(() => result.current.stats.recordResult(RESULTS.WIN));

      expect(result.current.stats.players).toEqual({
        maria: { classicScore: 1, classicStats: winsInARow(1) },
        juan: { classicScore: 2, classicStats: winsInARow(2) },
      });
      expect(result.current.stats.currentUserScore).toBe(2);
    });

    test("recording a result does nothing when there is no current user", () => {
      const { result } = renderHook(() => useGameStats());

      act(() => result.current.recordResult(RESULTS.WIN));

      expect(result.current.players).toEqual({});
      expect(result.current.currentUserScore).toBe(0);
    });

    test("currentUserScore is 0 after logout", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.recordResult(RESULTS.WIN));
      act(() => result.current.auth.logout());

      expect(result.current.stats.currentUserScore).toBe(0);
    });
  });

  describe("statistics", () => {
    const play = (result, ...outcomes) =>
      outcomes.forEach((outcome) =>
        act(() => result.current.stats.recordResult(outcome))
      );

    test("start empty for a new player", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));

      expect(result.current.stats.currentUserStats).toEqual(statsWith());
    });

    test("count wins, losses and ties, and only wins add points", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      play(
        result,
        RESULTS.WIN,
        RESULTS.LOSE,
        RESULTS.TIE,
        RESULTS.LOSE,
        RESULTS.WIN
      );

      expect(result.current.stats.currentUserScore).toBe(2);
      expect(result.current.stats.currentUserStats).toEqual(
        statsWith({
          wins: 2,
          losses: 2,
          ties: 1,
          currentStreak: 1,
          longestStreak: 1,
        })
      );
    });

    test.each([RESULTS.LOSE, RESULTS.TIE])(
      "a %s ends the winning streak but keeps the longest one",
      (outcome) => {
        const { result } = renderStore();

        act(() => result.current.auth.login("maria"));
        play(
          result,
          RESULTS.WIN,
          RESULTS.WIN,
          RESULTS.WIN,
          outcome,
          RESULTS.WIN
        );

        expect(result.current.stats.currentUserStats).toMatchObject({
          currentStreak: 1,
          longestStreak: 3,
        });
      }
    );

    test("the longest streak grows when the current one beats it", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      play(result, RESULTS.WIN, RESULTS.LOSE, RESULTS.WIN, RESULTS.WIN);

      expect(result.current.stats.currentUserStats).toMatchObject({
        currentStreak: 2,
        longestStreak: 2,
      });
    });

    test("the winning streak continues after logging in again", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      play(result, RESULTS.WIN, RESULTS.WIN);
      act(() => result.current.auth.logout());
      act(() => result.current.auth.login("maria"));
      play(result, RESULTS.WIN);

      expect(result.current.stats.currentUserStats).toEqual(winsInARow(3));
    });

    test("are kept apart for each game mode", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      play(result, RESULTS.LOSE);
      act(() => result.current.auth.logout());
      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      act(() => result.current.auth.login("maria"));
      play(result, RESULTS.TIE);

      expect(result.current.stats.currentUserStats).toEqual(
        statsWith({ ties: 1 })
      );
      expect(result.current.stats.players.maria.classicStats).toEqual(
        statsWith({ losses: 1 })
      );
    });

    test("start the score of a mode chosen after logging in", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      play(result, RESULTS.WIN);

      expect(result.current.stats.players.maria).toEqual({
        classicScore: 0,
        expandedScore: 1,
        expandedStats: winsInARow(1),
      });
    });

    test("are empty after logout", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      play(result, RESULTS.WIN);
      act(() => result.current.auth.logout());

      expect(result.current.stats.currentUserStats).toEqual(statsWith());
    });
  });

  describe("persistence", () => {
    test("persists state to localStorage", () => {
      const { result } = renderStore();

      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.recordResult(RESULTS.WIN));

      expect(getPersistedState()).toEqual({
        currentUser: "maria",
        gameMode: GAME_MODES.EXPANDED,
        players: {
          maria: { expandedScore: 1, expandedStats: winsInARow(1) },
        },
      });
    });

    test("rehydrates state from localStorage", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            currentUser: "maria",
            gameMode: GAME_MODES.EXPANDED,
            players: {
              maria: {
                classicScore: 5,
                expandedScore: 3,
                expandedStats: statsWith({ wins: 3, losses: 4 }),
              },
            },
          },
          version: 2,
        })
      );
      ({ useAuth, useGameMode, useGameStats } = await loadStore());

      const { result } = renderStore();

      expect(result.current.auth.currentUser).toBe("maria");
      expect(result.current.mode.gameMode).toBe(GAME_MODES.EXPANDED);
      expect(result.current.stats.currentUserScore).toBe(3);
      expect(result.current.stats.currentUserStats).toEqual(
        statsWith({ wins: 3, losses: 4 })
      );
    });

    test("gives a score of 0 to players saved before game modes without one", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: { currentUser: null, players: { maria: {} } },
          version: 0,
        })
      );
      ({ useAuth, useGameMode, useGameStats } = await loadStore());

      const { result } = renderStore();

      expect(result.current.stats.players).toEqual({
        maria: { classicScore: 0, classicStats: statsWith() },
      });
    });

    test.each([0, 1])(
      "starts with no players when version %i saved none",
      async (version) => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ state: { currentUser: null }, version })
        );
        ({ useAuth, useGameMode, useGameStats } = await loadStore());

        const { result } = renderStore();

        expect(result.current.stats.players).toEqual({});
      }
    );

    test("keeps the data saved by a newer version of the app as it is", async () => {
      const players = { maria: { classicScore: 2 } };
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            currentUser: "maria",
            gameMode: GAME_MODES.CLASSIC,
            players,
          },
          version: 99,
        })
      );
      ({ useAuth, useGameMode, useGameStats } = await loadStore());

      const { result } = renderStore();

      expect(result.current.stats.players).toEqual(players);
    });

    test("turns the scores saved before statistics into wins", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            currentUser: "maria",
            gameMode: GAME_MODES.CLASSIC,
            players: {
              maria: { classicScore: 5, expandedScore: 0 },
              juan: { expandedScore: 2 },
            },
          },
          version: 1,
        })
      );
      ({ useAuth, useGameMode, useGameStats } = await loadStore());

      const { result } = renderStore();

      expect(result.current.stats.players).toEqual({
        maria: {
          classicScore: 5,
          classicStats: statsWith({ wins: 5 }),
          expandedScore: 0,
          expandedStats: statsWith(),
        },
        juan: { expandedScore: 2, expandedStats: statsWith({ wins: 2 }) },
      });
      expect(result.current.stats.currentUserScore).toBe(5);
    });

    test("moves the scores saved before game modes to the classic mode", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            currentUser: "maria",
            players: { maria: { score: 5 }, juan: { score: 2 } },
          },
          version: 0,
        })
      );
      ({ useAuth, useGameMode, useGameStats } = await loadStore());

      const { result } = renderStore();

      expect(result.current.mode.gameMode).toBe(GAME_MODES.CLASSIC);
      expect(result.current.stats.players).toEqual({
        maria: { classicScore: 5, classicStats: statsWith({ wins: 5 }) },
        juan: { classicScore: 2, classicStats: statsWith({ wins: 2 }) },
      });
      expect(result.current.stats.currentUserScore).toBe(5);
    });
  });
});
