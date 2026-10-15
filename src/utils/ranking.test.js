import { describe, test, expect } from "vitest";

import { GAME_MODES } from "./game-rules";
import { getPlayerRanking, MEDALS } from "./ranking";

const { CLASSIC, EXPANDED } = GAME_MODES;

describe("getPlayerRanking", () => {
  test("returns an empty ranking when there are no players", () => {
    expect(getPlayerRanking({}, CLASSIC)).toEqual([]);
  });

  test("sorts the players from the highest score to the lowest", () => {
    const ranking = getPlayerRanking(
      {
        Ana: { classicScore: 2 },
        Juan: { classicScore: 7 },
        Maria: { classicScore: 4 },
      },
      CLASSIC
    );

    expect(ranking.map(({ name }) => name)).toEqual(["Juan", "Maria", "Ana"]);
    expect(ranking.map(({ position }) => position)).toEqual([1, 2, 3]);
  });

  test("orders players with the same score by name", () => {
    const ranking = getPlayerRanking(
      {
        Zoe: { classicScore: 3 },
        Ana: { classicScore: 3 },
        Luis: { classicScore: 5 },
      },
      CLASSIC
    );

    expect(ranking.map(({ name }) => name)).toEqual(["Luis", "Ana", "Zoe"]);
  });

  test("gives a medal only to the first three players", () => {
    const ranking = getPlayerRanking(
      {
        A: { classicScore: 5 },
        B: { classicScore: 4 },
        C: { classicScore: 3 },
        D: { classicScore: 2 },
        E: { classicScore: 1 },
      },
      CLASSIC
    );

    expect(ranking.map(({ medal }) => medal)).toEqual([...MEDALS, null, null]);
  });

  test.each([
    [
      CLASSIC,
      [
        ["Ana", 4],
        ["Juan", 1],
      ],
    ],
    [
      EXPANDED,
      [
        ["Luis", 6],
        ["Juan", 3],
      ],
    ],
  ])(
    "%s only ranks the players with a score in that mode",
    (mode, expected) => {
      const ranking = getPlayerRanking(
        {
          Ana: { classicScore: 4 },
          Juan: { classicScore: 1, expandedScore: 3 },
          Luis: { expandedScore: 6 },
        },
        mode
      );

      expect(ranking.map(({ name, score }) => [name, score])).toEqual(expected);
    }
  );
});
