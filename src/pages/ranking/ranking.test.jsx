import { describe, test, expect, beforeEach, vi } from "vitest";
import { KEYS_LOCALE, render, screen, within } from "@/utils/test-utils";

const STORAGE_KEY = "rock-paper-scissors-storage";

const CLASSIC = "game.modes.classic";
const EXPANDED = "game.modes.expanded";

/**
 * The store reads the players from storage when it is created,
 * so each test stores its players and loads a fresh page.
 */
const renderRanking = async (players = {}, locale = KEYS_LOCALE) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: { currentUser: null, gameMode: "classic", players },
      version: 1,
    })
  );
  vi.resetModules();
  const { default: RankingPage } = await import("./ranking");

  return render(<RankingPage />, { initialPath: "/ranking", locale });
};

const getColumn = (name) => screen.getByRole("region", { name });

const getCards = (name) =>
  within(within(getColumn(name)).getByRole("list")).getAllByRole("listitem");

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

  test("renders the uppercase title without the go back link", async () => {
    await renderRanking();

    const title = screen.getByRole("heading", {
      level: 1,
      name: "pages.ranking.title",
    });
    expect(title).toHaveClass("ranking-page__title");
    // The go back link lives in the navigation bar
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("renders a column for each game mode, classic first", async () => {
    await renderRanking();

    expect(screen.getAllByRole("region")).toEqual([
      getColumn(CLASSIC),
      getColumn(EXPANDED),
    ]);
    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent)
    ).toEqual([CLASSIC, EXPANDED]);
  });

  test("shows a message in each column when no players are registered", async () => {
    await renderRanking();

    [CLASSIC, EXPANDED].forEach((mode) => {
      expect(
        within(getColumn(mode)).getByText("pages.ranking.empty")
      ).toBeInTheDocument();
    });
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("lists every player from the highest score to the lowest", async () => {
    await renderRanking({
      Ana: { classicScore: 1 },
      Juan: { classicScore: 9 },
      Luis: { classicScore: 0 },
      Maria: { classicScore: 4 },
      Pepe: { classicScore: 6 },
      Zoe: { classicScore: 2 },
    });

    expect(within(getColumn(CLASSIC)).getByRole("list")).toHaveAccessibleName(
      CLASSIC
    );
    expect(getCards(CLASSIC).map(getVisibleText)).toEqual([
      "🥇Juanpages.ranking.score 9",
      "🥈Pepepages.ranking.score 6",
      "🥉Mariapages.ranking.score 4",
      "4Zoepages.ranking.score 2",
      "5Anapages.ranking.score 1",
      "6Luispages.ranking.score 0",
    ]);
  });

  test("each column only ranks the scores of its game mode", async () => {
    await renderRanking({
      Ana: { classicScore: 4 },
      Juan: { classicScore: 1, expandedScore: 3 },
      Luis: { expandedScore: 6 },
    });

    expect(getCards(CLASSIC).map(getVisibleText)).toEqual([
      "🥇Anapages.ranking.score 4",
      "🥈Juanpages.ranking.score 1",
    ]);
    expect(getCards(EXPANDED).map(getVisibleText)).toEqual([
      "🥇Luispages.ranking.score 6",
      "🥈Juanpages.ranking.score 3",
    ]);
  });

  test("shows the empty message only in the column without players", async () => {
    await renderRanking({ Ana: { expandedScore: 4 } });

    expect(
      within(getColumn(CLASSIC)).getByText("pages.ranking.empty")
    ).toBeInTheDocument();
    expect(
      within(getColumn(EXPANDED)).queryByText("pages.ranking.empty")
    ).not.toBeInTheDocument();
  });

  test("every card is read as a single sentence", async () => {
    await renderRanking({
      Juan: { classicScore: 9 },
      Ana: { classicScore: 1 },
    });

    expect(getCards(CLASSIC).map(getSpokenText)).toEqual([
      label(1, "Juan", 9),
      label(2, "Ana", 1),
    ]);
    // Everything else is hidden so it is not read twice
    getCards(CLASSIC).forEach((card) =>
      [...card.children]
        .filter((child) => !child.classList.contains("sr-only"))
        .forEach((child) =>
          expect(child).toHaveAttribute("aria-hidden", "true")
        )
    );
  });

  test("the cards are not in the Tab order", async () => {
    await renderRanking({ Juan: { classicScore: 9, expandedScore: 2 } });

    [...getCards(CLASSIC), ...getCards(EXPANDED)].forEach((card) =>
      expect(card).not.toHaveAttribute("tabindex")
    );
  });

  test.each([
    ["en", "Classic", 1, "Position 1: Juan, 1 point"],
    ["en", "Classic", 5, "Position 1: Juan, 5 points"],
    ["es", "Clásico", 1, "Posición 1: Juan, 1 punto"],
    ["es", "Clásico", 5, "Posición 1: Juan, 5 puntos"],
  ])(
    "reads the card in %s with a score of %d",
    async (locale, column, score, text) => {
      await renderRanking({ Juan: { classicScore: score } }, locale);

      expect(getCards(column).map(getSpokenText)).toEqual([text]);
    }
  );

  test("renders the Spanish translations", async () => {
    await renderRanking({}, "es");

    expect(
      screen.getByRole("heading", { level: 1, name: "Ranking" })
    ).toBeInTheDocument();
    expect(getColumn("Clásico")).toBeInTheDocument();
    expect(getColumn("Extendido")).toBeInTheDocument();
    expect(
      screen.getAllByText(
        "No hay puntuaciones de jugadores registradas para clasificar"
      )
    ).toHaveLength(2);
  });
});
