import { describe, test, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import {
  KEYS_LOCALE,
  act,
  render,
  renderHook,
  screen,
} from "@/utils/test-utils";

import NotFoundPage from "./not-found";
import HomePage from "@/pages/home/home";
import { useAuth } from "@/store/game-store";

const getAuth = () => renderHook(() => useAuth()).result.current;

const renderNotFound = (locale = KEYS_LOCALE) =>
  render(
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/game" element={<div data-testid="game-page" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>,
    { initialPath: "/unknown", locale }
  );

describe("NotFoundPage", () => {
  beforeEach(() => {
    const { logout } = getAuth();
    act(() => logout());
    localStorage.clear();
  });

  test("renders the title and the link back home", () => {
    renderNotFound();
    expect(
      screen.getByRole("heading", { level: 1, name: "pages.not-found.title" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "pages.not-found.back" })
    ).toHaveAttribute("href", "/home");
  });

  test("the link goes to the home page when there is no player", async () => {
    const user = userEvent.setup();
    renderNotFound();

    await user.click(
      screen.getByRole("link", { name: "pages.not-found.back" })
    );

    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("the link ends in the game when a player already exists", async () => {
    const user = userEvent.setup();
    renderNotFound();
    const { login } = getAuth();
    act(() => login("Maria"));

    await user.click(
      screen.getByRole("link", { name: "pages.not-found.back" })
    );

    expect(screen.getByTestId("game-page")).toBeInTheDocument();
  });
});
