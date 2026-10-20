import { calculate, type Course, type Scale, type RetakeRule } from "../cgpa";
import type { Academic } from "./schema";
export type { Academic } from "./schema";
export const emptyAcademic = (): Academic => ({
  deadlines: [],
  study: [],
  reviews: [],
});
export function localDate(at: number) {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDate(d.getTime());
}
export function actualResults(
  courses: Course[],
  scale: Scale,
  rule: RetakeRule,
) {
  return calculate(
    courses.map((c) => ({ ...c, plannedGrade: c.actualGrade ?? null })),
    scale,
    rule,
  );
}
export function recordReview(
  reviews: Academic["reviews"],
  questionId: string,
  correct: boolean,
  at: number,
) {
  const previous = reviews.find((r) => r.questionId === questionId);
  const intervalDays = correct
    ? Math.min(60, Math.max(1, (previous?.intervalDays ?? 0) * 2))
    : 1;
  return [
    ...reviews.filter((r) => r.questionId !== questionId),
    {
      questionId,
      dueAt: at + intervalDays * 86400000,
      intervalDays,
      mistakes: (previous?.mistakes ?? 0) + (correct ? 0 : 1),
      lastCorrect: correct,
    },
  ];
}
// Suggestions are editable allocations, never predictions of grades or mastery.
export function priorities(
  courses: Course[],
  academic: Academic,
  today: string,
) {
  return courses
    .filter((c) => !c.actualGrade)
    .map((course) => {
      const next = academic.deadlines
        .filter((d) => d.courseId === course.id && !d.done)
        .sort((a, b) => a.date.localeCompare(b.date))[0];
      const urgent = !!next && next.date <= addDays(today, 7);
      return {
        course,
        next,
        urgent,
        weight: course.creditUnits + (urgent ? 30 : 0),
      };
    })
    .sort(
      (a, b) =>
        b.weight - a.weight || a.course.code.localeCompare(b.course.code),
    );
}
export function suggestWeek(
  courses: Course[],
  academic: Academic,
  today: string,
  minutes: number,
): Academic["study"] {
  const ranked = priorities(courses, academic, today);
  if (!ranked.length || !Number.isFinite(minutes) || minutes < 5) return [];
  const count = Math.min(7, Math.floor(minutes / 25) || 1);
  const perSession = Math.min(120, Math.floor(minutes / count));
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    courseId: ranked[i % ranked.length].course.id,
    date: addDays(today, i),
    minutes: perSession,
    done: false,
  }));
}
