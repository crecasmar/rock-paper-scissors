import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { supportedLocales } from "./locales";

const BASE_URL = import.meta.env.BASE_URL;

const renderApp = async ({ language = "en-US", path = BASE_URL } = {}) => {
  vi.spyOn(navigator, "language", "get").mockReturnValue(language);
  window.history.pushState({}, "", path);
  vi.resetModules();
  const { default: Application } = await import("./app");

  return render(<Application />);
};

describe("Application", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("language", () => {
    test.each(["en-US", "en"])("uses English for %s", async (language) => {
      await renderApp({ language });

      expect(
        screen.getByRole("heading", { level: 1, name: "Create new player" })
      ).toBeInTheDocument();
      expect(document.documentElement.lang).toBe(language);
    });

    test.each(["es-ES", "es"])("uses Spanish for %s", async (language) => {
      await renderApp({ language });

      expect(
        screen.getByRole("heading", { level: 1, name: "Crear nuevo jugador" })
      ).toBeInTheDocument();
      expect(document.title).toBe(supportedLocales.es["app-name"]);
      expect(document.documentElement.lang).toBe(language);
    });

    test("falls back to English for an unsupported language", async () => {
      await renderApp({ language: "fr-FR" });

      expect(
        screen.getByRole("heading", { level: 1, name: "Create new player" })
      ).toBeInTheDocument();
    });
  });

  describe("routing", () => {
    test("redirects the base URL to the home page", async () => {
      await renderApp();

      expect(screen.getByTestId("home-page")).toBeInTheDocument();
      expect(window.location.pathname).toBe(`${BASE_URL}home`);
    });

    test("opens the page in the URL under the base URL", async () => {
      await renderApp({ path: `${BASE_URL}ranking` });

      expect(screen.getByTestId("ranking-page")).toBeInTheDocument();
    });

    test("shows the not found page for an unknown route", async () => {
      await renderApp({ path: `${BASE_URL}unknown` });

      expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
    });

    test("keeps the base URL in the browser when navigating", async () => {
      const user = userEvent.setup();
      await renderApp();

      await user.click(screen.getByRole("link", { name: "See ranking" }));

      expect(screen.getByTestId("ranking-page")).toBeInTheDocument();
      expect(window.location.pathname).toBe(`${BASE_URL}ranking`);
    });
  });
});
