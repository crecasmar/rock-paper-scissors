import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import {
  KEYS_LOCALE,
  act,
  render,
  renderHook,
  screen,
  within,
} from "@/utils/test-utils";

import { BOT_THINKING_DELAY_MS, GAME_MODES } from "@/utils/game-rules";

/**
 * The store is a module-level singleton that keeps every player's score,
 * so each test loads a fresh page and store.
 */
let GamePage;
let useAuth;
let useGameStats;
let useGameMode;

const getAuth = () => renderHook(() => useAuth()).result.current;

const renderGame = (locale = KEYS_LOCALE) =>
  render(
    <Routes>
      <Route path="/home" element={<div data-testid="home-page" />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>,
    { initialPath: "/game", locale }
  );

const ROCK = "game.moves.rock";
const PAPER = "game.moves.paper";
const SCISSORS = "game.moves.scissors";
const LIZARD = "game.moves.lizard";
const SPOCK = "game.moves.spock";
const YOU = "pages.game.you";
const BOT = "pages.game.bot";
const score = (value) => `pages.game.score ${value}`;

const getMoveButton = (name) => screen.getByRole("button", { name });
const getMoveButtons = () => [ROCK, PAPER, SCISSORS].map(getMoveButton);

const setupUser = () =>
  userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });

const waitForBot = () =>
  act(() => vi.advanceTimersByTime(BOT_THINKING_DELAY_MS));

const getChoice = (title) => screen.getByText(title).parentElement;

