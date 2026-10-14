import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { gzipSync } from "node:zlib";
const root = resolve("out");
const port = Number(process.env.PORT ?? 3000);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    let path = resolve(root, "." + pathname);
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    const data = await readFile(path);
    const compress =
      /\bgzip\b/.test(req.headers["accept-encoding"] ?? "") &&
      [
        ".html",
        ".css",
        ".js",
        ".json",
        ".webmanifest",
        ".svg",
        ".txt",
      ].includes(extname(path));
    res.writeHead(200, {
      "Content-Type": mime[extname(path)] ?? "application/octet-stream",
      "Cache-Control": pathname === "/sw.js" ? "no-cache" : "public, max-age=0",
      Vary: "Accept-Encoding",
      ...(compress ? { "Content-Encoding": "gzip" } : {}),
    });
    res.end(compress ? gzipSync(data) : data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end(
      await readFile(resolve(root, "404.html")).catch(() =>
        Buffer.from("Not found"),
      ),
    );
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Kora production preview: http://localhost:${port}`),
);
