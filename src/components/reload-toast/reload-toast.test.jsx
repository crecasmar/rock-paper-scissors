import { describe, test, expect, beforeEach, vi } from "vitest";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { KEYS_LOCALE, render, screen } from "@/utils/test-utils";

import ReloadToast from "./reload-toast";

const pwa = vi.hoisted(() => ({
  initialState: { offlineReady: false, needRefresh: false },
  updateServiceWorker: null,
  options: null,
}));

// Same contract as the real hook: each flag is a [value, setter] pair.
vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: (options) => {
    pwa.options = options;
    return {
      offlineReady: useState(pwa.initialState.offlineReady),
      needRefresh: useState(pwa.initialState.needRefresh),
      updateServiceWorker: pwa.updateServiceWorker,
    };
  },
}));

const renderToast = (state, locale = KEYS_LOCALE) => {
  pwa.initialState = { offlineReady: false, needRefresh: false, ...state };
  return render(<ReloadToast />, { locale });
};

describe("ReloadToast", () => {
  beforeEach(() => {
    pwa.updateServiceWorker = vi.fn();
    pwa.options = null;
  });

  test("renders nothing while there is nothing to report", () => {
    renderToast();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("tells the player the game works offline", () => {
    renderToast({ offlineReady: true });

    expect(screen.getByRole("status")).toHaveTextContent(
      "components.reload-toast.offline-ready"
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  test("closing the offline message hides it", async () => {
    const user = userEvent.setup();
    renderToast({ offlineReady: true });

    await user.click(
      screen.getByRole("button", { name: "components.reload-toast.close" })
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("offers to update when a new version is available", () => {
    renderToast({ needRefresh: true });

    expect(screen.getByRole("status")).toHaveTextContent(
      "components.reload-toast.new-version"
    );
    expect(
      screen.getByRole("button", { name: "components.reload-toast.update" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "components.reload-toast.later" })
    ).toBeInTheDocument();
  });

  test("updating reloads the page with the new service worker", async () => {
    const user = userEvent.setup();
    renderToast({ needRefresh: true });

    await user.click(
      screen.getByRole("button", { name: "components.reload-toast.update" })
    );

    expect(pwa.updateServiceWorker).toHaveBeenCalledWith(true);
  });

  test("postponing the update hides the message without updating", async () => {
    const user = userEvent.setup();
    renderToast({ needRefresh: true });

    await user.click(
      screen.getByRole("button", { name: "components.reload-toast.later" })
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(pwa.updateServiceWorker).not.toHaveBeenCalled();
  });

  test("logs the error when the service worker cannot be registered", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const error = new Error("boom");
    renderToast();

    pwa.options.onRegisterError(error);

    expect(consoleError).toHaveBeenCalledWith(
      "Error registering the service worker:",
      error
    );
    consoleError.mockRestore();
  });

  test("renders the Spanish translations", () => {
    renderToast({ needRefresh: true }, "es");

    expect(screen.getByRole("status")).toHaveTextContent(
      "Hay una nueva versión del juego. ¿Quieres actualizar ahora?"
    );
    expect(
      screen.getByRole("button", { name: "Actualizar" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Luego" })).toBeInTheDocument();
  });
});
