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

import { BOT_THINKING_DELAY_MS } from "@/utils/game-rules";

/**
 * The store is a module-level singleton that keeps every player's score,
 * so each test loads a fresh page and store.
 */
let GamePage;
let useAuth;
let useGameStats;

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
    ({ useAuth, useGameStats } = await import("@/store/game-store"));
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

    test("shows the nav bar greeting and the score", () => {
      renderGame();

      expect(screen.getByTestId("game-page")).toBeInTheDocument();
      expect(screen.getByRole("banner")).toHaveTextContent(
        "components.nav-bar.greeting Maria"
      );
      expect(screen.getByText(score(0))).toBeInTheDocument();
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
          "game-page__choice-icon--attack-right"
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
          "game-page__choice-icon--attack-left"
        );
      });

      test("both icons clash in the middle on a tie", async () => {
        const user = setupUser();
        renderGame();

        await user.click(getMoveButton(ROCK));
        waitForBot();

        expect(getIcon(YOU, "✊")).toHaveClass(
          "game-page__choice-icon--clash-right"
        );
        expect(getIcon(BOT, "✊")).toHaveClass(
          "game-page__choice-icon--clash-left"
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
      expect(result.current.players).toEqual({ Maria: { score: 1 } });
    });

    test("logging out goes back home", async () => {
      const user = setupUser();
      renderGame();

      await user.click(
        screen.getByRole("button", { name: "components.nav-bar.logout" })
      );

      expect(getAuth().currentUser).toBeNull();
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
});
