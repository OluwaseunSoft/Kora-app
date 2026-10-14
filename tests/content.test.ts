import { it, expect } from "vitest";
import { validateContent } from "../scripts/validate";
import { selectEntry } from "../lib/triggers";
import entries from "../content/library/entries.json";
import { entrySchema } from "../lib/content/schema";
const options = {
  moment: "dip",
  language: "en",
  readingLevel: 2,
  country: "NG",
  seed: 42,
  quietMode: false,
  frequency: "daily" as const,
};
it("validates sources, lesson budgets and quizzes", () =>
  expect(validateContent()).toEqual({ entries: 25, lessons: 10, quizzes: 30 }));
it("never selects unverified content", () =>
  expect(
    selectEntry(
      entries.map((e) => ({ ...e, verificationStatus: "unverified" })),
      options,
    ),
  ).toBeNull());
it("respects quiet mode, frequency and reading level", () => {
  expect(selectEntry(entries, { ...options, quietMode: true })).toBeNull();
  expect(selectEntry(entries, { ...options, frequency: "off" })).toBeNull();
  expect(selectEntry(entries, { ...options, readingLevel: 0 })).toBeNull();
  expect(
    selectEntry(entries, { ...options, now: 10, lastShownAt: 0 }),
  ).toBeNull();
});
it("is deterministic and avoids recent entries", () => {
  const first = selectEntry(entries, options)!;
  expect(selectEntry(entries, options)?.id).toBe(first.id);
  expect(selectEntry(entries, { ...options, recent: [first.id] })?.id).not.toBe(
    first.id,
  );
});
it("rejects unverified or source-less entries at the build gate", () => {
  expect(
    entrySchema.safeParse({ ...entries[0], verificationStatus: "unverified" })
      .success,
  ).toBe(false);
  expect(entrySchema.safeParse({ ...entries[0], sourceUrl: "" }).success).toBe(
    false,
  );
  expect(entrySchema.safeParse({ ...entries[0], sourceWork: "" }).success).toBe(
    false,
  );
});
