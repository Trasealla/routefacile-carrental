#!/usr/bin/env node
/**
 * Post-build step: paint the above-the-fold hero before React boots.
 *
 * This app is client-rendered, so the browser has the hero image downloaded and
 * decoded ~1s before anything appears on screen — it is waiting for the bundle
 * to parse and React to render. Lighthouse measured that gap directly as LCP
 * "Render Delay" of ~1.8s out of a 4.0s LCP. No amount of shrinking the image
 * or the bundle touches it.
 *
 * So the header + hero markup is injected straight into #root as static HTML,
 * and the CSS that gives it its geometry is inlined in <head>. The browser can
 * then paint the hero as soon as the HTML and that small style block arrive.
 * When the bundle finishes, React renders the real app over the top; because the
 * markup uses the same class names and the same rules, the boxes are identical
 * and nothing moves.
 *
 * The geometry CSS is EXTRACTED FROM THE BUILT STYLESHEET rather than written by
 * hand. Hand-copying those rules is how you get a placeholder that is a few
 * pixels off, which shows up as layout shift — and the header/hero heights here
 * come from a dozen breakpoint-specific rules spread across several files.
 * Extracting keeps the placeholder in lockstep with the real styles for free.
 *
 * It reads the chunk stylesheets as well as the entry one. HeroStudio.css is
 * imported by the HeroSection component, so webpack puts it in the Home route's
 * lazy chunk, not in main.css. Scanning only main.css therefore found the header
 * rules but not a single `.hero-rf` rule: the pre-painted hero shipped with no
 * height, laid itself out at the image's intrinsic aspect ratio, and then
 * snapped to its real 600px when the route chunk arrived — a full-viewport jump
 * that measured as desktop CLS 0.606, most of the total.
 */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = process.env.BUILD_PATH
  ? path.resolve(process.env.BUILD_PATH)
  : path.resolve(__dirname, "..", "build");

// Selectors whose rules decide the height/position of everything above the fold.
const KEEP = [
  ".hero-rf",
  ".hero-rf-media",
  ".hero-rf-img",
  ".rf-header",
  ".header-top-bar",
  ".rf-wa-pill-bar",
  ".bottom-bar",
  ".rf-logo",
  ".rf-logo-img",
  ".container",
  ".rf-bar",
  "#root",
  "html",
  "body",
];

const matches = (selector, k) => {
  if (k.startsWith(".")) {
    // match the class as a whole token, so .hero-rf does not swallow
    // .hero-rf-card and friends unless they are separately listed
    return new RegExp(`\\${k}(?![\\w-])`).test(selector);
  }
  return new RegExp(`(^|[\\s,>+~])${k}(?![\\w-])`).test(selector);
};

const wantedBy = (keep) => (selector) => keep.some((k) => matches(selector, k));

/** Split a stylesheet into top-level blocks, keeping @media wrappers intact. */
function extractCritical(css, wanted) {
  const out = [];
  let i = 0;

  const readBlock = (start) => {
    let depth = 0;
    for (let j = start; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") {
        depth--;
        if (depth === 0) return j + 1;
      }
    }
    return css.length;
  };

  while (i < css.length) {
    const braceAt = css.indexOf("{", i);
    if (braceAt === -1) break;
    const prelude = css.slice(i, braceAt).trim();

    if (prelude.startsWith("@media")) {
      const end = readBlock(braceAt);
      const inner = css.slice(braceAt + 1, end - 1);
      const kept = extractCritical(inner, wanted);
      if (kept.trim()) out.push(`${prelude}{${kept}}`);
      i = end;
      continue;
    }

    if (prelude.startsWith("@")) {
      // @font-face, @keyframes, @supports … skip: not needed for geometry
      i = readBlock(braceAt);
      continue;
    }

    const end = css.indexOf("}", braceAt);
    if (end === -1) break;
    const body = css.slice(braceAt + 1, end);
    if (wanted(prelude)) out.push(`${prelude}{${body}}`);
    i = end + 1;
  }

  return out.join("");
}

/**
 * Which of the KEEP selectors a stylesheet actually defines rules for.
 *
 * Used to decide what still has to be found in the chunk stylesheets. Anything
 * main.css already covers is taken from main.css alone — `.container` and
 * `html`/`body` are restyled in dozens of chunks, and hoovering all of those
 * copies into the pre-paint block would bloat every page and risk overriding
 * the entry sheet with a rule that normally loads after it.
 */
