import { describe, test, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import { KEYS_LOCALE, render, screen } from "@/utils/test-utils";

import RankingLink from "./ranking-link";

const SEE = "components.ranking-link.see";
const BACK = "components.ranking-link.back";

const Page = ({ testId }) => (
  <div data-testid={testId}>
    <RankingLink />
  </div>
);

const renderLink = (initialEntries, locale = KEYS_LOCALE) =>
  render(
    <Routes>
      <Route path="/home" element={<Page testId="home-page" />} />
      <Route path="/game" element={<Page testId="game-page" />} />
      <Route path="/ranking" element={<Page testId="ranking-page" />} />
    </Routes>,
    { initialEntries, locale }
  );

describe("RankingLink", () => {
  test.each(["/home", "/game"])("links to the ranking from %s", (path) => {
    renderLink([path]);

    expect(screen.getByRole("link", { name: SEE })).toHaveAttribute(
      "href",
      "/ranking"
    );
  });

  test("shows the go back link on the ranking page", () => {
    renderLink(["/ranking"]);

    expect(screen.getByRole("link", { name: BACK })).toHaveTextContent(
      `↩ ${BACK}`
    );
    expect(screen.queryByRole("link", { name: SEE })).not.toBeInTheDocument();
  });

  test.each([
    ["/home", "home-page"],
    ["/game", "game-page"],
  ])(
    "going to the ranking from %s and back returns to it",
    async (path, testId) => {
      const user = userEvent.setup();
      renderLink([path]);

      await user.click(screen.getByRole("link", { name: SEE }));
      expect(screen.getByTestId("ranking-page")).toBeInTheDocument();

      await user.click(screen.getByRole("link", { name: BACK }));
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    }
  );

  test("goes back home when the ranking was opened directly", async () => {
    const user = userEvent.setup();
    renderLink(["/ranking"]);

    await user.click(screen.getByRole("link", { name: BACK }));

    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("keeps the classes added by the caller", () => {
    render(<RankingLink className="nav-bar__action" />, {
      initialPath: "/home",
      locale: KEYS_LOCALE,
    });

    expect(screen.getByRole("link", { name: SEE })).toHaveClass(
      "button button_secondary nav-bar__action",
      { exact: true }
    );
  });

  test("renders the Spanish translations", () => {
    const { unmount } = renderLink(["/home"], "es");
    expect(
      screen.getByRole("link", { name: "Ver ranking" })
    ).toBeInTheDocument();
    unmount();

    renderLink(["/ranking"], "es");
    expect(screen.getByRole("link", { name: "Volver" })).toBeInTheDocument();
  });
});
