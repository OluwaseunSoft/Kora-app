"use client";
import Link from "next/link";
import { useKora } from "./provider";
import { localDate, priorities } from "../lib/academic";

export function TodayPlan() {
  const { data, t, now } = useKora();
  const today = localDate(now());
  const next = [...data.academic.study]
    .filter((s) => !s.done)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const course = data.courses.find((c) => c.id === next?.courseId);
  const priority = priorities(data.courses, data.academic, today)[0];
  const due = data.academic.reviews.filter((r) => r.dueAt <= now()).length;
  return (
    <section className="card today-plan" aria-labelledby="today-plan-heading">
      <div>
        <p className="eyebrow">{t("yourSemester")}</p>
        <h2 id="today-plan-heading">{t("nextUsefulStep")}</h2>
        <p>
          {course && next
            ? `${course.code} · ${next.minutes} ${t("minutes")} · ${next.date}`
            : priority
              ? `${priority.course.code} · ${t(priority.urgent ? "deadlinePriority" : "creditPriority")}`
              : t("semesterEmpty")}
        </p>
        {priority?.next && (
          <p className="hint">
            {priority.next.title} · {priority.next.date}
          </p>
        )}
      </div>
      <div className="academic-actions">
        <Link className="button primary" href="/semester/">
          {t(next ? "openWeeklyPlan" : "buildSemester")}
        </Link>
        <Link className="button secondary" href="/learn/">
          {t("learn")} {due > 0 && `(${due})`}
        </Link>
      </div>
    </section>
  );
}
