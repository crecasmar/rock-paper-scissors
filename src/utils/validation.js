export const PLAYER_NAME_MIN_LENGTH = 3;
export const PLAYER_NAME_MAX_LENGTH = 20;

/** How long the user must stop typing before an invalid name is reported. */
export const PLAYER_NAME_ERROR_DELAY_MS = 500;

const PLAYER_NAME_PATTERN = /^[\p{L}\p{N} _-]+$/u;

/**
 * Checks whether a player name is valid once surrounding whitespace is removed.
 * @param {string} name
 * @returns {boolean}
 */
export const isValidPlayerName = (name) => {
  const trimmed = (name ?? "").trim();

  return (
    trimmed.length >= PLAYER_NAME_MIN_LENGTH &&
    trimmed.length <= PLAYER_NAME_MAX_LENGTH &&
    PLAYER_NAME_PATTERN.test(trimmed)
  );
};
