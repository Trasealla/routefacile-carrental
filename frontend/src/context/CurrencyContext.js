import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import usePublicSettings from "../hooks/usePublicSettings";
import { DEFAULT_EUR_RATE, formatMoney, toEur } from "../utils/currency";

/**
 * Which currency the customer wants to *see*.
 *
 * Every price in the database is in dirhams and every booking is charged in
 * dirhams — this only changes the display. Picking EUR converts at the
 * admin-set `eur_rate` (Settings → "Dirhams per euro"), so the euro figure is
 * indicative and moves whenever that setting moves.
 */
export const CURRENCIES = ["MAD", "EUR"];
const STORAGE_KEY = "rf_currency";

const CurrencyContext = createContext(null);

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return CURRENCIES.includes(v) ? v : "MAD";
  } catch (e) {
    return "MAD"; // private mode / storage disabled
  }
}

export function CurrencyProvider({ children }) {
  const { t } = useTranslation();
  const { eurRate } = usePublicSettings();
  const [currency, setCurrencyState] = useState(readStored);

  const setCurrency = useCallback((next) => {
    if (!CURRENCIES.includes(next)) return;
    setCurrencyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* nothing to do — the choice just won't survive a reload */
    }
  }, []);

  // Keep other tabs of the same site in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && CURRENCIES.includes(e.newValue)) {
        setCurrencyState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const rate = Number(eurRate) || DEFAULT_EUR_RATE;

  const value = useMemo(() => {
    const isEur = currency === "EUR";
    const madLabel = t("MAD");
    // "MAD" is translated (درهم in Arabic); the euro sign is universal.
    const symbol = isEur ? "€" : madLabel;
    const other = isEur ? "MAD" : "EUR";

    /** Format an amount that is stored in dirhams, in the chosen currency. */
    const format = (mad, opts) =>
      formatMoney(mad, { ...opts, currency, rate, madLabel });

    /**
     * The same amount in the *other* currency — the small line under the
     * headline price, so the customer can always see the dirham figure they
     * will actually be charged even while browsing in euros.
     */
    const formatAlt = (mad, opts) =>
      formatMoney(mad, { ...opts, currency: other, rate, madLabel });

    /** Bare number in the active currency — for inputs and calculations. */
    const convert = (mad) => (isEur ? toEur(mad, rate) : Number(mad));

    return { currency, setCurrency, isEur, rate, symbol, format, formatAlt, convert };
  }, [currency, setCurrency, rate, t]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

/**
 * Safe to call outside the provider (e.g. a component rendered by a portal in
 * a test) — it falls back to plain dirhams rather than throwing.
 */
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (ctx) return ctx;
  return {
    currency: "MAD",
    setCurrency: () => {},
    isEur: false,
    rate: DEFAULT_EUR_RATE,
    symbol: "MAD",
    format: (mad, opts) => formatMoney(mad, { ...opts, currency: "MAD" }),
    formatAlt: (mad, opts) => formatMoney(mad, { ...opts, currency: "EUR" }),
    convert: (mad) => Number(mad),
  };
}

export default CurrencyContext;
