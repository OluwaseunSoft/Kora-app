import { z } from "zod";
import { emptyAcademic } from "../academic";
import { academicSchema } from "../academic/schema";
import type { Snapshot } from ".";

const text = z.string().max(2000),
  id = text.min(1),
  number = z.number().finite().nonnegative().max(8640000000000000);
const scale = z
  .object({
    packId: z.string().min(1).max(100).optional(),
    customized: z.boolean().optional(),
    maxPoints: z.number().finite().positive().max(100),
    bands: z
      .array(
        z.object({
          grade: id,
          points: number,
          minScore: number.max(100),
          maxScore: number.max(100),
        }),
      )
      .min(1)
      .max(30),
    classes: z
      .array(z.object({ minCgpa: number, maxCgpa: number, label: id }))
      .min(1)
      .max(30),
  })
  .passthrough()
  .superRefine((s, ctx) => {
    if (
      new Set(s.bands.map((b) => b.grade)).size !== s.bands.length ||
      s.bands.some((b) => b.points > s.maxPoints || b.minScore > b.maxScore) ||
      s.classes.some((c) => c.minCgpa > c.maxCgpa || c.maxCgpa > s.maxPoints)
    )
      ctx.addIssue({ code: "custom", message: "Invalid grading scale" });
  });
const course = z.object({
  id,
  code: text.max(24),
  title: text.max(100),
  creditUnits: z.number().finite().positive().max(30),
  plannedGrade: text.nullable(),
  actualGrade: text.nullable().optional(),
  semesterIndex: number.int().max(100),
  status: z.enum(["planned", "retake"]),
  planId: id,
});
export const snapshotSchema = z
  .object({
    profile: z
      .object({
        id: z.literal("me"),
        nickname: text,
        language: z.enum(["en", "pcm"]),
        createdAt: number,
        optionalFields: z.record(text),
      })
      .nullable(),
    settings: z.object({
      quietMode: z.boolean(),
      motivationFrequency: z.enum(["off", "daily", "weekly"]),
      ttsEnabled: z.boolean(),
      textScale: z.number().finite().min(0.5).max(3),
      highContrast: z.boolean(),
      plainLanguage: z.boolean(),
      lowLiteracyMode: z.boolean(),
      adaptiveSuggestions: z.boolean(),
      consentAcceptedAt: number.nullable(),
      hoursPerUnit: number.max(24),
      retakeRule: z.enum(["replace", "all"]),
      demoOffset: z.number().finite().min(-3153600000000).max(3153600000000),
      examDate: text,
      preferredTime: text,
    }),
    courses: z.array(course).max(2000),
    progress: z
      .array(
        z.object({
          lessonId: id,
          status: z.enum(["started", "completed"]),
          completedAt: number.nullable(),
          quizResults: z.array(
            z
              .object({ at: number, score: number.int(), total: number.int() })
              .refine((r) => r.score <= r.total),
          ),
        }),
      )
      .max(10000),
    sessions: z
      .array(
        z.object({
          id,
          startedAt: number,
          durationSec: number,
          lessonsTouched: z.array(id),
          quizzesSkipped: number.int(),
        }),
      )
      .max(50000),
    momentum: z.object({
      restTokens: number.int(),
      restTokensUsed: z.array(number),
      grantedWeeks: z.array(text),
      lastOfferAt: number.nullable(),
      lastReason: text.nullable(),
      lastState: text,
      weekProgress: z.array(text),
      recentEntries: z.array(text),
      lastEntryAt: number.nullable(),
      currentEntryId: text.nullable(),
    }),
    savedEntries: z.array(z.object({ libraryEntryId: id, savedAt: number })),
    target: number,
    scale,
    reports: z.array(z.object({ id, entryId: text, at: number })),
    academic: academicSchema.default(emptyAcademic),
  })
  .superRefine((s, ctx) => {
    const lists = [
      s.courses.map((c) => c.id),
      s.progress.map((p) => p.lessonId),
      s.sessions.map((v) => v.id),
      s.savedEntries.map((v) => v.libraryEntryId),
      s.reports.map((v) => v.id),
      s.academic.deadlines.map((v) => v.id),
      s.academic.study.map((v) => v.id),
      s.academic.reviews.map((v) => v.questionId),
    ];
    const courseIds = new Set(s.courses.map((c) => c.id));
    if (
      lists.some((list) => new Set(list).size !== list.length) ||
      s.target > s.scale.maxPoints ||
      s.courses.some((c) =>
        [c.plannedGrade, c.actualGrade].some(
          (g) => g != null && !s.scale.bands.some((b) => b.grade === g),
        ),
      ) ||
      [...s.academic.study, ...s.academic.deadlines].some(
        (v) => !courseIds.has(v.courseId),
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "Invalid identifiers, course references or grades",
      });
  });

export function createBackup(snapshot: Snapshot) {
  return {
    format: "kora-snapshot-v2",
    exportedAt: new Date().toISOString(),
    snapshot,
  };
}
export function parseBackup(input: unknown): Snapshot {
  const envelope = z.object({ format: z.string() }).passthrough().parse(input);
  if (envelope.format === "kora-snapshot-v2")
    return snapshotSchema.parse(envelope.snapshot);
  if (envelope.format === "kora-memory-export-v1")
    return snapshotSchema.parse(envelope);
  if (envelope.format === "kora-export-v1") {
    // Validate legacy table containers before extracting their singleton records.
    const tables = z
      .object({
        profile: z.array(z.unknown()).max(1),
        settings: z.array(z.unknown()).length(1),
        momentum: z.array(z.unknown()).length(1),
        targets: z.array(z.object({ value: number })).length(1),
        preferences: z.array(z.object({ scale: z.unknown() })).length(1),
      })
      .passthrough()
      .parse(envelope);
    return snapshotSchema.parse({
      ...tables,
      profile: tables.profile[0] ?? null,
      settings: tables.settings[0],
      momentum: tables.momentum[0],
      courses: tables.mockCourses,
      target: tables.targets[0].value,
      scale: tables.preferences[0].scale,
      academic: Array.isArray(tables.academic) ? tables.academic[0] : undefined,
    });
  }
  throw new Error("Unsupported backup version");
}
