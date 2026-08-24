/**
 * The only place that writes to the GTM data layer.
 *
 * Event names and payload shapes are fixed by the marketing spec — GTM triggers
 * and the Google Ads conversion are keyed to them, so they are not ours to
 * rename. Anything that changes here has to be agreed with whoever owns the
 * container.
 *
 * Two rules the spec is explicit about, enforced here rather than left to each
 * call site:
 *   • `value` is a Number, never a string and never carrying "MAD"
 *   • no personal data — no name, phone, email or document number, ever
 */

/**
 * The array is created here and never replaced. Assigning `window.dataLayer = []`
 * after GTM has loaded detaches the array GTM is holding a reference to, and
 * every later push disappears silently.
 */
const layer = () => {
  if (typeof window === "undefined") return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
};

/** Coerce to a plain number; GTM/Ads reject "450.00 MAD" and string values. */
const num = (v) => {
  const n = Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Push an event. Never throws: analytics must not be able to break a booking. */
export const track = (event, params = {}) => {
  try {
    const dl = layer();
    if (dl) dl.push({ event, ...params });
  } catch (e) {
    /* best-effort */
  }
};

/**
 * Push at most once per key for the life of the tab.
 *
 * The confirmation page is a normal URL, so a refresh or a back-navigation
 * would fire the purchase again and Google Ads would count one booking several
 * times. sessionStorage is the right scope: it survives a refresh but not a new
 * visit, and a genuinely new booking has a different booking number.
 */
const trackOnce = (key, event, params = {}) => {
  try {
    if (!key) return track(event, params);
    const stamp = `rf_tracked_${event}_${key}`;
    if (window.sessionStorage?.getItem(stamp)) return;
    window.sessionStorage?.setItem(stamp, "1");
  } catch (e) {
    /* private mode: fall through and push once for this render */
  }
  track(event, params);
};

/** One item entry, shared by purchase / begin_checkout / select_item. */
const carItem = (car, price) => ({
  item_id: String(car?.id ?? car?.car_id ?? ""),
  item_name: car?.name ?? car?.car_name ?? "",
  item_category: "car_rental",
  price: num(price),
  quantity: 1,
});

/**
 * The conversion. Only ever called once the API has stored the booking and
 * returned a real booking number such as RF123 — never on a button click and
 * never when the checkout modal opens.
 */
export const trackPurchase = ({
  booking_number,
  final_total,
  rental_days,
  pickup_location,
  dropoff_location,
  language,
  car,
}) => {
  if (!booking_number) return;
  trackOnce(String(booking_number), "purchase", {
    transaction_id: String(booking_number),
    value: num(final_total),
    currency: "MAD",
    rental_days: num(rental_days),
    pickup_location: pickup_location || "",
    dropoff_location: dropoff_location || "",
    language: language || "",
    items: [carItem(car, final_total)],
  });
};

export const trackBeginCheckout = ({ final_total, rental_days, car }) =>
  track("begin_checkout", {
    value: num(final_total),
    currency: "MAD",
    rental_days: num(rental_days),
    items: [carItem(car, final_total)],
  });

export const trackSearchCars = ({
  pickup_location,
  dropoff_location,
  pickup_date,
  dropoff_date,
  rental_days,
  language,
}) =>
  track("search_cars", {
    pickup_location: pickup_location || "",
    dropoff_location: dropoff_location || "",
    pickup_date: pickup_date || "",
    dropoff_date: dropoff_date || "",
    rental_days: num(rental_days),
    language: language || "",
  });

export const trackSelectItem = ({ car, car_total }) =>
  track("select_item", {
    value: num(car_total),
    currency: "MAD",
    items: [carItem(car, car_total)],
  });

export const trackGenerateLead = (lead_type) =>
  track("generate_lead", { lead_type });

export const trackSignUp = (method = "email") =>
  track("sign_up", { method });

export const trackWhatsappClick = (click_location) =>
  track("whatsapp_click", { click_location });

export const trackPhoneClick = (click_location) =>
  track("phone_click", { click_location });
