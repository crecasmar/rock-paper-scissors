import { FormattedMessage } from "react-intl";

import { RankingLink } from "@/components";
import { useGameStats } from "@/store/game-store";
import { getPlayerRanking } from "@/utils/ranking";

import "./ranking.css";

/**
 * Ranking page: every registered player sorted by score.
 */
const RankingPage = () => {
  const { players } = useGameStats();
  const playerRanking = getPlayerRanking(players);

  return (
    <main data-testid="ranking-page" className="ranking-page">
      <RankingLink />

      <h1 id="ranking-title" className="ranking-page__title">
        <FormattedMessage id="pages.ranking.title" />
      </h1>

      {playerRanking.length === 0 ? (
        <p className="ranking-page__empty">
          <FormattedMessage id="pages.ranking.empty" />
        </p>
      ) : (
        <ol className="ranking-page__list" aria-labelledby="ranking-title">
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
    </main>
  );
};

export default RankingPage;
