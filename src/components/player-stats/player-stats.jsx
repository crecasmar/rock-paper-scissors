import { useId, useState } from "react";
import { FormattedMessage } from "react-intl";

import { ChevronDownIcon } from "@/assets/icons";
import Button from "@/components/button/button";
import { BUTTON_VARIANTS } from "@/components/button/button-variants";
import { GAME_MODE_MESSAGES } from "@/utils/game-rules";

import "./player-stats.css";

/**
 * Button that shows and hides a summary of the player's rounds
 * in the selected game mode.
 * @param {{ stats: import("@/store/game-store").PlayerStats, mode: string, className?: string }} props
 */
const PlayerStats = ({ stats, mode, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const titleId = useId();

  const items = [
    ["played", stats.wins + stats.losses + stats.ties],
    ["wins", stats.wins],
    ["losses", stats.losses],
    ["ties", stats.ties],
    ["longest-streak", stats.longestStreak],
    ["current-streak", stats.currentStreak],
  ];

  return (
    <div className={["player-stats", className].filter(Boolean).join(" ")}>
      <Button
        variant={BUTTON_VARIANTS.SECONDARY}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="player-stats__toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        <FormattedMessage id="components.player-stats.toggle" />
        <ChevronDownIcon className="button__icon player-stats__chevron" />
      </Button>

      <section
        id={panelId}
        className="player-stats__panel"
        aria-labelledby={titleId}
        hidden={!isOpen}
      >
        <h2 id={titleId} className="player-stats__title">
          <FormattedMessage
            id="components.player-stats.title"
            values={{
              mode: <FormattedMessage {...GAME_MODE_MESSAGES[mode]} />,
            }}
          />
        </h2>

        <dl className="player-stats__list">
          {items.map(([key, value]) => (
            <div key={key} className="player-stats__item">
              <dt className="player-stats__label">
                <FormattedMessage id={`components.player-stats.${key}`} />
              </dt>
              <dd className="player-stats__value">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};

export default PlayerStats;
