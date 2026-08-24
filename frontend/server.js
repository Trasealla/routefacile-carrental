const http = require("http");
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "build");
const PORT = 5000;

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".map": "application/json",
};

http.createServer((req, res) => {
  let urlPath = req.url.split("?")[0];
  let filePath = path.join(BUILD_DIR, urlPath);

  // Security: prevent path traversal
  if (!filePath.startsWith(BUILD_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const tryFile = (fp) => {
    if (fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      const ext = path.extname(fp).toLowerCase();
      const mime = MIME[ext] || "application/octet-stream";
      res.writeHead(200, {
        "Content-Type": mime,
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000",
      });
      fs.createReadStream(fp).pipe(res);
      return true;
    }
    return false;
  };

  // Try exact file, then index.html fallback (SPA)
  if (!tryFile(filePath) && !tryFile(path.join(filePath, "index.html"))) {
    // SPA fallback
    const indexFile = path.join(BUILD_DIR, "index.html");
    res.writeHead(200, { "Content-Type": "text/html", "Cache-Control": "no-cache" });
    fs.createReadStream(indexFile).pipe(res);
  }
}).listen(PORT, () => {
  console.log(`Production build running at http://localhost:${PORT}`);
  console.log(`Test Lighthouse on: http://localhost:${PORT}/en`);
});
