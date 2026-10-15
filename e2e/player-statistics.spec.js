import { expect, test } from "@playwright/test";

import {
  forceBotToPlayRock,
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

/**
 * Value shown next to a statistic's label.
 * @param {import("@playwright/test").Page} page
 * @param {string} label
 */
const statValue = (page, label) =>
  page
    .locator(".player-stats__item")
    .filter({ has: page.getByText(label, { exact: true }) })
    .locator("dd");

test("see the statistics of the player's rounds", async ({ page }) => {
  const name = uniquePlayerName();

  // The bot alternates Rock and Paper, as it never repeats its move
  await forceBotToPlayRock(page);
  await page.goto("./");
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "JOIN" }).click();
  await expect(page).toHaveURL(/\/game$/);

  const toggle = page.getByRole("button", { name: "My statistics" });
  const summary = page.getByRole("region", { name: "Classic mode" });

  // The summary is hidden until the player asks for it
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(summary).toBeHidden();

  await toggle.click();
  await expect(summary).toBeVisible();
  await expect(statValue(page, "Games played")).toHaveText("0");

  await playRound(page, "Paper", RESULT_TEXTS.win); // vs Rock
  await playRound(page, "Scissors", RESULT_TEXTS.win); // vs Paper
  await playRound(page, "Rock", RESULT_TEXTS.tie); // vs Rock
  await playRound(page, "Rock", RESULT_TEXTS.lose); // vs Paper

  await expect(page.getByText("Score: 2")).toBeVisible();
  await expect(statValue(page, "Games played")).toHaveText("4");
  await expect(statValue(page, "Won")).toHaveText("2");
  await expect(statValue(page, "Lost")).toHaveText("1");
  await expect(statValue(page, "Drawn")).toHaveText("1");
  await expect(statValue(page, "Longest winning streak")).toHaveText("2");
  await expect(statValue(page, "Current winning streak")).toHaveText("0");

  // The statistics are kept in the browser
  await page.reload();
  await page.getByRole("button", { name: "My statistics" }).click();
  await expect(statValue(page, "Games played")).toHaveText("4");
  await expect(statValue(page, "Longest winning streak")).toHaveText("2");
});
