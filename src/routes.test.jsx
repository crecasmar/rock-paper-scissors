import { describe, test, expect } from "vitest";
import { render, screen } from "./utils/test-utils";

import { AppRoutes } from "./routes";

describe("AppRoutes", () => {
  test("redirects / to the home page", () => {
    render(<AppRoutes />, { initialPath: "/" });
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });

  test("renders the home page when the path is /home", () => {
    render(<AppRoutes />, { initialPath: "/home" });
    expect(screen.getByTestId("home-page")).toBeInTheDocument();
  });
});
