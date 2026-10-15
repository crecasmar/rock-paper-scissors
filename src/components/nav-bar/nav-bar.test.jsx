import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { KEYS_LOCALE, render, screen } from "@/utils/test-utils";

import NavBar from "./nav-bar";

const renderNavBar = (props = {}, locale = KEYS_LOCALE) =>
  render(<NavBar {...props} />, { locale });

const queryLogoutButton = () =>
  screen.queryByRole("button", { name: "components.nav-bar.logout" });

describe("NavBar", () => {
  test("renders a labelled navigation landmark", () => {
    renderNavBar();
    expect(
      screen.getByRole("navigation", { name: "components.nav-bar.label" })
    ).toBeInTheDocument();
  });

  describe("without a player", () => {
    test("shows only the app name", () => {
      renderNavBar();

      expect(screen.getByRole("banner")).toHaveTextContent("app-name");
      expect(queryLogoutButton()).not.toBeInTheDocument();
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

    rerender(<NavBar userName="Maria" onLogout={vi.fn()} />);

    expect(screen.getByText("Hola Maria")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cerrar sesión" })
    ).toBeInTheDocument();
  });
});
