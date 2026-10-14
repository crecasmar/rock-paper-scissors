import en from "./translations/en.json";
import es from "./translations/es.json";

/**
 * @typedef {Object} LocalesPayload
 * @property {Object.<string, string>} [key: string] - An object containing key-value pairs of localized strings.
 */

export const supportedLocales = {
  es: { ...es },
  en: { ...en },
};
