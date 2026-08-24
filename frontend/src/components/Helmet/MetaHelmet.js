import React from "react";
import { Helmet } from "react-helmet";

// Canonical base — the domain that actually serves this site, so dev URLs don't
// leak into the canonical tag.
//
// This pointed at routefacilecarrental.com, which is a *different*
// deployment (an older site on Vercel). Canonicalising there told Google this
// site's content belonged to that one. Override with REACT_APP_SITE_URL when the
// official domain is repointed at this deployment.
const CANONICAL_BASE = (
  process.env.REACT_APP_SITE_URL || "https://routefacilecarrental.com"
).replace(/\/+$/, "");

// Normalize a pathname:
//  - ensure leading slash
//  - collapse duplicate slashes
//  - lower-case it (URLs are case-sensitive to Google)
//  - strip trailing slash (except for root "/")
const normalizePath = (path) => {
  let p = path || "/";
  if (!p.startsWith("/")) p = "/" + p;
  p = p.replace(/\/{2,}/g, "/").toLowerCase();
  if (p.length > 1 && p.endsWith("/")) p = p.replace(/\/+$/, "");
  return p;
};

// Build a default canonical URL from the current location:
//  - always uses the production domain
//  - strips query string, hash, and trailing slash (except for "/")
//  - safe for SSR (returns "" when window is not available)
const buildDefaultCanonical = () => {
  if (typeof window === "undefined" || !window.location) return "";
  return `${CANONICAL_BASE}${normalizePath(window.location.pathname)}`;
};

// Normalize whatever the page passed in to always point at the production
// domain and a clean path. This guards against canonicals that accidentally
// reference the staging/file-server host or contain double slashes.
const normalizeCanonical = (input) => {
  if (!input) return "";
  try {
    // Absolute URL — extract just the path
    if (/^https?:\/\//i.test(input)) {
      const u = new URL(input);
      return `${CANONICAL_BASE}${normalizePath(u.pathname)}`;
    }
    // Relative path
    return `${CANONICAL_BASE}${normalizePath(input)}`;
  } catch (e) {
    return `${CANONICAL_BASE}${normalizePath(String(input))}`;
  }
};

const LANGS = ["en", "fr", "ar"];
const XDEFAULT = "en";

/**
 * Derive the hreflang set from the canonical URL instead of trusting callers.
 *
 * 31 pages passed a hand-written `hreflangs` array and 31 of them listed only
 * en + ar — French, the primary market language, was missing everywhere. Each
 * page also had to repeat its own path, so the arrays drifted from the routes
 * they described. Since every URL here is the same path under a language
 * prefix, the whole set is a function of the canonical: swap the prefix.
 *
 * Returns [] when the canonical has no language prefix, so nothing is claimed
 * for a URL whose translations we cannot name.
 */
const hreflangsFor = (canonical) => {
  if (!canonical) return [];
  let path;
  try {
    path = new URL(canonical).pathname;
  } catch (e) {
    return [];
  }
  const [, prefix, ...rest] = path.split("/");
  if (!LANGS.includes(prefix)) return [];
  const suffix = rest.length ? `/${rest.join("/")}` : "";
  return [
    ...LANGS.map((l) => ({ hreflang: l, href: `${CANONICAL_BASE}/${l}${suffix}` })),
    { hreflang: "x-default", href: `${CANONICAL_BASE}/${XDEFAULT}${suffix}` },
  ];
};

const SITE_NAME = "Route Facile";

// Compose the <title>. Pages that already name the brand keep their own wording
// rather than having it appended a second time.
const buildTitle = (title) => {
  if (!title) return `${SITE_NAME} — Location de Voitures au Maroc`;
  const clean = String(title).trim();
  return clean.toLowerCase().includes(SITE_NAME.toLowerCase())
    ? clean
    : `${clean} | ${SITE_NAME}`;
};

// Helper function to truncate meta descriptions to optimal length (155-160 characters)
const truncateMetaDescription = (description, maxLength = 160) => {
  if (!description) return "";
  
  // Remove HTML tags if any
  const textOnly = description.replace(/<[^>]*>/g, "").trim();
  
  if (textOnly.length <= maxLength) {
    return textOnly;
  }
  
  // Truncate at word boundary
  const truncated = textOnly.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  
  if (lastSpace > 0 && lastSpace > maxLength - 20) {
    return truncated.substring(0, lastSpace) + "...";
  }
  
  return truncated + "...";
};

const DEFAULT_OG_IMAGE = "https://routefacilecarrental.com/images/og-share.jpg";

const MetaHelmet = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = "summary_large_image",
  twitterSite,
  twitterCreator,
  canonicalUrl,
  noindex = false, // Set true for transactional/non-SEO pages
  hreflangs = [], // Array of objects for hreflang
}) => {
  // Ensure all descriptions are properly truncated
  const truncatedDescription = truncateMetaDescription(description);
  const truncatedOgDescription = truncateMetaDescription(ogDescription || description);
  const truncatedTwitterDescription = truncateMetaDescription(twitterDescription || description);

  // Always emit a canonical tag. If the page provided one, normalize it to
  // the production host (callers historically used the file-server base URL,
  // which produced invalid canonicals). Otherwise derive it from the current
  // location so query-string variants and trailing-slash duplicates all
  // consolidate to a single canonical URL.
  const resolvedCanonical = canonicalUrl
    ? normalizeCanonical(canonicalUrl)
    : buildDefaultCanonical();

  return (
    <Helmet>
      {/* Only append the brand when the page title does not already carry it —
          several pages include "Route Facile" themselves, which produced titles
          like "Route Facile | Car Rental Morocco … | Route Facile" in Google. */}
      <title>{buildTitle(title)}</title>
      <meta name="description" content={truncatedDescription || "Default description"} />
      <meta name="keywords" content={keywords || "car rental, rent a car"} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

  {/* Canonical URL */}
  {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}

         {/* Open Graph Tags */}
         <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={truncatedOgDescription} />
      {/* Absolute URL and a real file. The old fallback was the relative
          string "default-image.jpg", which does not exist and which
          crawlers cannot resolve anyway — they require an absolute URL. */}
      <meta property="og:image" content={ogImage || DEFAULT_OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={ogUrl || resolvedCanonical || (typeof window !== "undefined" ? window.location.href : "")} />
      <meta property="og:type" content="website" />


      {/* Twitter Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || title} />
      <meta name="twitter:description" content={truncatedTwitterDescription} />
      <meta name="twitter:image" content={twitterImage || ogImage || DEFAULT_OG_IMAGE} />
      {/* {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />} */}

        {/* Hreflang: always the full en/fr/ar/x-default set, derived from the
            canonical. The `hreflangs` prop is still accepted for a page that
            genuinely needs a custom set, but callers no longer have to supply
            one and can no longer supply an incomplete one by accident. */}
        {(hreflangs.length ? hreflangs : hreflangsFor(resolvedCanonical)).map(
          ({ href, hreflang }, index) => (
            <link key={index} rel="alternate" hrefLang={hreflang} href={normalizeCanonical(href)} />
          )
        )}
    </Helmet>
  );
};

export default MetaHelmet;
