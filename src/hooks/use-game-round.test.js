import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useGameRound from "./use-game-round";
import {
  BOT_THINKING_DELAY_MS,
  GAME_MODES,
  MOVES,
  RESULTS,
} from "@/utils/game-rules";
import { LOSE_VIBRATION_MS } from "@/utils/vibration";

const waitForBot = () =>
  act(() => vi.advanceTimersByTime(BOT_THINKING_DELAY_MS));

describe("useGameRound", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("starts without a round", () => {
    const { result } = renderHook(() => useGameRound());

    expect(result.current.round).toBeNull();
    expect(result.current.isThinking).toBe(false);
  });

  test("shows the player's move while the bot is thinking", () => {
    const { result } = renderHook(() => useGameRound());

    act(() => result.current.play(MOVES.PAPER));

    expect(result.current.round).toEqual({
      id: 1,
      playerMove: MOVES.PAPER,
      botMove: null,
      result: null,
    });
    expect(result.current.isThinking).toBe(true);
  });

  test("the bot waits at least the thinking delay before answering", () => {
    const { result } = renderHook(() => useGameRound());

    act(() => result.current.play(MOVES.PAPER));
    act(() => vi.advanceTimersByTime(BOT_THINKING_DELAY_MS - 1));

    expect(result.current.isThinking).toBe(true);

    act(() => vi.advanceTimersByTime(1));

    expect(result.current.isThinking).toBe(false);
  });

  test("resolves the round and calls onWin when the player wins", () => {
    const onWin = vi.fn();
    const { result } = renderHook(() => useGameRound({ onWin }));

    act(() => result.current.play(MOVES.PAPER));
    waitForBot();

    expect(result.current.round).toEqual({
      id: 1,
      playerMove: MOVES.PAPER,
      botMove: MOVES.ROCK,
      result: RESULTS.WIN,
    });
    expect(onWin).toHaveBeenCalledTimes(1);
  });

  test.each([
    [MOVES.ROCK, RESULTS.TIE],
    [MOVES.SCISSORS, RESULTS.LOSE],
  ])("does not call onWin when playing %s results in %s", (move, outcome) => {
    const onWin = vi.fn();
    const { result } = renderHook(() => useGameRound({ onWin }));

    act(() => result.current.play(move));
    waitForBot();

    expect(result.current.round.result).toBe(outcome);
    expect(onWin).not.toHaveBeenCalled();
  });

  test("vibrates when the bot wins the round", () => {
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate });
    const { result } = renderHook(() => useGameRound());

    act(() => result.current.play(MOVES.SCISSORS));
    waitForBot();

    expect(result.current.round.result).toBe(RESULTS.LOSE);
    expect(vibrate).toHaveBeenCalledExactlyOnceWith(LOSE_VIBRATION_MS);
  });

  test.each([
    [MOVES.PAPER, RESULTS.WIN],
    [MOVES.ROCK, RESULTS.TIE],
  ])("does not vibrate when playing %s results in %s", (move, outcome) => {
    const vibrate = vi.fn();
    vi.stubGlobal("navigator", { vibrate });
    const { result } = renderHook(() => useGameRound());

    act(() => result.current.play(move));
    waitForBot();

    expect(result.current.round.result).toBe(outcome);
    expect(vibrate).not.toHaveBeenCalled();
  });

  test("still resolves a lost round when vibration is not supported", () => {
    vi.stubGlobal("navigator", {});
    const { result } = renderHook(() => useGameRound());

    act(() => result.current.play(MOVES.SCISSORS));
    waitForBot();

    expect(result.current.round.result).toBe(RESULTS.LOSE);
  });

  test("ignores new moves until the round is resolved", () => {
    const { result } = renderHook(() => useGameRound());

    act(() => {
      result.current.play(MOVES.PAPER);
      result.current.play(MOVES.SCISSORS);
    });
    waitForBot();

    expect(result.current.round.playerMove).toBe(MOVES.PAPER);
    expect(vi.getTimerCount()).toBe(0);
  });

  test("the bot never repeats its previous move", () => {
    const { result } = renderHook(() => useGameRound());

    const botMoves = [];
    for (let i = 0; i < 4; i++) {
      act(() => result.current.play(MOVES.ROCK));
      waitForBot();
      botMoves.push(result.current.round.botMove);
    }

    expect(botMoves).toEqual([
      MOVES.ROCK,
      MOVES.PAPER,
      MOVES.ROCK,
      MOVES.PAPER,
    ]);
  });

  test("the bot plays the expanded moves in expanded mode", () => {
    Math.random.mockReturnValue(0.99);
    const onWin = vi.fn();
    const { result } = renderHook(() =>
      useGameRound({ onWin, mode: GAME_MODES.EXPANDED })
    );

    act(() => result.current.play(MOVES.LIZARD));
    waitForBot();

    expect(result.current.round).toEqual({
      id: 1,
      playerMove: MOVES.LIZARD,
      botMove: MOVES.SPOCK,
      result: RESULTS.WIN,
    });
    expect(onWin).toHaveBeenCalledTimes(1);
  });

  test("the bot only plays classic moves by default", () => {
    Math.random.mockReturnValue(0.99);
    const { result } = renderHook(() => useGameRound());

    act(() => result.current.play(MOVES.ROCK));
    waitForBot();

    expect(result.current.round.botMove).toBe(MOVES.SCISSORS);
  });

  test("gives every round a new id", () => {
    const { result } = renderHook(() => useGameRound());

    act(() => result.current.play(MOVES.ROCK));
    waitForBot();
    act(() => result.current.play(MOVES.ROCK));

    expect(result.current.round.id).toBe(2);
  });

  test("drops the pending bot move on unmount", () => {
    const { result, unmount } = renderHook(() => useGameRound());

    act(() => result.current.play(MOVES.ROCK));
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
