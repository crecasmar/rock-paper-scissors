import { FormattedMessage } from "react-intl";

import { RankingLink } from "@/components";
import { useGameStats } from "@/store/game-store";
import { GAME_MODE_MESSAGES, GAME_MODES } from "@/utils/game-rules";
import { getPlayerRanking } from "@/utils/ranking";

import "./ranking.css";

/**
 * Players of one game mode sorted by score.
 * @param {{ mode: string, players: Record<string, import("@/store/game-store").PlayerData> }} props
 */
const ModeRanking = ({ mode, players }) => {
  const playerRanking = getPlayerRanking(players, mode);
  const titleId = `ranking-title-${mode}`;

  return (
    <section className="ranking-page__column" aria-labelledby={titleId}>
      <h2 id={titleId} className="ranking-page__subtitle">
        <FormattedMessage {...GAME_MODE_MESSAGES[mode]} />
      </h2>

      {playerRanking.length === 0 ? (
        <p className="ranking-page__empty">
          <FormattedMessage id="pages.ranking.empty" />
        </p>
      ) : (
        <ol className="ranking-page__list" aria-labelledby={titleId}>
          {playerRanking.map(({ name, score, position, medal }) => (
            <li key={name} className="ranking-page__item">
              <span className="sr-only">
                <FormattedMessage
                  id="pages.ranking.player-label"
                  values={{ position, name, score }}
                />
              </span>
              <span className="ranking-page__position" aria-hidden="true">
                {medal ?? position}
              </span>
              <span className="ranking-page__name" aria-hidden="true">
                {name}
              </span>
              <span className="ranking-page__score" aria-hidden="true">
                <FormattedMessage id="pages.ranking.score" values={{ score }} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

/**
 * Ranking page: every registered player sorted by score,
 * with one column for each game mode.
 */
const RankingPage = () => {
  const { players } = useGameStats();

  return (
    <main data-testid="ranking-page" className="ranking-page">
      <RankingLink />

      <h1 className="ranking-page__title">
        <FormattedMessage id="pages.ranking.title" />
      </h1>

      <div className="ranking-page__columns">
        {Object.values(GAME_MODES).map((mode) => (
          <ModeRanking key={mode} mode={mode} players={players} />
        ))}
      </div>
    </main>
  );
};

export default RankingPage;
