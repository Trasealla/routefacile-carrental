#!/usr/bin/env node
/**
 * Post-build step: inline the CSS the first paint needs into index.html.
 *
 * The entry stylesheet is render-blocking, so the browser cannot paint anything
 * until it has arrived over the network. Beasties works out which rules the
 * above-the-fold markup actually uses, inlines those, and switches the full
 * stylesheet to a non-blocking `preload`+`swap` load.
 *
 * This used to run inside redeploy.sh as an inline `node -e` one-liner AFTER
 * `npm run build`. That put it after lang-shells.js, so every per-language shell
 * — that is, every real page on the site — was stamped from the pre-inlined
 * index.html and shipped without the critical CSS. Running it here, as part of
 * the build and before the shells are cut, means all four HTML files get it and
 * a local build matches production.
 *
 * pruneSource:false keeps the full stylesheet intact, so nothing below the fold
 * loses its styles when the async load lands.
 */
const fs = require("fs");
const path = require("path");
const Beasties = require("beasties");

const BUILD_DIR = process.env.BUILD_PATH
  ? path.resolve(process.env.BUILD_PATH)
  : path.resolve(__dirname, "..", "build");

async function main() {
  const indexPath = path.join(BUILD_DIR, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.log("[inline-critical] no index.html — skipping");
    return;
  }

  const before = fs.readFileSync(indexPath, "utf8");
  const beasties = new Beasties({
    path: BUILD_DIR,
    publicPath: "/",
    preload: "swap",
    pruneSource: false,
    reduceInlineStyles: false,
    mergeStylesheets: false,
    logLevel: "silent",
  });

  let after = await beasties.process(before);

  /**
   * Beasties adds a `preload`+`onload` swap for the entry stylesheet but leaves
   * the original blocking <link> in place, so the document ended up referencing
   * main.css twice — once asynchronously and once render-blocking. The blocking
   * copy wins, which made the whole exercise pointless: the browser still waited
   * for the full 38 KB stylesheet before painting, even though the ~29 KB of CSS
   * the first screen needs is already inlined above it. PageSpeed reported the
   * difference as ~30 KB of "unused CSS".
   *
   * Demote the blocking copy to a <noscript> fallback. With JavaScript the async
   * preload swaps itself in; without it, the plain stylesheet still applies, so
   * a no-JS visitor is no worse off than before.
   */
  const blocking = new RegExp(
    `<link href="([^"]*main\\.[a-z0-9]+\\.css)" rel="stylesheet"\\s*/?>`, "i");
  const match = after.match(blocking);
  if (match) {
    after = after.replace(blocking,
      `<noscript><link href="${match[1]}" rel="stylesheet"></noscript>`);
    console.log("[inline-critical] entry stylesheet demoted to <noscript> (no longer render-blocking)");
  } else {
    console.log("[inline-critical] no blocking stylesheet link found — check beasties output");
  }

  fs.writeFileSync(indexPath, after);
  console.log(
    `[inline-critical] critical CSS inlined (${Math.round(
      (after.length - before.length) / 1024
    )} KB added to index.html)`
  );
}

main().catch((err) => {
  // Cosmetic-ish: without it the page still renders, just a little later. Never
  // fail a deploy over it.
  console.error("[inline-critical] skipped:", err.message);
});
