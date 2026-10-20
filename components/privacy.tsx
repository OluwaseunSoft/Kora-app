"use client";
import { useState } from "react";
import { useKora } from "./provider";
import { createBackup, parseBackup } from "../lib/db/backup";
import type { Snapshot } from "../lib/db";
import { Icon } from "./icons";
import { researchSummary } from "../lib/research";
export function Privacy() {
  const { t, clear, notice, flush, guest, data, enableSaving, restore, now } =
    useKora();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState<Snapshot | null>(null);
  const [importError, setImportError] = useState(false);
  const [busy, setBusy] = useState(false);
  const summary = researchSummary(data, now());
  const download = async () => {
    try {
      await flush();
      const blob = new Blob([JSON.stringify(createBackup(data), null, 2)], {
          type: "application/json",
        }),
        url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = "kora-my-data.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      notice(t("saveError"));
    }
  };
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{t("privacyEyebrow")}</p>
        <h1>{t("privacyTitle")}</h1>
        <p className="intro">{t("privacyIntro")}</p>
      </div>
      <div className="privacy-layout">
        <section className="card privacy-card">
          <h2>{t("researchSummaryTitle")}</h2>
          <p>{t("researchSummaryBody")}</p>
          {summary ? (
            <>
              <p>
                {summary.activeStudyDays} {t("studyDaysCount")} ·{" "}
                {summary.recordedStudyActions} {t("studyActionsCount")}
              </p>
              <details>
                <summary>{t("previewSummary")}</summary>
                <pre className="summary-preview">
                  {JSON.stringify(summary, null, 2)}
                </pre>
              </details>
              <button
                className="button secondary"
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([JSON.stringify(summary, null, 2)], {
                      type: "application/json",
                    }),
                  );
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "kora-study-summary.json";
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                {t("downloadStudySummary")}
              </button>
            </>
          ) : (
            <p>{t("demoSummaryExcluded")}</p>
          )}
        </section>
        <section className="card privacy-card">
          <span className="small-icon">
            <Icon name="privacy" size={30} />
          </span>
          <h2>{t("storedTitle")}</h2>
          <p>{t("storedBody")}</p>
          <p>{t("externalNote")}</p>
          {guest && (
            <div className="confirmation">
              <p>{t("consentBody")}</p>
              <button className="button primary" onClick={enableSaving}>
                {t("enableSaving")}
              </button>
            </div>
          )}
        </section>
        <section className="card privacy-card">
          <h2>{t("export")}</h2>
          <p>{t("exportBody")}</p>
          <button className="button primary" onClick={download}>
            <Icon name="download" />
            {t("export")}
          </button>
        </section>
        <section className="card privacy-card">
          <h2>{t("restoreTitle")}</h2>
          <p>{t("restoreBody")}</p>
          <label>
            {t("backupFile")}
            <input
              type="file"
              accept=".json,application/json"
              disabled={busy}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                setPending(null);
                setImportError(false);
                if (!file) return;
                try {
                  if (file.size > 10 * 1024 * 1024)
                    throw new Error("File too large");
                  setPending(parseBackup(JSON.parse(await file.text())));
                } catch {
                  setImportError(true);
                }
              }}
            />
          </label>
          {importError && <p role="alert">{t("restoreError")}</p>}
          {pending && (
            <div className="confirmation">
              <p>
                {t("restorePreview")} {pending.courses.length}{" "}
                {t("coursesCount")} · {pending.academic.deadlines.length}{" "}
                {t("deadlines")} · {pending.academic.study.length}{" "}
                {t("studySessions")}
              </p>
              <p>{t("restoreReplace")}</p>
              <button
                className="button primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await restore(createBackup(pending));
                    setPending(null);
                    notice(t("restoreSuccess"));
                  } catch {
                    setImportError(true);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {t("confirmRestore")}
              </button>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => setPending(null)}
              >
                {t("cancel")}
              </button>
            </div>
          )}
        </section>
        <section className="card privacy-card">
          <h2>{t("delete")}</h2>
          <p>{t("deleteBody")}</p>
          {confirm ? (
            <div className="confirmation">
              <p>{t("deleteConfirm")}</p>
              <button
                className="button danger"
                disabled={busy}
                onClick={() => clear().catch(() => notice(t("saveError")))}
              >
                {t("confirmDelete")}
              </button>
              <button className="text-button" onClick={() => setConfirm(false)}>
                {t("cancel")}
              </button>
            </div>
          ) : (
            <button
              className="button danger-outline"
              onClick={() => setConfirm(true)}
            >
              {t("delete")}
            </button>
          )}
        </section>
        <section className="card privacy-card">
          <h2>{t("constraints")}</h2>
          <p>{t("constraintsBody")}</p>
        </section>
      </div>
    </>
  );
}
