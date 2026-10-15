import { useLocation } from "react-router";
import { FormattedMessage } from "react-intl";

import Button from "@/components/button/button";
import { BUTTON_VARIANTS } from "@/components/button/button-variants";

import "./ranking-link.css";

export const RANKING_PATH = "/ranking";

/**
 * Link to and from the ranking page.
 */
const RankingLink = () => {
  const { pathname, state } = useLocation();

  if (pathname === RANKING_PATH) {
    return (
      <Button
        variant={BUTTON_VARIANTS.SECONDARY}
        to={state?.from ?? "/home"}
        className="ranking-link"
      >
        <span aria-hidden="true">↩ </span>
        <FormattedMessage id="components.ranking-link.back" />
      </Button>
    );
  }

  return (
    <Button
      variant={BUTTON_VARIANTS.SECONDARY}
      to={RANKING_PATH}
      state={{ from: pathname }}
      className="ranking-link"
    >
      <FormattedMessage id="components.ranking-link.see" />
    </Button>
  );
};

export default RankingLink;
