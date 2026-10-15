import { Navigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";

import {
  ActionButton,
  GameModeTitle,
  PlayerStats,
  Spinner,
} from "@/components";
import useGameRound from "@/hooks/use-game-round";
import { useAuth, useGameMode, useGameStats } from "@/store/game-store";
import {
  GAME_MODE_MOVES,
  MOVE_DETAILS,
  RESULT_MESSAGES,
  RESULTS,
} from "@/utils/game-rules";

import "./game.css";

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
 * Round summary: who played and which move they chose.
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
      <Spinner className="game-page__spinner" label={thinkingLabel} />
    )}
  </div>
);

/**
 * Board of the game mode being played: score, statistics, moves and the
 * last round.
 * @param {{ mode: string }} props - One of GAME_MODES
 */
const GameBoard = ({ mode }) => {
  const { formatMessage } = useIntl();
  const { currentUserScore, currentUserStats, recordResult } = useGameStats();
  const { round, isThinking, play } = useGameRound({
    onResult: recordResult,
    mode,
  });
  const animations = round?.result ? ICON_ANIMATIONS[round.result] : {};

  return (
    <>
      <div className="game-page__score-section">
        <GameModeTitle mode={mode} />
        <p className="game-page__score" aria-live="polite">
          <FormattedMessage
            id="pages.game.score"
            values={{ score: currentUserScore }}
          />
        </p>
        <PlayerStats stats={currentUserStats} />
      </div>

      <div className="game-page__actions">
        {GAME_MODE_MOVES[mode].map((move) => (
          <ActionButton
            key={move}
            icon={MOVE_DETAILS[move].icon}
            label={formatMessage(MOVE_DETAILS[move].message)}
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

          <output className="game-page__result">
            {round.result && (
              <FormattedMessage {...RESULT_MESSAGES[round.result]} />
            )}
          </output>
        </>
      )}
    </>
  );
};

/**
 * Game page. Only reachable once a player has been registered.
 */
const GamePage = () => {
  const { currentUser } = useAuth();
  const { gameMode } = useGameMode();

  if (!currentUser) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main data-testid="game-page" className="game-page">
      <GameBoard key={gameMode} mode={gameMode} />
    </main>
  );
};

export default GamePage;
