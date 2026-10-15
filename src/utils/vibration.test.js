import { describe, test, expect, afterEach, vi } from "vitest";

import { vibrate } from "./vibration";

describe("vibrate", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("forwards the pattern to the Vibration API", () => {
    const navigatorVibrate = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { vibrate: navigatorVibrate });

    expect(vibrate(200)).toBe(true);
    expect(navigatorVibrate).toHaveBeenCalledWith(200);
  });

  test("does nothing when the Vibration API is not supported", () => {
    vi.stubGlobal("navigator", {});

    expect(vibrate(200)).toBe(false);
  });
});
