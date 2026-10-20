import { describe, expect, it } from "vitest";
import { createBackup, parseBackup } from "../lib/db/backup";
import { defaultSettings, emptyMomentum, type Snapshot } from "../lib/db";
import { emptyAcademic } from "../lib/academic";
import scale from "../content/ng/gradingScale.json";
const snapshot = (): Snapshot => ({
  profile: null,
  settings: { ...defaultSettings },
  courses: [],
  progress: [],
  sessions: [],
  momentum: emptyMomentum(),
  savedEntries: [],
  target: 3.5,
  scale: structuredClone(scale),
  reports: [],
  academic: emptyAcademic(),
});
describe("backup restore validation and migration", () => {
  it("round trips all snapshot data", () => {
    const data = snapshot();
    data.academic.reviews.push({
      questionId: "time-1",
      dueAt: 1000,
      intervalDays: 1,
      mistakes: 1,
      lastCorrect: false,
    });
    expect(parseBackup(createBackup(data))).toEqual(data);
  });
  it("migrates guest v1 without semester data", () => {
    const legacy: Partial<Snapshot> = snapshot();
    delete legacy.academic;
    expect(
      parseBackup({ format: "kora-memory-export-v1", ...legacy }).academic,
    ).toEqual(emptyAcademic());
  });
  it("migrates table-based v1", () => {
    const s = snapshot();
    const restored = parseBackup({
      format: "kora-export-v1",
      profile: [],
      settings: [s.settings],
      mockCourses: [],
      progress: [],
      sessions: [],
      momentum: [s.momentum],
      savedEntries: [],
      targets: [{ value: 3.5 }],
      preferences: [{ scale }],
      reports: [],
    });
    expect(restored).toEqual(s);
  });
  it("rejects unknown versions, missing tables and malformed snapshots", () => {
    for (const input of [
      null,
      {},
      { format: "kora-snapshot-v3", snapshot: snapshot() },
      { format: "kora-export-v1" },
      { format: "kora-snapshot-v2", snapshot: { ...snapshot(), settings: {} } },
    ])
      expect(() => parseBackup(input)).toThrow();
  });
  it("rejects invalid scale and target values", () => {
    const s = snapshot();
    s.scale.bands[0].points = 99;
    expect(() => parseBackup(createBackup(s))).toThrow();
    expect(() =>
      parseBackup(createBackup({ ...snapshot(), target: 8 })),
    ).toThrow();
  });
  it("rejects duplicate identifiers and dangling semester references", () => {
    const s = snapshot();
    s.sessions = [0, 1].map(() => ({
      id: "same",
      startedAt: 1,
      durationSec: 1,
      lessonsTouched: [],
      quizzesSkipped: 0,
    }));
    expect(() => parseBackup(createBackup(s))).toThrow();
    const missing = snapshot();
    missing.academic.study.push({
      id: "s",
      courseId: "missing",
      date: "2026-10-20",
      minutes: 25,
      done: false,
    });
    expect(() => parseBackup(createBackup(missing))).toThrow();
  });
  it("rejects unknown grades before replacing any data", () => {
    const s = snapshot();
    s.courses.push({
      id: "c",
      code: "GST",
      title: "GST",
      creditUnits: 3,
      plannedGrade: "Z",
      semesterIndex: 0,
      status: "planned",
      planId: "main",
    });
    expect(() => parseBackup(createBackup(s))).toThrow();
  });
});
