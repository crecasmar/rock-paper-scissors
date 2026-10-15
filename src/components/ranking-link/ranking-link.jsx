import { Link, useLocation } from "react-router";
import { FormattedMessage } from "react-intl";

import "./ranking-link.css";

export const RANKING_PATH = "/ranking";

/**
 * Link to and from the ranking page.
 */
const RankingLink = () => {
  const { pathname, state } = useLocation();

  if (pathname === RANKING_PATH) {
    return (
      <Link to={state?.from ?? "/home"} className="ranking-link">
        <span aria-hidden="true">↩ </span>
        <FormattedMessage id="components.ranking-link.back" />
      </Link>
    );
  }

  return (
    <Link to={RANKING_PATH} state={{ from: pathname }} className="ranking-link">
      <FormattedMessage id="components.ranking-link.see" />
    </Link>
  );
};

export default RankingLink;
