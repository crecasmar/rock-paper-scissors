import { Navigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";

import { ActionButton } from "@/components";
import useGameRound from "@/hooks/use-game-round";
import { useAuth, useGameStats } from "@/store/game-store";
import { MOVE_DETAILS, RESULT_MESSAGES, RESULTS } from "@/utils/game-rules";

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
 * Icon animation for each side once the round is resolved. The player sits
 * on the left, so the player attacks to the right and the bot to the left.
 */
const ICON_ANIMATIONS = Object.freeze({
  [RESULTS.WIN]: { player: "attack-right", bot: null },
  [RESULTS.LOSE]: { player: null, bot: "attack-left" },
  [RESULTS.TIE]: { player: "clash-right", bot: "clash-left" },
});

/**
 * One side of the round summary: who played and which move they chose.
 * @param {{ title: import("react").ReactNode, move: string | null, animation?: string | null, thinkingLabel?: string }} props
 */
const PlayerChoice = ({ title, move, animation, thinkingLabel }) => (
  <div className="game-page__choice">
    <span className="game-page__choice-title">{title}</span>
    {move ? (
      <>
        <span
          className={
            animation
              ? `game-page__choice-icon game-page__choice-icon_${animation}`
              : "game-page__choice-icon"
          }
          aria-hidden="true"
        >
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
  const { currentUser } = useAuth();
  const { currentUserScore, addWin } = useGameStats();
  const { round, isThinking, play } = useGameRound({ onWin: addWin });
  const animations = round?.result ? ICON_ANIMATIONS[round.result] : {};

  if (!currentUser) {
    return <Navigate to="/home" replace />;
  }

  return (
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
          {/* Keyed by round so the icons remount and replay their animation */}
          <div key={round.id} className="game-page__control">
            <PlayerChoice
              title={<FormattedMessage id="pages.game.you" />}
              move={round.playerMove}
              animation={animations.player}
            />
            <PlayerChoice
              title={<FormattedMessage id="pages.game.bot" />}
              move={round.botMove}
              animation={animations.bot}
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
  );
};

export default GamePage;
