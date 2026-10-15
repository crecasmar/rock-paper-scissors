export const MOVES = Object.freeze({
  ROCK: "rock",
  PAPER: "paper",
  SCISSORS: "scissors",
  LIZARD: "lizard",
  SPOCK: "spock",
});

export const GAME_MODES = Object.freeze({
  CLASSIC: "classic",
  EXPANDED: "expanded",
});

export const DEFAULT_GAME_MODE = GAME_MODES.CLASSIC;

/** Player data key where each game mode keeps its score */
export const SCORE_KEYS = Object.freeze({
  [GAME_MODES.CLASSIC]: "classicScore",
  [GAME_MODES.EXPANDED]: "expandedScore",
});

export const GAME_MODE_MESSAGES = Object.freeze({
  [GAME_MODES.CLASSIC]: { id: "game.modes.classic" },
  [GAME_MODES.EXPANDED]: { id: "game.modes.expanded" },
});

/** Moves available in each game mode, in display order */
export const GAME_MODE_MOVES = Object.freeze({
  [GAME_MODES.CLASSIC]: Object.freeze([
    MOVES.ROCK,
    MOVES.PAPER,
    MOVES.SCISSORS,
  ]),
  [GAME_MODES.EXPANDED]: Object.freeze([
    MOVES.ROCK,
    MOVES.PAPER,
    MOVES.SCISSORS,
    MOVES.LIZARD,
    MOVES.SPOCK,
  ]),
});

export const RESULTS = Object.freeze({
  WIN: "win",
  LOSE: "lose",
  TIE: "tie",
});

export const BOT_THINKING_DELAY_MS = 1000;

/**
 * Icon and translatable name for every move.
 */
export const MOVE_DETAILS = Object.freeze({
  [MOVES.ROCK]: { icon: "✊", message: { id: "game.moves.rock" } },
  [MOVES.PAPER]: { icon: "🖐️", message: { id: "game.moves.paper" } },
  [MOVES.SCISSORS]: { icon: "✌️", message: { id: "game.moves.scissors" } },
  [MOVES.LIZARD]: { icon: "🦎", message: { id: "game.moves.lizard" } },
  [MOVES.SPOCK]: { icon: "🖖", message: { id: "game.moves.spock" } },
});

export const RESULT_MESSAGES = Object.freeze({
  [RESULTS.WIN]: { id: "game.results.win" },
  [RESULTS.LOSE]: { id: "game.results.lose" },
  [RESULTS.TIE]: { id: "game.results.tie" },
});

/**
 * Each move maps to the moves it beats. Classic only uses the first three
 * moves, and the rules among them are the same in both modes.
 */
const BEATS = Object.freeze({
  [MOVES.ROCK]: [MOVES.SCISSORS, MOVES.LIZARD],
  [MOVES.PAPER]: [MOVES.ROCK, MOVES.SPOCK],
  [MOVES.SCISSORS]: [MOVES.PAPER, MOVES.LIZARD],
  [MOVES.LIZARD]: [MOVES.SPOCK, MOVES.PAPER],
  [MOVES.SPOCK]: [MOVES.SCISSORS, MOVES.ROCK],
});

/**
 * Decides the outcome of a round from the player's point of view.
 * @param {string} playerMove
 * @param {string} botMove
 * @returns {string} One of RESULTS
 */
export const getRoundResult = (playerMove, botMove) => {
  if (playerMove === botMove) return RESULTS.TIE;
  return BEATS[playerMove].includes(botMove) ? RESULTS.WIN : RESULTS.LOSE;
};

/**
 * Picks a random move of the game mode for the bot,
 * never repeating its previous move.
 * @param {string | null} [previousMove]
 * @param {() => number} [random]
 * @param {string} [mode] - One of GAME_MODES
 * @returns {string}
 */
export const pickBotMove = (
  previousMove = null,
  random = Math.random,
  mode = DEFAULT_GAME_MODE
) => {
  const options = GAME_MODE_MOVES[mode].filter((move) => move !== previousMove);
  return options[Math.floor(random() * options.length)];
};
