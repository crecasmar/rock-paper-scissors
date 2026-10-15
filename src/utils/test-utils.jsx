/* eslint-disable react-refresh/only-export-components */
import { MemoryRouter } from "react-router";
import { IntlProvider } from "react-intl";
import { render } from "@testing-library/react";
import { supportedLocales } from "../locales";

const DEFAULT_LOCALE = "en";

/**
 * Locale that renders every message as its own id, so tests can query by id.
 * Placeholder values are appended after the id, e.g. "pages.game.score 3".
 */
export const KEYS_LOCALE = "keys";

// Matches simple ({score}) and formatted ({score, plural, ...}) placeholders
const PLACEHOLDER_PATTERN = /\{(\w+)[,}]/g;

const keyMessages = Object.fromEntries(
  Object.entries(supportedLocales[DEFAULT_LOCALE]).map(([id, message]) => [
    id,
    [
      id,
      ...[...message.matchAll(PLACEHOLDER_PATTERN)].map(
        ([, name]) => `{${name}}`
      ),
    ].join(" "),
  ])
);

const getMessages = (locale) =>
  locale === KEYS_LOCALE
    ? keyMessages
    : (supportedLocales[locale] ?? supportedLocales[DEFAULT_LOCALE]);

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
      locale={locale === KEYS_LOCALE ? DEFAULT_LOCALE : locale}
      defaultLocale={DEFAULT_LOCALE}
      messages={getMessages(locale)}
    >
      {children}
    </IntlProvider>
  </MemoryRouter>
);

/**
 * Custom render with providers.
 * @param {import("react").ReactElement} uiElement
 * Pass `locale: KEYS_LOCALE` to render message ids instead of translated text.
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
