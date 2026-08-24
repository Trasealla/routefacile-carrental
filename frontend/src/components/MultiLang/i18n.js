import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// Translations are fetched at runtime from /locales/<lng>/translation.json
// rather than imported.
//
// The three JSON files total ~244 KB uncompressed, and importing them put all
// of that into main.js — every visitor downloaded and parsed Arabic, French and
// English even though a page only ever renders one of them. It was the single
// largest module in the main bundle and it delayed the point at which React
// could boot and paint.
//
// The files now live in public/locales/<lng>/translation.json and are fetched in
// parallel with the JS chunks, so only the active language is transferred. Those
// files are the single source of truth — edit them directly. (The former
// src/components/MultiLang/Translation*.json copies were deleted rather than
// kept alongside, so the two cannot drift apart.)
const SUPPORTED = ["en", "fr", "ar"];

export const i18nReady = i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    // The language always lives in the first path segment (/en, /fr, /ar), so
    // read it from there first. Without this the detector guessed from the
    // browser/localStorage, fetched the wrong file, and then had to fetch the
    // right one after the router corrected it.
    detection: {
      order: ["path", "localStorage", "navigator", "htmlTag"],
      lookupFromPathIndex: 0,
      caches: ["localStorage"],
    },
    supportedLngs: SUPPORTED,
    // Without this, a detected locale such as "en-GB" is requested verbatim and
    // 404s; it is folded down to "en" instead.
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    fallbackLng: "en",
    // The English sentence IS the key here, so keys routinely contain "." and
    // ":". With i18next's defaults those are read as nested-object paths and
    // namespace separators, so a key like "1. The Rental Agreement" was looked
    // up as ["1"]["The Rental Agreement"], missed, and fell back to printing
    // the key — i.e. the whole terms page rendered in English despite having
    // full French and Arabic translations.
    keySeparator: false,
    nsSeparator: false,
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      // Suspense is off deliberately. Several providers that sit above the app
      // (currency, app state) translate strings, so a suspending useTranslation
      // had no boundary above it and React threw error #426, blanking the page.
      // Instead index.js waits for `i18nReady` before the first render, so the
      // active language is always present and nothing ever suspends.
      useSuspense: false,
    },
  });

export default i18n;
