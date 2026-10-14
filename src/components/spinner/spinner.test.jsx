import { describe, test, expect } from "vitest";
import { render, screen } from "@/utils/test-utils";

import Spinner from "./spinner";

describe("Spinner", () => {
  test("renders an image with an accessible label", () => {
    render(<Spinner label="Loading" />);
    expect(screen.getByRole("img", { name: "Loading" })).toBeInTheDocument();
  });

  test("only has the base class by default", () => {
    render(<Spinner label="Loading" />);
    expect(screen.getByRole("img")).toHaveClass("spinner", { exact: true });
  });

  test("adds the custom class next to the base one", () => {
    render(<Spinner label="Loading" className="size-8 text-accent" />);
    expect(screen.getByRole("img")).toHaveClass("spinner size-8 text-accent", {
      exact: true,
    });
  });
});
