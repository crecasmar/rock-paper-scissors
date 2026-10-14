import { describe, test, expect } from "vitest";
import { render, screen } from "../../utils/test-utils";

import HomePage from "./home";

describe("HomePage", () => {
  test("renders the home page container", () => {
    render(<HomePage />);
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("renders the welcome heading", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Welcome to the Home Page",
      })
    ).toBeInTheDocument();
  });

  test("renders the description text", () => {
    render(<HomePage />);
    expect(
      screen.getByText("This is the main landing page of the application.")
    ).toBeInTheDocument();
  });
});
