import { FormattedMessage } from "react-intl";

import "./nav-bar.css";

/**
 * Navigation bar.
 * @param {{ userName: string, onLogout: () => void }} props
 */
const NavBar = ({ userName, onLogout }) => (
  <header className="nav-bar">
    <nav className="nav-bar__content" aria-label="Navegación principal">
      <span className="nav-bar__greeting">
        <FormattedMessage
          id="components.nav-bar.greeting"
          values={{ name: userName }}
        />
      </span>

      <button type="button" className="nav-bar__logout" onClick={onLogout}>
        <FormattedMessage id="components.nav-bar.logout" />
      </button>
    </nav>
  </header>
);

export default NavBar;
