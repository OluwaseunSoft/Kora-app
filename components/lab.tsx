"use client";
import { useState } from "react";
import { useKora } from "./provider";
import {
  calculate,
  classFor,
  reversePlan,
  weeklyHours,
  type Course,
} from "../lib/cgpa";
import type { CopyKey } from "../lib/i18n";
import templates from "../content/ng/courseTemplates.json";
import defaultScale from "../content/ng/gradingScale.json";
import { Icon } from "./icons";
export function Lab() {
  const { data, update, t } = useKora();
  const [semester, setSemester] = useState(0),
    [template, setTemplate] = useState(0),
    [remaining, setRemaining] = useState(16),
    [whatCourse, setWhatCourse] = useState(""),
    [whatGrade, setWhatGrade] = useState("A"),
    [targetType, setTargetType] = useState("cgpa"),
    [scaleError, setScaleError] = useState(false);
  const courses = data.courses.filter((c) => c.semesterIndex === semester),
    sem = calculate(courses, data.scale, "all"),
    total = calculate(data.courses, data.scale, data.settings.retakeRule),
    label = classFor(total.gpa, data.scale),
    plan = reversePlan(
      total.units,
      total.points,
      data.target,
      remaining,
      data.scale,
    );
  const maxSemester = Math.max(
    semester,
    ...data.courses.map((c) => c.semesterIndex),
    0,
  );
  const edit = (id: string, patch: Partial<Course>) =>
    update((s) => ({
      ...s,
      courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  const add = () =>
    update((s) => ({
      ...s,
      courses: [
        ...s.courses,
        {
          id: crypto.randomUUID(),
          code: "",
          title: "",
          creditUnits: 2,
          plannedGrade: null,
          status: "planned",
          semesterIndex: semester,
          planId: "main",
        },
      ],
    }));
  const what = whatCourse
    ? calculate(
        data.courses.map((c) =>
          c.id === whatCourse ? { ...c, plannedGrade: whatGrade } : c,
        ),
        data.scale,
        data.settings.retakeRule,
      ).gpa
    : null;
  const changeScale = (
    kind: "points" | "class",
    index: number,
    value: number,
  ) => {
    if (!Number.isFinite(value) || value < 0 || value > 5) {
      setScaleError(true);
      return;
    }
    const scale = structuredClone(data.scale);
    if (kind === "points") scale.bands[index].points = value;
    else scale.classes[index].minCgpa = value;
    const mins = scale.classes.map((c) => c.minCgpa);
    if (mins.some((m, i) => i > 0 && m >= mins[i - 1])) {
      setScaleError(true);
      return;
    }
    setScaleError(false);
    update((s) => ({ ...s, scale }));
  };
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{t("labEyebrow")}</p>
        <h1>{t("labTitle")}</h1>
        <p className="intro">{t("labIntro")}</p>
      </div>
      <p className="disclaimer">
        <Icon name="lab" size={18} />
        {t("estimate")}
      </p>
      <div className="lab-layout">
        <div>
          <section className="card course-card">
            <div className="section-heading">
              <h2>{t("planName")}</h2>
              <button
                className="text-button"
                onClick={() => setSemester(maxSemester + 1)}
              >
                <Icon name="plus" size={16} />
                {t("addSemester")}
              </button>
            </div>
            <div
              className="semester-tabs"
              role="group"
              aria-label={t("semester")}
            >
              {Array.from({ length: maxSemester + 1 }, (_, i) => (
                <button
                  key={i}
                  className={i === semester ? "selected" : ""}
                  aria-pressed={i === semester}
                  onClick={() => setSemester(i)}
                >
                  {t("semester")} {i + 1}
                </button>
              ))}
            </div>
            <div className="template-row">
              <label>
                {t("template")}
                <select
                  value={template}
                  onChange={(e) => setTemplate(Number(e.target.value))}
                >
                  {templates.map((x, i) => (
                    <option key={x.programme} value={i}>
                      {x.programme}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button secondary"
                onClick={() =>
                  update((s) => ({
                    ...s,
                    courses: [
                      ...s.courses,
                      ...templates[template].courses.map((c) => ({
                        ...c,
                        id: crypto.randomUUID(),
                        planId: "main",
                        semesterIndex: semester,
                        plannedGrade: null,
                        status: "planned" as const,
                      })),
                    ],
                  }))
                }
              >
                {t("loadTemplate")}
              </button>
            </div>
            <p className="hint">{t("typical")}</p>
            <div className="course-list">
              {courses.map((c) => (
                <div className="course-row" key={c.id}>
                  <label className="course-code">
                    <span>{t("course")}</span>
                    <input
                      placeholder={templates[0].courses[1].code}
                      value={c.code}
                      maxLength={24}
                      onChange={(e) => edit(c.id, { code: e.target.value })}
                    />
                  </label>
                  <label className="course-title">
                    <span>{t("courseTitle")}</span>
                    <input
                      value={c.title}
                      maxLength={100}
                      onChange={(e) => edit(c.id, { title: e.target.value })}
                    />
                  </label>
                  <label className="course-units">
                    <span>{t("units")}</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={c.creditUnits}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 1 && value <= 30)
                          edit(c.id, { creditUnits: value });
                      }}
                    />
                  </label>
                  <label className="course-grade">
                    <span>{t("grade")}</span>
                    <select
                      value={c.plannedGrade ?? ""}
                      onChange={(e) =>
                        edit(c.id, { plannedGrade: e.target.value || null })
                      }
                    >
                      <option value="">—</option>
                      {data.scale.bands.map((b) => (
                        <option key={b.grade} value={b.grade}>
                          {b.grade} · {b.points}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="retake-check">
                    <input
                      type="checkbox"
                      checked={c.status === "retake"}
                      onChange={(e) =>
                        edit(c.id, {
                          status: e.target.checked ? "retake" : "planned",
                        })
                      }
                    />
                    {t("retake")}
                  </label>
                  <button
                    className="icon-button remove-course"
                    aria-label={`${t("remove")} ${c.code}`}
                    onClick={() =>
                      update((s) => ({
                        ...s,
                        courses: s.courses.filter((x) => x.id !== c.id),
                      }))
                    }
                  >
                    <Icon name="close" size={17} />
                  </button>
                </div>
              ))}
            </div>
            <button className="add-course" onClick={add}>
              <Icon name="plus" size={18} />
              {t("addCourse")}
            </button>
            <p className="hint">{t("retakeNote")}</p>
          </section>
          <section className="card what-if">
            <h2>{t("whatIf")}</h2>
            <div className="two-fields">
              <label>
                {t("whatIfCourse")}
                <select
                  value={whatCourse}
                  onChange={(e) => setWhatCourse(e.target.value)}
                >
                  <option value="">—</option>
                  {data.courses
                    .filter((c) => c.plannedGrade)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} · {t("semester")} {c.semesterIndex + 1}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                {t("whatIfGrade")}
                <select
                  value={whatGrade}
                  onChange={(e) => setWhatGrade(e.target.value)}
                >
                  {data.scale.bands.map((b) => (
                    <option key={b.grade}>{b.grade}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="what-result">
              {t("difference")}{" "}
              <strong>
                {what !== null && total.gpa !== null
                  ? `${what - total.gpa >= 0 ? "+" : ""}${(what - total.gpa).toFixed(2)}`
                  : "—"}
              </strong>
            </p>
          </section>
          <details className="card scale-editor">
            <summary>{t("scaleTitle")}</summary>
            <p>{t("scaleNote")}</p>
            <div className="scale-grid">
              {data.scale.bands.map((b, i) => (
                <label key={b.grade}>
                  {b.grade} · {b.minScore}–{b.maxScore}
                  <input
                    aria-label={`${b.grade} ${t("points")}`}
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={b.points}
                    onChange={(e) =>
                      changeScale("points", i, Number(e.target.value))
                    }
                  />
                </label>
              ))}
            </div>
            <div className="scale-grid">
              {data.scale.classes.map((b, i) => (
                <label key={b.label}>
                  {t(b.label as CopyKey)}
                  <input
                    aria-label={`${t(b.label as CopyKey)} ${t("threshold")}`}
                    type="number"
                    min="0"
                    max="5"
                    step="0.01"
                    value={b.minCgpa}
                    onChange={(e) =>
                      changeScale("class", i, Number(e.target.value))
                    }
                  />
                </label>
              ))}
            </div>
            {scaleError && <p role="alert">{t("scaleInvalid")}</p>}
            <p className="hint">{defaultScale.sourceNote}</p>
            <a href={defaultScale.sourceUrl} target="_blank" rel="noreferrer">
              {t("readMore")} ↗
            </a>
            <button
              className="text-button"
              onClick={() => update((s) => ({ ...s, scale: defaultScale }))}
            >
              {t("resetScale")}
            </button>
          </details>
        </div>
        <aside className="lab-summary">
          <section className="cgpa-card">
            <p className="eyebrow">{t("cgpa")}</p>
            <div className="big-gpa" aria-live="polite">
              {total.gpa?.toFixed(2) ?? "—"}
              <span>/ 5.00</span>
            </div>
            <span className="class-pill">
              {t((label ?? "noClass") as CopyKey)}
            </span>
            <div className="gpa-meter" aria-hidden="true">
              <span style={{ inlineSize: `${(total.gpa ?? 0) * 20}%` }} />
            </div>
            <div className="summary-stats">
              <div>
                <span>{t("gpa")}</span>
                <strong>{sem.gpa?.toFixed(2) ?? "—"}</strong>
              </div>
              <div>
                <span>{t("gradedUnits")}</span>
                <strong>{total.units}</strong>
              </div>
            </div>
            {total.gpa === null && <p>{t("noGrades")}</p>}
          </section>
          <section className="card target-card">
            <span className="small-icon peach">
              <Icon name="spark" />
            </span>
            <h2>{t("targetTitle")}</h2>
            <p>{t("targetBody")}</p>
            <label>
              {t("targetType")}
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
              >
                <option value="cgpa">{t("byCgpa")}</option>
                <option value="class">{t("byClass")}</option>
              </select>
            </label>
            {targetType === "cgpa" ? (
              <label>
                {t("target")}
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.01"
                  value={data.target}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 0 && v <= 5) update((s) => ({ ...s, target: v }));
                  }}
                />
              </label>
            ) : (
              <label>
                {t("class")}
                <select
                  value={data.target}
                  onChange={(e) =>
                    update((s) => ({ ...s, target: Number(e.target.value) }))
                  }
                >
                  {!data.scale.classes.some(
                    (b) => b.minCgpa === data.target,
                  ) && <option value={data.target}>{data.target}</option>}
                  {data.scale.classes.map((b) => (
                    <option key={b.label} value={b.minCgpa}>
                      {t(b.label as CopyKey)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              {t("remaining")}
              <input
                type="number"
                min="0"
                max="300"
                value={remaining}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= 0 && v <= 300) setRemaining(v);
                }}
              />
            </label>
            <div className="planner-result" aria-live="polite">
              <span>{t("required")}</span>
              <strong>{plan.required?.toFixed(2) ?? "—"}</strong>
              {plan.hint && (
                <p>
                  {t("gradeHint")}: {plan.hint}
                </p>
              )}
              <p>
                {t(
                  !remaining
                    ? "noRemaining"
                    : plan.reachable
                      ? "reachable"
                      : "unreachable",
                )}
              </p>
              {!plan.reachable && (
                <p>
                  {t("best")}: {plan.best?.toFixed(2) ?? "—"} ·{" "}
                  {t((plan.bestClass ?? "noClass") as CopyKey)}
                </p>
              )}
              <p>
                {t("step")}:{" "}
                <strong className="inline-number">
                  {plan.steppedTarget?.toFixed(2) ?? "—"}
                </strong>
              </p>
            </div>
            <div className="hours-box">
              <Icon name="clock" />
              <div>
                <strong>
                  {weeklyHours(remaining, data.settings.hoursPerUnit)}
                </strong>
                <span>{t("hours")}</span>
              </div>
            </div>
            <p className="hint">{t("hoursNote")}</p>
          </section>
        </aside>
      </div>
    </>
  );
}
