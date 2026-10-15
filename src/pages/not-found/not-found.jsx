import { FormattedMessage } from "react-intl";

import { BackIcon } from "@/assets/icons";
import { Button } from "@/components";

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

    <Button to="/home">
      <BackIcon className="button__icon" />
      <FormattedMessage id="pages.not-found.back" />
    </Button>
  </main>
);

export default NotFoundPage;
