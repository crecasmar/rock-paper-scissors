import { describe, test, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  KEYS_LOCALE,
  act,
  render,
  renderHook,
  screen,
  within,
} from "@/utils/test-utils";

import GameModeSelector from "./game-mode-selector";
import { useAuth, useGameMode } from "@/store/game-store";
import { GAME_MODES } from "@/utils/game-rules";

const TITLE = "components.game-mode-selector.title";
const CLASSIC = "game.modes.classic";
const EXPANDED = "game.modes.expanded";

const getGameMode = () => renderHook(() => useGameMode()).result.current;

const renderSelector = (locale = KEYS_LOCALE) =>
  render(<GameModeSelector />, { locale });

const getGroup = (name = TITLE) => screen.getByRole("group", { name });
const getRadio = (name) => screen.getByRole("radio", { name });

describe("GameModeSelector", () => {
  beforeEach(() => {
    // Logging out goes back to the default mode
    const { logout } = renderHook(() => useAuth()).result.current;
    act(() => logout());
    localStorage.clear();
  });

  test("renders a radio button for each mode under its title", () => {
    renderSelector();

    expect(
      within(getGroup())
        .getAllByRole("radio")
        .map((radio) => radio.value)
    ).toEqual([GAME_MODES.CLASSIC, GAME_MODES.EXPANDED]);
    expect(getRadio(CLASSIC)).toBeInTheDocument();
    expect(getRadio(EXPANDED)).toBeInTheDocument();
  });

  test("classic is selected by default", () => {
    renderSelector();

    expect(getRadio(CLASSIC)).toBeChecked();
    expect(getRadio(EXPANDED)).not.toBeChecked();
  });

  test("shows the mode already stored as selected", () => {
    const { setGameMode } = getGameMode();
    act(() => setGameMode(GAME_MODES.EXPANDED));
    renderSelector();

    expect(getRadio(EXPANDED)).toBeChecked();
  });

  test.each([
    [EXPANDED, GAME_MODES.EXPANDED],
    [CLASSIC, GAME_MODES.CLASSIC],
  ])("selecting %s stores the %s mode", async (name, mode) => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(getRadio(EXPANDED));
    await user.click(getRadio(name));

    expect(getRadio(name)).toBeChecked();
    expect(getGameMode().gameMode).toBe(mode);
  });

  test("the modes can be changed with the arrow keys", async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.tab();
    expect(getRadio(CLASSIC)).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(getRadio(EXPANDED)).toBeChecked();
    expect(getGameMode().gameMode).toBe(GAME_MODES.EXPANDED);
  });

  test("renders the Spanish translations", () => {
    renderSelector("es");

    expect(getGroup("Elige tu modo")).toBeInTheDocument();
    expect(getRadio("Clásico")).toBeChecked();
    expect(getRadio("Extendido")).toBeInTheDocument();
  });
});
