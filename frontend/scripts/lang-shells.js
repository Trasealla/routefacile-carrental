#!/usr/bin/env node
/**
 * Post-build step: write one HTML shell per language.
 *
 * The app is client-rendered from a single index.html, so everything a crawler
 * (or PageSpeed, or a link preview) sees before the bundle runs is whatever that
 * one file says — which was French, on every URL. An Arabic page served a French
 * meta description and `lang="en"`, and the canonical pointed at the English
 * copy. react-helmet fixes all of it a second later, which is a second too late
 * for anything that does not execute JavaScript.
 *
 * So index.html is stamped out three times, once per language, differing only in
 * the head: lang/dir, title, description, keywords and og:locale.
 * nginx then serves index.<lng>.html for /<lng>/… and the correct language is
 * in the very first byte. The body is untouched — same bundle, same pre-painted
 * hero — so this costs two extra ~15 KB files and nothing at runtime.
 */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = process.env.BUILD_PATH
  ? path.resolve(process.env.BUILD_PATH)
  : path.resolve(__dirname, "..", "build");

const LANGS = {
  en: {
    dir: "ltr",
    ogLocale: "en_MA",
    title:
      "Route Facile | Car Rental Morocco — Marrakech, Casablanca, Rabat, Agadir",
    description:
      "Route Facile — car rental in Morocco. Recent vehicles, unlimited mileage, instant booking on WhatsApp. Based in Marrakech with delivery across Morocco.",
    keywords:
      "car rental Morocco, rent a car Marrakech, car rental Casablanca, car hire Morocco, airport car rental Morocco, Route Facile",
  },
  fr: {
    dir: "ltr",
    ogLocale: "fr_MA",
    title:
      "Route Facile — Location de Voitures au Maroc | Marrakech, Casablanca, Agadir",
    description:
      "Route Facile — location de voitures au Maroc. Véhicules récents, kilométrage illimité, réservation instantanée par WhatsApp. Basée à Marrakech, livraison partout au Maroc.",
    keywords:
      "location voiture Maroc, location voiture Marrakech, location voiture Casablanca, louer voiture Maroc, location voiture aéroport Maroc, Route Facile",
  },
  ar: {
    dir: "rtl",
    ogLocale: "ar_MA",
    title:
      "روت فاسيل | تأجير سيارات بالمغرب — مراكش، الدار البيضاء، الرباط، أكادير",
    description:
      "روت فاسيل — تأجير سيارات في المغرب. سيارات حديثة، كيلومترات غير محدودة، حجز فوري عبر واتساب. مقرّنا في مراكش مع توصيل في جميع أنحاء المغرب.",
    keywords:
      "تأجير سيارات المغرب، تأجير سيارات مراكش، تأجير سيارات الدار البيضاء، كراء سيارات المغرب، تأجير سيارات المطار، روت فاسيل",
  },
};

/**
 * Replace the content="…" of a meta tag matched by `attr`, leaving the rest alone.
 *
 * `claim` also stamps the tag with data-react-helmet="true". react-helmet only
 * removes tags carrying that attribute when it writes its own, so an unclaimed
 * meta in the shell survives alongside helmet's and the page ends up with two
 * descriptions. Claiming it hands ownership over: helmet replaces the shell's
 * copy with the per-route one instead of appending a second.
 */
function setMeta(html, attr, value, { claim = false } = {}) {
  const re = new RegExp(`(<meta[^>]*${attr}[^>]*content=")[^"]*(")`, "i");
  if (!re.test(html)) return html;
  let out = html.replace(re, `$1${escapeAttr(value)}$2`);
  if (claim) {
    const tagRe = new RegExp(`<meta([^>]*${attr}[^>]*)>`, "i");
    out = out.replace(tagRe, (m, inner) =>
      inner.includes("data-react-helmet")
        ? m
        : `<meta${inner} data-react-helmet="true">`
    );
  }
  return out;
}

const escapeAttr = (s) => s.replace(/"/g, "&quot;");

function buildShell(html, lng, cfg) {
  let out = html;

  out = out.replace(
    /<html[^>]*>/i,
    `<html lang="${lng}" dir="${cfg.dir}">`
  );

  out = out.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${cfg.title}</title>`
  );

  out = setMeta(out, 'name="description"', cfg.description, { claim: true });
  out = setMeta(out, 'name="keywords"', cfg.keywords, { claim: true });
  // og:locale is not emitted by MetaHelmet, so it stays ours to keep.
  out = setMeta(out, 'property="og:locale"', cfg.ogLocale);

  // Deliberately NO canonical here. react-helmet emits an accurate per-route
  // canonical once the app boots, but it appends its own tag rather than
  // replacing markup it did not create — so a shell canonical survives
  // alongside it and the page ends up declaring two different canonical URLs,
  // which Google resolves by ignoring both. One late-but-correct canonical
  // beats two contradictory ones.

  return out;
}

function main() {
  const indexPath = path.join(BUILD_DIR, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.log("[lang-shells] no index.html — skipping");
    return;
  }

  const html = fs.readFileSync(indexPath, "utf8");
  const written = [];

  for (const [lng, cfg] of Object.entries(LANGS)) {
    const shell = buildShell(html, lng, cfg);
    // A shell that came out identical to the source means a regex stopped
    // matching after an index.html edit — fail loudly rather than shipping
    // three copies of the French page under three names.
    if (shell === html) {
      throw new Error(
        `shell for "${lng}" is byte-identical to index.html — the head markup changed shape`
      );
    }
    const file = path.join(BUILD_DIR, `index.${lng}.html`);
    fs.writeFileSync(file, shell);
    written.push(`index.${lng}.html`);
  }

  console.log(`[lang-shells] wrote ${written.join(", ")}`);
}

try {
  main();
} catch (err) {
  // Unlike the hero pre-paint this is not cosmetic: silently skipping it would
  // leave nginx serving 404s for /index.ar.html. Fail the build.
  console.error("[lang-shells] FAILED:", err.message);
  process.exit(1);
}
