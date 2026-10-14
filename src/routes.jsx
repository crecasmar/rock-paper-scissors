import { Navigate, Route, Routes } from "react-router";

import HomePage from "./pages/home/home";

/**
 * Application Routes Component
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Default route - Redirect to home */}
      <Route
        key="default"
        path="/?"
        element={<Navigate to="/home" replace />}
      />

      {/* Default - Redirect root to home */}
      <Route key="home" path="/home" element={<HomePage />} />
    </Routes>
  );
};
