import { describe, test, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { act, fireEvent, render, renderHook, screen } from "@/utils/test-utils";

import HomePage from "./home";
import { useAuth } from "@/store/game-store";

const STORAGE_KEY = "rock-paper-scissors-storage";

const getPersistedState = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY)).state;

const getAuth = () => renderHook(() => useAuth()).result.current;

const renderHome = () =>
  render(
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/game" element={<div data-testid="game-page" />} />
    </Routes>,
    { initialPath: "/home" }
  );

const getNameInput = () => screen.getByRole("textbox", { name: "Name" });
const getJoinButton = () => screen.getByRole("button", { name: "JOIN" });

describe("HomePage", () => {
  beforeEach(() => {
    const { logout } = getAuth();
    act(() => logout());
    localStorage.clear();
  });

  test("renders the home page container", () => {
    renderHome();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("renders the 'Create new player' title", () => {
    renderHome();
    expect(
      screen.getByRole("heading", { level: 1, name: "Create new player" })
    ).toBeInTheDocument();
  });

  test("renders the name input and the JOIN button", () => {
    renderHome();
    expect(getNameInput()).toBeInTheDocument();
    expect(getJoinButton()).toBeInTheDocument();
  });

  test("JOIN is disabled while the name is empty", () => {
    renderHome();
    expect(getJoinButton()).toBeDisabled();
  });

  test.each(["ab", "   ", "maria!"])(
    "JOIN stays disabled for the invalid name %j",
    async (name) => {
      const user = userEvent.setup();
      renderHome();

      await user.type(getNameInput(), name);

      expect(getJoinButton()).toBeDisabled();
      expect(getNameInput()).toHaveAttribute("aria-invalid", "true");
    }
  );

  test("JOIN is enabled once a valid name is entered", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(getNameInput(), "Maria");

    expect(getJoinButton()).toBeEnabled();
    expect(getNameInput()).toHaveAttribute("aria-invalid", "false");
  });

  test("JOIN is disabled again when the name becomes invalid", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(getNameInput(), "Maria");
    await user.clear(getNameInput());

    expect(getJoinButton()).toBeDisabled();
  });

  test("clicking JOIN registers the trimmed name and opens the game", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(getNameInput(), "  Maria  ");
    await user.click(getJoinButton());

    expect(getAuth().currentUser).toBe("Maria");
    expect(screen.getByTestId("game-page")).toBeInTheDocument();
  });

  test("the registered player is persisted", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(getNameInput(), "Maria");
    await user.click(getJoinButton());

    expect(getPersistedState()).toMatchObject({
      currentUser: "Maria",
      players: { Maria: { score: 0 } },
    });
  });

  test("redirects to the game when a player is already registered", () => {
    const { login } = getAuth();
    act(() => login("Maria"));
    renderHome();

    expect(screen.getByTestId("game-page")).toBeInTheDocument();
  });

  test("pressing Enter with a valid name submits the form", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(getNameInput(), "Maria{Enter}");

    expect(getAuth().currentUser).toBe("Maria");
    expect(screen.getByTestId("game-page")).toBeInTheDocument();
  });

  test("pressing Enter with an invalid name does nothing", async () => {
    const user = userEvent.setup();
    renderHome();

    await user.type(getNameInput(), "ab{Enter}");

    expect(getAuth().currentUser).toBeNull();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("submitting the form directly with an invalid name does nothing", () => {
    renderHome();

    fireEvent.change(getNameInput(), { target: { value: "ab" } });
    fireEvent.submit(getNameInput().closest("form"));

    expect(getAuth().currentUser).toBeNull();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("renders the Spanish translations", () => {
    render(<HomePage />, { initialPath: "/home", locale: "es" });
    expect(
      screen.getByRole("heading", { level: 1, name: "Crear nuevo jugador" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "UNIRSE" })).toBeDisabled();
  });
});
