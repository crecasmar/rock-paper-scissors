import { describe, test, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router";
import {
  KEYS_LOCALE,
  act,
  render,
  renderHook,
  screen,
} from "@/utils/test-utils";

let Layout;
let useAuth;

const getAuth = () => renderHook(() => useAuth()).result.current;

const renderLayout = (locale = KEYS_LOCALE) =>
  render(
    <Routes>
      <Route element={<Layout />}>
        <Route path="/page" element={<div data-testid="page" />} />
      </Route>
    </Routes>,
    { initialPath: "/page", locale }
  );

describe("Layout", () => {
  beforeEach(async () => {
    // Same starting point as index.html, which ships a static <title>
    document.head.innerHTML = "<title>index.html title</title>";
    localStorage.clear();
    vi.resetModules();
    ({ default: Layout } = await import("./layout"));
    ({ useAuth } = await import("@/store/game-store"));
  });

  test("renders the page below the navigation bar", () => {
    renderLayout();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  test("shows the app name when no player is logged in", () => {
    renderLayout();

    expect(screen.getByRole("banner")).toHaveTextContent("app-name");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("greets the logged in player", () => {
    const { login } = getAuth();
    act(() => login("Maria"));
    renderLayout();

    expect(screen.getByRole("banner")).toHaveTextContent(
      "components.nav-bar.greeting Maria"
    );
  });

  test("logging out shows the app name again", async () => {
    const user = userEvent.setup();
    const { login } = getAuth();
    act(() => login("Maria"));
    renderLayout();

    await user.click(
      screen.getByRole("button", { name: "components.nav-bar.logout" })
    );

    expect(getAuth().currentUser).toBeNull();
    expect(screen.getByRole("banner")).toHaveTextContent("app-name");
  });

  test("sets the document title and language", () => {
    renderLayout();

    expect(document.title).toBe("app-name");
    expect(document.head.querySelectorAll("title")).toHaveLength(1);
    expect(document.documentElement.lang).toBe("en");
  });

  test("renders the Spanish translations", () => {
    renderLayout("es");

    expect(screen.getByRole("banner")).toHaveTextContent(
      "Piedra, Papel o Tijera"
    );
    expect(document.title).toBe("Piedra, Papel o Tijera");
    expect(document.documentElement.lang).toBe("es");
  });
});
