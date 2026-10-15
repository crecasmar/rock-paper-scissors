import { describe, test, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  KEYS_LOCALE,
  act,
  render,
  renderHook,
  screen,
} from "@/utils/test-utils";

import GameModeSwitch from "./game-mode-switch";
import { useAuth, useGameMode } from "@/store/game-store";
import { GAME_MODES } from "@/utils/game-rules";

const getGameMode = () => renderHook(() => useGameMode()).result.current;

const renderSwitch = (locale = KEYS_LOCALE) =>
  render(<GameModeSwitch />, { locale });

const switchTo = (mode) =>
  screen.getByRole("button", { name: `game.modes.switch ${mode}` });

describe("GameModeSwitch", () => {
  beforeEach(() => {
    // Logging out goes back to the default mode
    const { logout } = renderHook(() => useAuth()).result.current;
    act(() => logout());
    localStorage.clear();
  });

  test("offers the expanded mode while playing classic", () => {
    renderSwitch();

    expect(switchTo("game.modes.expanded")).toBeInTheDocument();
  });

  test("switches between the modes", async () => {
    const user = userEvent.setup();
    renderSwitch();

    await user.click(switchTo("game.modes.expanded"));
    expect(getGameMode().gameMode).toBe(GAME_MODES.EXPANDED);

    await user.click(switchTo("game.modes.classic"));
    expect(getGameMode().gameMode).toBe(GAME_MODES.CLASSIC);
  });

  test("renders the Spanish translations", () => {
    renderSwitch("es");

    expect(
      screen.getByRole("button", { name: "Jugar Extendido" })
    ).toBeInTheDocument();
  });
});
