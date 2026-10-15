import { FormattedMessage } from "react-intl";

import { SwitchIcon } from "@/assets/icons";
import Button from "@/components/button/button";
import { BUTTON_VARIANTS } from "@/components/button/button-variants";
import { useGameMode } from "@/store/game-store";
import { GAME_MODE_MESSAGES, GAME_MODES } from "@/utils/game-rules";

const MODES = Object.values(GAME_MODES);

/**
 * Button that lets a logged in player change to the next game mode
 * without logging out.
 * @param {{ className?: string, labelClassName?: string }} props
 */
const GameModeSwitch = ({ className, labelClassName }) => {
  const { gameMode, setGameMode } = useGameMode();
  const nextMode = MODES[(MODES.indexOf(gameMode) + 1) % MODES.length];

  return (
    <Button
      variant={BUTTON_VARIANTS.SECONDARY}
      className={className}
      onClick={() => setGameMode(nextMode)}
    >
      <SwitchIcon className="button__icon" />
      <span className={labelClassName}>
        <FormattedMessage
          id="game.modes.switch"
          values={{
            mode: <FormattedMessage {...GAME_MODE_MESSAGES[nextMode]} />,
          }}
        />
      </span>
    </Button>
  );
};

export default GameModeSwitch;
