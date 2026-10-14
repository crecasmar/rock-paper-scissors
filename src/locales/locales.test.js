import { describe, test, expect } from "vitest";

import { supportedLocales } from ".";

/**
 * Tests render message ids instead of real text (see KEYS_LOCALE in
 * test-utils), so a missing or misspelled key would not fail them.
 * These checks make sure every key the app uses is actually translated.
 */

const sourceFiles = import.meta.glob(["../**/*.{js,jsx}", "!../**/*.test.*"], {
  query: "?raw",
  import: "default",
  eager: true,
});

const MESSAGE_ID_PATTERNS = [
  /<FormattedMessage[^>]*?\sid="([^"]+)"/g,
  /formatMessage\(\s*\{\s*id:\s*"([^"]+)"/g,
];

const usedMessageIds = [
  ...new Set(
    Object.values(sourceFiles).flatMap((source) =>
      MESSAGE_ID_PATTERNS.flatMap((pattern) =>
        [...source.matchAll(pattern)].map(([, id]) => id)
      )
    )
  ),
].sort();

const localeNames = Object.keys(supportedLocales);

describe("locales", () => {
  test("finds the message ids used in the source code", () => {
    expect(usedMessageIds).toContain("pages.home.title");
  });

  test("all locales define the same keys", () => {
    const [referenceKeys, ...otherKeys] = localeNames.map((locale) =>
      Object.keys(supportedLocales[locale]).sort()
    );

    otherKeys.forEach((keys) => expect(keys).toEqual(referenceKeys));
  });

  test.each(localeNames)(
    "every message id used in the app is translated in %s",
    (locale) => {
      const missing = usedMessageIds.filter(
        (id) => !(id in supportedLocales[locale])
      );

      expect(missing).toEqual([]);
    }
  );

  test.each(localeNames)("no translation in %s is empty", (locale) => {
    const empty = Object.entries(supportedLocales[locale])
      .filter(([, text]) => text.trim() === "")
      .map(([id]) => id);

    expect(empty).toEqual([]);
  });
});
