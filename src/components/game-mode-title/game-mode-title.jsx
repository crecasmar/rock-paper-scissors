import { useId, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { InformationCircleIcon } from "@/assets/icons";
import { GAME_MODE_MESSAGES, GAME_MODE_RULES } from "@/utils/game-rules";

import "./game-mode-title.css";

/**
 * Title with the game mode being played and an info button whose tooltip
 * introduces and lists the rules of that mode. The tooltip opens on hover, focus or tap,
 * and closes when the pointer or the focus leave, or with Escape.
 * @param {{ mode: string }} props - One of GAME_MODES
 */
const GameModeTitle = ({ mode }) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  const modeName = formatMessage(GAME_MODE_MESSAGES[mode]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <div className="game-mode-title">
      <h1 className="game-mode-title__heading">
        <FormattedMessage id="game.modes.title" values={{ mode: modeName }} />
      </h1>

      <div
        className="game-mode-title__rules"
        onMouseEnter={open}
        onMouseLeave={close}
      >
        <button
          type="button"
          className="game-mode-title__info"
          aria-label={formatMessage({ id: "game.rules.open" })}
          aria-describedby={tooltipId}
          aria-expanded={isOpen}
          onClick={open}
          onFocus={open}
          onBlur={close}
          onKeyDown={(event) => event.key === "Escape" && close()}
        >
          <InformationCircleIcon className="game-mode-title__icon" />
        </button>

        <div
          id={tooltipId}
          role="tooltip"
          className="game-mode-title__tooltip"
          data-open={isOpen}
        >
          <p className="game-mode-title__tooltip-title">
            <FormattedMessage id="game.rules.show" values={{ mode }} />
          </p>
          <ul className="game-mode-title__rule-list">
            {GAME_MODE_RULES[mode].map((rule) => (
              <li key={rule.id}>
                <FormattedMessage {...rule} />
              </li>
            ))}
          </ul>
          <span className="game-mode-title__tooltip-arrow" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default GameModeTitle;
