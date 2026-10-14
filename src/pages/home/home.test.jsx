import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import {
  KEYS_LOCALE,
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@/utils/test-utils";

import HomePage from "./home";
import { useAuth } from "@/store/game-store";
import { PLAYER_NAME_ERROR_DELAY_MS } from "@/utils/validation";

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
    { initialPath: "/home", locale: KEYS_LOCALE }
  );

const getNameInput = () =>
  screen.getByRole("textbox", { name: "pages.home.name-label" });
const getJoinButton = () =>
  screen.getByRole("button", { name: "PAGES.HOME.JOIN" });
const getNameHint = () => screen.getByRole("alert");

const NAME_HINT = "pages.home.name-hint";

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

  test("renders the title", () => {
    renderHome();
    expect(
      screen.getByRole("heading", { level: 1, name: "pages.home.title" })
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

  describe("invalid name error", () => {
    const setupUser = () =>
      userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });

    const waitForDebounce = () =>
      act(() => vi.advanceTimersByTime(PLAYER_NAME_ERROR_DELAY_MS));

    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("is hidden before the user types anything", () => {
      renderHome();

      expect(getNameHint()).toBeEmptyDOMElement();
      expect(getNameInput()).toHaveAttribute("aria-invalid", "false");
      expect(getNameInput()).not.toHaveAttribute("aria-describedby");
    });

    test("is not shown while the user is still typing", async () => {
      const user = setupUser();
      renderHome();

      await user.type(getNameInput(), "ab");
      act(() => vi.advanceTimersByTime(PLAYER_NAME_ERROR_DELAY_MS - 100));

      expect(getNameHint()).toBeEmptyDOMElement();
      expect(getNameInput()).toHaveAttribute("aria-invalid", "false");
    });

    test.each(["ab", "   ", "maria!"])(
      "is shown once the user stops typing the invalid name %j",
      async (name) => {
        const user = setupUser();
        renderHome();

        await user.type(getNameInput(), name);
        waitForDebounce();

        expect(getNameHint()).toHaveTextContent(NAME_HINT);
        expect(getNameInput()).toHaveAttribute("aria-invalid", "true");
        expect(getNameInput()).toHaveAccessibleDescription(NAME_HINT);
      }
    );

    test("restarts the wait on every keystroke", async () => {
      const user = setupUser();
      renderHome();

      await user.type(getNameInput(), "a");
      act(() => vi.advanceTimersByTime(PLAYER_NAME_ERROR_DELAY_MS - 100));
      await user.type(getNameInput(), "b");
      act(() => vi.advanceTimersByTime(PLAYER_NAME_ERROR_DELAY_MS - 100));

      expect(getNameHint()).toBeEmptyDOMElement();

      act(() => vi.advanceTimersByTime(100));

      expect(getNameHint()).toHaveTextContent(NAME_HINT);
    });

    test("is not shown for a valid name", async () => {
      const user = setupUser();
      renderHome();

      await user.type(getNameInput(), "Maria");
      waitForDebounce();

      expect(getNameHint()).toBeEmptyDOMElement();
      expect(getNameInput()).toHaveAttribute("aria-invalid", "false");
    });

    test("clears immediately once the name becomes valid", async () => {
      const user = setupUser();
      renderHome();

      await user.type(getNameInput(), "ab");
      waitForDebounce();
      await user.type(getNameInput(), "c");

      expect(getNameHint()).toBeEmptyDOMElement();
      expect(getNameInput()).toHaveAttribute("aria-invalid", "false");
    });

    test("clears immediately once the input is emptied", async () => {
      const user = setupUser();
      renderHome();

      await user.type(getNameInput(), "ab");
      waitForDebounce();
      await user.clear(getNameInput());
      waitForDebounce();

      expect(getNameHint()).toBeEmptyDOMElement();
      expect(getNameInput()).toHaveAttribute("aria-invalid", "false");
    });

    test("is not shown after leaving the page mid-wait", async () => {
      const user = setupUser();
      const { unmount } = renderHome();

      await user.type(getNameInput(), "ab");
      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
