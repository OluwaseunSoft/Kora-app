"use client";
import { useEffect, useRef, useState } from "react";
import { useKora } from "./provider";
import { SourceBadge } from "./source-badge";
import { recordReview } from "../lib/academic";
import { keptWeeks } from "../lib/momentum";
import rawQuizzes from "../content/lessons/quizzes.json";
import type { Quiz } from "../lib/content/schema";
const questions = rawQuizzes as Quiz[];

export function Practice() {
  const { data, update, now, t } = useKora();
  const lang = data.profile?.language ?? "en";
  const [queue, setQueue] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [index, setIndex] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const practiceSession = useRef({ id: "", startedAt: 0 });
  const at = now();
  const due = questions.filter((q) =>
    data.academic.reviews.some((r) => r.questionId === q.id && r.dueAt <= at),
  );
  const mistakes = questions.filter((q) =>
    data.academic.reviews.some((r) => r.questionId === q.id && !r.lastCorrect),
  );
  const start = (items: Quiz[]) => {
    practiceSession.current = { id: crypto.randomUUID(), startedAt: now() };
    setQueue(items.map((q) => q.id));
    setIndex(0);
    setChecked(false);
    setSelected(null);
  };
  const current = questions.find((q) => q.id === queue?.[index]);
  useEffect(() => {
    if (current) heading.current?.focus();
  }, [current]);
  return (
    <section
      className="card academic-card practice-panel"
      aria-labelledby="practice-heading"
    >
      <h2 id="practice-heading">{t("practiceTitle")}</h2>
      <p>{t("practiceIntro")}</p>
      <p>
        {due.length} {t("reviewsDue")} · {mistakes.length}{" "}
        {t("mistakesToReview")}
      </p>
      {queue === null ? (
        <div className="academic-actions">
          <button
            className="button primary"
            disabled={!due.length}
            onClick={() => start(due)}
          >
            {t("reviewDue")}
          </button>
          <button
            className="button secondary"
            disabled={!mistakes.length}
            onClick={() => start(mistakes)}
          >
            {t("reviewMistakes")}
          </button>
          <button className="button secondary" onClick={() => start(questions)}>
            {t("practiceAll")}
          </button>
        </div>
      ) : current ? (
        <>
          <p>
            {index + 1} / {queue.length}
          </p>
          <h3 ref={heading} tabIndex={-1}>
            {current.prompt[lang]}
          </h3>
          <fieldset className="quiz-options">
            <legend className="sr-only">{current.prompt[lang]}</legend>
            {current.options.map((option, i) => (
              <label
                className={`quiz-option ${checked && i === current.correctIndex ? "answer-correct" : ""}`}
                key={i}
              >
                <input
                  type="radio"
                  name={`review-${current.id}`}
                  checked={selected === i}
                  disabled={checked}
                  onChange={() => setSelected(i)}
                />
                {option[lang]}
              </label>
            ))}
          </fieldset>
          {checked && (
            <div className="quiz-feedback" role="status">
              <strong>
                {t(selected === current.correctIndex ? "correct" : "incorrect")}
              </strong>
              <p>
                {t("correctAnswer")}{" "}
                {current.options[current.correctIndex][lang]}
              </p>
              <p>{current.explanation[lang]}</p>
              <p>{t("reviewTomorrow")}</p>
              <SourceBadge source={current.source} />
            </div>
          )}
          <div className="academic-actions">
            <button
              className="button primary"
              disabled={!checked && selected === null}
              onClick={() => {
                if (checked) {
                  setIndex(index + 1);
                  setChecked(false);
                  setSelected(null);
                } else {
                  setChecked(true);
                  const at = now();
                  const session = {
                    ...practiceSession.current,
                    durationSec: Math.max(
                      1,
                      Math.round(
                        (at - practiceSession.current.startedAt) / 1000,
                      ),
                    ),
                    lessonsTouched: [current.lessonId],
                    quizzesSkipped: 0,
                  };
                  update((s) => {
                    const sessions = [
                      ...s.sessions.filter((v) => v.id !== session.id),
                      session,
                    ];
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
                        reviews: recordReview(
                          s.academic.reviews,
                          current.id,
                          selected === current.correctIndex,
                          at,
                        ),
                      },
                    };
                  });
                }
              }}
            >
              {t(checked ? "next" : "check")}
            </button>
            <button className="text-button" onClick={() => setQueue(null)}>
              {t("finishPractice")}
            </button>
          </div>
        </>
      ) : (
        <div role="status">
          <p>{t("practiceComplete")}</p>
          <button className="button secondary" onClick={() => setQueue(null)}>
            {t("continue")}
          </button>
        </div>
      )}
    </section>
  );
}
