import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { KEYS_LOCALE, render, screen } from "@/utils/test-utils";

import NavBar from "./nav-bar";

const renderNavBar = (props = {}, locale = KEYS_LOCALE) =>
  render(<NavBar userName="Maria" onLogout={vi.fn()} {...props} />, {
    locale,
  });

describe("NavBar", () => {
  test("greets the player by name", () => {
    renderNavBar();
    expect(
      screen.getByText("components.nav-bar.greeting Maria")
    ).toBeInTheDocument();
  });

  test("calls onLogout when the log out button is clicked", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    renderNavBar({ onLogout });

    await user.click(
      screen.getByRole("button", { name: "components.nav-bar.logout" })
    );

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test("renders the Spanish translations", () => {
    renderNavBar({}, "es");

    expect(screen.getByText("Hola Maria")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cerrar sesión" })
    ).toBeInTheDocument();
  });
});
