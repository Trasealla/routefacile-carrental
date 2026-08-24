#!/usr/bin/env node
/**
 * Post-build step: rewrite asset-manifest.json to describe the build that
 * actually shipped.
 *
 * CRA writes the manifest straight after webpack, but several steps run
 * afterwards — purge-css.js rewrites the CSS under new hashes and deletes the
 * originals. The manifest kept pointing at pre-purge filenames, so a third of
 * its entries were 404s.
 *
 * An earlier version of this script tried to *filter* the stale entries out.
 * That was worse: it also removed `main.js`, `main.css` and every entrypoint,
 * leaving `"entrypoints": []` and a manifest that no longer described the app
 * at all. Filtering could only ever subtract, and it could not tell "renamed"
 * from "gone".
 *
 * So this regenerates the manifest from the filesystem. Whatever is on disk
 * after every other step is, by definition, what shipped — there is nothing to
 * infer and nothing to drift.
 *
 * Runs last in the build chain.
 */
const fs = require("fs");
const path = require("path");

const BUILD_DIR = process.env.BUILD_PATH
  ? path.resolve(process.env.BUILD_PATH)
  : path.resolve(__dirname, "..", "build");

const MANIFEST = path.join(BUILD_DIR, "asset-manifest.json");

/** Every file under a directory, as web paths rooted at the build dir. */
function walk(dir, rel = "") {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const url = `${rel}/${name}`;
    if (fs.statSync(full).isDirectory()) out.push(...walk(full, url));
    else out.push(url);
  }
  return out;
}

function main() {
  const staticFiles = walk(path.join(BUILD_DIR, "static"), "/static");
  if (!staticFiles.length) {
    console.log("[asset-manifest] no static/ directory — skipping");
    return;
  }

  const files = {};

  // CRA's own key convention: the entry bundles are "main.js" / "main.css",
  // everything else is keyed by its own path.
  const mainJs = staticFiles.find((f) => /^\/static\/js\/main\.[^/]+\.js$/.test(f));
  const mainCss = staticFiles.find((f) => /^\/static\/css\/main\.[^/]+\.css$/.test(f));
  if (mainJs) files["main.js"] = mainJs;
  if (mainCss) files["main.css"] = mainCss;

  for (const f of staticFiles) {
    if (f === mainJs || f === mainCss) continue;
    files[f.replace(/^\//, "")] = f;
  }

  // Root-level assets CRA normally lists alongside the bundles.
  for (const name of ["index.html", "favicon.png", "manifest.json", "robots.txt"]) {
    if (fs.existsSync(path.join(BUILD_DIR, name))) files[name] = `/${name}`;
  }

  // Entrypoints are what a server-rendered shell would need to include, in
  // load order: styles first so the page paints without a flash, then script.
  const entrypoints = [];
  if (mainCss) entrypoints.push(mainCss.replace(/^\//, ""));
  if (mainJs) entrypoints.push(mainJs.replace(/^\//, ""));

  fs.writeFileSync(MANIFEST, JSON.stringify({ files, entrypoints }, null, 2));
  console.log(
    `[asset-manifest] rebuilt from disk — ${Object.keys(files).length} files, ` +
      `${entrypoints.length} entrypoints (${entrypoints.join(", ") || "none"})`
  );
}

try {
  main();
} catch (err) {
  console.error("[asset-manifest] skipped:", err.message);
}
