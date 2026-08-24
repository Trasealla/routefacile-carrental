/**
 * Social-proof configuration.
 *
 * The homepage previously advertised "4.9 — 80+ Reviews" against Google,
 * Tripadvisor AND Trustpilot badges, plus "Based on 200+ Google reviews" and
 * "Trusted by thousands", with named testimonials. None of it was linked to a
 * real profile, and the numbers contradicted each other — which reads as
 * invented and costs more trust than it buys.
 *
 * Nothing here renders until it is filled in with figures that can be checked
 * against a live profile. Leave a platform's URL null and its badge stays off.
 */

// Paste the public Google Business Profile review URL here, then set the rating
// and count to whatever that page actually shows on the day you update it.
export const GOOGLE_REVIEWS_URL = null;
export const GOOGLE_RATING = null;   // e.g. 4.9
export const GOOGLE_REVIEW_COUNT = null; // e.g. 37

// Only enable these if Route Facile genuinely has a profile with reviews on the
// platform. An empty or non-existent profile behind a badge is worse than no
// badge at all.
export const TRIPADVISOR_URL = null;
export const TRUSTPILOT_URL = null;

// Customer quotes. Use real, attributable reviews only — first name plus the
// month they were left, matching what is publicly visible on the profile.
export const TESTIMONIALS = [];

export const hasGoogleReviews = () =>
  Boolean(GOOGLE_REVIEWS_URL && GOOGLE_RATING && GOOGLE_REVIEW_COUNT);
