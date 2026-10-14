import { describe, test, expect } from "vitest";

import { isValidPlayerName } from "./validation";

describe("isValidPlayerName", () => {
  test.each(["Maria", "abc", "Player 1", "john_doe-93", "  Ana  ", "Álvaro"])(
    "accepts %j",
    (name) => {
      expect(isValidPlayerName(name)).toBe(true);
    }
  );

  test.each([
    "",
    "   ",
    "ab",
    "  ab  ",
    "a".repeat(21),
    "maria!",
    "<script>",
    undefined,
    null,
  ])("rejects %j", (name) => {
    expect(isValidPlayerName(name)).toBe(false);
  });
});
