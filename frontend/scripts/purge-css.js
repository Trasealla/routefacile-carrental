#!/usr/bin/env node
/**
 * Post-build step: strip CSS rules this site never uses.
 *
 * The bundle pulls in the whole of Bootstrap (233 KB of source CSS). Lighthouse
 * measured ~88% of the shipped stylesheet as unused on the homepage, and the
 * biggest blocks are components the app does not import at all — Offcanvas
 * (182 rules), Navbar (127), Carousel (78), Popover (52).
 *
 * Content is scanned from the BUILT JavaScript rather than src/. After
 * minification every class name that appears literally in JSX survives as a
 * string in the bundle, so this catches utility classes without needing to
 * safelist them wholesale.
 *
 * What it cannot see are class names assembled at runtime. react-bootstrap
 * builds variants as `${bsPrefix}-${variant}`, so "btn-primary" never exists as
 * a literal anywhere. Those, plus classes toggled by library JS (modal state,
 * Leaflet, Swiper, MUI/emotion, react-select, Toastify) are safelisted below.
 *
 * Run automatically as part of `npm run build`. To check what it removed:
 *   node scripts/purge-css.js --dry-run
 */
const fs = require("fs");
const path = require("path");
const { PurgeCSS } = require("purgecss");

const BUILD_DIR = process.env.BUILD_PATH
  ? path.resolve(process.env.BUILD_PATH)
  : path.resolve(__dirname, "..", "build");

const DRY_RUN = process.argv.includes("--dry-run");

// Colour variants actually passed to react-bootstrap components in src/.
// Keep this in step with the `variant=` props in use; anything not listed is
// removed, so adding a new variant means adding it here too.
const USED_VARIANTS = [
  "primary",
  "secondary",
  "success",
  "danger",
  "light",
  "link",
  "outline-secondary",
];

const VARIANT_PREFIXES = ["btn", "alert", "text-bg", "list-group-item", "table"];

const safelist = {
  standard: [
    "html",
    "body",
    // Bootstrap state classes toggled by JS, never written in markup.
    "show",
    "showing",
    "hide",
    "hiding",
    "fade",
    "collapse",
    "collapsing",
    "collapsed",
    "active",
    "disabled",
    "modal-open",
    "modal-backdrop",
    "modal-static",
    "was-validated",
    "is-invalid",
    "is-valid",
    "invalid-feedback",
    "valid-feedback",
    "dropup",
    "dropend",
    "dropstart",
    // Our own scroll-reveal (classes are added by JS at runtime).
    "wow",
    "animated",
    "fadeInUp",
    ...USED_VARIANTS.flatMap((v) => VARIANT_PREFIXES.map((p) => `${p}-${v}`)),
  ],
  deep: [
    // Third-party widgets that render their own DOM after the CSS is scanned.
    /^leaflet-/,
    /^swiper/,
    /^Mui/,
    /^css-/, // emotion (MUI) and react-select generated class names
    /^Toastify/,
    /^react-select/,
    /^rf-/, // our own design-system prefix, some applied conditionally
    /^ri-/, // remixicon
    /^fa-/, // font awesome
    /^flaticon/,
  ],
  greedy: [
    // react-bootstrap builds nearly all of its class names by concatenation —
    // `${bsPrefix}-dialog`, `${bsPrefix}-content` and so on — so strings like
    // "modal-dialog" never appear literally in the bundle for PurgeCSS to find.
    // Purging them stripped the white box out of every <Modal> on the site and
    // left the dialogs floating unstyled over the page. One prefix per
    // react-bootstrap component actually imported in src/.
    /^modal/,
    /^accordion/,
    /^carousel/,
    /^dropdown/,
    /^card-/,
    /^form-/,
    /^input-group/,
    /^nav-/,
    /^tab-/,
    /^spinner-/,
    /^pagination/,
    /^page-(item|link)/,
    /^table-/,
    /^badge/,
    /^btn-(group|close|check|toolbar)/,
    /^figure-/,
    /^container-/,
    // Bootstrap grid/spacing utilities can be composed at runtime by <Col>/<Row>
    // (e.g. lg={true} -> "col-lg"), so the literal may not exist in the bundle.
    /^col-/,
    /^row-cols-/,
    /^offset-/,
    /^g-/,
    /^gx-/,
    /^gy-/,
    /^order-/,
  ],
};

