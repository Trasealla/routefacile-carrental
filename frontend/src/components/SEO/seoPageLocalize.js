/**
 * Merge a translated content pack onto an English landing page.
 *
 * The English copy in seoPageData.js stays the single source of structure — the
 * slug, page type, section order, canonical shape and breadcrumb trail all come
 * from there. A pack only supplies strings.
 *
 * The pack is passed in rather than imported so this file has no imports at all.
 * scripts/prerender.js loads these modules by copying them to a .mjs file and
 * importing that, which only works while they are dependency-free — and the
 * prerenderer and the SPA have to agree on the merge exactly, or a crawler and a
 * visitor see different pages.
 *
 * Fallback is per-field and deliberately all-or-nothing for the arrays: a
 * sections list translated only halfway would render French headings over
 * English bodies. Missing translations fall back to English, which is
 * understandable; a half-translated page is not.
 */

/** Rewrite the /en/ segment of a site URL to another language. */
function relang(url, lng) {
  return typeof url === "string"
    ? url.replace(/(^https?:\/\/[^/]+)\/en(\/|$)/, `$1/${lng}$2`)
    : url;
}

export function localizeSeoPage(page, lng, pack) {
  if (!page) return page;
  if (lng === "en" || !pack) return page;

  const t = pack[page.slug];
  const pick = (key) => (t && t[key]) || page[key];

  // Arrays arrive as [heading, body] / [question, answer] pairs — compact to
  // write and read, and it keeps the packs from drifting out of order.
  const pairs = (translated, original, aKey, bKey) => {
    if (!translated || translated.length !== original.length) return original;
    return original.map((item, i) => ({
      ...item,
      [aKey]: translated[i][0] || item[aKey],
      [bKey]: translated[i][1] || item[bKey],
    }));
  };

  const crumbs = page.breadcrumbs || [];
  const names = t && t.crumbs && t.crumbs.length === crumbs.length ? t.crumbs : null;

  return {
    ...page,
    metaTitle: pick("metaTitle"),
    metaDesc: pick("metaDesc"),
    metaKeywords: pick("metaKeywords"),
    h1: pick("h1"),
    h2Intro: pick("h2Intro"),
    sections: pairs(t && t.sections, page.sections || [], "heading", "body"),
    faq: pairs(t && t.faq, page.faq || [], "question", "answer"),
    // The trail points at this language's URLs whether or not the names are
    // translated — an English breadcrumb linking a visitor out of /fr is a bug
    // on its own.
    breadcrumbs: crumbs.map((c, i) => ({
      name: names ? names[i] : c.name,
      url: relang(c.url, lng),
    })),
    canonicalUrl: relang(page.canonicalUrl, lng),
  };
}

export default localizeSeoPage;
