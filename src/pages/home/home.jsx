import { useState } from "react";
import { Navigate } from "react-router";
import { FormattedMessage } from "react-intl";

import { useAuth } from "@/store/game-store";
import { isValidPlayerName, PLAYER_NAME_MAX_LENGTH } from "@/utils/validation";

import "./home.css";

/**
 * Home page: registers a new player and sends them to the game.
 * If the player exists in the store, it goes straight to the game.
 */
const HomePage = () => {
  const { currentUser, login } = useAuth();
  const [name, setName] = useState("");

  const nameIsValid = isValidPlayerName(name);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!nameIsValid) return;

    login(name.trim());
  };

  if (currentUser) {
    return <Navigate to="/game" replace />;
  }

  return (
    <main data-testid="home-page" className="home">
      <h1>
        <FormattedMessage id="pages.home.title" />
      </h1>

      <form className="home__form" onSubmit={handleSubmit} noValidate>
        <div className="home__field">
          <input
            id="player-name"
            type="text"
            className="home__input peer"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder=" "
            required
            maxLength={PLAYER_NAME_MAX_LENGTH}
            autoComplete="off"
            aria-describedby="player-name-hint"
            aria-invalid={name !== "" && !nameIsValid}
          />
          <label htmlFor="player-name" className="home__input-label">
            <FormattedMessage id="pages.home.name-label" />
          </label>
        </div>

        <p id="player-name-hint" className="home__hint">
          <FormattedMessage id="pages.home.name-hint" />
        </p>

        <button type="submit" className="home__button" disabled={!nameIsValid}>
          <FormattedMessage id="pages.home.join" />
        </button>
      </form>
    </main>
  );
};

export default HomePage;
