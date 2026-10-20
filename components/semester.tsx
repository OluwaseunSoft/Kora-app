"use client";
import Link from "next/link";
import { useState } from "react";
import { useKora } from "./provider";
import {
  actualResults,
  addDays,
  localDate,
  priorities,
  suggestWeek,
  type Academic,
} from "../lib/academic";
import { keptWeeks } from "../lib/momentum";
import { classFor, reversePlan } from "../lib/cgpa";
import { dictionary, type CopyKey } from "../lib/i18n";
import { InstitutionPicker } from "./institution-picker";

export function Semester() {
  const { data, update, now, t } = useKora();
  const today = localDate(now());
  const [budget, setBudget] = useState(120);
  const [remaining, setRemaining] = useState(16);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [kind, setKind] = useState<"assignment" | "exam">("assignment");
  const [sessionDate, setSessionDate] = useState(today);
  const [minutes, setMinutes] = useState(25);
  const [suggested, setSuggested] = useState<Academic["study"]>([]);
  const selectedCourse = data.courses.some((c) => c.id === courseId)
    ? courseId
    : (data.courses[0]?.id ?? "");
  const actual = actualResults(
    data.courses,
    data.scale,
    data.settings.retakeRule,
  );
  const classification = classFor(actual.gpa, data.scale);
  const classLabel = classification
    ? (dictionary(data.profile?.language ?? "en")[classification as CopyKey] ??
      classification)
    : t("noClass");
  const target = reversePlan(
    actual.units,
    actual.points,
    data.target,
    remaining,
    data.scale,
  );
  const ranked = priorities(data.courses, data.academic, today);
  const sessions = [...data.academic.study].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const week = sessions.filter(
    (s) => s.date >= today && s.date <= addDays(today, 6),
  );
  const courseName = (id: string) => {
    const c = data.courses.find((c) => c.id === id);
    return c ? `${c.code} · ${c.title}` : t("course");
  };
  const calendar = () => {
    const escape = (s: string) =>
      s
        .replaceAll("\\", "\\\\")
        .replaceAll("\n", "\\n")
        .replaceAll(",", "\\,")
        .replaceAll(";", "\\;");
    const events = [
      ...data.academic.deadlines
        .filter((d) => !d.done)
        .map((d) => ({ ...d, label: `${courseName(d.courseId)}: ${d.title}` })),
      ...sessions
        .filter((s) => !s.done)
        .map((s) => ({
          ...s,
          label: `${t("studySession")}: ${courseName(s.courseId)} (${s.minutes} ${t("minutes")})`,
        })),
    ];
    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    const content = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kora//Semester//EN",
      ...events.flatMap((event) => [
        "BEGIN:VEVENT",
        `UID:${event.id}@kora.local`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${event.date.replaceAll("-", "")}`,
        `DTEND;VALUE=DATE:${addDays(event.date, 1).replaceAll("-", "")}`,
        `SUMMARY:${escape(event.label)}`,
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "kora-semester.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{t("semesterEyebrow")}</p>
        <h1>{t("semesterTitle")}</h1>
        <p className="intro">{t("semesterIntro")}</p>
      </div>
      <p className="disclaimer">{t("estimate")}</p>
      <InstitutionPicker />
      <div className="academic-grid">
        <section className="card academic-card">
          <h2>{t("actualResults")}</h2>
          <p>{t("actualNote")}</p>
          <p className="academic-stat">
            {actual.gpa === null ? "—" : actual.gpa.toFixed(2)}{" "}
            <small>{actual.gpa === null ? t("noActual") : classLabel}</small>
          </p>
          {!data.courses.length && <p>{t("semesterEmpty")}</p>}
          {data.courses.map((c) => (
            <label className="academic-row" key={c.id}>
              <span>
                {c.code} · {c.title}{" "}
                <small>
                  {t("semester")} {c.semesterIndex + 1} · {c.creditUnits}{" "}
                  {t("units")}
                </small>
              </span>
              <select
                aria-label={`${t("actualGrade")} ${c.code}`}
                value={c.actualGrade ?? ""}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    courses: s.courses.map((v) =>
                      v.id === c.id
                        ? { ...v, actualGrade: e.target.value || null }
                        : v,
                    ),
                  }))
                }
              >
                <option value="">{t("notGraded")}</option>
                {data.scale.bands.map((b) => (
                  <option key={b.grade} value={b.grade}>
                    {b.grade}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <Link className="button secondary" href="/lab/">
            {t("manageCourses")}
          </Link>
        </section>
        <section className="card academic-card">
          <h2>{t("targetToPlan")}</h2>
          <div className="two-fields">
            <label>
              {t("targetCgpa")}
              <input
                type="number"
                min="0"
                max={data.scale.maxPoints}
                step="0.01"
                value={data.target}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n) && n >= 0 && n <= data.scale.maxPoints)
                    update((s) => ({ ...s, target: n }));
                }}
              />
            </label>
            <label>
              {t("remainingCredits")}
              <input
                type="number"
                min="1"
                max="500"
                value={remaining}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isInteger(n) && n > 0 && n <= 500) setRemaining(n);
                }}
              />
            </label>
          </div>
          <p>{t("actualBaseline")}</p>
          <p role="status">
            {target.reachable
              ? `${t("requiredAverage")} ${target.required?.toFixed(2)}`
              : t("targetStep")}
          </p>
          <p className="hint">{t("priorityReason")}</p>
          <ol>
            {ranked.slice(0, 3).map(({ course, urgent }) => (
              <li key={course.id}>
                {course.code} · {course.creditUnits} {t("units")} —{" "}
                {t(urgent ? "deadlinePriority" : "creditPriority")}
              </li>
            ))}
          </ol>
          <label>
            {t("weeklyBudget")}
            <input
              type="number"
              min="5"
              max="840"
              step="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </label>
          <button
            className="button primary"
            disabled={
              !ranked.length ||
              !Number.isInteger(budget) ||
              budget < 5 ||
              budget > 840
            }
            onClick={() =>
              setSuggested(
                suggestWeek(data.courses, data.academic, today, budget),
              )
            }
          >
            {t("suggestWeek")}
          </button>
          {!!suggested.length && (
            <div className="confirmation">
              <h3>{t("previewSessions")}</h3>
              <p>{t("suggestedReady")}</p>
              <ul>
                {suggested.map((s) => (
                  <li key={s.id}>
                    {courseName(s.courseId)} · {s.date} · {s.minutes}{" "}
                    {t("minutes")}
                  </li>
                ))}
              </ul>
              <button
                className="button primary"
                onClick={() => {
                  update((s) => ({
                    ...s,
                    academic: {
                      ...s.academic,
                      study: [
                        ...s.academic.study,
                        ...suggested.filter((v) =>
                          s.courses.some((c) => c.id === v.courseId),
                        ),
                      ],
                    },
                  }));
                  setSuggested([]);
                }}
              >
                {t("addSuggested")}
              </button>
              <button className="text-button" onClick={() => setSuggested([])}>
                {t("cancel")}
              </button>
            </div>
          )}
          <p className="hint">{t("allocationNote")}</p>
        </section>
        <section className="card academic-card">
          <h2>{t("deadlines")}</h2>
          <form
            className="academic-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedCourse || !title.trim()) return;
              update((s) => ({
                ...s,
                academic: {
                  ...s.academic,
                  deadlines: [
                    ...s.academic.deadlines,
                    {
                      id: crypto.randomUUID(),
                      courseId: selectedCourse,
                      title: title.trim(),
                      date,
                      kind,
                      done: false,
                    },
                  ],
                },
              }));
              setTitle("");
            }}
          >
            <label>
              {t("course")}
              <select
                required
                value={selectedCourse}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="" disabled>
                  {t("chooseCourse")}
                </option>
                {data.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("deadlineTitle")}
              <input
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <div className="two-fields">
              <label>
                {t("date")}
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                {t("assessmentKind")}
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value as typeof kind)}
                >
                  <option value="assignment">{t("assignment")}</option>
                  <option value="exam">{t("exam")}</option>
                </select>
              </label>
            </div>
            <button className="button secondary" disabled={!selectedCourse}>
              {t("addDeadline")}
            </button>
          </form>
          <ul className="academic-list">
            {[...data.academic.deadlines]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((d) => (
                <li key={d.id}>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={d.done}
                      onChange={() =>
                        update((s) => ({
                          ...s,
                          academic: {
                            ...s.academic,
                            deadlines: s.academic.deadlines.map((v) =>
                              v.id === d.id ? { ...v, done: !v.done } : v,
                            ),
                          },
                        }))
                      }
                    />
                    <span>
                      {d.title}
                      <small>
                        {courseName(d.courseId)} · {d.date} · {t(d.kind)}
                        {!d.done && d.date < today ? ` · ${t("overdue")}` : ""}
                      </small>
                    </span>
                  </label>
                  <button
                    className="text-button"
                    aria-label={`${t("removeItem")} ${d.title}`}
                    onClick={() =>
                      update((s) => ({
                        ...s,
                        academic: {
                          ...s.academic,
                          deadlines: s.academic.deadlines.filter(
                            (v) => v.id !== d.id,
                          ),
                        },
                      }))
                    }
                  >
                    {t("removeItem")}
                  </button>
                </li>
              ))}
          </ul>
          {!data.academic.deadlines.length && <p>{t("noDeadlines")}</p>}
        </section>
        <section className="card academic-card">
          <h2>{t("weeklyPlan")}</h2>
          <p>
            {today} — {addDays(today, 6)}
          </p>
          <p>
            {week.filter((s) => s.done).reduce((n, s) => n + s.minutes, 0)} /{" "}
            {week.reduce((n, s) => n + s.minutes, 0)} {t("plannedMinutes")}
          </p>
          <form
            className="academic-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedCourse) return;
              update((s) => ({
                ...s,
                academic: {
                  ...s.academic,
                  study: [
                    ...s.academic.study,
                    {
                      id: crypto.randomUUID(),
                      courseId: selectedCourse,
                      date: sessionDate,
                      minutes,
                      done: false,
                    },
                  ],
                },
              }));
            }}
          >
            <label>
              {t("course")}
              <select
                required
                value={selectedCourse}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="" disabled>
                  {t("chooseCourse")}
                </option>
                {data.courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="two-fields">
              <label>
                {t("date")}
                <input
                  required
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
              </label>
              <label>
                {t("minutes")}
                <input
                  required
                  type="number"
                  min="5"
                  max="480"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                />
              </label>
            </div>
            <button className="button secondary" disabled={!selectedCourse}>
              {t("addSession")}
            </button>
          </form>
          <ul className="academic-list">
            {sessions.map((session) => (
              <li key={session.id}>
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={session.done}
                    onChange={() =>
                      update((s) => {
                        const sessions = s.sessions.filter(
                          (v) => v.id !== `study-${session.id}`,
                        );
                        if (!session.done)
                          sessions.push({
                            id: `study-${session.id}`,
                            startedAt: now(),
                            durationSec: session.minutes * 60,
                            lessonsTouched: [],
                            quizzesSkipped: 0,
                          });
                        return {
                          ...s,
                          sessions,
                          momentum: {
                            ...s.momentum,
                            weekProgress: keptWeeks(
                              sessions,
                              s.momentum.restTokensUsed,
                            ),
                          },
                          academic: {
                            ...s.academic,
                            study: s.academic.study.map((v) =>
                              v.id === session.id ? { ...v, done: !v.done } : v,
                            ),
                          },
                        };
                      })
                    }
                  />
                  <span>
                    {courseName(session.courseId)}
                    <small>
                      {session.minutes} {t("minutes")}
                    </small>
                  </span>
                </label>
                <label className="sr-only" htmlFor={`date-${session.id}`}>
                  {t("reschedule")} {courseName(session.courseId)}
                </label>
                <input
                  id={`date-${session.id}`}
                  required
                  type="date"
                  value={session.date}
                  onChange={(e) => {
                    if (e.target.value)
                      update((s) => ({
                        ...s,
                        academic: {
                          ...s.academic,
                          study: s.academic.study.map((v) =>
                            v.id === session.id
                              ? { ...v, date: e.target.value }
                              : v,
                          ),
                        },
                      }));
                  }}
                />
                <button
                  className="text-button"
                  aria-label={`${t("removeItem")} ${courseName(session.courseId)} ${session.date}`}
                  onClick={() =>
                    update((s) => ({
                      ...s,
                      academic: {
                        ...s.academic,
                        study: s.academic.study.filter(
                          (v) => v.id !== session.id,
                        ),
                      },
                    }))
                  }
                >
                  {t("removeItem")}
                </button>
              </li>
            ))}
          </ul>
          {!sessions.length && <p>{t("noSessions")}</p>}
          <button className="button secondary" onClick={calendar}>
            {t("exportCalendar")}
          </button>
          <p className="hint">{t("calendarNote")}</p>
        </section>
      </div>
    </>
  );
}
