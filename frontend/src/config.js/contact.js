/**
 * The only phone numbers Route Facile answers on.
 *
 * The locations table still carries per-branch `contact_number` values seeded
 * from the template (+212500000001, …03, …05 and friends). Those numbers do not
 * exist, so nothing user-facing may render them — every call and WhatsApp link
 * points here instead.
 */
export const PHONE_PRIMARY = "+212655585859";
export const PHONE_SECONDARY = "+212655585853";

/** Same numbers, spaced for display. */
export const PHONE_PRIMARY_DISPLAY = "+212 655 585 859";
export const PHONE_SECONDARY_DISPLAY = "+212 655 585 853";

/** Digits only — what wa.me and api.whatsapp.com expect. */
export const WHATSAPP_NUMBER = "212655585859";

export const whatsappUrl = (message) =>
  `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
    message || "Hello Route Facile! I would like information about car rental."
  )}&type=phone_number&app_absent=0`;
