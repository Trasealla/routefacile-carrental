#!/usr/bin/env node
/**
 * Post-build step: write a real HTML document for every static URL.
 *
 * The app is client-rendered, so before this existed every page in a language
 * returned byte-identical HTML — same <title>, same description, same empty
 * body — and only diverged once React had booted. A crawler that does not run
 * JavaScript (and Google's first pass often does not) saw twenty-one city and
 * category landing pages that were indistinguishable from the home page.
 *
 * Each generated file carries, in the HTML itself:
 *   • its own <title> and meta description
 *   • a canonical pointing at itself, on the live domain
 *   • hreflang for en / fr / ar plus x-default
 *   • Open Graph and Twitter tags
 *   • an <h1>, intro, section headings and bodies, and the FAQ as text
 *   • BreadcrumbList + FAQPage JSON-LD where the page has that content
 *
 * The same JS bundle is still attached, so React hydrates over the top and the
 * page behaves exactly as before. The prerendered markup lives inside
 * #root-prerender, which index.js removes on boot — the same trick the hero
 * pre-paint uses, so nothing double-renders.
 *
 * Content comes from src/components/SEO/seoPageData.js (the landing pages, which
 * already hold real copy) and from public/locales/<lng>/translation.json (the
 * standard pages' meta). Nothing is invented here: a page with no copy to show
 * gets meta and an H1 only.
 */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = process.env.BUILD_PATH
  ? path.resolve(process.env.BUILD_PATH)
  : path.resolve(__dirname, "..", "build");

const SRC = path.resolve(__dirname, "..", "src");
const LOCALES = path.resolve(__dirname, "..", "public", "locales");
const SITE = "https://routefacilecarrental.com";
const LANGS = ["en", "fr", "ar"];
const DIR = { en: "ltr", fr: "ltr", ar: "rtl" };
const OG_LOCALE = { en: "en_MA", fr: "fr_MA", ar: "ar_MA" };

const esc = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Standard (non-landing) pages. `key` names the translation keys to read, so
 * each language gets its own title and description where they exist.
 */
const STATIC_PAGES = [
  { path: "", key: "home" },
  { path: "ourfleetlist", key: "fleet" },
  { path: "location", key: "locations" },
  { path: "about", key: "about" },
  { path: "contact", key: "contact" },
  { path: "faq", key: "faq" },
  { path: "our-services", key: "services" },
  { path: "offerspage", key: "offers" },
  { path: "blogs", key: "blogs" },
  { path: "discover-morocco", key: "discover" },
  { path: "termscondition", key: "terms" },
  { path: "privacypolicy", key: "privacy" },
  { path: "fleet-leasing", key: "leasing" },
];

/** Per-language fallbacks for pages whose translation keys are missing. */
const FALLBACK = {
  home: {
    en: ["Route Facile | Car Rental Morocco — Marrakech, Casablanca, Rabat, Agadir",
         "Car rental in Morocco. Recent vehicles, unlimited mileage, instant booking on WhatsApp. Based in Marrakech with delivery across Morocco.",
         "Rent a Car in Morocco"],
    fr: ["Route Facile — Location de Voitures au Maroc | Marrakech, Casablanca, Agadir",
         "Location de voitures au Maroc. Véhicules récents, kilométrage illimité, réservation instantanée par WhatsApp. Basée à Marrakech.",
         "Location de voitures au Maroc"],
    ar: ["روت فاسيل | تأجير سيارات بالمغرب — مراكش، الدار البيضاء، الرباط، أكادير",
         "تأجير سيارات في المغرب. سيارات حديثة، كيلومترات غير محدودة، حجز فوري عبر واتساب. مقرّنا في مراكش.",
         "تأجير سيارات في المغرب"],
  },
  fleet: {
    en: ["Our Car Rental Fleet in Morocco | Route Facile",
         "Browse the Route Facile fleet: economy, compact, SUV, family and premium cars with daily prices, delivered across Morocco.",
         "Our Car Rental Fleet in Morocco"],
    fr: ["Notre flotte de location au Maroc | Route Facile",
         "Découvrez la flotte Route Facile : économique, compacte, SUV, familiale et premium, avec les tarifs journaliers, partout au Maroc.",
         "Notre flotte de location au Maroc"],
    ar: ["أسطول سياراتنا في المغرب | روت فاسيل",
         "تصفح أسطول روت فاسيل: اقتصادية، مدمجة، دفع رباعي، عائلية ومميزة، مع الأسعار اليومية، في جميع أنحاء المغرب.",
         "أسطول سياراتنا في المغرب"],
  },
  services: {
    en: ["Our Car Rental Services in Morocco | Route Facile",
         "Daily, weekly and monthly car rental, airport pick-up and delivery across Morocco, with unlimited mileage on every rental.",
         "Our Services"],
    fr: ["Nos services de location au Maroc | Route Facile",
         "Location journalière, hebdomadaire et mensuelle, prise en charge à l'aéroport et livraison partout au Maroc, kilométrage illimité.",
         "Nos services"],
    ar: ["خدماتنا لتأجير السيارات في المغرب | روت فاسيل",
         "تأجير يومي وأسبوعي وشهري، استلام من المطار وتوصيل في جميع أنحاء المغرب، مع كيلومترات غير محدودة.",
         "خدماتنا"],
  },
};

