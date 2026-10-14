import { describe, it, expect } from "vitest";
import { calculate, classFor, reversePlan, type Course } from "../lib/cgpa";
import scale from "../content/ng/gradingScale.json";
const c = (
  id: string,
  grade: string | null,
  units = 3,
  semesterIndex = 0,
  status: "planned" | "retake" = "planned",
  code = id,
): Course => ({
  id,
  plannedGrade: grade,
  creditUnits: units,
  semesterIndex,
  status,
  code,
  title: code,
  planId: "main",
});
describe("weighted planning", () => {
  it("ignores ungraded courses and does not round intermediate points", () => {
    expect(
      calculate([c("a", "A", 3), c("b", "C", 2), c("c", null, 20)], scale),
    ).toEqual({ points: 21, units: 5, gpa: 4.2 });
  });
  it("returns null with no graded positive credit units", () => {
    expect(calculate([], scale).gpa).toBeNull();
    expect(calculate([c("a", null), c("b", "A", 0)], scale).gpa).toBeNull();
  });
  it.each([
    [3.5, "upper"],
    [4.5, "first"],
    [2.4, "lower"],
    [3.4999, "lower"],
    [4.4999, "upper"],
    [5, "first"],
    [0, null],
  ])("classifies %s at the exact threshold", (value, label) =>
    expect(classFor(value, scale)).toBe(label),
  );
  it("replaces the original when a later graded retake matches its code", () => {
    const courses = [
      c("a", "F", 3, 0, "planned", "CSC101"),
      c("b", "B", 3, 1, "retake", "CSC101"),
    ];
    expect(calculate(courses, scale).gpa).toBe(4);
    expect(calculate(courses, scale, "all").gpa).toBe(2);
  });
  it("keeps original when a retake has no grade yet", () =>
    expect(
      calculate(
        [
          c("a", "C", 3, 0, "planned", "CSC"),
          c("b", null, 3, 1, "retake", "CSC"),
        ],
        scale,
      ).gpa,
    ).toBe(3));
  it("computes reachable target without rounding", () => {
    const p = reversePlan(20, 60, 3.5, 20, scale);
    expect(p.required).toBe(4);
    expect(p.hint).toBe("B");
    expect(p.reachable).toBe(true);
  });
  it("proposes achievable steps for a target outside remaining capacity", () => {
    const p = reversePlan(100, 200, 4.5, 20, scale);
    expect(p.reachable).toBe(false);
    expect(p.best).toBe(2.5);
    expect(p.bestClass).toBe("lower");
    expect(p.steppedTarget).toBeLessThanOrEqual(p.best!);
  });
  it("handles no remaining credits", () => {
    expect(reversePlan(0, 0, 3.5, 0, scale).required).toBeNull();
    expect(reversePlan(20, 80, 3.5, 0, scale).reachable).toBe(true);
  });
  it("rejects impossible input totals", () =>
    expect(() => reversePlan(3, 99, 4, 10, scale)).toThrow(RangeError));
});
