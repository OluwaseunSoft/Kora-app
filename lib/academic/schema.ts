import { z } from "zod";
import { localDate } from ".";
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T12:00:00`);
    return (
      Number.isFinite(date.getTime()) && localDate(date.getTime()) === value
    );
  });
const id = z.string().min(1).max(100);
export const academicSchema = z.object({
  deadlines: z
    .array(
      z.object({
        id,
        courseId: id,
        title: z.string().trim().min(1).max(120),
        date: dateSchema,
        kind: z.enum(["assignment", "exam"]),
        done: z.boolean(),
      }),
    )
    .max(2000),
  study: z
    .array(
      z.object({
        id,
        courseId: id,
        date: dateSchema,
        minutes: z.number().int().min(5).max(480),
        done: z.boolean(),
      }),
    )
    .max(10000),
  reviews: z
    .array(
      z.object({
        questionId: id,
        dueAt: z.number().finite().nonnegative().max(8640000000000000),
        intervalDays: z.number().int().min(0).max(60),
        mistakes: z.number().int().nonnegative(),
        lastCorrect: z.boolean(),
      }),
    )
    .max(10000),
});
export type Academic = z.infer<typeof academicSchema>;
