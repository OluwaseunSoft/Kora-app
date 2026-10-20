import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath:
    process.env.KORA_BROWSER_PATH ??
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  acceptDownloads: true,
});
const page = await context.newPage();
const errors = [],
  audits = [];
page.on("pageerror", (e) => errors.push(e.message));
mkdirSync("artifacts", { recursive: true });
const audit = async (name) => {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `${name}: overflow`,
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();
  audits.push({ name, violations });
  assert.equal(violations.length, 0, JSON.stringify(violations));
};
try {
  await page.goto("http://localhost:3000/welcome/");
  await page.getByLabel("What should we call you?").fill("Semester learner");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Try the Tunde demo", exact: true })
    .click();
  await page.waitForURL("**/home/");
  await page.getByText("Ready for offline learning", { exact: true }).waitFor();
  await context.setOffline(true);
  await page.getByRole("link", { name: "My semester", exact: true }).click();
  await page
    .getByRole("heading", { name: "A target. A plan. Your next step." })
    .waitFor();
  const recordedGrade = page.getByLabel("Recorded grade GST 101", {
    exact: true,
  });
  await recordedGrade.selectOption("F");
  assert.ok(
    (await page.locator(".academic-stat").innerText()).includes("0.00"),
  );
  const rules = page.locator(".institution-picker");
  await rules.locator("summary").click();
  await rules.getByLabel("Handbook snapshot").selectOption("unilorin-eee-2024");
  await rules
    .getByRole("button", { name: "Apply these grading rules" })
    .click();
  assert.equal(await recordedGrade.inputValue(), "F");
  await rules.getByRole("link", { name: "Open official handbook" }).waitFor();
  await audit("offline institution evidence");
  await rules.locator("summary").click();
  const deadline = page.locator("section").filter({
    has: page.getByRole("heading", { name: "Deadlines", exact: true }),
  });
  await deadline.getByLabel("Assignment or exam title").fill("GST essay");
  await deadline.getByRole("button", { name: "Add deadline" }).click();
  await deadline.getByText("GST essay", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Suggest study sessions" }).click();
  await page.getByRole("button", { name: "Add these sessions" }).click();
  const study = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "Your next seven days",
      exact: true,
    }),
  });
  assert.equal(await study.locator(".academic-list li").count(), 4);
  await study.getByRole("checkbox").first().check();
  assert.ok((await study.innerText()).includes("30 / 120"));
  const calendar = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download calendar" }).click();
  assert.equal((await calendar).suggestedFilename(), "kora-semester.ics");
  await audit("offline mobile semester");
  await page.screenshot({
    path: "artifacts/semester-mobile.png",
    fullPage: true,
  });
  await page.reload();
  await page.getByText("GST essay", { exact: false }).waitFor();
  assert.equal(await recordedGrade.inputValue(), "F");
  assert.ok(
    (await rules.locator("summary").innerText()).includes(
      "University of Ilorin",
    ),
  );
  assert.equal(await study.getByRole("checkbox").first().isChecked(), true);
  await page.getByRole("link", { name: "Practice", exact: true }).click();
  await page.getByRole("button", { name: "Practise all questions" }).click();
  await page.locator(".practice-panel").getByRole("radio").first().check();
  await page
    .locator(".practice-panel")
    .getByRole("button", { name: "Check my answer" })
    .click();
  await page
    .locator(".practice-panel")
    .getByText("Correct answer:", { exact: false })
    .waitFor();
  await audit("offline practice feedback");
  await page.getByRole("button", { name: "Finish for now" }).click();
  await page.getByRole("button", { name: "Revisit mistakes" }).click();
  await page.locator(".practice-panel").getByRole("radio").nth(1).check();
  await page
    .locator(".practice-panel")
    .getByRole("button", { name: "Check my answer" })
    .click();
  await page
    .locator(".practice-panel")
    .getByRole("button", { name: "Next question" })
    .click();
  await page
    .getByText(
      "Practice complete. Your review schedule has been updated on this device.",
    )
    .waitFor();
  await page
    .getByRole("link", { name: "Make it yours", exact: true })
    .first()
    .click();
  await page.getByRole("heading", { name: "Your offline download" }).waitFor();
  await page.getByText("Content version", { exact: true }).waitFor();
  await page.getByLabel("High contrast", { exact: true }).check();
  await page.getByLabel("Text size").selectOption("1.3");
  await page.getByRole("link", { name: "My semester", exact: true }).click();
  await audit("semester large text high contrast");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await audit("desktop semester");
  await page.screenshot({
    path: "artifacts/semester-desktop.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "Passed: recorded grades, deadlines, editable weekly planning, completed sessions, calendar export, persistence, offline practice, mistake review, offline details, responsive layout and accessibility.",
  );
} catch (error) {
  await page.screenshot({
    path: "artifacts/semester-failure.png",
    fullPage: true,
  });
  throw error;
} finally {
  writeFileSync(
    "artifacts/semester-check.json",
    JSON.stringify({ errors, audits }, null, 2),
  );
  await browser.close();
}
