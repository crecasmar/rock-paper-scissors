import { SCORE_KEYS } from "@/utils/game-rules";

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
 * Sorts the players with a score in the game mode from the highest score to
 * the lowest. Players with the same score are ordered by name.
 * @param {Record<string, import("@/store/game-store").PlayerData>} players
 * @param {string} mode - One of GAME_MODES
 * @returns {RankingEntry[]}
 */
export const getPlayerRanking = (players, mode) =>
  Object.entries(players)
    .filter(([, player]) => SCORE_KEYS[mode] in player)
    .map(([name, player]) => ({ name, score: player[SCORE_KEYS[mode]] }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .map((player, index) => ({
      ...player,
      position: index + 1,
      medal: MEDALS[index] ?? null,
    }));
