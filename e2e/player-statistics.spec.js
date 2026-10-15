import { expect, test } from "@playwright/test";

import {
  expectStatistics,
  forceBotToPlayRock,
  openStatistics,
  RESULT_TEXTS,
  uniquePlayerName,
} from "./helpers/game";

/**
 * Plays a move and waits until the round shows the expected result.
 * @param {import("@playwright/test").Page} page
 * @param {string} move
 * @param {string} result - One of RESULT_TEXTS
 */
const playRound = async (page, move, result) => {
  await page.getByRole("button", { name: move, exact: true }).click();
  await expect(page.locator("output")).toHaveText(result);
};

test("see the statistics of the player's rounds", async ({ page }) => {
  const name = uniquePlayerName();

  // The bot alternates Rock and Paper, as it never repeats its move
  await forceBotToPlayRock(page);
  await page.goto("./");
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "JOIN" }).click();
  await expect(page).toHaveURL(/\/game$/);

  const toggle = page.getByRole("button", { name: "My statistics" });
  const summary = page.getByRole("region", { name: "My statistics" });

  // The summary is hidden until the player asks for it
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(summary).toBeHidden();

  await openStatistics(page);
  await expect(summary).toBeVisible();
  await expectStatistics(page, {
    played: 0,
    won: 0,
    lost: 0,
    drawn: 0,
    longestStreak: 0,
    currentStreak: 0,
  });

  await playRound(page, "Paper", RESULT_TEXTS.win); // vs Rock
  await playRound(page, "Scissors", RESULT_TEXTS.win); // vs Paper
  await playRound(page, "Rock", RESULT_TEXTS.tie); // vs Rock
  await playRound(page, "Rock", RESULT_TEXTS.lose); // vs Paper

  // Only wins add points, and the tie ended the winning streak
  await expect(page.getByText("Score: 2")).toBeVisible();
  await expectStatistics(page, {
    played: 4,
    won: 2,
    lost: 1,
    drawn: 1,
    longestStreak: 2,
    currentStreak: 0,
  });
});
