import { FormattedMessage } from "react-intl";
import { useRegisterSW } from "virtual:pwa-register/react";

import "./reload-toast.css";

/**
 * Registers the service worker and lets the player know when the game is
 * ready to work offline or when a new version can be installed.
 */
const ReloadToast = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("Error registering the service worker:", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="reload-toast">
      <output className="reload-toast__message">
        <FormattedMessage
          id={
            needRefresh
              ? "components.reload-toast.new-version"
              : "components.reload-toast.offline-ready"
          }
        />
      </output>

      <div className="reload-toast__actions">
        {needRefresh && (
          <button
            type="button"
            className="reload-toast__button reload-toast__button--primary"
            onClick={() => updateServiceWorker(true)}
          >
            <FormattedMessage id="components.reload-toast.update" />
          </button>
        )}

        <button type="button" className="reload-toast__button" onClick={close}>
          <FormattedMessage
            id={
              needRefresh
                ? "components.reload-toast.later"
                : "components.reload-toast.close"
            }
          />
        </button>
      </div>
    </div>
  );
};

export default ReloadToast;
