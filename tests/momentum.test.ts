import { it, expect } from "vitest";
import {
  evaluateMomentum,
  dayMs,
  keptWeeks,
  type MomentumInput,
} from "../lib/momentum";
const base: MomentumInput = {
  now: 10 * dayMs,
  sessions: [
    {
      id: "1",
      startedAt: 10 * dayMs,
      durationSec: 300,
      lessonsTouched: [],
      quizzesSkipped: 0,
    },
  ],
  quietMode: false,
  adaptiveSuggestions: true,
  lastOfferAt: null,
  restTokens: 2,
};
it.each([
  [2, "steady"],
  [3, "drifting"],
  [5, "drifting"],
  [6, "paused"],
])("handles a %s-day gap", (gap, state) =>
  expect(evaluateMomentum({ ...base, now: base.now + gap * dayMs }).state).toBe(
    state,
  ),
);
it("respects quiet mode, opt out, and the daily rate limit", () => {
  for (const patch of [
    { quietMode: true },
    { adaptiveSuggestions: false },
    { lastOfferAt: base.now + 3.5 * dayMs },
  ])
    expect(
      evaluateMomentum({ ...base, now: base.now + 4 * dayMs, ...patch }).offer,
    ).toBeNull();
});
it("allows another offer exactly 24 hours later", () =>
  expect(
    evaluateMomentum({
      ...base,
      now: base.now + 4 * dayMs,
      lastOfferAt: base.now + 3 * dayMs,
    }).offer,
  ).toBe("minimum"));
it("detects three short sessions against older personal average", () => {
  const sessions = Array.from({ length: 6 }, (_, i) => ({
    id: String(i),
    startedAt: base.now - i * 1000,
    durationSec: i < 3 ? 100 : 300,
    lessonsTouched: [],
    quizzesSkipped: 0,
  }));
  expect(evaluateMomentum({ ...base, sessions }).reason).toBe("short");
});
it("detects consecutive skipped quizzes", () =>
  expect(
    evaluateMomentum({
      ...base,
      sessions: [
        { ...base.sessions[0], quizzesSkipped: 1 },
        { ...base.sessions[0], id: "2", quizzesSkipped: 1 },
      ],
    }).reason,
  ).toBe("skipped"));
it("offers exam rest and planned-study recovery", () => {
  expect(evaluateMomentum({ ...base, examSoon: true }).offer).toBe("rest");
  expect(
    evaluateMomentum({ ...base, plannedStudy: 60, completedStudy: 10 }).reason,
  ).toBe("planned");
});
it("counts rest weeks once and groups Monday to Sunday", () =>
  expect(keptWeeks([], [Date.UTC(2026, 9, 12), Date.UTC(2026, 9, 18)])).toEqual(
    ["2026-10-12"],
  ));
