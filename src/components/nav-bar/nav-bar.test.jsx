import { describe, test, expect, vi } from "vitest";
import { Route, Routes } from "react-router";
import userEvent from "@testing-library/user-event";
import { KEYS_LOCALE, render, screen } from "@/utils/test-utils";

import NavBar from "./nav-bar";

const renderNavBar = (props = {}, locale = KEYS_LOCALE, initialPath = "/") =>
  render(<NavBar {...props} />, { locale, initialPath });

const queryLogoutButton = () =>
  screen.queryByRole("button", { name: "components.nav-bar.logout" });
const SEE_RANKING = "components.ranking-link.see";
const BACK = "components.ranking-link.back";

describe("NavBar", () => {
  test("renders a labelled navigation landmark", () => {
    renderNavBar();
    expect(
      screen.getByRole("navigation", { name: "components.nav-bar.label" })
    ).toBeInTheDocument();
  });

  describe("without a player", () => {
    test("shows the app name and the link to the ranking", () => {
      renderNavBar({}, KEYS_LOCALE, "/home");

      expect(screen.getByRole("banner")).toHaveTextContent("app-name");
      expect(screen.getByRole("link", { name: SEE_RANKING })).toHaveAttribute(
        "href",
        "/ranking"
      );
      expect(queryLogoutButton()).not.toBeInTheDocument();
    });

    test("links back to the previous page from the ranking", () => {
      render(
        <Routes>
          <Route path="/ranking" element={<NavBar />} />
        </Routes>,
        {
          locale: KEYS_LOCALE,
          initialEntries: [{ pathname: "/ranking", state: { from: "/game" } }],
        }
      );

      expect(screen.getByRole("link", { name: BACK })).toHaveAttribute(
        "href",
        "/game"
      );
      expect(
        screen.queryByRole("link", { name: SEE_RANKING })
      ).not.toBeInTheDocument();
    });
  });

  describe("with a player", () => {
    test("greets the player by name", () => {
      renderNavBar({ userName: "Maria", onLogout: vi.fn() });

      expect(
        screen.getByText("components.nav-bar.greeting Maria")
      ).toBeInTheDocument();
      expect(screen.queryByText("app-name")).not.toBeInTheDocument();
    });

    test.each(["/home", "/ranking"])(
      "shows log out instead of the ranking link on %s",
      (path) => {
        renderNavBar(
          { userName: "Maria", onLogout: vi.fn() },
          KEYS_LOCALE,
          path
        );

        expect(queryLogoutButton()).toBeInTheDocument();
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
      }
    );

    test("shows the button to change the game mode", () => {
      renderNavBar({ userName: "Maria", onLogout: vi.fn() });

      expect(
        screen.getByRole("button", {
          name: "game.modes.switch game.modes.expanded",
        })
      ).toBeInTheDocument();
    });

    test("calls onLogout when the log out button is clicked", async () => {
      const user = userEvent.setup();
      const onLogout = vi.fn();
      renderNavBar({ userName: "Maria", onLogout });

      await user.click(queryLogoutButton());

      expect(onLogout).toHaveBeenCalledTimes(1);
    });
  });

  test("renders the Spanish translations", () => {
    const { rerender } = renderNavBar({}, "es");

    expect(screen.getByRole("banner")).toHaveTextContent(
      "Piedra, Papel o Tijera"
    );
    expect(
      screen.getByRole("navigation", { name: "Navegación principal" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver ranking" })
    ).toBeInTheDocument();

    rerender(<NavBar userName="Maria" onLogout={vi.fn()} />);

    expect(screen.getByText("Hola Maria")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cerrar sesión" })
    ).toBeInTheDocument();
  });
});