async function main() {
  const cssDir = path.join(BUILD_DIR, "static", "css");
  if (!fs.existsSync(cssDir)) {
    console.log(`[purge-css] no CSS at ${cssDir} — skipping`);
    return;
  }

  const cssFiles = fs
    .readdirSync(cssDir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => path.join(cssDir, f));

  if (cssFiles.length === 0) {
    console.log("[purge-css] no stylesheets found — skipping");
    return;
  }

  const before = cssFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);

  const results = await new PurgeCSS().purge({
    content: [
      path.join(BUILD_DIR, "static", "js", "*.js"),
      path.join(BUILD_DIR, "index.html"),
    ],
    css: cssFiles,
    safelist,
    // Keep @font-face and keyframes even when the matching selector is dropped;
    // removing them silently breaks icon fonts and the scroll-reveal animation.
    fontFace: false,
    keyframes: false,
    variables: false,
  });

  let after = 0;
  for (const result of results) {
    after += Buffer.byteLength(result.css);
    if (!DRY_RUN) fs.writeFileSync(result.file, result.css);
  }

  const saved = before - after;
  const pct = before ? Math.round((saved / before) * 100) : 0;
  console.log(
    `[purge-css]${DRY_RUN ? " (dry run)" : ""} ${Math.round(before / 1024)} KB -> ` +
      `${Math.round(after / 1024)} KB (removed ${Math.round(saved / 1024)} KB, ${pct}%)`
  );

  if (!DRY_RUN) rehashStylesheets(cssDir);
}

/**
 * Give every purged stylesheet a filename that reflects its new contents.
 *
 * webpack computes the content hash before this script runs, so purging leaves
 * each file byte-different but identically named. That is not merely a missed
 * optimisation — /static/ is served `immutable, max-age=31536000`, so a mutated
 * file keeps its year-long cache entry and both Cloudflare and browsers go on
 * serving the pre-purge bytes. Rewriting a URL that has been promised as
 * immutable is the one thing content hashing exists to prevent, so the hash has
 * to be recomputed here.
 *
 * Two kinds of reference have to be updated:
 *  - the entry stylesheet (main.<hash>.css) is referenced from index.html;
 *  - chunk stylesheets (<id>.<hash>.chunk.css) are never named literally. The
 *    webpack runtime assembles their URLs from a `{chunkId: hash}` map, so the
 *    hash is patched there instead, keyed by chunk id to avoid touching any
 *    other 8-character string that happens to match.
 */
function rehashStylesheets(cssDir) {
  const crypto = require("crypto");
  const hashOf = (file) =>
    crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex").slice(0, 8);

  const rename = (from, to) => {
    fs.renameSync(path.join(cssDir, from), path.join(cssDir, to));
    // Keep the source map alongside so devtools still resolve.
    const oldMap = path.join(cssDir, `${from}.map`);
    if (fs.existsSync(oldMap)) fs.renameSync(oldMap, path.join(cssDir, `${to}.map`));
  };

  const files = fs.readdirSync(cssDir);
  const jsDir = path.join(BUILD_DIR, "static", "js");
  const jsFiles = fs.existsSync(jsDir)
    ? fs.readdirSync(jsDir).filter((f) => f.endsWith(".js")).map((f) => path.join(jsDir, f))
    : [];

  // --- entry stylesheet -----------------------------------------------------
  const indexPath = path.join(BUILD_DIR, "index.html");
  const entry = files.find((f) => /^main\.[a-z0-9]+\.css$/.test(f));
  if (entry && fs.existsSync(indexPath)) {
    const renamed = `main.${hashOf(path.join(cssDir, entry))}.css`;
    const html = fs.readFileSync(indexPath, "utf8");
    if (renamed !== entry && html.includes(entry)) {
      rename(entry, renamed);
      fs.writeFileSync(indexPath, html.split(entry).join(renamed));
      console.log(`[purge-css] ${entry} -> ${renamed}`);
    }
  }

  // --- chunk stylesheets ----------------------------------------------------
  // Rename first, then make the runtime map agree with whatever is on disk.
  // Disk is treated as the source of truth rather than trying to swap a known
  // old hash for a new one: that approach silently no-ops if the expected old
  // value is not found, which can leave the map pointing at a filename that no
  // longer exists — a 404 for that route's stylesheet.
  let renamed = 0;
  for (const file of files) {
    const m = file.match(/^(\d+)\.([a-z0-9]+)\.chunk\.css$/);
    if (!m) continue;
    const [, chunkId, oldHash] = m;
    const newHash = hashOf(path.join(cssDir, file));
    if (newHash === oldHash) continue;
    rename(file, `${chunkId}.${newHash}.chunk.css`);
    renamed++;
  }

  // chunkId -> hash, read back from the directory after renaming.
  const onDisk = new Map();
  for (const f of fs.readdirSync(cssDir)) {
    const m = f.match(/^(\d+)\.([a-z0-9]+)\.chunk\.css$/);
    if (m) onDisk.set(m[1], m[2]);
  }

  const MAP_RE = /(miniCssF\s*=\s*\w+\s*=>\s*"static\/css\/"\s*\+\s*\w+\s*\+\s*"\."\s*\+\s*)(\{[^}]*\})/;
  let mapsFixed = 0;
  for (const jsFile of jsFiles) {
    const js = fs.readFileSync(jsFile, "utf8");
    const m = js.match(MAP_RE);
    if (!m) continue;

    const rebuilt = m[2].replace(
      /(\d+)\s*:\s*"([a-z0-9]+)"/g,
      (whole, id, hash) => (onDisk.has(id) ? `${id}:"${onDisk.get(id)}"` : whole)
    );
    if (rebuilt === m[2]) continue;
    fs.writeFileSync(jsFile, js.replace(MAP_RE, `$1${rebuilt}`));
    mapsFixed++;

    // Editing the bundle invalidates its own content hash. Leaving the filename
    // alone repeats the mistake this whole function exists to fix: /static/ is
    // immutable for a year, so Cloudflare and browsers keep serving whichever
    // generation of this bundle they cached first — along with its stale chunk
    // map. Re-hash and rename it too, so the patched runtime actually ships.
    renameHashedJs(jsFile);
  }

  if (renamed) {
    console.log(
      `[purge-css] re-hashed ${renamed} chunk stylesheet(s), updated ${mapsFixed} runtime map(s)`
    );
  }

  // Re-read the JS directory: bundles may have just been renamed.
  assertChunkMapResolves(cssDir);
}

