"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useKora } from "./provider";
import { Icon } from "./icons";
import { SourceBadge } from "./source-badge";
import rawLessons from "../content/lessons/lessons.json";
import rawQuizzes from "../content/lessons/quizzes.json";
import type { Lesson, Quiz } from "../lib/content/schema";
import { keptWeeks, weekKey, config } from "../lib/momentum";
export const lessons = rawLessons as Lesson[],
  quizzes = rawQuizzes as Quiz[];
const lessonIcons = [
  "clock",
  "learn",
  "library",
  "lab",
  "spark",
  "heart",
  "leaf",
  "library",
  "sun",
  "wifi",
];
export function Learn() {
  const { data, t } = useKora(),
    lang = data.profile?.language ?? "en";
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{t("learnEyebrow")}</p>
        <h1>{t("learnTitle")}</h1>
        <p className="intro">{t("learnIntro")}</p>
      </div>
      <div className="lesson-grid">
        {lessons.map((l, i) => {
          const done = data.progress.some(
            (p) => p.lessonId === l.id && p.status === "completed",
          );
          return (
            <Link
              className="card lesson-card"
              href={`/learn/${l.id}/`}
              key={l.id}
            >
              <div className="lesson-card-top">
                <span
                  className={`small-icon ${i % 3 === 1 ? "peach" : i % 3 === 2 ? "lilac" : ""}`}
                >
                  <Icon name={lessonIcons[i]} size={26} />
                </span>
                <span className="lesson-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h2>{l.title[lang]}</h2>
              <p>{l.description[lang]}</p>
              <div className="lesson-card-footer">
                <span>
                  <Icon name="clock" size={14} />
                  {l.estimatedMinutes} {t("minutes")}
                </span>
                <span className={done ? "completion" : ""}>
                  {done && <Icon name="check" size={14} />}{" "}
                  {t(done ? "completed" : "notStarted")}
                  <Icon name="arrow" size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
export function LessonReader({ id }: { id: string }) {
  const router = useRouter();
  const { data, update, t, now, notice } = useKora(),
    lang = data.profile?.language ?? "en";
  const lesson = lessons.find((l) => l.id === id)!;
  const items = quizzes.filter((q) => q.lessonId === id);
  const [index, setIndex] = useState(0),
    [selected, setSelected] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [results, setResults] = useState<boolean[]>([]),
    [finished, setFinished] = useState(false),
    [speaking, setSpeaking] = useState(false),
    [ttsError, setTtsError] = useState(false),
    [answerError, setAnswerError] = useState(false);
  const started = useRef(Date.now()),
    heading = useRef<HTMLHeadingElement>(null);
  const current = items[index];
  useEffect(() => {
    started.current = Date.now();
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [id]);
  const speak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!("speechSynthesis" in window)) {
      setTtsError(true);
      return;
    }
    const voices = window.speechSynthesis
      .getVoices()
      .filter((v) => v.localService && v.lang.toLowerCase().startsWith("en"));
    if (!voices.length) {
      setTtsError(true);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      [
        lesson.title[lang],
        ...lesson.sections.map((s) =>
          data.settings.plainLanguage ? s.simple[lang] : s.text[lang],
        ),
      ].join(". "),
    );
    utterance.voice = voices[0];
    utterance.lang = voices[0].lang;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setTtsError(true);
    };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  const record = (complete: boolean) => {
    const at = now(),
      session = {
        id: crypto.randomUUID(),
        startedAt: at,
        durationSec: Math.max(
          1,
          Math.round((Date.now() - started.current) / 1000),
        ),
        lessonsTouched: [id],
        quizzesSkipped: complete ? 0 : 1,
      };
    update((s) => {
      const existing = s.progress.find((p) => p.lessonId === id);
      const progress = {
        lessonId: id,
        status: complete
          ? ("completed" as const)
          : (existing?.status ?? ("started" as const)),
        completedAt: complete ? at : (existing?.completedAt ?? null),
        quizResults: complete
          ? [
              ...(existing?.quizResults ?? []),
              {
                at,
                score: results.filter(Boolean).length,
                total: items.length,
              },
            ]
          : (existing?.quizResults ?? []),
      };
      const sessions = [...s.sessions, session],
        key = weekKey(at),
        grant = !s.momentum.grantedWeeks.includes(key);
      return {
        ...s,
        progress: [...s.progress.filter((p) => p.lessonId !== id), progress],
        sessions,
        momentum: {
          ...s.momentum,
          weekProgress: keptWeeks(sessions, s.momentum.restTokensUsed),
          restTokens:
            s.momentum.restTokens + (grant ? config.tokensPerWeek : 0),
          grantedWeeks: grant
            ? [...s.momentum.grantedWeeks, key]
            : s.momentum.grantedWeeks,
        },
      };
    });
    notice(t(complete ? "lessonSaved" : "progressSaved"));
    if (complete) router.push("/home/");
  };
  const reset = () => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setResults([]);
    setFinished(false);
    setAnswerError(false);
  };
  return (
    <article className="reader">
      <Link className="text-link back-link" href="/learn/">
        ← {t("lessonBack")}
      </Link>
      <p className="eyebrow">
        {t("learnEyebrow")} · {lesson.estimatedMinutes} {t("minutes")}
      </p>
      <h1>{lesson.title[lang]}</h1>
      <p className="intro">{lesson.description[lang]}</p>
      <div className="reader-tools">
        {data.settings.ttsEnabled && (
          <button className="button secondary" onClick={speak}>
            <Icon name="volume" size={18} />
            {t(speaking ? "stop" : "listen")}
          </button>
        )}
        <span className="hint">{t("ttsNote")}</span>
      </div>
      {ttsError && <p role="status">{t("ttsUnavailable")}</p>}
      {lang === "pcm" && (
        <p className="translation-note">{t("translationBadge")}</p>
      )}
      <div className="reader-body">
        {lesson.sections.map((section) => (
          <section key={section.id}>
            <h2>{section.heading[lang]}</h2>
            <p>
              {data.settings.plainLanguage
                ? section.simple[lang]
                : section.text[lang]}
            </p>
          </section>
        ))}
      </div>
      <section className="reader-sources">
        <h2>{t("sources")}</h2>
        {lesson.sources.map((src) => (
          <SourceBadge key={src.sourceUrl} source={src} />
        ))}
      </section>
      <section className="card quiz-card" aria-label={t("practice")}>
        <div className="section-heading">
          <h2>{t("practice")}</h2>
          <span className="quiz-count">
            {index + 1} / {items.length}
          </span>
        </div>
        <p>{t("quizIntro")}</p>
        {finished ? (
          <div className="quiz-finish">
            <span className="small-icon">
              <Icon name="check" size={30} />
            </span>
            <h3>{t("quizDone")}</h3>
            <p>
              {t("score")}: {results.filter(Boolean).length} / {items.length}
            </p>
            <button className="button primary" onClick={() => record(true)}>
              {t("finish")}
              <Icon name="check" />
            </button>
            <button className="text-button" onClick={reset}>
              {t("tryAgain")}
            </button>
          </div>
        ) : (
          <>
            <h3 ref={heading} tabIndex={-1}>
              {current.prompt[lang]}
            </h3>
            <fieldset className="quiz-options">
              <legend className="sr-only">{current.prompt[lang]}</legend>
              {current.options.map((option, i) => (
                <label
                  className={`quiz-option ${selected === i ? "selected" : ""} ${checked && i === current.correctIndex ? "answer-correct" : ""}`}
                  key={i}
                >
                  <input
                    type="radio"
                    name={`quiz-${current.id}`}
                    value={i}
                    checked={selected === i}
                    disabled={checked}
                    onChange={() => {
                      setSelected(i);
                      setAnswerError(false);
                    }}
                  />
                  <span className="option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{option[lang]}</span>
                  {checked && i === current.correctIndex && (
                    <Icon name="check" />
                  )}
                </label>
              ))}
            </fieldset>
            {answerError && <p role="alert">{t("chooseAnswer")}</p>}
            {checked && (
              <div className="quiz-feedback" role="status">
                <strong>
                  {t(
                    selected === current.correctIndex ? "correct" : "incorrect",
                  )}
                </strong>
                <p>{current.explanation[lang]}</p>
                <SourceBadge source={current.source} />
              </div>
            )}
            <div className="quiz-actions">
              {checked ? (
                <button
                  className="button primary"
                  onClick={() => {
                    if (index === items.length - 1) setFinished(true);
                    else {
                      setIndex(index + 1);
                      setChecked(false);
                      setSelected(null);
                      setTimeout(() => heading.current?.focus(), 0);
                    }
                  }}
                >
                  {t("next")}
                  <Icon name="arrow" />
                </button>
              ) : (
                <button
                  className="button primary"
                  onClick={() => {
                    if (selected === null) {
                      setAnswerError(true);
                      return;
                    }
                    setChecked(true);
                    setResults([...results, selected === current.correctIndex]);
                  }}
                >
                  {t("check")}
                </button>
              )}
              <Link
                className="text-link muted"
                href="/home/"
                onClick={() => record(false)}
              >
                {t("skipQuiz")}
              </Link>
            </div>
          </>
        )}
      </section>
    </article>
  );
}
