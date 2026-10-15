import { useCallback, useEffect, useRef, useState } from "react";

import {
  BOT_THINKING_DELAY_MS,
  DEFAULT_GAME_MODE,
  getRoundResult,
  pickBotMove,
  RESULTS,
} from "@/utils/game-rules";
import { LOSE_VIBRATION_MS, vibrate } from "@/utils/vibration";

/**
 * @typedef {Object} Round
 * @property {number} id - increases with every round
 * @property {string} playerMove
 * @property {string | null} botMove - null while the bot is thinking
 * @property {string | null} result - null until the round is resolved
 */

/**
 * Runs rock-paper-scissors rounds of the given game mode against the bot.
 * The bot answers after BOT_THINKING_DELAY_MS, and new moves are ignored
 * until the current round is resolved.
 * @param {{ onResult?: (result: string) => void, mode?: string }} [options]
 * @returns {{ round: Round | null, isThinking: boolean, play: (move: string) => void }}
 */
const useGameRound = ({ onResult, mode = DEFAULT_GAME_MODE } = {}) => {
  const [round, setRound] = useState(null);
  const lastBotMoveRef = useRef(null);
  const timeoutRef = useRef(null);
  const roundIdRef = useRef(0);
  const onResultRef = useRef(onResult);
  const modeRef = useRef(mode);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const play = useCallback((playerMove) => {
    if (timeoutRef.current) return;

    roundIdRef.current += 1;
    const id = roundIdRef.current;
    setRound({ id, playerMove, botMove: null, result: null });

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;

      const botMove = pickBotMove(
        lastBotMoveRef.current,
        Math.random,
        modeRef.current
      );
      lastBotMoveRef.current = botMove;
      const result = getRoundResult(playerMove, botMove);

      setRound({ id, playerMove, botMove, result });
      onResultRef.current?.(result);
      if (result === RESULTS.LOSE) vibrate(LOSE_VIBRATION_MS);
    }, BOT_THINKING_DELAY_MS);
  }, []);

  const isThinking = round !== null && round.result === null;

  return { round, isThinking, play };
};

export default useGameRound;
