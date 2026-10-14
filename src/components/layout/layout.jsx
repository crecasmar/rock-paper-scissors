import { useEffect } from "react";
import { Outlet } from "react-router";
import { useIntl } from "react-intl";

import NavBar from "../nav-bar/nav-bar";
import { useAuth } from "@/store/game-store";

import "./layout.css";

/**
 * The layout shared by every page: navigation bar on top and the page below.
 */
const Layout = () => {
  const { formatMessage, locale } = useIntl();
  const { currentUser, logout } = useAuth();

  const appName = formatMessage({ id: "app-name" });

  // Updates the <title> from index.html instead of adding a second one,
  // which the browser would ignore.
  useEffect(() => {
    document.title = appName;
    document.documentElement.lang = locale;
  }, [appName, locale]);

  return (
    <>
      <NavBar userName={currentUser} onLogout={logout} />

      <div className="layout__content">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
