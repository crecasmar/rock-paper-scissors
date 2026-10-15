import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { GAME_MODES } from "@/utils/game-rules";

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
      act(() => result.current.stats.addWin());
      act(() => result.current.auth.logout());
      act(() => result.current.auth.login("maria"));

      expect(result.current.stats.currentUserScore).toBe(1);
    });

    test("login in another mode adds that score and keeps the other one", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.auth.logout());
      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      act(() => result.current.auth.login("maria"));

      expect(result.current.stats.players).toEqual({
        maria: { classicScore: 1, expandedScore: 0 },
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

    test("addWin increments the current user's score", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.stats.addWin());

      expect(result.current.stats.currentUserScore).toBe(2);
      expect(result.current.stats.players.maria.classicScore).toBe(2);
    });

    test("addWin in expanded mode only increments the expanded score", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.auth.logout());
      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.stats.addWin());

      expect(result.current.stats.currentUserScore).toBe(2);
      expect(result.current.stats.players).toEqual({
        maria: { classicScore: 1, expandedScore: 2 },
      });
    });

    test("addWin only affects the current user", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.auth.login("juan"));
      act(() => result.current.stats.addWin());
      act(() => result.current.stats.addWin());

      expect(result.current.stats.players).toEqual({
        maria: { classicScore: 1 },
        juan: { classicScore: 2 },
      });
      expect(result.current.stats.currentUserScore).toBe(2);
    });

    test("addWin does nothing when there is no current user", () => {
      const { result } = renderHook(() => useGameStats());

      act(() => result.current.addWin());

      expect(result.current.players).toEqual({});
      expect(result.current.currentUserScore).toBe(0);
    });

    test("currentUserScore is 0 after logout", () => {
      const { result } = renderStore();

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.auth.logout());

      expect(result.current.stats.currentUserScore).toBe(0);
    });
  });

  describe("persistence", () => {
    test("persists state to localStorage", () => {
      const { result } = renderStore();

      act(() => result.current.mode.setGameMode(GAME_MODES.EXPANDED));
      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());

      expect(getPersistedState()).toEqual({
        currentUser: "maria",
        gameMode: GAME_MODES.EXPANDED,
        players: { maria: { expandedScore: 1 } },
      });
    });

    test("rehydrates state from localStorage", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: {
            currentUser: "maria",
            gameMode: GAME_MODES.EXPANDED,
            players: { maria: { classicScore: 5, expandedScore: 3 } },
          },
          version: 1,
        })
      );
      ({ useAuth, useGameMode, useGameStats } = await loadStore());

      const { result } = renderStore();

      expect(result.current.auth.currentUser).toBe("maria");
      expect(result.current.mode.gameMode).toBe(GAME_MODES.EXPANDED);
      expect(result.current.stats.currentUserScore).toBe(3);
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
        maria: { classicScore: 5 },
        juan: { classicScore: 2 },
      });
      expect(result.current.stats.currentUserScore).toBe(5);
    });
  });
});
