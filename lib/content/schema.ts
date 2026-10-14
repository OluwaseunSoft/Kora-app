import { z } from "zod";
export const localized = z.object({
  en: z.string().min(1),
  pcm: z.string().min(1),
});
export const sourceSchema = z.object({
  author: z.string().min(1),
  sourceWork: z.string().min(1),
  year: z.string().min(1),
  sourceUrl: z.union([
    z.string().url(),
    z.string().regex(/^\/(?!\/)[a-zA-Z0-9/_.-]+$/),
  ]),
  license: z.string().min(1),
  verificationStatus: z.literal("verified"),
  verifiedBy: z.string().min(1),
  verifiedAt: z.string().min(1),
});
export const entrySchema = sourceSchema.extend({
  id: z.string(),
  type: z.enum(["quote", "story", "proverb", "tip"]),
  title: localized,
  text: z.string().min(1),
  originalLanguage: z.string(),
  translations: z.array(
    z.object({
      lang: z.string(),
      text: z.string(),
      translationType: z.enum(["original", "human", "machine"]),
    }),
  ),
  themes: z.array(z.string()).min(1),
  moments: z.array(z.string()).min(1),
  readingLevel: z.number(),
  country: z.array(z.string()),
  tryThisToday: z.string().optional(),
});
export const lessonSchema = z.object({
  id: z.string(),
  title: localized,
  description: localized,
  sections: z
    .array(
      z.object({
        id: z.string(),
        heading: localized,
        text: localized,
        simple: localized,
      }),
    )
    .min(1),
  estimatedMinutes: z.number().positive(),
  sources: z.array(sourceSchema).min(1),
  readingLevel: z.number(),
  tags: z.array(z.string()),
  quizIds: z.array(z.string()).min(3),
  translationType: z.literal("machine"),
});
export const quizSchema = z
  .object({
    id: z.string(),
    lessonId: z.string(),
    prompt: localized,
    options: z.array(localized).min(2),
    correctIndex: z.number().int().nonnegative(),
    explanation: localized,
    source: sourceSchema,
    reviewStatus: z.literal("reviewed"),
    reviewedBy: z.string(),
    reviewNote: z.string(),
  })
  .refine((q) => q.correctIndex < q.options.length);
export type Entry = z.infer<typeof entrySchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export const scaleSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    maxPoints: z.number().positive(),
    editable: z.boolean(),
    bands: z
      .array(
        z.object({
          minScore: z.number(),
          maxScore: z.number(),
          grade: z.string(),
          points: z.number().nonnegative(),
        }),
      )
      .min(1),
    classes: z
      .array(
        z.object({
          minCgpa: z.number().nonnegative(),
          maxCgpa: z.number(),
          label: z.string(),
        }),
      )
      .min(1),
    sourceNote: z.string().min(1),
    sourceUrl: z.string().url(),
  })
  .refine(
    (s) =>
      s.bands.every(
        (b) => b.points <= s.maxPoints && b.minScore <= b.maxScore,
      ) &&
      s.classes.every(
        (b) => b.minCgpa <= b.maxCgpa && b.maxCgpa <= s.maxPoints,
      ),
  );
export const templateSchema = z.object({
  programme: z.string(),
  level: z.number(),
  semester: z.number().int().nonnegative(),
  note: z.literal("typical, editable"),
  courses: z.array(
    z.object({
      code: z.string(),
      title: z.string(),
      creditUnits: z.number().positive(),
    }),
  ),
});
export const examSchema = z.object({
  note: z.string().min(1),
  teachingWeeks: z.number().positive(),
  revisionWeeks: z.number().positive(),
  examWeeks: z.number().positive(),
});