/**
 * Re-hash and rename a JS bundle whose contents this script edited, updating
 * the reference in index.html.
 *
 * Only entry bundles named from index.html are renamed. A lazily-loaded chunk's
 * URL is built by the webpack runtime from its own hash map, so renaming one
 * here would 404 it; those are left alone and reported.
 */
function renameHashedJs(jsFile) {
  const crypto = require("crypto");
  const dir = path.dirname(jsFile);
  const name = path.basename(jsFile);
  const m = name.match(/^(.*)\.([a-z0-9]+)\.js$/);
  if (!m) return;

  const indexPath = path.join(BUILD_DIR, "index.html");
  if (!fs.existsSync(indexPath)) return;
  const html = fs.readFileSync(indexPath, "utf8");
  if (!html.includes(name)) {
    console.warn(`[purge-css] ${name} edited but not referenced in index.html — not renamed`);
    return;
  }

  const hash = crypto
    .createHash("md5")
    .update(fs.readFileSync(jsFile))
    .digest("hex")
    .slice(0, 8);
  const renamed = `${m[1]}.${hash}.js`;
  if (renamed === name) return;

  fs.renameSync(jsFile, path.join(dir, renamed));
  const oldMap = `${jsFile}.map`;
  if (fs.existsSync(oldMap)) fs.renameSync(oldMap, path.join(dir, `${renamed}.map`));
  fs.writeFileSync(indexPath, html.split(name).join(renamed));
  console.log(`[purge-css] ${name} -> ${renamed} (runtime map patched)`);
}

/**
 * Fail the build if the webpack runtime asks for a stylesheet that is not on
 * disk. /static/ is served immutable for a year, so shipping a broken mapping
 * would strand that route without styles until the filename changed again.
 */
function assertChunkMapResolves(cssDir) {
  const jsDir = path.join(BUILD_DIR, "static", "js");
  const jsFiles = fs.existsSync(jsDir)
    ? fs.readdirSync(jsDir).filter((f) => f.endsWith(".js")).map((f) => path.join(jsDir, f))
    : [];
  const MAP_RE = /miniCssF\s*=\s*\w+\s*=>\s*"static\/css\/"\s*\+\s*\w+\s*\+\s*"\."\s*\+\s*(\{[^}]*\})/;
  const missing = [];
  let checked = 0;

  for (const jsFile of jsFiles) {
    const m = fs.readFileSync(jsFile, "utf8").match(MAP_RE);
    if (!m) continue;
    for (const [, id, hash] of m[1].matchAll(/(\d+)\s*:\s*"([a-z0-9]+)"/g)) {
      checked++;
      if (!fs.existsSync(path.join(cssDir, `${id}.${hash}.chunk.css`))) {
        missing.push(`${id}.${hash}.chunk.css`);
      }
    }
  }

  if (missing.length) {
    throw new Error(
      `runtime references ${missing.length} missing stylesheet(s): ${missing
        .slice(0, 5)
        .join(", ")}`
    );
  }
  console.log(`[purge-css] verified ${checked} chunk stylesheet reference(s)`);
}

main().catch((err) => {
  // A broken chunk mapping is a correctness failure, not an optimisation that
  // did not pay off: /static/ is immutable for a year, so shipping it would
  // leave a route unstyled until its filename changed again. Fail the build so
  // the deploy stops and the previous release stays up.
  if (/missing stylesheet/.test(err.message)) {
    console.error(`[purge-css] ABORTING BUILD — ${err.message}`);
    process.exit(1);
  }

  // Anything else is optimisation-only. Ship the un-purged stylesheet rather
  // than no stylesheet.
  console.error("[purge-css] failed, leaving CSS untouched:", err.message);
});
