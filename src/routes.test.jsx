import { describe, test, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { act, renderHook } from "@testing-library/react";
import { KEYS_LOCALE, render, screen, within } from "./utils/test-utils";

import { AppRoutes } from "./routes";
import { useAuth } from "./store/game-store";

const renderRoutes = (Routes, initialPath) =>
  render(<Routes />, { initialPath, locale: KEYS_LOCALE });

const registerPlayer = async (user, name) => {
  await user.type(
    screen.getByRole("textbox", { name: "pages.home.name-label" }),
    name
  );
  await user.click(screen.getByRole("button", { name: "PAGES.HOME.JOIN" }));
};

describe("AppRoutes", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useAuth());
    act(() => result.current.logout());
    localStorage.clear();
  });

  test("redirects / to the home page", () => {
    renderRoutes(AppRoutes, "/");
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("renders the home page when the path is /home", () => {
    renderRoutes(AppRoutes, "/home");
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test.each(["/unknown", "/home/extra", "/some/deep/path"])(
    "shows the not found page for the unknown route %s",
    (path) => {
      renderRoutes(AppRoutes, path);
      expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
    }
  );

  test("redirects /game to home when no player is registered", () => {
    renderRoutes(AppRoutes, "/game");
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("registering a player from home opens the game page", async () => {
    const user = userEvent.setup();
    renderRoutes(AppRoutes, "/");

    await registerPlayer(user, "Maria");

    expect(screen.getByTestId("game-page")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveTextContent(
      "components.nav-bar.greeting Maria"
    );
  });

  describe("ranking", () => {
    test("renders the ranking page when the path is /ranking", () => {
      renderRoutes(AppRoutes, "/ranking");
      expect(screen.getByTestId("ranking-page")).toBeInTheDocument();
    });

    test("is reachable from home and goes back to it", async () => {
      const user = userEvent.setup();
      renderRoutes(AppRoutes, "/home");

      await user.click(
        screen.getByRole("link", { name: "components.ranking-link.see" })
      );
      expect(screen.getByTestId("ranking-page")).toBeInTheDocument();

      await user.click(
        screen.getByRole("link", { name: "components.ranking-link.back" })
      );
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    test("is reachable from the not found page and goes back to it", async () => {
      const user = userEvent.setup();
      renderRoutes(AppRoutes, "/unknown");

      await user.click(
        screen.getByRole("link", { name: "components.ranking-link.see" })
      );
      expect(screen.getByTestId("ranking-page")).toBeInTheDocument();

      await user.click(
        screen.getByRole("link", { name: "components.ranking-link.back" })
      );
      expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
    });

    test("is hidden while playing and lists the player once logged out", async () => {
      const user = userEvent.setup();
      renderRoutes(AppRoutes, "/");
      await registerPlayer(user, "Maria");

      expect(screen.queryByRole("link")).not.toBeInTheDocument();

      await user.click(
        screen.getByRole("button", { name: "components.nav-bar.logout" })
      );
      await user.click(
        screen.getByRole("link", { name: "components.ranking-link.see" })
      );

      expect(screen.getByRole("listitem")).toHaveTextContent(
        "pages.ranking.player-label 1 Maria 0"
      );
    });
  });

  describe("navigation bar", () => {
    test.each(["/home", "/unknown"])(
      "shows the app name and the ranking link on %s when no player is logged in",
      (path) => {
        renderRoutes(AppRoutes, path);

        const banner = within(screen.getByRole("banner"));
        expect(screen.getByRole("banner")).toHaveTextContent("app-name");
        expect(
          banner.getByRole("link", { name: "components.ranking-link.see" })
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "components.nav-bar.logout" })
        ).not.toBeInTheDocument();
      }
    );

    test("greets the player on the not found page", async () => {
      const user = userEvent.setup();
      const { unmount } = renderRoutes(AppRoutes, "/");
      await registerPlayer(user, "Maria");
      unmount();

      renderRoutes(AppRoutes, "/unknown");

      expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
      expect(screen.getByRole("banner")).toHaveTextContent(
        "components.nav-bar.greeting Maria"
      );
    });

    test("logging out from the game goes back home", async () => {
      const user = userEvent.setup();
      renderRoutes(AppRoutes, "/");
      await registerPlayer(user, "Maria");

      await user.click(
        screen.getByRole("button", { name: "components.nav-bar.logout" })
      );

      expect(screen.getByTestId("home-page")).toBeInTheDocument();
      expect(screen.getByRole("banner")).toHaveTextContent("app-name");
    });
  });

  describe("after the app is closed and reopened", () => {
    const reopenApp = async () => {
      vi.resetModules();
      return import("./routes");
    };

    test("restores the registered player and opens the game", async () => {
      const user = userEvent.setup();
      const { unmount } = renderRoutes(AppRoutes, "/");
      await registerPlayer(user, "Maria");
      unmount();

      const { AppRoutes: ReopenedRoutes } = await reopenApp();
      renderRoutes(ReopenedRoutes, "/");

      expect(screen.getByRole("banner")).toHaveTextContent(
        "components.nav-bar.greeting Maria"
      );
    });

    test("restores every player's data from storage", async () => {
      localStorage.setItem(
        "rock-paper-scissors-storage",
        JSON.stringify({
          state: {
            currentUser: "Juan",
            players: {
              Maria: { classicScore: 3 },
              Juan: { classicScore: 5, expandedScore: 2 },
            },
            gameMode: "classic",
          },
          version: 1,
        })
      );

      await reopenApp();
      const { useGameStats } = await import("./store/game-store");
      const { result } = renderHook(() => useGameStats());

      expect(result.current.players).toMatchObject({
        Maria: { classicScore: 3 },
        Juan: { classicScore: 5, expandedScore: 2 },
      });
      expect(result.current.currentUserScore).toBe(5);
    });
  });
});
