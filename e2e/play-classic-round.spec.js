import { expect, test } from "@playwright/test";

import {
  GAME_MODE_MOVES,
  GAME_MODES,
  expectedResult,
  RESULT_TEXTS,
  roundChoice,
  uniquePlayerName,
} from "./helpers/game";

// Every test is one part of the same journey, so they share the page
// and run in order: if one fails, the following ones are skipped.
test.describe.configure({ mode: "serial" });

test.describe("Play a classic round as a new user", () => {
  const name = uniquePlayerName();
  const mode = GAME_MODES.classic;
  const move = "Rock";

  /** @type {import("@playwright/test").Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("open the app as a new user", async () => {
    await page.goto("./");

    // A new user lands on the home page with an empty form
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByLabel("Name")).toBeEmpty();
  });

  test("enter a new name", async () => {
    await page.getByLabel("Name").fill(name);

    // A valid name enables the join button
    await expect(page.getByRole("button", { name: "JOIN" })).toBeEnabled();
  });

  test("choose the classic mode", async () => {
    await page.getByRole("radio", { name: mode }).check();

    await expect(page.getByRole("radio", { name: mode })).toBeChecked();
  });

  test("join the game", async () => {
    await page.getByRole("button", { name: "JOIN" }).click();

    // The player is greeted on the game page with no points yet
    await expect(page).toHaveURL(/\/game$/);
    await expect(page.getByText(`Hello ${name}`)).toBeVisible();
    await expect(page.getByText("Score: 0")).toBeVisible();

    // Every move of the mode can be played
    for (const modeMove of GAME_MODE_MOVES[mode]) {
      await expect(
        page.getByRole("button", { name: modeMove, exact: true })
      ).toBeVisible();
    }

    // Lizard and Spock only exist in the expanded mode
    await expect(page.getByRole("button", { name: "Lizard" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Spock" })).toHaveCount(0);
  });

  test("choose Rock", async () => {
    const moveButton = page.getByRole("button", { name: move, exact: true });
    await moveButton.click();

    // The bot thinks its move and, meanwhile, no other move can be played
    const botThinking = page.getByRole("img", {
      name: "The bot is choosing its move",
    });
    await expect(botThinking).toBeVisible();
    await expect(moveButton).toBeDisabled();

    // The bot answers with its move and the moves can be played again
    await expect(botThinking).toBeHidden();
    await expect(roundChoice(page, "Bot:")).toBeVisible();
    await expect(moveButton).toBeEnabled();
  });

  test("see the result", async () => {
    // Both moves are shown in the round summary
    await expect(roundChoice(page, "You:")).toHaveText(move);
    const botMove = await roundChoice(page, "Bot:").textContent();

    // The result follows the rules for the player's move against the bot's
    const result = expectedResult(move, botMove);
    await expect(page.locator("output")).toHaveText(result);

    // Only a win adds a point
    const score = result === RESULT_TEXTS.win ? 1 : 0;
    await expect(page.getByText(`Score: ${score}`)).toBeVisible();
  });
});
