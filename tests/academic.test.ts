import { describe, expect, it } from "vitest";
import {
  actualResults,
  addDays,
  emptyAcademic,
  localDate,
  priorities,
  recordReview,
  suggestWeek,
} from "../lib/academic";
import { dateSchema } from "../lib/academic/schema";
import scale from "../content/ng/gradingScale.json";
import type { Course } from "../lib/cgpa";
const course = (id: string, credits = 3): Course => ({
  id,
  code: id,
  title: id,
  creditUnits: credits,
  plannedGrade: "A",
  semesterIndex: 0,
  status: "planned",
  planId: "main",
});
describe("semester planning", () => {
  it("keeps scenario grades out of the recorded baseline", () => {
    expect(
      actualResults(
        [course("a"), { ...course("b"), actualGrade: "C" }],
        scale,
        "replace",
      ).gpa,
    ).toBe(3);
    expect(actualResults([course("a")], scale, "replace").gpa).toBeNull();
  });
  it("uses the selected retake rule for recorded results", () => {
    const rows = [
      { ...course("a"), actualGrade: "C" },
      {
        ...course("b"),
        code: "a",
        actualGrade: "A",
        status: "retake" as const,
        semesterIndex: 1,
      },
    ];
    expect(actualResults(rows, scale, "replace").gpa).toBe(5);
    expect(actualResults(rows, scale, "all").gpa).toBe(4);
  });
  it("prioritises deadlines and excludes completed courses", () => {
    const academic = emptyAcademic();
    academic.deadlines.push({
      id: "d",
      courseId: "b",
      title: "Exam",
      kind: "exam",
      date: "2026-10-21",
      done: false,
    });
    expect(
      priorities(
        [course("a", 6), course("b", 1), { ...course("c"), actualGrade: "B" }],
        academic,
        "2026-10-20",
      ).map((p) => p.course.id),
    ).toEqual(["b", "a"]);
    academic.deadlines[0].done = true;
    expect(
      priorities([course("a", 6), course("b", 1)], academic, "2026-10-20")[0]
        .course.id,
    ).toBe("a");
  });
  it("keeps suggestions inside the available budget and seven days", () => {
    for (const budget of [5, 24, 25, 120, 840]) {
      const suggested = suggestWeek(
        [course("a"), course("b")],
        emptyAcademic(),
        "2026-12-29",
        budget,
      );
      expect(suggested.reduce((n, s) => n + s.minutes, 0)).toBeLessThanOrEqual(
        budget,
      );
      expect(
        suggested.every(
          (s) => s.minutes >= 5 && s.minutes <= 120 && s.date <= "2027-01-04",
        ),
      ).toBe(true);
      expect(new Set(suggested.map((s) => s.id)).size).toBe(suggested.length);
    }
  });
  it("returns no suggestions for missing courses or invalid time", () => {
    expect(suggestWeek([], emptyAcademic(), "2026-10-20", 120)).toEqual([]);
    expect(
      suggestWeek([course("a")], emptyAcademic(), "2026-10-20", NaN),
    ).toEqual([]);
  });
  it("handles local dates and rejects impossible calendar dates", () => {
    expect(localDate(new Date(2026, 9, 20, 0, 1).getTime())).toBe("2026-10-20");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(dateSchema.safeParse("2026-02-30").success).toBe(false);
  });
});
describe("offline review schedule", () => {
  it("brings mistakes back tomorrow and lengthens correct intervals", () => {
    let reviews = recordReview([], "q", false, 1000);
    expect(reviews[0]).toMatchObject({
      dueAt: 86401000,
      mistakes: 1,
      intervalDays: 1,
      lastCorrect: false,
    });
    reviews = recordReview(reviews, "q", true, 2000);
    expect(reviews[0]).toMatchObject({
      intervalDays: 2,
      mistakes: 1,
      lastCorrect: true,
    });
    reviews = recordReview(reviews, "q", false, 3000);
    expect(reviews).toHaveLength(1);
    expect(reviews[0]).toMatchObject({ intervalDays: 1, mistakes: 2 });
  });
  it("caps the interval and preserves other questions", () => {
    let reviews = recordReview([], "other", false, 0);
    for (let i = 0; i < 20; i++) reviews = recordReview(reviews, "q", true, i);
    expect(reviews.find((r) => r.questionId === "q")?.intervalDays).toBe(60);
    expect(reviews.find((r) => r.questionId === "other")?.mistakes).toBe(1);
  });
});
