import { i18n } from "@lingui/core";
import { en, ja } from "make-plural/plurals";
import { negotiateLanguages } from "@fluent/langneg";
import { messages as locale_en } from "./locales/en-US/messages";
import { messages as locale_ja } from "./locales/ja-JP/messages";

/* eslint-disable string-to-lingui/missing-lingui-transformation */
export const locales: Record<string, string> = {
  "en-US": "En",
  "ja-JP": "Ja",
};
/* eslint-enable string-to-lingui/missing-lingui-transformation */

export const defaultLocale =
  localStorage.getItem("locale") ||
  negotiateLanguages(
    navigator.languages, // requested locales
    Object.keys(locales), // available locales
    { defaultLocale: "en-US", strategy: "lookup" }
  )[0];

i18n.loadLocaleData({
  "en-US": { plurals: en },
  "ja-JP": { plurals: ja },
});
i18n.load({ "en-US": locale_en, "ja-JP": locale_ja });

const finalLocale = locales[defaultLocale] ? defaultLocale : "en-US";
i18n.activate(finalLocale);