describe("GamePage", () => {
  beforeEach(async () => {
    localStorage.clear();
    vi.resetModules();
    ({ default: GamePage } = await import("./game"));
    ({ useAuth, useGameStats, useGameMode } =
      await import("@/store/game-store"));
  });

  test("redirects to home when no player is registered", () => {
    renderGame();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  describe("with a registered player", () => {
    beforeEach(() => {
      const { login } = getAuth();
      act(() => login("Maria"));
      vi.useFakeTimers({ shouldAdvanceTime: true });
      // Bot picks the first available move: rock, then paper (rock excluded)...
      vi.spyOn(Math, "random").mockReturnValue(0);
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    test("shows the game mode above the score", () => {
      renderGame();

      const title = screen.getByRole("heading", {
        level: 1,
        name: "game.modes.title game.modes.classic",
      });
      expect(title.compareDocumentPosition(screen.getByText(score(0)))).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
      expect(
        screen.getByRole("button", {
          name: "game.rules.show game.modes.classic",
        })
      ).toBeInTheDocument();
    });

    describe("changing the game mode", () => {
      const setGameMode = (mode) => {
        const { result } = renderHook(() => useGameMode());
        act(() => result.current.setGameMode(mode));
      };

      test("shows the board of the new mode without the last round", async () => {
        const user = setupUser();
        renderGame();

        await user.click(getMoveButton(PAPER));
        waitForBot();
        setGameMode(GAME_MODES.EXPANDED);

        expect(
          screen.getByRole("heading", {
            level: 1,
            name: "game.modes.title game.modes.expanded",
          })
        ).toBeInTheDocument();
        expect(getMoveButton(SPOCK)).toBeEnabled();
        expect(screen.getByText(score(0))).toBeInTheDocument();
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      });

      test("drops the round in progress", async () => {
        const user = setupUser();
        renderGame();

        await user.click(getMoveButton(PAPER));
        setGameMode(GAME_MODES.EXPANDED);
        waitForBot();

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        const { result } = renderHook(() => useGameStats());
        expect(result.current.players).toEqual({
          Maria: { classicScore: 0, expandedScore: 0 },
        });
      });
    });

    test("shows the score", () => {
      renderGame();

      expect(screen.getByTestId("game-page")).toBeInTheDocument();
      expect(screen.getByText(score(0))).toBeInTheDocument();
    });

    test("does not show the link to the ranking", () => {
      renderGame();

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    test("shows the three move buttons enabled", () => {
      renderGame();

      const buttons = getMoveButtons();
      expect(buttons.map((button) => button.textContent)).toEqual([
        "✊",
        "🖐️",
        "✌️",
      ]);
      buttons.forEach((button) => expect(button).toBeEnabled());
    });

    test("hides the round summary before the first round", () => {
      renderGame();

      expect(screen.queryByText(YOU)).not.toBeInTheDocument();
      expect(screen.queryByText(BOT)).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    test("shows the player's move and a spinner while the bot thinks", async () => {
      const user = setupUser();
      renderGame();

      await user.click(getMoveButton(PAPER));

      expect(getChoice(YOU)).toHaveTextContent(`🖐️${PAPER}`);
      expect(
        within(getChoice(BOT)).getByRole("img", {
          name: "pages.game.bot-thinking",
        })
      ).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
      getMoveButtons().forEach((button) => expect(button).toBeDisabled());
    });

    test("a win shows the bot's move, the result and adds a point", async () => {
      const user = setupUser();
      renderGame();

      await user.click(getMoveButton(PAPER));
      waitForBot();

      expect(getChoice(BOT)).toHaveTextContent(`✊${ROCK}`);
      expect(screen.getByRole("status")).toHaveTextContent("game.results.win");
      expect(screen.getByText(score(1))).toBeInTheDocument();
      getMoveButtons().forEach((button) => expect(button).toBeEnabled());
    });

    test.each([
      [ROCK, "game.results.tie"],
      [SCISSORS, "game.results.lose"],
    ])(
      "playing %s against rock shows %s and keeps the score",
      async (move, text) => {
        const user = setupUser();
        renderGame();

        await user.click(getMoveButton(move));
        waitForBot();

        expect(screen.getByRole("status")).toHaveTextContent(text);
        expect(screen.getByText(score(0))).toBeInTheDocument();
        getMoveButtons().forEach((button) => expect(button).toBeEnabled());
      }
    );

    describe("icon animation", () => {
      const getIcon = (title, icon) => within(getChoice(title)).getByText(icon);

      test("does not animate while the bot is thinking", async () => {
        const user = setupUser();
        renderGame();

        await user.click(getMoveButton(PAPER));

        expect(getIcon(YOU, "🖐️")).toHaveClass("game-page__choice-icon", {
          exact: true,
        });
      });

      test("the player's icon attacks the bot when the player wins", async () => {
        const user = setupUser();
        renderGame();

        await user.click(getMoveButton(PAPER));
        waitForBot();

        expect(getIcon(YOU, "🖐️")).toHaveClass(
          "game-page__choice-icon_attack-right"
        );
        expect(getIcon(BOT, "✊")).toHaveClass("game-page__choice-icon", {
          exact: true,
        });
      });

      test("the bot's icon attacks the player when the bot wins", async () => {
        const user = setupUser();
        renderGame();

        await user.click(getMoveButton(SCISSORS));
        waitForBot();

        expect(getIcon(YOU, "✌️")).toHaveClass("game-page__choice-icon", {
          exact: true,
        });
        expect(getIcon(BOT, "✊")).toHaveClass(
          "game-page__choice-icon_attack-left"
        );
      });

      test("both icons clash in the middle on a tie", async () => {
        const user = setupUser();
        renderGame();

        await user.click(getMoveButton(ROCK));
        waitForBot();

        expect(getIcon(YOU, "✊")).toHaveClass(
          "game-page__choice-icon_clash-right"
        );
        expect(getIcon(BOT, "✊")).toHaveClass(
          "game-page__choice-icon_clash-left"
        );
      });
    });

    test("the bot does not repeat its move in the next round", async () => {
      const user = setupUser();
      renderGame();

      await user.click(getMoveButton(ROCK));
      waitForBot();
      await user.click(getMoveButton(ROCK));

      expect(screen.getByRole("status")).toBeEmptyDOMElement();

      waitForBot();

      expect(getChoice(BOT)).toHaveTextContent(`🖐️${PAPER}`);
      expect(screen.getByRole("status")).toHaveTextContent("game.results.lose");
    });

    test("the score is persisted with the player", async () => {
      const user = setupUser();
      renderGame();

      await user.click(getMoveButton(PAPER));
      waitForBot();

      const { result } = renderHook(() => useGameStats());
      expect(result.current.players).toEqual({
        Maria: {
          classicScore: 1,
          classicStats: {
            wins: 1,
            losses: 0,
            ties: 0,
            currentStreak: 1,
            longestStreak: 1,
          },
        },
      });
    });

    describe("statistics", () => {
      const STATS = "components.player-stats.toggle";
      const getStat = (label) => screen.getByText(label).nextElementSibling;

      test("shows a closed statistics button below the score", () => {
        renderGame();

        const button = screen.getByRole("button", { name: STATS });
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("region")).not.toBeInTheDocument();
      });

      test("opening them shows the summary of the selected mode", async () => {
        const user = setupUser();
        renderGame();

        await user.click(screen.getByRole("button", { name: STATS }));

        expect(screen.getByRole("button", { name: STATS })).toHaveAttribute(
          "aria-expanded",
          "true"
        );
        expect(
          screen.getByRole("region", {
            name: STATS,
          })
        ).toBeVisible();
      });

      test("are updated after every round", async () => {
        const user = setupUser();
        renderGame();
        await user.click(screen.getByRole("button", { name: STATS }));

        // Bot plays rock, then paper, then rock
        await user.click(getMoveButton(PAPER));
        waitForBot();
        await user.click(getMoveButton(ROCK));
        waitForBot();
        await user.click(getMoveButton(SCISSORS));
        waitForBot();

        expect(getStat("components.player-stats.played")).toHaveTextContent(
          "3"
        );
        expect(getStat("components.player-stats.wins")).toHaveTextContent("1");
        expect(getStat("components.player-stats.losses")).toHaveTextContent(
          "2"
        );
        expect(getStat("components.player-stats.ties")).toHaveTextContent("0");
        expect(
          getStat("components.player-stats.longest-streak")
        ).toHaveTextContent("1");
        expect(
          getStat("components.player-stats.current-streak")
        ).toHaveTextContent("0");
      });
    });

    test("goes back home when the player logs out", () => {
      renderGame();

      const { logout } = getAuth();
      act(() => logout());

      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    test("renders the Spanish translations", async () => {
      const user = setupUser();
      renderGame("es");

      expect(screen.getByText("Puntuación: 0")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Papel" }));
      waitForBot();

      expect(getChoice("Tú:")).toHaveTextContent("🖐️Papel");
      expect(screen.getByRole("status")).toHaveTextContent("¡Has ganado!");
    });
  });

  describe("with a player in expanded mode", () => {
    beforeEach(() => {
      const { setGameMode } = renderHook(() => useGameMode()).result.current;
      act(() => setGameMode(GAME_MODES.EXPANDED));
      const { login } = getAuth();
      act(() => login("Maria"));
      vi.useFakeTimers({ shouldAdvanceTime: true });
      vi.spyOn(Math, "random").mockReturnValue(0);
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    test("shows the five move buttons", () => {
      renderGame();

      expect(
        [ROCK, PAPER, SCISSORS, LIZARD, SPOCK].map(
          (name) => getMoveButton(name).textContent
        )
      ).toEqual(["✊", "🖐️", "✌️", "🦎", "🖖"]);
    });

    test("spock beats rock and adds an expanded point", async () => {
      const user = setupUser();
      renderGame();

      await user.click(getMoveButton(SPOCK));
      waitForBot();

      expect(getChoice(YOU)).toHaveTextContent(`🖖${SPOCK}`);
      expect(getChoice(BOT)).toHaveTextContent(`✊${ROCK}`);
      expect(screen.getByRole("status")).toHaveTextContent("game.results.win");
      expect(screen.getByText(score(1))).toBeInTheDocument();

      const { result } = renderHook(() => useGameStats());
      expect(result.current.players).toMatchObject({
        Maria: { expandedScore: 1, expandedStats: { wins: 1 } },
      });
    });

    test("lizard loses against rock", async () => {
      const user = setupUser();
      renderGame();

      await user.click(getMoveButton(LIZARD));
      waitForBot();

      expect(screen.getByRole("status")).toHaveTextContent("game.results.lose");
      expect(screen.getByText(score(0))).toBeInTheDocument();
    });

    test("the bot can play the expanded moves", async () => {
      Math.random.mockReturnValue(0.99);
      const user = setupUser();
      renderGame();

      await user.click(getMoveButton(LIZARD));
      waitForBot();

      expect(getChoice(BOT)).toHaveTextContent(`🖖${SPOCK}`);
      expect(screen.getByRole("status")).toHaveTextContent("game.results.win");
    });

    test("renders the Spanish names of the new moves", () => {
      renderGame("es");

      expect(screen.getByRole("button", { name: "Lagarto" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Spock" })).toBeEnabled();
    });
  });
});
