import { Navigate, Route, Routes } from "react-router";

import HomePage from "./pages/home/home";
import GamePage from "./pages/game/game";

/**
 * Application Routes Component
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route key="home" path="/home" element={<HomePage />} />
      <Route key="game" path="/game" element={<GamePage />} />

      {/* Root and any unknown route - Redirect to home */}
      <Route key="default" path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};
