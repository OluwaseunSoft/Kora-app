import { describe, expect, it } from "vitest";
import { researchSummary } from "../lib/research";
import { defaultSettings, emptyMomentum, type Snapshot } from "../lib/db/state";
import { emptyAcademic } from "../lib/academic";
import scale from "../content/ng/gradingScale.json";
const origin = new Date(2026, 8, 1, 12).getTime(),
  day = 86400000;
const snapshot = (): Snapshot => ({
  profile: {
    id: "me",
    nickname: "PRIVATE NAME",
    language: "en",
    createdAt: origin,
    optionalFields: {},
  },
  settings: { ...defaultSettings },
  courses: [],
  progress: [],
  sessions: [0, 0, 8, 22].map((d, i) => ({
    id: `private-${i}`,
    startedAt: origin + d * day,
    durationSec: 60,
    lessonsTouched: ["private-lesson"],
    quizzesSkipped: 0,
  })),
  momentum: emptyMomentum(),
  savedEntries: [],
  target: 3.5,
  scale,
  reports: [],
  academic: emptyAcademic(),
});
describe("voluntary research summary", () => {
  it("aggregates distinct days without identifying raw history", () => {
    const summary = researchSummary(snapshot(), origin + 30 * day)!;
    expect(summary.activeStudyDays).toBe(3);
    expect(summary.recordedStudyActions).toBe(4);
    const json = JSON.stringify(summary);
    for (const value of [
      "PRIVATE NAME",
      "private-",
      "2026-09",
      "plannedGrade",
      "target",
    ])
      expect(json).not.toContain(value);
  });
  it("does not report return outcomes before full windows finish", () => {
    expect(
      researchSummary(snapshot(), origin + 13 * day)?.returnedInWeekTwo,
    ).toBeNull();
    expect(
      researchSummary(snapshot(), origin + 14 * day)?.returnedInWeekTwo,
    ).toBe(true);
    expect(
      researchSummary(snapshot(), origin + 27 * day)?.returnedInWeekFour,
    ).toBeNull();
    expect(
      researchSummary(snapshot(), origin + 28 * day)?.returnedInWeekFour,
    ).toBe(true);
  });
  it("excludes marked demos and simulated clocks", () => {
    const s = snapshot();
    s.settings.demoOffset = day;
    expect(researchSummary(s, origin)).toBeNull();
    s.settings.demoOffset = 0;
    s.profile!.optionalFields.koraDemo = "true";
    expect(researchSummary(s, origin)).toBeNull();
  });
  it("handles missing history and excludes future sessions", () => {
    const s = snapshot();
    s.sessions = [];
    expect(researchSummary(s, origin)?.daysObserved).toBe(0);
    expect(researchSummary(snapshot(), origin)?.activeStudyDays).toBe(1);
  });
});
