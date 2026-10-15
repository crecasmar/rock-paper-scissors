import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { KEYS_LOCALE, render, screen, within } from "@/utils/test-utils";

import GameModeTitle from "./game-mode-title";
import { GAME_MODE_RULES, GAME_MODES } from "@/utils/game-rules";

const renderTitle = (mode = GAME_MODES.CLASSIC, locale = KEYS_LOCALE) =>
  render(<GameModeTitle mode={mode} />, { locale });

const getInfoButton = (mode = "game.modes.classic") =>
  screen.getByRole("button", { name: `game.rules.show ${mode}` });
const getTooltip = () => screen.getByRole("tooltip", { hidden: true });
const isOpen = () => getTooltip().dataset.open === "true";

describe("GameModeTitle", () => {
  test.each([
    [GAME_MODES.CLASSIC, "game.modes.classic"],
    [GAME_MODES.EXPANDED, "game.modes.expanded"],
  ])("shows the %s mode as the title", (mode, name) => {
    renderTitle(mode);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: `game.modes.title ${name}`,
      })
    ).toBeInTheDocument();
    expect(getInfoButton(name)).toBeInTheDocument();
  });

  test.each(Object.values(GAME_MODES))(
    "the tooltip lists the rules of the %s mode",
    (mode) => {
      renderTitle(mode);

      expect(
        within(getTooltip())
          .getAllByRole("listitem", { hidden: true })
          .map((item) => item.textContent)
      ).toEqual(GAME_MODE_RULES[mode].map(({ id }) => id));
    }
  );

  test("the tooltip describes the info button and starts closed", () => {
    renderTitle();

    expect(getInfoButton()).toHaveAttribute(
      "aria-describedby",
      getTooltip().id
    );
    expect(getInfoButton()).toHaveAttribute("aria-expanded", "false");
    expect(isOpen()).toBe(false);
  });

  test("opens on hover and closes when the pointer leaves", async () => {
    const user = userEvent.setup();
    renderTitle();

    await user.hover(getInfoButton());
    expect(isOpen()).toBe(true);

    await user.unhover(getInfoButton());
    expect(isOpen()).toBe(false);
  });

  test("opens with the keyboard and closes with Escape or on blur", async () => {
    const user = userEvent.setup();
    renderTitle();

    await user.tab();
    expect(getInfoButton()).toHaveFocus();
    expect(isOpen()).toBe(true);

    await user.keyboard("{Escape}");
    expect(isOpen()).toBe(false);

    await user.keyboard("{Enter}");
    expect(isOpen()).toBe(true);

    await user.tab();
    expect(isOpen()).toBe(false);
  });

  test("stays open after tapping the info button", async () => {
    const user = userEvent.setup();
    renderTitle();

    await user.click(getInfoButton());

    expect(isOpen()).toBe(true);
    expect(getInfoButton()).toHaveAttribute("aria-expanded", "true");
  });

  test("renders the Spanish translations", () => {
    renderTitle(GAME_MODES.EXPANDED, "es");

    expect(
      screen.getByRole("heading", { level: 1, name: "Modo Extendido" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ver las reglas del modo Extendido" })
    ).toBeInTheDocument();
    expect(getTooltip()).toHaveTextContent("Spock vaporiza la Piedra");
  });
});
