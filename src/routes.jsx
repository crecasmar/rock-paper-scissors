import { Navigate, Route, Routes } from "react-router";

import { Layout } from "@/components";

import { HomePage, GamePage, NotFoundPage } from "@/pages";

/**
 * Application Routes Component
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Every page shares the layout */}
      <Route key="layout" element={<Layout />}>
        <Route key="home" path="/home" element={<HomePage />} />
        <Route key="game" path="/game" element={<GamePage />} />

        {/* Root - Redirect to home */}
        <Route key="root" path="/" element={<Navigate to="/home" replace />} />

        {/* Any unknown route */}
        <Route key="not-found" path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
