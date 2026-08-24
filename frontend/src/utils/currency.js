/**
 * Prices are stored and charged in MAD. The euro figure shown beside them is
 * derived, not a second price — the customer is always billed in dirhams.
 *
 * The rate comes from the backend setting `eur_rate` (dirhams per euro), so it
 * can be changed in the admin without a deploy. 10 is the fallback: it is the
 * rate the client works to (700 MAD = 70 €, 900 = 90 €).
 */
export const DEFAULT_EUR_RATE = 10;

export function toEur(mad, rate = DEFAULT_EUR_RATE) {
  const amount = Number(mad);
  const r = Number(rate) || DEFAULT_EUR_RATE;
  if (!isFinite(amount) || r <= 0) return null;
  return amount / r;
}

/** "€40" for whole numbers, "€40.50" when there are centimes. */
export function formatEur(mad, rate = DEFAULT_EUR_RATE) {
  const eur = toEur(mad, rate);
  if (eur === null) return "";
  const rounded = Math.round(eur * 100) / 100;
  return `€${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
}

/**
 * Render an amount held in dirhams as either currency.
 *
 * `decimals` mirrors what the markup used to do by hand: pass 2 where the JSX
 * had `.toFixed(2)`, leave it undefined to print whole numbers bare and only
 * show centimes when there are any.
 *
 * `madLabel` is injected rather than hard-coded because "MAD" is translated
 * (درهم in Arabic) while the euro sign is not.
 */
export function formatMoney(mad, { currency = "MAD", rate = DEFAULT_EUR_RATE, decimals, madLabel = "MAD" } = {}) {
  const isEur = currency === "EUR";
  const raw = isEur ? toEur(mad, rate) : Number(mad);
  if (raw === null || !isFinite(raw)) return "";

  let text;
  if (decimals === undefined) {
    const n = Math.round(raw * 100) / 100;
    text = Number.isInteger(n) ? String(n) : n.toFixed(2);
  } else {
    text = raw.toFixed(decimals);
  }
  return isEur ? `€${text}` : `${madLabel} ${text}`;
}
