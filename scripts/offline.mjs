import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
const files = walk("out").filter(
  (p) =>
    !p.endsWith(".map") &&
    !p.endsWith("sw.js") &&
    !p.endsWith("offline-status.json"),
);
const hash = createHash("sha256");
for (const p of files) hash.update(readFileSync(p));
const revision = hash.digest("hex").slice(0, 12);
writeFileSync(
  "out/offline-status.json",
  JSON.stringify({
    revision,
    builtAt: new Date().toISOString(),
    bytes: files.reduce((n, p) => n + readFileSync(p).length, 0),
  }),
);
files.push("out/offline-status.json");
const urls = files
  .map((p) => "/" + relative("out", p).replaceAll("\\", "/"))
  .flatMap((p) =>
    p.endsWith("/index.html")
      ? [p, p.replace(/index\.html$/, "")]
      : p === "/index.html"
        ? [p, "/"]
        : [p],
  );
const cache = `kora-v1-${revision}`;
writeFileSync(
  "out/sw.js",
  `const CACHE=${JSON.stringify(cache)};const FILES=${JSON.stringify([...new Set(urls)])};
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);for(let i=0;i<FILES.length;i+=20)await cache.addAll(FILES.slice(i,i+20));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('kora-v1-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();for(const client of await self.clients.matchAll())client.postMessage({type:'OFFLINE_READY'});})()));
self.addEventListener('message',event=>{if(event.data?.type==='READY_CHECK')event.source?.postMessage({type:'OFFLINE_READY'});});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;event.respondWith((async()=>{const cache=await caches.open(CACHE);let path=url.pathname;try{path=decodeURIComponent(path);}catch{}const cached=await cache.match(path)||await cache.match(url.pathname);if(cached)return cached;try{const result=await fetch(event.request);if(result.ok)await cache.put(path,result.clone());return result;}catch{if(event.request.mode==='navigate')return await cache.match('/home/')||Response.error();return Response.error();}})());});`,
);
const js = files.filter((p) => p.endsWith(".js"));
console.log(
  "Offline precache:",
  new Set(urls).size,
  "assets; all-route JS gzip total:",
  Math.round(
    js.reduce((n, p) => n + gzipSync(readFileSync(p)).length, 0) / 1024,
  ),
  "KB (Next runtime means the 100 KB critical-path target needs measurement).",
);
