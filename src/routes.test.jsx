import { describe, test, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { act, renderHook } from "@testing-library/react";
import { render, screen } from "./utils/test-utils";

import { AppRoutes } from "./routes";
import { useAuth } from "./store/game-store";

describe("AppRoutes", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.logout());
    localStorage.clear();
  });

  test("redirects / to the home page", () => {
    render(<AppRoutes />, { initialPath: "/" });
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("renders the home page when the path is /home", () => {
    render(<AppRoutes />, { initialPath: "/home" });
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test.each(["/unknown", "/home/extra", "/some/deep/path"])(
    "redirects the unknown route %s to the home page",
    (path) => {
      render(<AppRoutes />, { initialPath: path });
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    }
  );

  test("redirects /game to home when no player is registered", () => {
    render(<AppRoutes />, { initialPath: "/game" });
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("registering a player from home opens the game page", async () => {
    const user = userEvent.setup();
    render(<AppRoutes />, { initialPath: "/" });

    await user.type(screen.getByRole("textbox", { name: "Name*" }), "Maria");
    await user.click(screen.getByRole("button", { name: "JOIN" }));

    expect(screen.getByTestId("game-page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Hi, Maria" })
    ).toBeInTheDocument();
  });

  describe("after the app is closed and reopened", () => {
    const reopenApp = async () => {
      vi.resetModules();
      return import("./routes");
    };

    test("restores the registered player and opens the game", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<AppRoutes />, { initialPath: "/" });
      await user.type(screen.getByRole("textbox", { name: "Name*" }), "Maria");
      await user.click(screen.getByRole("button", { name: "JOIN" }));
      unmount();

      const { AppRoutes: ReopenedRoutes } = await reopenApp();
      render(<ReopenedRoutes />, { initialPath: "/" });

      expect(
        screen.getByRole("heading", { level: 1, name: "Hi, Maria" })
      ).toBeInTheDocument();
    });

    test("restores every player's data from storage", async () => {
      localStorage.setItem(
        "rock-paper-scissors-storage",
        JSON.stringify({
          state: {
            currentUser: "Juan",
            players: { Maria: { score: 3 }, Juan: { score: 5 } },
          },
          version: 0,
        })
      );

      await reopenApp();
      const { useGameStats } = await import("./store/game-store");
      const { result } = renderHook(() => useGameStats());

      expect(result.current.players).toEqual({
        Maria: { score: 3 },
        Juan: { score: 5 },
      });
      expect(result.current.currentUserScore).toBe(5);
    });
  });
});
