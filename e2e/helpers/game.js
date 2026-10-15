/** localStorage key where the game store is persisted */
const STORAGE_KEY = "rock-paper-scissors-storage";
const STORAGE_VERSION = 2;

import { expect } from "@playwright/test";

export const RESULT_TEXTS = Object.freeze({
  win: "You won!",
  lose: "You lost!",
  tie: "Tie!",
});

/**
 * A valid player name (3-20 letters, numbers or hyphens) that no other
 * test run will reuse.
 * @returns {string}
 */
export const uniquePlayerName = () =>
  `E2E-${Date.now().toString(36)}${Math.floor(Math.random() * 100)}`;

export const GAME_MODES = Object.freeze({
  classic: "Classic",
  expanded: "Expanded",
});

/** Move buttons shown in each game mode, in display order */
export const GAME_MODE_MOVES = Object.freeze({
  [GAME_MODES.classic]: ["Rock", "Paper", "Scissors"],
  [GAME_MODES.expanded]: ["Rock", "Paper", "Scissors", "Lizard", "Spock"],
});

/** Moves each move beats, by the name shown in the game */
const BEATS = Object.freeze({
  Rock: ["Scissors", "Lizard"],
  Paper: ["Rock", "Spock"],
  Scissors: ["Paper", "Lizard"],
  Lizard: ["Spock", "Paper"],
  Spock: ["Scissors", "Rock"],
});

/**
 * The result text the game should show for a round.
 * @param {string} playerMove - e.g. "Rock"
 * @param {string} botMove - e.g. "Scissors"
 * @returns {string} One of RESULT_TEXTS
 */
export const expectedResult = (playerMove, botMove) => {
  if (playerMove === botMove) return RESULT_TEXTS.tie;
  return BEATS[playerMove].includes(botMove)
    ? RESULT_TEXTS.win
    : RESULT_TEXTS.lose;
};

/**
 * Name of the move shown in the round summary for the player ("You:")
 * or the bot ("Bot:").
 * @param {import("@playwright/test").Page} page
 * @param {"You:" | "Bot:"} title
 */
export const roundChoice = (page, title) =>
  page
    .locator(".game-page__choice")
    .filter({ hasText: title })
    .locator(".game-page__choice-name");

/**
 * Makes Math.random always return 0, so the bot's first move is always Rock.
 * @param {import("@playwright/test").Page} page
 */
export const forceBotToPlayRock = (page) =>
  page.addInitScript(() => {
    Math.random = () => 0;
  });

/**
 * Stores some players before the app loads, as if they had played before.
 * It only writes when there is nothing stored, so reloads keep the real state.
 * @param {import("@playwright/test").Page} page
 * @param {Record<string, { classicScore?: number, expandedScore?: number }>} players
 */
export const seedPlayers = (page, players) =>
  page.addInitScript(
    ({ key, version, players }) => {
      if (localStorage.getItem(key)) return;

      localStorage.setItem(
        key,
        JSON.stringify({
          state: { players, currentUser: null, gameMode: "classic" },
          version,
        })
      );
    },
    { key: STORAGE_KEY, version: STORAGE_VERSION, players }
  );

/** Label of every statistic in the summary, by the name used in the tests */
const STAT_LABELS = Object.freeze({
  played: "Games played",
  won: "Won",
  lost: "Lost",
  drawn: "Drawn",
  longestStreak: "Longest winning streak",
  currentStreak: "Current winning streak",
});

/**
 * Opens the player's statistics below the score.
 * @param {import("@playwright/test").Page} page
 */
export const openStatistics = async (page) => {
  const toggle = page.getByRole("button", { name: "My statistics" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
};

/**
 * Checks every value of the opened statistics summary.
 * @param {import("@playwright/test").Page} page
 * @param {Record<keyof typeof STAT_LABELS, number>} stats
 */
export const expectStatistics = async (page, stats) => {
  for (const [key, label] of Object.entries(STAT_LABELS)) {
    await expect(
      page
        .locator(".player-stats__item")
        .filter({ has: page.getByText(label, { exact: true }) })
        .locator("dd"),
      label
    ).toHaveText(String(stats[key]));
  }
};
