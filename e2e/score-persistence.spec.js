import { expect, test } from "@playwright/test";

import {
  forceBotToPlayRock,
  GAME_MODES,
  RESULT_TEXTS,
  roundChoice,
  uniquePlayerName,
} from "./helpers/game";

// Every test is one part of the same journey, so they share the page
// and run in order: if one fails, the following ones are skipped.
test.describe.configure({ mode: "serial" });

test.describe("Keep the score after logging in again", () => {
  const name = uniquePlayerName();
  const mode = GAME_MODES.classic;

  /** @type {import("@playwright/test").Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // The bot's first move will be Rock, so Paper always wins
    await forceBotToPlayRock(page);
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
  });

  test("choose Paper", async () => {
    await page.getByRole("button", { name: "Paper", exact: true }).click();

    // The bot thinks its move and then answers
    const botThinking = page.getByRole("img", {
      name: "The bot is choosing its move",
    });
    await expect(botThinking).toBeVisible();
    await expect(botThinking).toBeHidden();
    await expect(roundChoice(page, "Bot:")).toBeVisible();
  });

  test("see the result: a win", async () => {
    // Paper beats the bot's Rock and adds a point
    await expect(roundChoice(page, "Bot:")).toHaveText("Rock");
    await expect(page.locator("output")).toHaveText(RESULT_TEXTS.win);
    await expect(page.getByText("Score: 1")).toBeVisible();
  });

  test("log out", async () => {
    await page.getByRole("button", { name: "Log out" }).click();

    // The player goes back to an empty home page
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByLabel("Name")).toBeEmpty();
    await expect(page.getByText(`Hello ${name}`)).toBeHidden();
  });

  test("log in again with the same name", async () => {
    await page.getByLabel("Name").fill(name);

    // Logging out goes back to the classic mode
    await expect(page.getByRole("radio", { name: mode })).toBeChecked();

    await page.getByRole("button", { name: "JOIN" }).click();

    await expect(page).toHaveURL(/\/game$/);
    await expect(page.getByText(`Hello ${name}`)).toBeVisible();
  });

  test("see the score is still 1", async () => {
    // The player gets back the point won before logging out
    await expect(page.getByText("Score: 1")).toBeVisible();
  });

  test("see the score is still 1 after reloading the page", async () => {
    await page.reload();

    // The player stays logged in and the score is kept in the browser
    await expect(page).toHaveURL(/\/game$/);
    await expect(page.getByText(`Hello ${name}`)).toBeVisible();
    await expect(page.getByText("Score: 1")).toBeVisible();
  });
});
