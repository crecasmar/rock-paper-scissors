/* eslint-disable react-refresh/only-export-components */
import { MemoryRouter } from "react-router";
import { IntlProvider } from "react-intl";
import { render } from "@testing-library/react";
import { supportedLocales } from "../locales";

const DEFAULT_LOCALE = "en";

/**
 * Wraps the component under test with every provider the app needs.
 */
const TestProviders = ({
  children,
  initialEntries = ["/"],
  locale = DEFAULT_LOCALE,
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <IntlProvider
      locale={locale}
      defaultLocale={DEFAULT_LOCALE}
      messages={supportedLocales[locale] ?? supportedLocales[DEFAULT_LOCALE]}
    >
      {children}
    </IntlProvider>
  </MemoryRouter>
);

/**
 * Custom render with providers.
 * @param {import("react").ReactElement} uiElement
 * @param {{ initialPath?: string, initialEntries?: string[], locale?: string } & import("@testing-library/react").RenderOptions} [options]
 */
const customRender = (uiElement, options = {}) => {
  const {
    initialPath = "/",
    initialEntries = [initialPath],
    locale,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <TestProviders initialEntries={initialEntries} locale={locale}>
      {children}
    </TestProviders>
  );

  return render(uiElement, { wrapper: Wrapper, ...renderOptions });
};

export * from "@testing-library/react";
export { customRender as render };
