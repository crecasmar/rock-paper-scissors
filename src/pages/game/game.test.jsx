import { describe, test, expect, beforeEach, vi } from "vitest";
import { Route, Routes } from "react-router";
import { render, screen } from "@/utils/test-utils";

import GamePage from "./game";

let currentUser = null;

vi.mock("@/store/game-store", () => ({
  useAuth: () => ({ currentUser, login: vi.fn(), logout: vi.fn() }),
}));

const renderGame = () =>
  render(
    <Routes>
      <Route path="/home" element={<div data-testid="home-page" />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>,
    { initialPath: "/game" }
  );

describe("GamePage", () => {
  beforeEach(() => {
    currentUser = null;
  });

  test("redirects to home when no player is registered", () => {
    renderGame();
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("greets the registered player", () => {
    currentUser = "Maria";
    renderGame();
    expect(screen.getByTestId("game-page")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Hi, Maria" })
    ).toBeInTheDocument();
  });
});
