import { useEffect, useState } from "react";
import { simpleGetCall } from "../config.js/SetUp";
import configWeb from "../config.js/configWeb";

/**
 * Runtime switches served by the backend (`GET /settings/public`).
 *
 * Defaults are deliberately the SAFE state: if the request fails we behave as
 * though "Pay Now" is off, so a network blip can never expose a payment option
 * that has no working gateway behind it.
 */
const SAFE_DEFAULTS = {
  pay_now_enabled: false,
  eur_rate: 10, // dirhams per euro — see utils/currency.js
};

// module-level cache so every card doesn't refetch this
let cached = null;
let inflight = null;

export default function usePublicSettings() {
  const [settings, setSettings] = useState(cached || SAFE_DEFAULTS);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let alive = true;

    if (cached) {
      setSettings(cached);
      setLoading(false);
      return;
    }

    if (!inflight) {
      inflight = simpleGetCall(configWeb.GET_PUBLIC_SETTINGS)
        .then((res) => {
          cached = { ...SAFE_DEFAULTS, ...(res && typeof res === "object" ? res : {}) };
          return cached;
        })
        .catch(() => {
          cached = { ...SAFE_DEFAULTS };
          return cached;
        })
        .finally(() => {
          inflight = null;
        });
    }

    inflight.then((val) => {
      if (!alive) return;
      setSettings(val);
      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  return {
    settings,
    loading,
    payNowEnabled: !!settings.pay_now_enabled,
    eurRate: Number(settings.eur_rate) || SAFE_DEFAULTS.eur_rate,
  };
}
