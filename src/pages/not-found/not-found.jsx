import { Link } from "react-router";
import { FormattedMessage } from "react-intl";

import "./not-found.css";

/**
 * Not found page: shown for any unknown route.
 */
const NotFoundPage = () => (
  <main data-testid="not-found-page" className="not-found-page">
    <span className="not-found-page__code">404</span>
    <h1>
      <FormattedMessage id="pages.not-found.title" />
    </h1>

    <Link to="/home" className="not-found-page__button">
      <FormattedMessage id="pages.not-found.back" />
    </Link>
  </main>
);

export default NotFoundPage;
