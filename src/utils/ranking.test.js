import { describe, test, expect } from "vitest";

import { getPlayerRanking, MEDALS } from "./ranking";

describe("getPlayerRanking", () => {
  test("returns an empty ranking when there are no players", () => {
    expect(getPlayerRanking({})).toEqual([]);
  });

  test("sorts the players from the highest score to the lowest", () => {
    const ranking = getPlayerRanking({
      Ana: { score: 2 },
      Juan: { score: 7 },
      Maria: { score: 4 },
    });

    expect(ranking.map(({ name }) => name)).toEqual(["Juan", "Maria", "Ana"]);
    expect(ranking.map(({ position }) => position)).toEqual([1, 2, 3]);
  });

  test("orders players with the same score by name", () => {
    const ranking = getPlayerRanking({
      Zoe: { score: 3 },
      Ana: { score: 3 },
      Luis: { score: 5 },
    });

    expect(ranking.map(({ name }) => name)).toEqual(["Luis", "Ana", "Zoe"]);
  });

  test("gives a medal only to the first three players", () => {
    const ranking = getPlayerRanking({
      A: { score: 5 },
      B: { score: 4 },
      C: { score: 3 },
      D: { score: 2 },
      E: { score: 1 },
    });

    expect(ranking.map(({ medal }) => medal)).toEqual([...MEDALS, null, null]);
  });
});
