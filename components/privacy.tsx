"use client";
import { useState } from "react";
import { useKora } from "./provider";
import { exportData } from "../lib/db";
import { Icon } from "./icons";
export function Privacy() {
  const { t, clear, notice, flush, guest, data, enableSaving } = useKora();
  const [confirm, setConfirm] = useState(false);
  const download = async () => {
    try {
      await flush();
      const blob = new Blob(
          [
            JSON.stringify(
              guest
                ? {
                    format: "kora-memory-export-v1",
                    exportedAt: new Date().toISOString(),
                    ...data,
                  }
                : await exportData(),
              null,
              2,
            ),
          ],
          {
            type: "application/json",
          },
        ),
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
          <h2>{t("delete")}</h2>
          <p>{t("deleteBody")}</p>
          {confirm ? (
            <div className="confirmation">
              <p>{t("deleteConfirm")}</p>
              <button
                className="button danger"
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
