import Dexie, { type Table } from "dexie";
import type { Course, Scale } from "../cgpa";
import type { Session } from "../momentum";
import { emptyAcademic, type Academic } from "../academic";
import {
  defaultSettings,
  emptyMomentum,
  type Settings,
  type Profile,
  type Progress,
  type Momentum,
  type Snapshot,
} from "./state";
export { defaultSettings, emptyMomentum } from "./state";
export type { Settings, Profile, Progress, Momentum, Snapshot } from "./state";
class KoraDB extends Dexie {
  academic!: Table<Academic & { id: string }, string>;
  profile!: Table<Profile, string>;
  settings!: Table<Settings & { id: string }, string>;
  mockPlans!: Table<{ id: string; name: string; semesters: number[] }, string>;
  mockCourses!: Table<Course, string>;
  targets!: Table<
    {
      id: string;
      planId: string;
      type: string;
      value: number;
      derivedWeeklyHours: number;
    },
    string
  >;
  progress!: Table<Progress, string>;
  sessions!: Table<Session, string>;
  momentum!: Table<Momentum & { id: string }, string>;
  savedEntries!: Table<{ libraryEntryId: string; savedAt: number }, string>;
  preferences!: Table<{ id: string; scale: Scale }, string>;
  reports!: Table<{ id: string; entryId: string; at: number }, string>;
  constructor() {
    super("kora-local");
    this.version(1).stores({
      profile: "id",
      settings: "id",
      mockPlans: "id",
      mockCourses: "id,planId,semesterIndex",
      targets: "id,planId",
      progress: "lessonId",
      sessions: "id,startedAt",
      momentum: "id",
      savedEntries: "libraryEntryId",
      preferences: "id",
      reports: "id",
    });
    this.version(2).stores({ academic: "id" });
  }
}
export const db = new KoraDB();
export async function loadSnapshot(scale: Scale): Promise<Snapshot> {
  const [
    profile,
    settings,
    courses,
    progress,
    sessions,
    momentum,
    savedEntries,
    target,
    preferences,
    reports,
    academic,
  ] = await Promise.all([
    db.profile.get("me"),
    db.settings.get("settings"),
    db.mockCourses.toArray(),
    db.progress.toArray(),
    db.sessions.toArray(),
    db.momentum.get("momentum"),
    db.savedEntries.toArray(),
    db.targets.get("target"),
    db.preferences.get("scale"),
    db.reports.toArray(),
    db.academic.get("semester"),
  ]);
  return {
    academic: academic ?? emptyAcademic(),
    profile: profile ?? null,
    settings: settings ?? defaultSettings,
    courses,
    progress,
    sessions,
    momentum: momentum ?? emptyMomentum(),
    savedEntries,
    target: target?.value ?? 3.5,
    scale: preferences?.scale ?? scale,
    reports,
  };
}
export async function saveSnapshot(s: Snapshot) {
  await db.transaction("rw", db.tables, async () => {
    await db.academic.put({ ...s.academic, id: "semester" });
    if (s.profile) await db.profile.put(s.profile);
    else await db.profile.clear();
    await db.settings.put({ ...s.settings, id: "settings" });
    await db.mockPlans.put({
      id: "main",
      name: "My future",
      semesters: [...new Set(s.courses.map((c) => c.semesterIndex))],
    });
    for (const table of [
      db.mockCourses,
      db.progress,
      db.sessions,
      db.savedEntries,
      db.reports,
    ])
      await table.clear();
    await db.mockCourses.bulkPut(s.courses);
    await db.progress.bulkPut(s.progress);
    await db.sessions.bulkPut(s.sessions);
    await db.savedEntries.bulkPut(s.savedEntries);
    await db.reports.bulkPut(s.reports);
    await db.momentum.put({ ...s.momentum, id: "momentum" });
    await db.targets.put({
      id: "target",
      planId: "main",
      type: "cgpa",
      value: s.target,
      derivedWeeklyHours:
        s.courses.reduce((n, c) => n + c.creditUnits, 0) *
        s.settings.hoursPerUnit,
    });
    await db.preferences.put({ id: "scale", scale: s.scale });
  });
}
export async function deleteAll() {
  await db.transaction("rw", db.tables, async () => {
    for (const table of db.tables) await table.clear();
  });
}
export async function exportData() {
  const result: Record<string, unknown> = {
    format: "kora-export-v1",
    exportedAt: new Date().toISOString(),
  };
  for (const table of db.tables) result[table.name] = await table.toArray();
  return result;
}
