import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { mkdirSync, writeFileSync } from "node:fs";
const chrome = await launch({
  chromePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  chromeFlags: ["--headless", "--disable-gpu"],
});
try {
  const result = await lighthouse("http://localhost:3000/home/", {
    port: chrome.port,
    output: ["html", "json"],
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices"],
    formFactor: "mobile",
    throttlingMethod: "simulate",
    screenEmulation: {
      mobile: true,
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      disabled: false,
    },
  });
  mkdirSync("artifacts", { recursive: true });
  writeFileSync("artifacts/lighthouse.html", result.report[0]);
  writeFileSync("artifacts/lighthouse.json", result.report[1]);
  console.log(
    JSON.stringify(
      {
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, value]) => [
            key,
            value.score,
          ]),
        ),
        fcp: result.lhr.audits["first-contentful-paint"].displayValue,
        lcp: result.lhr.audits["largest-contentful-paint"].displayValue,
        totalBlockingTime:
          result.lhr.audits["total-blocking-time"].displayValue,
      },
      null,
      2,
    ),
  );
} finally {
  await chrome.kill();
}