function selectorsCovered(css) {
  const found = new Set();
  for (const m of css.matchAll(/([^{}]+)\{/g)) {
    const prelude = m[1].trim();
    if (prelude.startsWith("@")) continue;
    for (const k of KEEP) if (matches(prelude, k)) found.add(k);
  }
  return found;
}

// Static above-the-fold markup. Uses the real class names so the extracted CSS
// (and later the full stylesheet) style it exactly as React will.
// aria-hidden + a spacer header: this is scaffolding, not content. Screen
// readers get the real header a moment later; announcing a duplicate would be
// worse than announcing nothing.
// Static above-the-fold markup. Uses the real class names so the extracted CSS
// (and later the full stylesheet) style it exactly as React will.
//
// The header carries the logo and a non-breaking space in the WhatsApp bar on
// purpose: an empty header collapses to 23px instead of its real 79px, which
// would place the hero 55px too high and make it jump the moment React renders.
// Letting the real CSS size real content keeps the box correct at every
// breakpoint without hardcoding a single height.
//
// The bar's text is a space rather than the real string because this scaffolding
// is language-agnostic — the page language is only known once i18n loads, and
// flashing the wrong language for a second is worse than flashing none.
//
// aria-hidden throughout: this is scaffolding, not content. The real header
// arrives moments later; announcing a duplicate would be worse than silence.
const HERO_HTML = `<div id="rf-prepaint" aria-hidden="true"><header class="rf-header"><div class="header-top-bar"><div class="container"><div class="bottom-bar rf-bar"><span class="rf-logo"><img class="rf-logo-img" src="/images/logo-header-v4.webp" alt="" width="256" height="71" style="width:200px;height:auto;object-fit:contain;display:block" fetchpriority="high" decoding="async"></span></div></div></div><span class="rf-wa-pill-bar">&nbsp;</span></header><section class="hero-rf"><div class="hero-rf-media"><picture><source type="image/avif" media="(max-width: 767px)" sizes="100vw" srcset="/images/banners/rf-hero-m-414.avif 414w, /images/banners/rf-hero-m-640.avif 640w, /images/banners/rf-hero-m-828.avif 828w"><source type="image/webp" media="(max-width: 767px)" sizes="100vw" srcset="/images/banners/rf-hero-m-414.webp 414w, /images/banners/rf-hero-m-640.webp 640w, /images/banners/rf-hero-m-828.webp 828w"><source media="(max-width: 767px)" srcset="/images/banners/rf-hero-mobile-v2.jpg"><source type="image/avif" media="(min-width: 1600px)" srcset="/images/banners/rf-hero-desktop-v3.avif"><source type="image/webp" media="(min-width: 1600px)" srcset="/images/banners/rf-hero-desktop-v3.webp"><source type="image/avif" srcset="/images/banners/rf-hero-desktop-1280-v3.avif"><source type="image/webp" srcset="/images/banners/rf-hero-desktop-1280-v3.webp"><img class="hero-rf-img" src="/images/banners/rf-hero-desktop-v2.jpg" alt="" fetchpriority="high" decoding="async"></picture></div></section></div>`;

function main() {
  const indexPath = path.join(BUILD_DIR, "index.html");
  const cssDir = path.join(BUILD_DIR, "static", "css");
  if (!fs.existsSync(indexPath) || !fs.existsSync(cssDir)) {
    console.log("[inline-hero] build output not found — skipping");
    return;
  }

  const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
  const entry = cssFiles.find((f) => /^main\.[a-z0-9]+\.css$/.test(f));
  if (!entry) {
    console.log("[inline-hero] no entry stylesheet — skipping");
    return;
  }

  const entryCss = fs.readFileSync(path.join(cssDir, entry), "utf8");
  let critical = extractCritical(entryCss, wantedBy(KEEP));

  // Fill the gaps from the chunk stylesheets, in the cascade order the page
  // itself uses: entry sheet first, chunks after it.
  const missing = KEEP.filter((k) => !selectorsCovered(entryCss).has(k));
  if (missing.length) {
    const seen = new Set();
    const extra = [];
    for (const f of cssFiles.filter((f) => f !== entry).sort()) {
      const kept = extractCritical(
        fs.readFileSync(path.join(cssDir, f), "utf8"),
        wantedBy(missing)
      );
      // Chunks are duplicated across routes, so the same rule shows up many
      // times. Emit each distinct block once.
      for (const block of kept.match(/[^{}]+\{(?:[^{}]|\{[^{}]*\})*\}/g) || []) {
        if (seen.has(block)) continue;
        seen.add(block);
        extra.push(block);
      }
    }
    critical += extra.join("");
    console.log(
      `[inline-hero] ${missing.join(", ")} not in ${entry} — ` +
        `recovered ${extra.length} rule(s) from chunk stylesheets`
    );
  }

  if (!critical.trim()) {
    console.log("[inline-hero] extracted no rules — skipping (markup would be unstyled)");
    return;
  }

  let html = fs.readFileSync(indexPath, "utf8");
  if (html.includes("rf-prepaint")) {
    console.log("[inline-hero] already injected — skipping");
    return;
  }
  if (!html.includes('<div id="root">')) {
    console.log('[inline-hero] no <div id="root"> to inject into — skipping');
    return;
  }

  html = html
    .replace("</head>", `<style id="rf-prepaint-css">${critical}</style></head>`)
    .replace('<div id="root">', `<div id="root">${HERO_HTML}`);

  fs.writeFileSync(indexPath, html);
  console.log(
    `[inline-hero] injected hero pre-paint (${Math.round(critical.length / 1024)} KB of extracted CSS)`
  );
}

try {
  main();
} catch (err) {
  // Never break a build over this: without it the page simply renders as before.
  console.error("[inline-hero] skipped:", err.message);
}
