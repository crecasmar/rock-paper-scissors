import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { KEYS_LOCALE, render, screen, within } from "@/utils/test-utils";

import { EMPTY_STATS } from "@/store/game-store";

import PlayerStats from "./player-stats";

const TOGGLE = "components.player-stats.toggle";

const STATS = {
  wins: 7,
  losses: 4,
  ties: 2,
  currentStreak: 1,
  longestStreak: 3,
};

const renderStats = ({ stats = STATS, locale = KEYS_LOCALE } = {}) =>
  render(<PlayerStats stats={stats} />, { locale });

const getRows = () =>
  within(screen.getByRole("region", { hidden: true }))
    .getAllByRole("term", { hidden: true })
    .map((term) => [term.textContent, term.nextElementSibling.textContent]);

describe("PlayerStats", () => {
  test("starts with the summary hidden", () => {
    renderStats();

    const button = screen.getByRole("button", { name: TOGGLE });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("region", { hidden: true })).not.toBeVisible();
  });

  test("the button keeps its classes and shows a chevron", () => {
    renderStats();

    const button = screen.getByRole("button", { name: TOGGLE });
    expect(button).toHaveClass("button button_secondary player-stats__toggle", {
      exact: true,
    });
    expect(button.querySelector(".player-stats__chevron")).toBeInTheDocument();
  });

  test("the button controls the summary", () => {
    renderStats();

    expect(screen.getByRole("button", { name: TOGGLE })).toHaveAttribute(
      "aria-controls",
      screen.getByRole("region", { hidden: true }).id
    );
  });

  test("clicking the button shows and hides the summary", async () => {
    const user = userEvent.setup();
    renderStats();
    const button = screen.getByRole("button", { name: TOGGLE });

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region")).toBeVisible();

    await user.click(button);

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("region", { hidden: true })).not.toBeVisible();
  });

  test("shows every statistic and the games played", () => {
    renderStats();

    expect(getRows()).toEqual([
      ["components.player-stats.played", "13"],
      ["components.player-stats.wins", "7"],
      ["components.player-stats.losses", "4"],
      ["components.player-stats.ties", "2"],
      ["components.player-stats.longest-streak", "3"],
      ["components.player-stats.current-streak", "1"],
    ]);
  });

  test("shows zeros for a player who has not played", () => {
    renderStats({ stats: EMPTY_STATS });

    expect(getRows().map(([, value]) => value)).toEqual([
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
    ]);
  });

  test("is named after the button, without repeating the game mode", async () => {
    const user = userEvent.setup();
    renderStats();

    await user.click(screen.getByRole("button", { name: TOGGLE }));

    expect(screen.getByRole("region", { name: TOGGLE })).toBeVisible();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  test("renders the Spanish translations", async () => {
    const user = userEvent.setup();
    renderStats({ locale: "es" });

    await user.click(screen.getByRole("button", { name: "Mis estadísticas" }));

    expect(
      screen.getByRole("region", { name: "Mis estadísticas" })
    ).toBeVisible();
    expect(getRows()).toEqual([
      ["Partidas jugadas", "13"],
      ["Ganadas", "7"],
      ["Perdidas", "4"],
      ["Empatadas", "2"],
      ["Mejor racha de victorias", "3"],
      ["Racha actual de victorias", "1"],
    ]);
  });
});
