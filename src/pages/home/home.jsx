import { useState } from "react";
import { Navigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";

import { Button, GameModeSelector } from "@/components";
import useDebouncedValue from "@/hooks/use-debounced-value";
import { useAuth } from "@/store/game-store";
import {
  isValidPlayerName,
  PLAYER_NAME_ERROR_DELAY_MS,
  PLAYER_NAME_MIN_LENGTH,
  PLAYER_NAME_MAX_LENGTH,
} from "@/utils/validation";

import "./home.css";

/**
 * Home page: chooses the game mode, registers a new player
 * and sends them to the game. If the player exists in the store,
 * it goes straight to the game.
 */
const HomePage = () => {
  const { formatMessage } = useIntl();
  const { currentUser, login } = useAuth();
  const [name, setName] = useState("");
  const debouncedName = useDebouncedValue(name, PLAYER_NAME_ERROR_DELAY_MS);

  const nameIsValid = isValidPlayerName(name);

  const showNameError =
    name !== "" &&
    !nameIsValid &&
    debouncedName !== "" &&
    !isValidPlayerName(debouncedName);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!nameIsValid) return;

    login(name.trim());
  };

  if (currentUser) {
    return <Navigate to="/game" replace />;
  }

  return (
    <main data-testid="home-page" className="home-page">
      <GameModeSelector />

      <h1>
        <FormattedMessage id="pages.home.title" />
      </h1>

      <form className="home-page__form" onSubmit={handleSubmit} noValidate>
        <div className="home-page__field">
          <input
            id="player-name"
            type="text"
            className="home-page__input peer"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder=" "
            required
            maxLength={PLAYER_NAME_MAX_LENGTH}
            autoComplete="off"
            aria-label={formatMessage({ id: "pages.home.name-label" })}
            aria-describedby={showNameError ? "player-name-hint" : undefined}
            aria-invalid={showNameError}
          />
          <label htmlFor="player-name" className="home-page__input-label">
            <FormattedMessage id="pages.home.name-label" />
          </label>
        </div>

        <p id="player-name-hint" className="home-page__hint" role="alert">
          {showNameError && (
            <FormattedMessage
              id="pages.home.name-hint"
              values={{
                minValue: PLAYER_NAME_MIN_LENGTH,
                maxValue: PLAYER_NAME_MAX_LENGTH,
              }}
            />
          )}
        </p>

        <Button
          type="submit"
          className="home-page__button"
          disabled={!nameIsValid}
        >
          {formatMessage({ id: "pages.home.join" }).toUpperCase()}
        </Button>
      </form>
    </main>
  );
};

export default HomePage;
