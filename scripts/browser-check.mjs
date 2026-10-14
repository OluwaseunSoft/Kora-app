import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const base = "http://localhost:3000";
const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [],
  requests = [],
  accessibility = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (message) => {
  if (message.type() === "error")
    console.error("Browser error:", message.text());
});
page.on("request", (r) =>
  requests.push({ url: r.url(), method: r.method(), body: r.postData() }),
);
await context.route("**/*", (route) =>
  new URL(route.request().url()).origin === base
    ? route.continue()
    : route.abort(),
);
mkdirSync("artifacts", { recursive: true });
const audit = async (name) => {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  accessibility.push({
    name,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
};
try {
  await page.goto(base + "/welcome/");
  await page.getByLabel("What should we call you?").fill("Tunde");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Try the Tunde demo", exact: true })
    .click();
  await page.waitForURL("**/home/");
  await page
    .getByRole("heading", { name: "Small steps. Real possibilities." })
    .waitFor();
  await audit("desktop home");
  await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });
  await page
    .getByRole("link", { name: "Future Self Lab", exact: true })
    .first()
    .click();
  await page.locator(".big-gpa").waitFor();
  const before = await page.locator(".big-gpa").textContent();
  await page.locator(".course-grade select").first().selectOption("A");
  assert.notEqual(await page.locator(".big-gpa").textContent(), before);
  await page.getByLabel("Target CGPA", { exact: true }).fill("3.5");
  await audit("lab");
  await page.screenshot({ path: "artifacts/lab-desktop.png", fullPage: true });
  await page
    .getByRole("link", { name: "Words to carry", exact: true })
    .first()
    .click();
  await page.locator(".entry-card").first().waitFor();
  await page.locator(".entry-card").first().locator("summary").click();
  assert.ok(await page.getByRole("link", { name: "Open source" }).count());
  await page
    .locator(".entry-card")
    .first()
    .getByRole("button", { name: "Save for later" })
    .click();
  await audit("library");
  await page
    .getByRole("link", { name: "Make it yours", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Simulate 4 days passing" }).click();
  await page
    .getByRole("link", { name: "My journey", exact: true })
    .first()
    .click();
  await page
    .getByRole("heading", { name: "There’s room to begin again." })
    .waitFor();
  await page.getByRole("button", { name: "Use a rest token" }).first().click();
  assert.ok((await page.locator(".tokens strong").textContent()) === "1");
  await page.setViewportSize({ width: 390, height: 844 });
  await audit("mobile home");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.screenshot({ path: "artifacts/home-mobile.png", fullPage: true });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, {
    timeout: 120000,
  });
  await page.evaluate(async () => {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys())
        if (new URL(request.url).pathname.includes("%5B"))
          await cache.delete(request);
    }
  });
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("heading", { name: "Small steps. Real possibilities." })
    .waitFor();
  await page
    .getByRole("link", { name: "Learn a little", exact: true })
    .first()
    .click();
  await page
    .getByRole("heading", { name: "Skills for your next chapter." })
    .waitFor();
  await audit("offline lessons");
  await page.locator('a[href="/learn/time/"]').click();
  await page
    .getByRole("heading", { name: "Make room for what matters" })
    .waitFor();
  await audit("offline reader");
  for (const [i, correct] of [1, 1, 0].entries()) {
    await page.waitForFunction(
      (expected) =>
        document.querySelector(".quiz-count")?.textContent === expected,
      `${i + 1} / 3`,
    );
    await page.locator(".quiz-option").nth(correct).click();
    await page.getByRole("button", { name: "Check my answer" }).click();
    await page.getByRole("button", { name: "Next question" }).click();
  }
  await page.getByRole("heading", { name: "A small step, taken." }).waitFor();
  await page.getByRole("button", { name: "Finish this lesson" }).click();
  await page.waitForURL("**/home/");
  await page
    .getByRole("link", { name: "Future Self Lab", exact: true })
    .first()
    .click();
  await page.locator(".big-gpa").waitFor();
  assert.ok((await page.locator(".big-gpa").textContent()).includes("3.69"));
  await audit("offline mobile lab");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page
    .getByRole("link", { name: "Make it yours", exact: true })
    .first()
    .click();
  await page.getByLabel("High contrast", { exact: true }).check();
  await page.getByLabel("Text size").selectOption("1.3");
  await audit("settings high contrast and large text");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  );
  await page.locator('a[href="/privacy/"]').filter({ visible: true }).click();
  await audit("privacy");
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export my data", exact: true })
    .click();
  const exported = JSON.parse(
    readFileSync(await (await downloadEvent).path(), "utf8"),
  );
  assert.equal(exported.profile[0].nickname, "Tunde");
  assert.equal(exported.mockCourses.length, 6);
  assert.equal(
    exported.progress.find((p) => p.lessonId === "time").status,
    "completed",
  );
  assert.equal(exported.momentum[0].restTokensUsed.length, 1);
  await page
    .getByRole("button", { name: "Delete my data", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete everything from this device" })
    .click();
  await page.getByLabel("What should we call you?").waitFor();
  await page.reload();
  await page.getByLabel("What should we call you?").waitFor();
  const counts = await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("kora-local");
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result,
            tx = db.transaction(Array.from(db.objectStoreNames), "readonly"),
            counts = {};
          for (const name of db.objectStoreNames) {
            const request = tx.objectStore(name).count();
            request.onsuccess = () => (counts[name] = request.result);
          }
          tx.oncomplete = () => {
            db.close();
            resolve(counts);
          };
        };
      }),
  );
  assert.ok(Object.values(counts).every((n) => n === 0));
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Continue without saving", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Future Self Lab", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Add template to this semester" })
    .click();
  await page.locator(".course-grade select").first().selectOption("A");
  await page
    .getByRole("link", { name: "Make it yours", exact: true })
    .first()
    .click();
  await page.locator('a[href="/privacy/"]').filter({ visible: true }).click();
  const guestDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export my data", exact: true })
    .click();
  const guestExport = JSON.parse(
    readFileSync(await (await guestDownload).path(), "utf8"),
  );
  assert.equal(guestExport.format, "kora-memory-export-v1");
  assert.equal(guestExport.courses.length, 6);
  await page.reload();
  await page.getByLabel("What should we call you?").waitFor();
  assert.ok(
    requests.every((r) => r.method === "GET" && !r.body),
    "Core requests must never contain learner data.",
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  writeFileSync(
    "artifacts/browser-check.json",
    JSON.stringify(
      {
        offline: true,
        export: true,
        delete: true,
        noLearnerRequests: true,
        guestMode: true,
        keyboard:
          "Semantic and visible-focus controls; manual review still recommended.",
        pageErrors: errors,
        accessibility,
      },
      null,
      2,
    ),
  );
  assert.equal(
    accessibility.flatMap((a) => a.violations).length,
    0,
    JSON.stringify(
      accessibility.filter((a) => a.violations.length),
      null,
      2,
    ),
  );
  console.log(
    "Passed: simulator, source badges, saved entries, recovery, rest, offline navigation and quiz, persistence, export, delete, private requests, responsive widths, and axe WCAG AA checks.",
  );
} catch (error) {
  console.error(
    "Failed at",
    page.url(),
    errors,
    await page.locator("main").innerText(),
  );
  await page.screenshot({ path: "artifacts/failure.png", fullPage: true });
  throw error;
} finally {
  writeFileSync(
    "artifacts/accessibility.json",
    JSON.stringify(accessibility, null, 2),
  );
  await browser.close();
}
