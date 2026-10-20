export interface Course {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  plannedGrade: string | null;
  actualGrade?: string | null;
  semesterIndex: number;
  status: "planned" | "retake";
  planId: string;
}
export interface Scale {
  packId?: string;
  customized?: boolean;
  maxPoints: number;
  bands: {
    grade: string;
    points: number;
    minScore: number;
    maxScore: number;
  }[];
  classes: { minCgpa: number; maxCgpa: number; label: string }[];
}
export type RetakeRule = "replace" | "all";
export function gradedCourses(courses: Course[], rule: RetakeRule = "replace") {
  const ordered = [...courses].sort(
    (a, b) => a.semesterIndex - b.semesterIndex,
  );
  const selected: Course[] = [];
  for (const c of ordered) {
    if (
      !c.plannedGrade ||
      !Number.isFinite(c.creditUnits) ||
      c.creditUnits <= 0
    )
      continue;
    if (rule === "replace" && c.status === "retake") {
      const prior = selected.findLastIndex(
        (x) =>
          x.code.trim().toUpperCase() === c.code.trim().toUpperCase() &&
          x.planId === c.planId,
      );
      if (prior >= 0) selected.splice(prior, 1);
    }
    selected.push(c);
  }
  return selected;
}
export function calculate(
  courses: Course[],
  scale: Scale,
  rule: RetakeRule = "replace",
) {
  let units = 0,
    points = 0;
  for (const course of gradedCourses(courses, rule)) {
    const band = scale.bands.find((b) => b.grade === course.plannedGrade);
    if (!band) continue;
    units += course.creditUnits;
    points += band.points * course.creditUnits;
  }
  return { units, points, gpa: units ? points / units : null };
}
export function classFor(cgpa: number | null, scale: Scale): string | null {
  if (
    cgpa === null ||
    !Number.isFinite(cgpa) ||
    cgpa < 0 ||
    cgpa > scale.maxPoints
  )
    return null;
  // Lower thresholds define continuous bands: 3.499 is lower; 3.50 is upper.
  return (
    [...scale.classes]
      .sort((a, b) => b.minCgpa - a.minCgpa)
      .find((b) => cgpa >= b.minCgpa)?.label ?? null
  );
}
export function reversePlan(
  units: number,
  points: number,
  target: number,
  remaining: number,
  scale: Scale,
) {
  if (
    ![units, points, target, remaining].every(Number.isFinite) ||
    units < 0 ||
    points < 0 ||
    points > units * scale.maxPoints ||
    remaining < 0 ||
    target < 0 ||
    target > scale.maxPoints
  )
    throw new RangeError("Invalid planner inputs");
  const best =
    units + remaining
      ? (points + remaining * scale.maxPoints) / (units + remaining)
      : null;
  const required = remaining
    ? Math.max(0, (target * (units + remaining) - points) / remaining)
    : null;
  const reachable = remaining
    ? required! <= scale.maxPoints
    : units > 0 && points / units >= target;
  const hint =
    required === null
      ? null
      : ([...scale.bands]
          .sort((a, b) => a.points - b.points)
          .find((b) => b.points >= required)?.grade ?? null);
  const current = units ? points / units : 0;
  const nextStep = current < 3.5 ? 3.5 : current < 4.5 ? 4.5 : target;
  const steppedTarget = best === null ? null : Math.min(target, best, nextStep);
  return {
    required,
    reachable,
    best,
    bestClass: classFor(best, scale),
    hint,
    steppedTarget,
  };
}
export const weeklyHours = (units: number, hoursPerUnit = 2) =>
  Math.max(0, units) * Math.max(0, hoursPerUnit);
