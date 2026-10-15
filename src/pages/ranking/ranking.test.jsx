import { describe, test, expect, beforeEach, vi } from "vitest";
import { KEYS_LOCALE, render, screen, within } from "@/utils/test-utils";

const STORAGE_KEY = "rock-paper-scissors-storage";

/**
 * The store reads the players from storage when it is created,
 * so each test stores its players and loads a fresh page.
 */
const renderRanking = async (players = {}, locale = KEYS_LOCALE) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ state: { currentUser: null, players }, version: 0 })
  );
  vi.resetModules();
  const { default: RankingPage } = await import("./ranking");

  return render(<RankingPage />, { initialPath: "/ranking", locale });
};

const getCards = () =>
  within(screen.getByRole("list")).getAllByRole("listitem");

/** Text read by screen readers for each card */
const getSpokenText = (card) => card.querySelector(".sr-only").textContent;

/** Text shown on screen for each card */
const getVisibleText = (card) =>
  [...card.querySelectorAll("[aria-hidden='true']")]
    .map((element) => element.textContent)
    .join("");

const label = (position, name, score) =>
  `pages.ranking.player-label ${position} ${name} ${score}`;

describe("RankingPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders the uppercase title and the go back link", async () => {
    await renderRanking();

    const title = screen.getByRole("heading", {
      level: 1,
      name: "pages.ranking.title",
    });
    expect(title).toHaveClass("ranking-page__title");
    expect(
      screen.getByRole("link", { name: "components.ranking-link.back" })
    ).toBeInTheDocument();
  });

  test("shows a message when no players are registered", async () => {
    await renderRanking();

    expect(screen.getByText("pages.ranking.empty")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("lists every player from the highest score to the lowest", async () => {
    await renderRanking({
      Ana: { score: 1 },
      Juan: { score: 9 },
      Luis: { score: 0 },
      Maria: { score: 4 },
      Pepe: { score: 6 },
      Zoe: { score: 2 },
    });

    expect(screen.queryByText("pages.ranking.empty")).not.toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveAccessibleName(
      "pages.ranking.title"
    );
    expect(getCards().map(getVisibleText)).toEqual([
      "🥇Juanpages.ranking.score 9",
      "🥈Pepepages.ranking.score 6",
      "🥉Mariapages.ranking.score 4",
      "4Zoepages.ranking.score 2",
      "5Anapages.ranking.score 1",
      "6Luispages.ranking.score 0",
    ]);
  });

  test("every card is read as a single sentence", async () => {
    await renderRanking({ Juan: { score: 9 }, Ana: { score: 1 } });

    expect(getCards().map(getSpokenText)).toEqual([
      label(1, "Juan", 9),
      label(2, "Ana", 1),
    ]);
    // Everything else is hidden so it is not read twice
    getCards().forEach((card) =>
      [...card.children]
        .filter((child) => !child.classList.contains("sr-only"))
        .forEach((child) =>
          expect(child).toHaveAttribute("aria-hidden", "true")
        )
    );
  });

  test("the cards are not in the Tab order", async () => {
    await renderRanking({ Juan: { score: 9 } });

    getCards().forEach((card) => expect(card).not.toHaveAttribute("tabindex"));
  });

  test.each([
    ["en", 1, "Position 1: Juan, 1 point"],
    ["en", 5, "Position 1: Juan, 5 points"],
    ["es", 1, "Posición 1: Juan, 1 punto"],
    ["es", 5, "Posición 1: Juan, 5 puntos"],
  ])("reads the card in %s with a score of %d", async (locale, score, text) => {
    await renderRanking({ Juan: { score } }, locale);

    expect(getCards().map(getSpokenText)).toEqual([text]);
  });

  test("renders the Spanish translations", async () => {
    await renderRanking({}, "es");

    expect(
      screen.getByRole("heading", { level: 1, name: "Ranking" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "No hay puntuaciones de jugadores registradas para clasificar"
      )
    ).toBeInTheDocument();
  });
});
