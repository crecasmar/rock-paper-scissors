/** Medals shown instead of the position for the first three players */
export const MEDALS = Object.freeze(["🥇", "🥈", "🥉"]);

/**
 * @typedef {Object} RankingEntry
 * @property {number} position - 1 for the highest score
 * @property {string} name
 * @property {number} score
 * @property {string | null} medal
 */

/**
 * Sorts every player from the highest score to the lowest.
 * Players with the same score are ordered by name.
 * @param {Record<string, import("@/store/game-store").PlayerData>} players
 * @returns {RankingEntry[]}
 */
export const getPlayerRanking = (players) =>
  Object.entries(players)
    .map(([name, { score }]) => ({ name, score }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map((player, index) => ({
      ...player,
      position: index + 1,
      medal: MEDALS[index] ?? null,
    }));
