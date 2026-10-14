import { FormattedMessage, useIntl } from "react-intl";

import "./nav-bar.css";

/**
 * Navigation bar.
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

        {userName && (
          <button type="button" className="nav-bar__logout" onClick={onLogout}>
            <FormattedMessage id="components.nav-bar.logout" />
          </button>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