/** Read a translation bundle, tolerating a missing file. */
function translations(lng) {
  try {
    return JSON.parse(fs.readFileSync(path.join(LOCALES, lng, "translation.json"), "utf8"));
  } catch {
    return {};
  }
}

/** Import one of the SEO modules. They are plain ESM with no imports of their
 *  own, so Node can load them directly once given an .mjs extension. */
async function importSeoModule(file, tag) {
  const src = path.join(SRC, "components", "SEO", file);
  if (!fs.existsSync(src)) return null;
  const tmp = path.join(BUILD_DIR, `.seo-${tag}-${process.pid}.mjs`);
  fs.writeFileSync(tmp, fs.readFileSync(src, "utf8"));
  try {
    return await import(`file://${tmp}`);
  } finally {
    fs.unlinkSync(tmp);
  }
}

/** Load the landing-page data. */
async function loadSeoPages() {
  const mod = await importSeoModule("seoPageData.js", "pages");
  return (mod && mod.default) || [];
}

/**
 * Load the translation packs and the merge function the SPA uses.
 *
 * The prerenderer has to apply exactly the same merge as SeoLandingPage, or a
 * crawler reads one version of the page and a visitor sees another — which is
 * precisely the bug this replaced, where every language was prerendered with
 * the English copy.
 */
async function loadLocalizer() {
  const [fr, ar, lib] = await Promise.all([
    importSeoModule("seoPageContent.fr.js", "fr"),
    importSeoModule("seoPageContent.ar.js", "ar"),
    importSeoModule("seoPageLocalize.js", "loc"),
  ]);
  const packs = { fr: fr && fr.default, ar: ar && ar.default };
  const localize = lib && lib.localizeSeoPage;
  if (!localize) return (page) => page;
  return (page, lng) => localize(page, lng, packs[lng]);
}

/**
 * hreflang set for one path, identical across languages so the cluster agrees.
 *
 * Stamped with data-react-helmet so react-helmet adopts these tags on hydration
 * instead of appending its own alongside them. Without the attribute a crawler
 * that runs JS saw the set twice — once from here, once from MetaHelmet.
 */
function alternates(subPath) {
  const suffix = subPath ? `/${subPath}` : "";
  const tag = (l, href) =>
    `<link data-react-helmet="true" rel="alternate" hreflang="${l}" href="${href}" />`;
  return (
    LANGS.map((l) => tag(l, `${SITE}/${l}${suffix}`)).join("\n    ") +
    `\n    ${tag("x-default", `${SITE}/en${suffix}`)}`
  );
}

function head({ lng, subPath, title, description, keywords, jsonLd }) {
  const url = `${SITE}/${lng}${subPath ? `/${subPath}` : ""}`;
  return `
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    ${keywords ? `<meta name="keywords" content="${esc(keywords)}" />` : ""}
    <!-- Same data-react-helmet marker as the alternates below, and for the same
         reason: without it react-helmet appended a second canonical on hydration
         rather than replacing this one, so a crawler running JS saw the tag
         twice. -->
    <link data-react-helmet="true" rel="canonical" href="${url}" />
    ${alternates(subPath)}
    <!-- Share image. Without this, a link pasted into WhatsApp, Facebook or
         LinkedIn renders as a bare grey card — which matters here because
         WhatsApp is the primary booking channel. 1200x630 is the size all three
         expect; the absolute URL is required, relative paths are ignored. -->
    <meta property="og:image" content="${SITE}/images/og-share.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Route Facile car rental in Morocco" />
    <meta name="twitter:image" content="${SITE}/images/og-share.jpg" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Route Facile" />
    <meta property="og:locale" content="${OG_LOCALE[lng]}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ""}`;
}

/** The visible content. Hidden from view but present in the HTML — React paints
 *  over it a moment later, and a crawler that never runs JS still reads it. */
function body(parts) {
  const html = parts.filter(Boolean).join("\n      ");
  return `<div id="root-prerender" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">
      ${html}
    </div>`;
}

function landingBody(page) {
  const out = [`<h1>${esc(page.h1)}</h1>`];
  if (page.h2Intro) out.push(`<p>${esc(page.h2Intro)}</p>`);
  (page.sections || []).forEach((s) => {
    out.push(`<h2>${esc(s.heading)}</h2>`);
    out.push(`<p>${esc(s.body)}</p>`);
  });
  if (page.faq && page.faq.length) {
    out.push(`<h2>FAQ</h2>`);
    page.faq.forEach((f) => {
      out.push(`<h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p>`);
    });
  }
  return body(out);
}

