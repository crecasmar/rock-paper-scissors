import { describe, test, expect } from "vitest";

import { getRoundResult, MOVES, pickBotMove, RESULTS } from "./game-rules";

const { ROCK, PAPER, SCISSORS } = MOVES;

describe("getRoundResult", () => {
  test.each([
    [ROCK, SCISSORS],
    [SCISSORS, PAPER],
    [PAPER, ROCK],
  ])("%s beats %s", (playerMove, botMove) => {
    expect(getRoundResult(playerMove, botMove)).toBe(RESULTS.WIN);
    expect(getRoundResult(botMove, playerMove)).toBe(RESULTS.LOSE);
  });

  test.each([ROCK, PAPER, SCISSORS])("%s against itself is a tie", (move) => {
    expect(getRoundResult(move, move)).toBe(RESULTS.TIE);
  });
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

  test("uses Math.random by default", () => {
    expect(Object.values(MOVES)).toContain(pickBotMove());
  });
});
