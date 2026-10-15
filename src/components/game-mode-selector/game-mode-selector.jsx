import { FormattedMessage } from "react-intl";

import { useGameMode } from "@/store/game-store";
import { GAME_MODE_MESSAGES, GAME_MODES } from "@/utils/game-rules";

import "./game-mode-selector.css";

/**
 * Radio buttons to choose the game mode the player will play.
 */
const GameModeSelector = () => {
  const { gameMode, setGameMode } = useGameMode();

  return (
    <fieldset className="game-mode-selector">
      <legend className="game-mode-selector__title">
        <FormattedMessage id="components.game-mode-selector.title" />
      </legend>
      <div className="game-mode-selector__options">
        {Object.values(GAME_MODES).map((mode) => (
          <label key={mode} className="game-mode-selector__option group">
            <input
              type="radio"
              name="game-mode"
              className="game-mode-selector__input"
              value={mode}
              checked={gameMode === mode}
              onChange={() => setGameMode(mode)}
            />
            <FormattedMessage {...GAME_MODE_MESSAGES[mode]} />
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default GameModeSelector;
