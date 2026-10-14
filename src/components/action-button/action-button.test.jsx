import { describe, test, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@/utils/test-utils";

import ActionButton from "./action-button";

describe("ActionButton", () => {
  test("renders the icon with an accessible label", () => {
    render(<ActionButton icon="✊" label="Rock" onClick={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Rock" });
    expect(button).toHaveTextContent("✊");
    expect(button).toBeEnabled();
  });

  test("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ActionButton icon="✊" label="Rock" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Rock" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick while disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ActionButton icon="✊" label="Rock" onClick={onClick} disabled />);

    const button = screen.getByRole("button", { name: "Rock" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