function landingJsonLd(page, lng) {
  const graph = [];
  if (page.breadcrumbs && page.breadcrumbs.length) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: page.breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url.replace("/en/", `/${lng}/`).replace(/\/en$/, `/${lng}`),
      })),
    });
  }
  if (page.faq && page.faq.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: page.faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  return graph.length ? { "@context": "https://schema.org", "@graph": graph } : null;
}

/** Build one document from a language shell. */
function render(shell, { lng, subPath, title, description, keywords, jsonLd, bodyHtml }) {
  let out = shell;

  out = out.replace(/<html[^>]*>/i, `<html lang="${lng}" dir="${DIR[lng]}">`);
  out = out.replace(/<title>[\s\S]*?<\/title>/i, "");
  out = out.replace(/<meta[^>]*name="description"[^>]*>/i, "");
  out = out.replace(/<meta[^>]*name="keywords"[^>]*>/i, "");
  out = out.replace(/<meta[^>]*property="og:locale"[^>]*>/i, "");
  // The shell carries og:site_name too, and head() below adds its own, so
  // every prerendered page shipped the tag twice. Strip it here for the same
  // reason og:locale is stripped: one source of truth per tag.
  out = out.replace(/<meta[^>]*property="og:site_name"[^>]*>/i, "");
  out = out.replace(/<link[^>]*rel="alternate"[^>]*hreflang="[^"]*"[^>]*>\s*/gi, "");
  out = out.replace(/<link[^>]*rel="canonical"[^>]*>/i, "");

  out = out.replace("</head>", `${head({ lng, subPath, title, description, keywords, jsonLd })}\n  </head>`);

  if (bodyHtml) {
    out = out.replace('<div id="root">', `<div id="root">${bodyHtml}`);
  }
  return out;
}

async function main() {
  const shells = {};
  for (const l of LANGS) {
    const p = path.join(BUILD_DIR, `index.${l}.html`);
    if (!fs.existsSync(p)) {
      console.log(`[prerender] missing ${path.basename(p)} — run lang-shells first; skipping`);
      return;
    }
    shells[l] = fs.readFileSync(p, "utf8");
  }

  const seoPages = await loadSeoPages();
  const localizeSeoPage = await loadLocalizer();
  const outRoot = path.join(BUILD_DIR, "p");
  fs.rmSync(outRoot, { recursive: true, force: true });

  let count = 0;
  const write = (lng, subPath, html) => {
    const file = subPath
      ? path.join(outRoot, lng, `${subPath}.html`)
      : path.join(outRoot, lng, "index.html");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    count++;
  };

  for (const lng of LANGS) {
    const t = translations(lng);

    // Standard pages: meta from the translation bundle, falling back to the
    // table above. No invented body copy — just the heading.
    for (const page of STATIC_PAGES) {
      const fb = (FALLBACK[page.key] && FALLBACK[page.key][lng]) || null;
      const title = t[`${page.key}_meta_title`] || (fb && fb[0]);
      const description = t[`${page.key}_meta_description`] || (fb && fb[1]);
      const h1 = t[`${page.key}_h1`] || (fb && fb[2]);
      if (!title || !description) continue; // nothing trustworthy to publish
      write(
        lng,
        page.path,
        render(shells[lng], {
          lng,
          subPath: page.path,
          title,
          description,
          keywords: t[`${page.key}_meta_keywords`],
          bodyHtml: h1 ? body([`<h1>${esc(h1)}</h1>`]) : null,
        })
      );
    }

    // Landing pages, in the language of the URL. The merge here is the same one
    // SeoLandingPage applies, so what a crawler reads and what a visitor sees
    // after hydration are the same page.
    for (const englishPage of seoPages) {
      if (!englishPage.slug) continue;
      const page = localizeSeoPage(englishPage, lng);
      write(
        lng,
        page.slug,
        render(shells[lng], {
          lng,
          subPath: page.slug,
          title: page.metaTitle,
          description: page.metaDesc,
          keywords: page.metaKeywords,
          jsonLd: landingJsonLd(page, lng),
          bodyHtml: landingBody(page),
        })
      );
      // `slug2` is an alternate spelling of the same page — "rent-a-car-tangier"
      // beside "rent-a-car-tanger". It used to be prerendered as a second copy,
      // which put a duplicate URL in the sitemap whose own canonical pointed
      // somewhere else: an invitation for Google to treat one of them as thin
      // duplicate content. The alias is a 301 in nginx instead, so the spelling
      // still resolves for anyone who types or links it.
    }
  }

  console.log(
    `[prerender] wrote ${count} pages (${seoPages.length} landing + ${STATIC_PAGES.length} standard) × ${LANGS.length} languages`
  );
}

main().catch((err) => {
  // A missing prerender means pages fall back to the language shell, which is
  // how the site behaved before. Not worth failing a deploy over.
  console.error("[prerender] skipped:", err.message);
});
