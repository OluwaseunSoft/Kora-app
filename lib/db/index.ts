import Dexie, { type Table } from "dexie";
import type { Course, RetakeRule, Scale } from "../cgpa";
import type { Session } from "../momentum";
export interface Settings {
  quietMode: boolean;
  motivationFrequency: "off" | "daily" | "weekly";
  ttsEnabled: boolean;
  textScale: number;
  highContrast: boolean;
  plainLanguage: boolean;
  lowLiteracyMode: boolean;
  adaptiveSuggestions: boolean;
  consentAcceptedAt: number | null;
  hoursPerUnit: number;
  retakeRule: RetakeRule;
  demoOffset: number;
  examDate: string;
  preferredTime: string;
}
export interface Profile {
  id: string;
  nickname: string;
  language: "en" | "pcm";
  createdAt: number;
  optionalFields: Record<string, string>;
}
export interface Progress {
  lessonId: string;
  status: "started" | "completed";
  completedAt: number | null;
  quizResults: { at: number; score: number; total: number }[];
}
export interface Momentum {
  restTokens: number;
  restTokensUsed: number[];
  grantedWeeks: string[];
  lastOfferAt: number | null;
  lastReason: string | null;
  lastState: string;
  weekProgress: string[];
  recentEntries: string[];
  lastEntryAt: number | null;
  currentEntryId: string | null;
}
export interface Snapshot {
  profile: Profile | null;
  settings: Settings;
  courses: Course[];
  progress: Progress[];
  sessions: Session[];
  momentum: Momentum;
  savedEntries: { libraryEntryId: string; savedAt: number }[];
  target: number;
  scale: Scale;
  reports: { id: string; entryId: string; at: number }[];
}
export const defaultSettings: Settings = {
  quietMode: false,
  motivationFrequency: "daily",
  ttsEnabled: true,
  textScale: 1,
  highContrast: false,
  plainLanguage: false,
  lowLiteracyMode: false,
  adaptiveSuggestions: true,
  consentAcceptedAt: null,
  hoursPerUnit: 2,
  retakeRule: "replace",
  demoOffset: 0,
  examDate: "",
  preferredTime: "17:00",
};
class KoraDB extends Dexie {
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
  }
}
export const db = new KoraDB();
export const emptyMomentum = (): Momentum => ({
  restTokens: 2,
  restTokensUsed: [],
  grantedWeeks: [],
  lastOfferAt: null,
  lastReason: null,
  lastState: "steady",
  weekProgress: [],
  recentEntries: [],
  lastEntryAt: null,
  currentEntryId: null,
});
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
  ]);
  return {
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
    if (s.profile) await db.profile.put(s.profile);
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
