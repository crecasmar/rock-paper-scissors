import { Navigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";

import { NavBar, ActionButton } from "@/components/game";
import useGameRound from "@/hooks/use-game-round";
import { useAuth, useGameStats } from "@/store/game-store";
import { MOVE_DETAILS, RESULT_MESSAGES } from "@/utils/game-rules";

import "./game.css";

const Spinner = ({ label }) => (
  <svg
    className="game-page__spinner"
    viewBox="0 0 24 24"
    fill="none"
    role="img"
    aria-label={label}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * One side of the round summary: who played and which move they chose.
 * @param {{ title: import("react").ReactNode, move: string | null, thinkingLabel?: string }} props
 */
const PlayerChoice = ({ title, move, thinkingLabel }) => (
  <div className="game-page__choice">
    <span className="game-page__choice-title">{title}</span>
    {move ? (
      <>
        <span className="game-page__choice-icon" aria-hidden="true">
          {MOVE_DETAILS[move].icon}
        </span>
        <span className="game-page__choice-name">
          <FormattedMessage {...MOVE_DETAILS[move].message} />
        </span>
      </>
    ) : (
      <Spinner label={thinkingLabel} />
    )}
  </div>
);

/**
 * Game page. Only reachable once a player has been registered.
 */
const GamePage = () => {
  const { formatMessage } = useIntl();
  const { currentUser, logout } = useAuth();
  const { currentUserScore, addWin } = useGameStats();
  const { round, isThinking, play } = useGameRound({ onWin: addWin });

  if (!currentUser) {
    return <Navigate to="/home" replace />;
  }

  return (
    <>
      <NavBar userName={currentUser} onLogout={logout} />

      <main data-testid="game-page" className="game-page">
        <p className="game-page__score" aria-live="polite">
          <FormattedMessage
            id="pages.game.score"
            values={{ score: currentUserScore }}
          />
        </p>

        <div className="game-page__actions">
          {Object.entries(MOVE_DETAILS).map(([move, { icon, message }]) => (
            <ActionButton
              key={move}
              icon={icon}
              label={formatMessage(message)}
              onClick={() => play(move)}
              disabled={isThinking}
            />
          ))}
        </div>

        {round && (
          <>
            <div className="game-page__control">
              <PlayerChoice
                title={<FormattedMessage id="pages.game.you" />}
                move={round.playerMove}
              />
              <PlayerChoice
                title={<FormattedMessage id="pages.game.bot" />}
                move={round.botMove}
                thinkingLabel={formatMessage({ id: "pages.game.bot-thinking" })}
              />
            </div>

            <p className="game-page__result" role="status">
              {round.result && (
                <FormattedMessage {...RESULT_MESSAGES[round.result]} />
              )}
            </p>
          </>
        )}
      </main>
    </>
  );
};

export default GamePage;
