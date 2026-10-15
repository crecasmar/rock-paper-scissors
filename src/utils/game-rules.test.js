import { describe, test, expect } from "vitest";

import {
  GAME_MODE_MOVES,
  GAME_MODES,
  getRoundResult,
  MOVES,
  pickBotMove,
  RESULTS,
} from "./game-rules";

const { ROCK, PAPER, SCISSORS, LIZARD, SPOCK } = MOVES;

describe("GAME_MODE_MOVES", () => {
  test("classic plays rock, paper and scissors", () => {
    expect(GAME_MODE_MOVES[GAME_MODES.CLASSIC]).toEqual([
      ROCK,
      PAPER,
      SCISSORS,
    ]);
  });

  test("expanded adds lizard and Spock", () => {
    expect(GAME_MODE_MOVES[GAME_MODES.EXPANDED]).toEqual([
      ROCK,
      PAPER,
      SCISSORS,
      LIZARD,
      SPOCK,
    ]);
  });
});

describe("getRoundResult", () => {
  test.each([
    [ROCK, SCISSORS],
    [SCISSORS, PAPER],
    [PAPER, ROCK],
  ])("classic: %s beats %s", (playerMove, botMove) => {
    expect(getRoundResult(playerMove, botMove)).toBe(RESULTS.WIN);
    expect(getRoundResult(botMove, playerMove)).toBe(RESULTS.LOSE);
  });

  test.each([
    [SCISSORS, PAPER],
    [PAPER, ROCK],
    [ROCK, LIZARD],
    [LIZARD, SPOCK],
    [SPOCK, SCISSORS],
    [SCISSORS, LIZARD],
    [LIZARD, PAPER],
    [PAPER, SPOCK],
    [SPOCK, ROCK],
    [ROCK, SCISSORS],
  ])("expanded: %s beats %s", (playerMove, botMove) => {
    expect(getRoundResult(playerMove, botMove)).toBe(RESULTS.WIN);
    expect(getRoundResult(botMove, playerMove)).toBe(RESULTS.LOSE);
  });

  test.each(GAME_MODE_MOVES[GAME_MODES.EXPANDED])(
    "expanded: %s beats two moves and loses to two",
    (move) => {
      const results = GAME_MODE_MOVES[GAME_MODES.EXPANDED]
        .filter((other) => other !== move)
        .map((other) => getRoundResult(move, other));

      expect(results.filter((result) => result === RESULTS.WIN)).toHaveLength(
        2
      );
      expect(results.filter((result) => result === RESULTS.LOSE)).toHaveLength(
        2
      );
    }
  );

  test.each([ROCK, PAPER, SCISSORS, LIZARD, SPOCK])(
    "%s against itself is a tie",
    (move) => {
      expect(getRoundResult(move, move)).toBe(RESULTS.TIE);
    }
  );
});

describe("pickBotMove", () => {
  test.each([
    [0, ROCK],
    [0.4, PAPER],
    [0.99, SCISSORS],
  ])(
    "picks from every move when there is no previous one (random %d → %s)",
    (randomValue, expected) => {
      expect(pickBotMove(null, () => randomValue)).toBe(expected);
    }
  );

  test.each([ROCK, PAPER, SCISSORS])("never repeats %s", (previousMove) => {
    [0, 0.49, 0.5, 0.99].forEach((randomValue) => {
      expect(pickBotMove(previousMove, () => randomValue)).not.toBe(
        previousMove
      );
    });
  });

  test("can pick both remaining moves after a previous move", () => {
    expect(pickBotMove(ROCK, () => 0)).toBe(PAPER);
    expect(pickBotMove(ROCK, () => 0.99)).toBe(SCISSORS);
  });

  test("only picks classic moves by default", () => {
    [0, 0.5, 0.99].forEach((randomValue) => {
      expect(GAME_MODE_MOVES[GAME_MODES.CLASSIC]).toContain(
        pickBotMove(null, () => randomValue)
      );
    });
  });

  test.each([
    [0, ROCK],
    [0.3, PAPER],
    [0.5, SCISSORS],
    [0.7, LIZARD],
    [0.99, SPOCK],
  ])(
    "picks from every expanded move (random %d → %s)",
    (randomValue, expected) => {
      expect(pickBotMove(null, () => randomValue, GAME_MODES.EXPANDED)).toBe(
        expected
      );
    }
  );

  test.each([ROCK, PAPER, SCISSORS, LIZARD, SPOCK])(
    "never repeats %s in expanded mode",
    (previousMove) => {
      [0, 0.25, 0.5, 0.75, 0.99].forEach((randomValue) => {
        expect(
          pickBotMove(previousMove, () => randomValue, GAME_MODES.EXPANDED)
        ).not.toBe(previousMove);
      });
    }
  );

  test("uses Math.random by default", () => {
    expect(Object.values(MOVES)).toContain(pickBotMove());
  });
});
