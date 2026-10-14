import { BrowserRouter } from "react-router";
import { IntlProvider } from "react-intl";
import { supportedLocales } from "./locales";
import { AppRoutes } from "./routes";

const localeLang = navigator.language;
const languageCode = localeLang.split("-")[0];
const messages = supportedLocales[languageCode] || supportedLocales.en;

const Application = () => (
  <IntlProvider locale={localeLang} messages={messages}>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </IntlProvider>
);

export default Application;
