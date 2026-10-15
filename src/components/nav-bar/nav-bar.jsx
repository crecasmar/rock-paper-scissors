import { FormattedMessage, useIntl } from "react-intl";

import { LogOutIcon } from "@/assets/icons";
import Button from "@/components/button/button";
import { BUTTON_VARIANTS } from "@/components/button/button-variants";
import GameModeSwitch from "@/components/game-mode-switch/game-mode-switch";
import RankingLink from "@/components/ranking-link/ranking-link";

import "./nav-bar.css";

/**
 * Navigation bar. A logged in player can change the game mode or log out;
 * otherwise it links to and from the ranking, which players can only see
 * once they log out.
 * @param {{ userName?: string | null, onLogout?: () => void }} props
 */
const NavBar = ({ userName, onLogout }) => {
  const { formatMessage } = useIntl();

  return (
    <header className="nav-bar">
      <nav
        className="nav-bar__content"
        aria-label={formatMessage({ id: "components.nav-bar.label" })}
      >
        <span className="nav-bar__title">
          {userName ? (
            <FormattedMessage
              id="components.nav-bar.greeting"
              values={{ name: userName }}
            />
          ) : (
            <FormattedMessage id="app-name" />
          )}
        </span>

        {userName ? (
          <div className="nav-bar__actions">
            <GameModeSwitch
              className="nav-bar__action"
              labelClassName="nav-bar__action-label"
            />
            <Button
              variant={BUTTON_VARIANTS.SECONDARY}
              className="nav-bar__action"
              onClick={onLogout}
            >
              <LogOutIcon className="button__icon" />
              <span className="nav-bar__action-label">
                <FormattedMessage id="components.nav-bar.logout" />
              </span>
            </Button>
          </div>
        ) : (
          <RankingLink className="nav-bar__action" />
        )}
      </nav>
    </header>
  );
};

export default NavBar;
