export const MOVES = Object.freeze({
  ROCK: "rock",
  PAPER: "paper",
  SCISSORS: "scissors",
});

export const RESULTS = Object.freeze({
  WIN: "win",
  LOSE: "lose",
  TIE: "tie",
});

export const BOT_THINKING_DELAY_MS = 1000;

/**
 * Icon and translatable name for every move, in display order.
 */
export const MOVE_DETAILS = Object.freeze({
  [MOVES.ROCK]: { icon: "✊", message: { id: "game.moves.rock" } },
  [MOVES.PAPER]: { icon: "🖐️", message: { id: "game.moves.paper" } },
  [MOVES.SCISSORS]: { icon: "✌️", message: { id: "game.moves.scissors" } },
});

export const RESULT_MESSAGES = Object.freeze({
  [RESULTS.WIN]: { id: "game.results.win" },
  [RESULTS.LOSE]: { id: "game.results.lose" },
  [RESULTS.TIE]: { id: "game.results.tie" },
});

/** Each move maps to the move it beats. */
const BEATS = Object.freeze({
  [MOVES.ROCK]: MOVES.SCISSORS,
  [MOVES.SCISSORS]: MOVES.PAPER,
  [MOVES.PAPER]: MOVES.ROCK,
});

/**
 * Decides the outcome of a round from the player's point of view.
 * @param {string} playerMove
 * @param {string} botMove
 * @returns {string} One of RESULTS
 */
export const getRoundResult = (playerMove, botMove) => {
  if (playerMove === botMove) return RESULTS.TIE;
  return BEATS[playerMove] === botMove ? RESULTS.WIN : RESULTS.LOSE;
};

/**
 * Picks a random move for the bot, never repeating its previous move.
 * @param {string | null} [previousMove]
 * @param {() => number} [random]
 * @returns {string}
 */
export const pickBotMove = (previousMove = null, random = Math.random) => {
  const options = Object.values(MOVES).filter((move) => move !== previousMove);
  return options[Math.floor(random() * options.length)];
};
