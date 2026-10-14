import { describe, test, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

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
  let useGameStats;

  beforeEach(async () => {
    localStorage.clear();
    ({ useAuth, useGameStats } = await loadStore());
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

    test("login creates a new player with a score of 0", () => {
      const { result } = renderHook(() => ({
        auth: useAuth(),
        stats: useGameStats(),
      }));

      act(() => result.current.auth.login("maria"));

      expect(result.current.stats.players).toEqual({ maria: { score: 0 } });
      expect(result.current.stats.currentUserScore).toBe(0);
    });

    test("login keeps the score of an existing player", () => {
      const { result } = renderHook(() => ({
        auth: useAuth(),
        stats: useGameStats(),
      }));

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.auth.logout());
      act(() => result.current.auth.login("maria"));

      expect(result.current.stats.currentUserScore).toBe(1);
    });

    test("logout clears the current user but keeps players", () => {
      const { result } = renderHook(() => ({
        auth: useAuth(),
        stats: useGameStats(),
      }));

      act(() => result.current.auth.login("maria"));
      act(() => result.current.auth.logout());

      expect(result.current.auth.currentUser).toBeNull();
      expect(result.current.stats.players).toEqual({ maria: { score: 0 } });
    });
  });

  describe("useGameStats", () => {
    test("starts with no players and a score of 0", () => {
      const { result } = renderHook(() => useGameStats());

      expect(result.current.players).toEqual({});
      expect(result.current.currentUserScore).toBe(0);
    });

    test("addWin increments the current user's score", () => {
      const { result } = renderHook(() => ({
        auth: useAuth(),
        stats: useGameStats(),
      }));

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.stats.addWin());

      expect(result.current.stats.currentUserScore).toBe(2);
      expect(result.current.stats.players.maria.score).toBe(2);
    });

    test("addWin only affects the current user", () => {
      const { result } = renderHook(() => ({
        auth: useAuth(),
        stats: useGameStats(),
      }));

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.auth.login("juan"));
      act(() => result.current.stats.addWin());
      act(() => result.current.stats.addWin());

      expect(result.current.stats.players).toEqual({
        maria: { score: 1 },
        juan: { score: 2 },
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
      const { result } = renderHook(() => ({
        auth: useAuth(),
        stats: useGameStats(),
      }));

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());
      act(() => result.current.auth.logout());

      expect(result.current.stats.currentUserScore).toBe(0);
    });
  });

  describe("persistence", () => {
    test("persists state to localStorage", () => {
      const { result } = renderHook(() => ({
        auth: useAuth(),
        stats: useGameStats(),
      }));

      act(() => result.current.auth.login("maria"));
      act(() => result.current.stats.addWin());

      expect(getPersistedState()).toEqual({
        currentUser: "maria",
        players: { maria: { score: 1 } },
      });
    });

    test("rehydrates state from localStorage", async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          state: { currentUser: "maria", players: { maria: { score: 5 } } },
          version: 0,
        })
      );
      ({ useAuth, useGameStats } = await loadStore());

      const { result } = renderHook(() => ({
        auth: useAuth(),
        stats: useGameStats(),
      }));

      expect(result.current.auth.currentUser).toBe("maria");
      expect(result.current.stats.currentUserScore).toBe(5);
    });
  });
});
