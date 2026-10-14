import { Navigate, Route, Routes } from "react-router";

import HomePage from "./pages/home/home";
import GamePage from "./pages/game/game";
import NotFoundPage from "./pages/not-found/not-found";

/**
 * Application Routes Component
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route key="home" path="/home" element={<HomePage />} />
      <Route key="game" path="/game" element={<GamePage />} />

      {/* Root - Redirect to home */}
      <Route key="root" path="/" element={<Navigate to="/home" replace />} />

      {/* Any unknown route */}
      <Route key="not-found" path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
