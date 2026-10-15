import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router";
import { render, screen } from "@/utils/test-utils";

import Button from "./button";
import { BUTTON_VARIANTS } from "./button-variants";

describe("Button", () => {
  describe("without `to`", () => {
    test("renders a button that does not submit forms by default", () => {
      render(<Button>Play</Button>);

      const button = screen.getByRole("button", { name: "Play" });
      expect(button).toHaveAttribute("type", "button");
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    test("can be a submit button", () => {
      render(<Button type="submit">Join</Button>);

      expect(screen.getByRole("button", { name: "Join" })).toHaveAttribute(
        "type",
        "submit"
      );
    });

    test("calls onClick when clicked", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Play</Button>);

      await user.click(screen.getByRole("button", { name: "Play" }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    test("does not call onClick while disabled", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Button onClick={onClick} disabled>
          Play
        </Button>
      );

      const button = screen.getByRole("button", { name: "Play" });
      await user.click(button);

      expect(button).toBeDisabled();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("with `to`", () => {
    test("renders a link to the given path", () => {
      render(<Button to="/ranking">Ranking</Button>);

      expect(screen.getByRole("link", { name: "Ranking" })).toHaveAttribute(
        "href",
        "/ranking"
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    test("navigates when clicked", async () => {
      const user = userEvent.setup();
      render(
        <Routes>
          <Route path="/" element={<Button to="/ranking">Ranking</Button>} />
          <Route path="/ranking" element={<div data-testid="ranking-page" />} />
        </Routes>
      );

      await user.click(screen.getByRole("link", { name: "Ranking" }));

      expect(screen.getByTestId("ranking-page")).toBeInTheDocument();
    });

    test("passes the router props to the link", async () => {
      const user = userEvent.setup();
      const RankingPage = () => {
        const { state } = useLocation();
        return <div data-testid="ranking-page">{state.from}</div>;
      };
      render(
        <Routes>
          <Route
            path="/"
            element={
              <Button to="/ranking" state={{ from: "/home" }}>
                Ranking
              </Button>
            }
          />
          <Route path="/ranking" element={<RankingPage />} />
        </Routes>
      );

      await user.click(screen.getByRole("link", { name: "Ranking" }));

      expect(screen.getByTestId("ranking-page")).toHaveTextContent("/home");
    });
  });

  describe("variants", () => {
    test("is primary by default", () => {
      render(<Button>Play</Button>);

      expect(screen.getByRole("button")).toHaveClass("button button_primary", {
        exact: true,
      });
    });

    test.each(Object.values(BUTTON_VARIANTS))(
      "renders the %s variant as a button and as a link",
      (variant) => {
        render(
          <>
            <Button variant={variant}>Play</Button>
            <Button variant={variant} to="/ranking">
              Ranking
            </Button>
          </>
        );

        expect(screen.getByRole("button")).toHaveClass(`button_${variant}`);
        expect(screen.getByRole("link")).toHaveClass(`button_${variant}`);
      }
    );

    test("keeps the classes added by the caller", () => {
      render(
        <Button variant={BUTTON_VARIANTS.SECONDARY} className="nav-bar__logout">
          Log out
        </Button>
      );

      expect(screen.getByRole("button")).toHaveClass(
        "button button_secondary nav-bar__logout",
        { exact: true }
      );
    });
  });
});
