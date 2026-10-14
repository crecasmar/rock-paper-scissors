import { Navigate } from "react-router";
import { FormattedMessage } from "react-intl";

import { useAuth } from "@/store/game-store";

/**
 * Game page. Only reachable once a player has been registered.
 */
const GamePage = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main data-testid="game-page">
      <h1>
        <FormattedMessage
          id="pages.game.title"
          values={{ name: currentUser }}
        />
      </h1>
    </main>
  );
};

export default GamePage;
