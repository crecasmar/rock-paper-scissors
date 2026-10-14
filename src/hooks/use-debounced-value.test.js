import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import useDebouncedValue from "./use-debounced-value";

const INITIAL_VALUE = "initial-value";
const CHANGED_VALUE = "changed-value";
const FINAL_VALUE = "final-value";

const renderDebouncedValue = (delay) =>
  renderHook(({ value }) => useDebouncedValue(value, delay), {
    initialProps: { value: INITIAL_VALUE },
  });

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test("returns the initial value straight away", () => {
    const { result } = renderDebouncedValue();

    expect(result.current).toBe(INITIAL_VALUE);
  });

  test("debounces value changes using the default delay of 250ms", () => {
    const { result, rerender } = renderDebouncedValue();

    rerender({ value: CHANGED_VALUE });
    expect(result.current).toBe(INITIAL_VALUE);

    act(() => vi.advanceTimersByTime(249));
    expect(result.current).toBe(INITIAL_VALUE);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(CHANGED_VALUE);
  });

  test("debounces value changes using the given delay", () => {
    const testDelay = 800;
    const { result, rerender } = renderDebouncedValue(testDelay);

    rerender({ value: CHANGED_VALUE });

    act(() => vi.advanceTimersByTime(testDelay - 1));
    expect(result.current).toBe(INITIAL_VALUE);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(CHANGED_VALUE);
  });

  test("restarts the wait on every change and only keeps the last value", () => {
    const { result, rerender } = renderDebouncedValue();

    rerender({ value: CHANGED_VALUE });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: FINAL_VALUE });
    act(() => vi.advanceTimersByTime(200));

    expect(result.current).toBe(INITIAL_VALUE);

    act(() => vi.advanceTimersByTime(50));
    expect(result.current).toBe(FINAL_VALUE);
  });

  test("does not update when the value goes back before the delay ends", () => {
    const { result, rerender } = renderDebouncedValue();

    rerender({ value: CHANGED_VALUE });
    rerender({ value: INITIAL_VALUE });
    act(() => vi.advanceTimersByTime(250));

    expect(result.current).toBe(INITIAL_VALUE);
  });

  test("drops the pending update when unmounted", () => {
    const { rerender, unmount } = renderDebouncedValue();

    rerender({ value: CHANGED_VALUE });
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
