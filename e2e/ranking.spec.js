import { expect, test } from "@playwright/test";

import {
  forceBotToPlayRock,
  GAME_MODES,
  expectedResult,
  RESULT_TEXTS,
  roundChoice,
  seedPlayers,
  uniquePlayerName,
} from "./helpers/game";

// Every test is one part of the same journey, so they share the page
// and run in order: if one fails, the following ones are skipped.
test.describe.configure({ mode: "serial" });

/**
 * Players listed in the classic ranking, in ranking order.
 * @param {import("@playwright/test").Page} page
 */
const classicRankingPlayers = (page) =>
  page.getByRole("region", { name: GAME_MODES.classic }).getByRole("listitem");

test.describe("Check the ranking as the first player", () => {
  const name = uniquePlayerName();

  /** @type {import("@playwright/test").Page} */
  let page;
  let score;

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

  test("join the game", async () => {
    await page.getByRole("button", { name: "JOIN" }).click();

    // The player is greeted on the game page with no points yet
    await expect(page).toHaveURL(/\/game$/);
    await expect(page.getByText(`Hello ${name}`)).toBeVisible();
    await expect(page.getByText("Score: 0")).toBeVisible();
  });

  test("choose Rock", async () => {
    await page.getByRole("button", { name: "Rock", exact: true }).click();

    // The bot thinks its move and then answers
    const botThinking = page.getByRole("img", {
      name: "The bot is choosing its move",
    });
    await expect(botThinking).toBeVisible();
    await expect(botThinking).toBeHidden();
    await expect(roundChoice(page, "Bot:")).toBeVisible();
  });

  test("see the result", async () => {
    // The result follows the rules for Rock against the bot's move
    const botMove = await roundChoice(page, "Bot:").textContent();
    const result = expectedResult("Rock", botMove);
    await expect(page.locator("output")).toHaveText(result);

    // Only a win adds a point
    score = result === RESULT_TEXTS.win ? 1 : 0;
    await expect(page.getByText(`Score: ${score}`)).toBeVisible();
  });

  test("log out", async () => {
    await page.getByRole("button", { name: "Log out" }).click();

    // The player goes back to the home page
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByLabel("Name")).toBeVisible();
  });

  test("open the ranking", async () => {
    await page.getByRole("link", { name: "See ranking" }).click();

    await expect(page).toHaveURL(/\/ranking$/);
    await expect(page.getByRole("heading", { name: "Ranking" })).toBeVisible();
  });

  test("see the new player first in the ranking", async () => {
    const players = classicRankingPlayers(page);

    // The new player is the only one, so they lead the ranking
    await expect(players).toHaveCount(1);
    await expect(players.first()).toContainText(
      `Position 1: ${name}, ${score} ${score === 1 ? "point" : "points"}`
    );
    await expect(players.first()).toContainText("🥇");
  });
});

test.describe("Check the ranking among existing players", () => {
  const name = uniquePlayerName();

  /** @type {import("@playwright/test").Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // María (5 points) and Toni (0 points) have played before
    await seedPlayers(page, {
      María: { classicScore: 5 },
      Toni: { classicScore: 0 },
    });

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

    // The player goes back to the home page
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByLabel("Name")).toBeVisible();
  });

  test("open the ranking", async () => {
    await page.getByRole("link", { name: "See ranking" }).click();

    await expect(page).toHaveURL(/\/ranking$/);
    await expect(page.getByRole("heading", { name: "Ranking" })).toBeVisible();
  });

  test("see the new player second in the ranking", async () => {
    const players = classicRankingPlayers(page);

    // Players are sorted by score: María (5), the new player (1), Toni (0)
    await expect(players).toHaveCount(3);
    await expect(players.nth(0)).toContainText("Position 1: María, 5 points");
    await expect(players.nth(1)).toContainText(`Position 2: ${name}, 1 point`);
    await expect(players.nth(1)).toContainText("🥈");
    await expect(players.nth(2)).toContainText("Position 3: Toni, 0 points");

    // Nobody has played the expanded mode yet
    await expect(
      page
        .getByRole("region", { name: GAME_MODES.expanded })
        .getByText("There are no player's scores registered to rank")
    ).toBeVisible();
  });
});
