import { negotiateLanguages } from "@fluent/langneg";
import { i18n } from "@lingui/core";
import { setDefaultOptions } from "date-fns";
import datesEn from "date-fns/locale/en-US";
import datesJa from "date-fns/locale/ja";
import { en, ja } from "make-plural/plurals";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { messages as locale_en } from "./locales/en-US/messages";
import { messages as locale_ja } from "./locales/ja-JP/messages";

/* eslint-disable string-to-lingui/missing-lingui-transformation */
export const locales: Record<string, string> = {
  "ja-JP": "Ja",
  "en-US": "En",
};
/* eslint-enable string-to-lingui/missing-lingui-transformation */

export const datefnsLocales: { [key: string]: Locale } = {
  "en-US": datesEn,
  "ja-JP": datesJa,
};

export const defaultLocale =
  localStorage.getItem("locale") ||
  negotiateLanguages(
    navigator.languages, // requested locales
    Object.keys(locales), // available locales
    { defaultLocale: "ja-JP", strategy: "lookup" }
  )[0];

i18n.loadLocaleData({
  "en-US": { plurals: en },
  "ja-JP": { plurals: ja },
});
i18n.load({ "en-US": locale_en, "ja-JP": locale_ja });
// dates
registerLocale("es", datesEn);
registerLocale("ja", datesJa);

const finalLocale = locales[defaultLocale] ? defaultLocale : "ja-JP";
i18n.activate(finalLocale);
setDefaultLocale(finalLocale);
setDefaultOptions({ locale: datefnsLocales[finalLocale] });
