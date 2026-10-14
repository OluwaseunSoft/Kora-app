"use client";
import { useState } from "react";
import Link from "next/link";
import { useKora } from "./provider";
import { config, weekKey } from "../lib/momentum";
import type { Settings as Prefs } from "../lib/db";
import type { CopyKey } from "../lib/i18n";
export function Settings() {
  const { data, update, t, now, demo } = useKora();
  const [confirm, setConfirm] = useState(false);
  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    update((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));
  const toggles: { key: keyof Prefs; label: CopyKey; hint?: CopyKey }[] = [
    { key: "highContrast", label: "contrast" },
    { key: "plainLanguage", label: "plain" },
    { key: "lowLiteracyMode", label: "icons" },
    { key: "ttsEnabled", label: "tts" },
    { key: "quietMode", label: "quiet", hint: "quietHint" },
    { key: "adaptiveSuggestions", label: "adaptive", hint: "adaptiveHint" },
  ];
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{t("settingsEyebrow")}</p>
        <h1>{t("settingsTitle")}</h1>
        <p className="intro">{t("settingsIntro")}</p>
      </div>
      <div className="settings-grid">
        <section className="card settings-card">
          <label>
            {t("nicknameSetting")}
            <input
              value={data.profile?.nickname ?? ""}
              maxLength={40}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  profile: s.profile
                    ? { ...s.profile, nickname: e.target.value }
                    : null,
                }))
              }
            />
          </label>
          <label>
            {t("language")}
            <select
              value={data.profile?.language ?? "en"}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  profile: s.profile
                    ? { ...s.profile, language: e.target.value as "en" | "pcm" }
                    : null,
                }))
              }
            >
              <option value="en">{t("english")}</option>
              <option value="pcm">{t("pidgin")}</option>
            </select>
          </label>
          <p className="hint">{t("translation")}</p>
          <label>
            {t("textScale")}
            <select
              value={data.settings.textScale}
              onChange={(e) => set("textScale", Number(e.target.value))}
            >
              <option value={1}>{t("standard")}</option>
              <option value={1.15}>{t("large")}</option>
              <option value={1.3}>{t("largest")}</option>
            </select>
          </label>
          {toggles.map((x) => (
            <label className="setting-toggle" key={x.key}>
              <span>
                <strong>{t(x.label)}</strong>
                {x.hint && <small>{t(x.hint)}</small>}
              </span>
              <input
                type="checkbox"
                checked={Boolean(data.settings[x.key])}
                onChange={(e) => set(x.key, e.target.checked as never)}
              />
            </label>
          ))}
          <label>
            {t("frequency")}
            <select
              value={data.settings.motivationFrequency}
              onChange={(e) =>
                set(
                  "motivationFrequency",
                  e.target.value as Prefs["motivationFrequency"],
                )
              }
            >
              {(["daily", "weekly", "off"] as const).map((x) => (
                <option key={x} value={x}>
                  {t(x)}
                </option>
              ))}
            </select>
          </label>
        </section>
        <div>
          <section className="card settings-card">
            <label>
              {t("heuristic")}
              <input
                type="number"
                min="0.5"
                max="6"
                step="0.5"
                value={data.settings.hoursPerUnit}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= 0.5 && v <= 6) set("hoursPerUnit", v);
                }}
              />
            </label>
            <label>
              {t("retakeRule")}
              <select
                value={data.settings.retakeRule}
                onChange={(e) =>
                  set("retakeRule", e.target.value as "replace" | "all")
                }
              >
                <option value="replace">{t("replace")}</option>
                <option value="all">{t("countAll")}</option>
              </select>
            </label>
            <label>
              {t("examDate")}
              <input
                type="date"
                value={data.settings.examDate}
                onChange={(e) => set("examDate", e.target.value)}
              />
            </label>
            <p className="hint">{t("examHint")}</p>
            <label>
              {t("studyTime")}
              <input
                type="time"
                value={data.settings.preferredTime}
                onChange={(e) => set("preferredTime", e.target.value)}
              />
            </label>
          </section>
          <section className="card settings-card demo-controls">
            <h2>{t("demoTitle")}</h2>
            <p className="hint">{t("demoOnly")}</p>
            <p>
              {t("demoClock")}: <strong>{data.settings.demoOffset}</strong>
            </p>
            <button
              className="button secondary"
              onClick={() =>
                update((s) => {
                  const offset = s.settings.demoOffset + 4,
                    key = weekKey(now() + 4 * 86400000),
                    grant = !s.momentum.grantedWeeks.includes(key);
                  return {
                    ...s,
                    settings: { ...s.settings, demoOffset: offset },
                    momentum: {
                      ...s.momentum,
                      restTokens:
                        s.momentum.restTokens +
                        (grant ? config.tokensPerWeek : 0),
                      grantedWeeks: grant
                        ? [...s.momentum.grantedWeeks, key]
                        : s.momentum.grantedWeeks,
                    },
                  };
                })
              }
            >
              {t("advance")}
            </button>
            <button
              className="text-button"
              onClick={() => set("demoOffset", 0)}
            >
              {t("resetClock")}
            </button>
            <button
              className="button secondary"
              onClick={() => setConfirm(true)}
            >
              {t("demo")}
            </button>
            {confirm && (
              <div className="confirmation">
                <p>{t("demoNote")}</p>
                <button
                  className="button primary"
                  onClick={() => {
                    demo();
                    setConfirm(false);
                  }}
                >
                  {t("demoConfirm")}
                </button>
                <button
                  className="text-button"
                  onClick={() => setConfirm(false)}
                >
                  {t("cancel")}
                </button>
              </div>
            )}
          </section>
          <section className="card settings-card demo-controls">
            <h2>{t("privacy")}</h2>
            <p>{t("privacyIntro")}</p>
            <Link className="button secondary" href="/privacy/">
              {t("privacy")} →
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
