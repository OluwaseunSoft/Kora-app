import { chromium } from "playwright-core";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath:
    process.env.KORA_BROWSER_PATH ??
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const reach = async (type, text) => {
  for (let i = 0; i < 140; i++) {
    const active = await page.evaluate(() => {
      const e = document.activeElement;
      return {
        tag: e?.tagName,
        text: e?.textContent ?? "",
        type: e?.getAttribute("type"),
        href: e?.getAttribute("href"),
      };
    });
    if (
      type === "radio"
        ? active.type === "radio"
        : type === "checkbox"
          ? active.type === "checkbox"
          : type === "link"
            ? active.tag === "A" && active.href === text
            : active.tag === "BUTTON" && active.text.includes(text)
    )
      return;
    await page.keyboard.press("Tab");
  }
  throw Error(`Keyboard target unreachable: ${type} ${text}`);
};
try {
  await page.goto("http://localhost:3000/welcome/");
  await page.getByLabel("What should we call you?").waitFor();
  await page.waitForFunction(
    () => !document.querySelector('input[autocomplete="nickname"]')?.disabled,
  );
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.getAttribute("autocomplete"),
    ),
    "nickname",
  );
  await page.keyboard.type("Keyboard learner");
  await reach("button", "Continue");
  await page.keyboard.press("Enter");
  await reach("checkbox");
  await page.keyboard.press("Space");
  await reach("button", "Make a small beginning");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/home/");
  await reach("link", "/lab/");
  await page.keyboard.press("Enter");
  await reach("button", "Add template to this semester");
  await page.keyboard.press("Enter");
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    if (
      await page.evaluate(
        () => !!document.activeElement?.closest(".course-grade"),
      )
    )
      break;
  }
  assert.equal(
    await page.evaluate(() => document.activeElement?.tagName),
    "SELECT",
  );
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  assert.ok((await page.locator(".big-gpa").textContent()).includes("5.00"));
  await reach("link", "/learn/");
  await page.keyboard.press("Enter");
  await reach("link", "/learn/time/");
  await page.keyboard.press("Enter");
  await page
    .getByRole("heading", { name: "Make room for what matters" })
    .waitFor();
  for (const correct of [1, 1, 0]) {
    await reach("radio");
    for (let i = 0; i < correct; i++) await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await reach("button", "Check my answer");
    await page.keyboard.press("Enter");
    await reach("button", "Next question");
    await page.keyboard.press("Enter");
  }
  await reach("button", "Finish this lesson");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/home/");
  await reach("link", "/privacy/");
  await page.keyboard.press("Enter");
  await reach("button", "Export my data");
  const downloaded = page.waitForEvent("download");
  await page.keyboard.press("Enter");
  await downloaded;
  await reach("button", "Delete my data");
  await page.keyboard.press("Enter");
  await reach("button", "Delete everything from this device");
  await page.keyboard.press("Enter");
  await page.getByLabel("What should we call you?").waitFor();
  console.log(
    "Keyboard-only check passed: onboarding, consent, navigation, course template and grade selection, complete quiz, export and deletion.",
  );
} catch (error) {
  console.error(await page.locator("main").innerText());
  throw error;
} finally {
  await browser.close();
}
