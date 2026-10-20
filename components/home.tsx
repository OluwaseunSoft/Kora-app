"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useKora } from "./provider";
import { Icon } from "./icons";
import { EntryCard } from "./entry-card";
import { TodayPlan } from "./today-plan";
import { evaluateMomentum, keptWeeks, weekKey } from "../lib/momentum";
import { selectEntry } from "../lib/triggers";
import rawEntries from "../content/library/entries.json";
import type { Entry } from "../lib/content/schema";
import type { CopyKey } from "../lib/i18n";
const entries = rawEntries as Entry[];
export function Home() {
  const { data, update, t, now, notice } = useKora();
  const [dismissed, setDismissed] = useState(false);
  const clock = now(),
    examSoon =
      !!data.settings.examDate &&
      new Date(data.settings.examDate).getTime() - clock >= 0 &&
      new Date(data.settings.examDate).getTime() - clock < 14 * 86400000;
  const result = evaluateMomentum({
    now: clock,
    sessions: data.sessions,
    quietMode: data.settings.quietMode,
    adaptiveSuggestions: data.settings.adaptiveSuggestions,
    lastOfferAt: data.momentum.lastOfferAt,
    restTokens: data.momentum.restTokens,
    examSoon,
  });
  const [shownOffer] = useState(result);
  useEffect(() => {
    if (shownOffer.offer)
      update((s) => ({
        ...s,
        momentum: {
          ...s.momentum,
          lastOfferAt: clock,
          lastState: shownOffer.state,
          lastReason: shownOffer.reason,
        },
      }));
    // A latched offer is recorded once per visit, without changing it after the write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const moment =
    result.gap >= 6
      ? "return"
      : result.gap >= 3
        ? "dip"
        : examSoon
          ? "preExam"
          : data.sessions.length
            ? "milestone"
            : "firstWeek";
  useEffect(() => {
    if (data.settings.quietMode || data.settings.motivationFrequency === "off")
      return;
    const entry = selectEntry(entries, {
      moment,
      language: data.profile?.language ?? "en",
      readingLevel: 2,
      country: "NG",
      seed: Math.floor(clock / 86400000),
      recent: data.momentum.recentEntries,
      quietMode: data.settings.quietMode,
      frequency: data.settings.motivationFrequency,
      lastShownAt: data.momentum.lastEntryAt,
      now: clock,
    });
    if (entry)
      update((s) => ({
        ...s,
        momentum: {
          ...s.momentum,
          currentEntryId: entry.id,
          lastEntryAt: clock,
          recentEntries: [...s.momentum.recentEntries, entry.id].slice(-5),
        },
      }));
  }, [
    moment,
    data.settings.quietMode,
    data.settings.motivationFrequency,
    clock,
    data.momentum.lastEntryAt,
    data.momentum.recentEntries,
    data.profile?.language,
    update,
  ]);
  const entry = entries.find((e) => e.id === data.momentum.currentEntryId);
  const weeks = keptWeeks(data.sessions, data.momentum.restTokensUsed),
    thisWeek = weekKey(clock);
  const dismiss = () => {
    setDismissed(true);
    update((s) => ({
      ...s,
      momentum: {
        ...s.momentum,
        lastOfferAt: clock,
        lastState: result.state,
        lastReason: result.reason,
      },
    }));
  };
  const useRest = () => {
    if (!data.momentum.restTokens) return;
    update((s) => ({
      ...s,
      momentum: {
        ...s.momentum,
        restTokens: s.momentum.restTokens - 1,
        restTokensUsed: [...s.momentum.restTokensUsed, clock],
        lastOfferAt: clock,
        weekProgress: keptWeeks(s.sessions, [
          ...s.momentum.restTokensUsed,
          clock,
        ]),
      },
    }));
    notice(t("restUsed"));
    setDismissed(true);
  };
  const recap = data.progress.find((p) => p.status === "completed");
  return (
    <>
      <div className="page-heading home-heading">
        <div>
          <p className="eyebrow greeting">
            <Icon name="sun" size={17} />
            {t("hello")} {data.profile?.nickname}.
          </p>
          <h1>{t("homeTitle")}</h1>
          <p className="intro">{t("homeIntro")}</p>
        </div>
        <div className="chapter-badge" aria-hidden="true">
          <Icon name="leaf" size={34} />
          <span>01</span>
        </div>
      </div>
      <TodayPlan />
      {!dismissed && shownOffer.offer && (
        <section className="recovery card" aria-label={t("recoveryTitle")}>
          <div>
            <p className="eyebrow">{t("today")}</p>
            <h2>
              {t(
                shownOffer.offer === "return" ? "returnTitle" : "recoveryTitle",
              )}
            </h2>
            <p>{t("recoveryBody")}</p>
            <details>
              <summary>{t("reason")}</summary>
              <p>{t((shownOffer.reason + "Reason") as CopyKey)}</p>
              <p>{t("disableOffers")}</p>
            </details>
          </div>
          <div className="recovery-actions">
            <Link
              className="button primary"
              onClick={dismiss}
              href={
                shownOffer.offer === "return" && recap
                  ? `/learn/${recap.lessonId}/`
                  : "/learn/return/"
              }
            >
              {t(
                shownOffer.offer === "return" && recap
                  ? "recap"
                  : "startLesson",
              )}
              <Icon name="arrow" />
            </Link>
            <button
              className="button secondary"
              onClick={useRest}
              disabled={!data.momentum.restTokens}
            >
              {t("useRest")}
            </button>
            <Link className="text-link" href="/settings/">
              {t("differentTime")}
            </Link>
            <button className="text-button" onClick={dismiss}>
              {t("dismiss")}
            </button>
          </div>
        </section>
      )}
      <div className="home-grid">
        <section className="today-card">
          <div className="today-copy">
            <p className="eyebrow">{t("today")}</p>
            <h2>{t("todayTitle")}</h2>
            <p>{t("todayBody")}</p>
            <Link className="button light" href="/learn/time/">
              {t("startLesson")}
              <Icon name="arrow" size={19} />
            </Link>
            <span className="time-label">
              <Icon name="clock" size={15} />5 {t("minutes")} ·{" "}
              {t("notStarted")}
            </span>
          </div>
          <div className="today-art" aria-hidden="true">
            <div className="art-ring" />
            <div className="book-shape">
              <div />
              <div />
              <span>✳</span>
            </div>
            <span className="floating-spark">✳</span>
            <span className="art-circle" />
          </div>
        </section>
        <section className="weeks-card card">
          <div className="card-heading">
            <span className="small-icon">
              <Icon name="sun" />
            </span>
            <h2>{t("weekTitle")}</h2>
          </div>
          <p>{t("weekBody")}</p>
          <div
            className="week-cells"
            aria-label={`${weeks.length} ${t("kept")}`}
          >
            {Array.from({ length: 6 }, (_, i) => {
              const date = weekKey(clock - (5 - i) * 7 * 86400000),
                kept = weeks.includes(date);
              return (
                <span
                  className={`week-cell ${kept ? "kept" : ""} ${date === thisWeek ? "current" : ""}`}
                  key={date}
                >
                  <span>{i + 1}</span>
                  {kept ? (
                    <Icon name="check" size={19} />
                  ) : (
                    <span className="week-mark">·</span>
                  )}
                </span>
              );
            })}
          </div>
          <div className="week-total">
            <strong>{weeks.length}</strong>
            <span>{t("kept")}</span>
            <Icon name="leaf" size={22} />
          </div>
        </section>
        <section className="lab-preview card">
          <div>
            <span className="small-icon peach">
              <Icon name="lab" />
            </span>
            <p className="eyebrow">{t("lab").toUpperCase()}</p>
            <h2>{t("labTeaser")}</h2>
            <p>{t("labTeaserBody")}</p>
            <Link className="text-link" href="/lab/">
              {t("openLab")}
              <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="grade-visual" aria-hidden="true">
            <span>3.50</span>
            <div className="mini-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <small>{t("byCgpa")}</small>
          </div>
        </section>
        <section className="rest-card card">
          <div className="card-heading">
            <span className="small-icon lilac">
              <Icon name="heart" />
            </span>
            <h2>{t("restTitle")}</h2>
          </div>
          <p>{t("restBody")}</p>
          <div className="rest-bottom">
            <div className="tokens">
              <span className="token-icon">
                <Icon name="leaf" size={18} />
              </span>
              <strong>{data.momentum.restTokens}</strong>
              <span>{t("tokens")}</span>
            </div>
            <button
              className="button secondary"
              onClick={useRest}
              disabled={!data.momentum.restTokens}
            >
              {t("useRest")}
            </button>
          </div>
        </section>
      </div>
      {!data.settings.quietMode &&
        data.settings.motivationFrequency !== "off" && (
          <section className="home-library">
            <div className="section-heading">
              <h2>{t("wordTitle")}</h2>
              <Link className="text-link" href="/library/">
                {t("library")}
                <Icon name="arrow" size={17} />
              </Link>
            </div>
            {entry ? (
              <EntryCard entry={entry} featured />
            ) : (
              <div className="card neutral">
                <Icon name="spark" />
                <p>{t("neutral")}</p>
              </div>
            )}
          </section>
        )}
    </>
  );
}
