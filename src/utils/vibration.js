/** Vibration played when the bot wins a round. */
export const LOSE_VIBRATION_MS = 200;

/**
 * Vibrates the device when the browser supports it (e.g. not on iOS Safari).
 * @param {number | number[]} pattern - duration in ms, or a vibrate/pause pattern
 * @returns {boolean} whether the vibration was requested
 */
export const vibrate = (pattern) => {
  if (typeof navigator === "undefined" || !navigator.vibrate) return false;
  return navigator.vibrate(pattern);
};
