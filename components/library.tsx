"use client";
import { useState } from "react";
import { useKora } from "./provider";
import { EntryCard } from "./entry-card";
import rawEntries from "../content/library/entries.json";
import type { Entry } from "../lib/content/schema";
import type { CopyKey } from "../lib/i18n";
export function Library() {
  const { data, t } = useKora();
  const [type, setType] = useState("all"),
    [theme, setTheme] = useState("all"),
    [saved, setSaved] = useState(false);
  const entries = (rawEntries as Entry[]).filter(
    (e) =>
      e.verificationStatus === "verified" &&
      (type === "all" || e.type === type) &&
      (theme === "all" || e.themes.includes(theme)) &&
      (!saved || data.savedEntries.some((s) => s.libraryEntryId === e.id)),
  );
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{t("libraryEyebrow")}</p>
        <h1>{t("libraryTitle")}</h1>
        <p className="intro">{t("libraryIntro")}</p>
      </div>
      <div className="library-filters">
        <div className="filter-pills" role="group" aria-label={t("type")}>
          {(["all", "story", "tip", "quote", "proverb"] as const).map((key) => (
            <button
              key={key}
              className={type === key ? "selected" : ""}
              aria-pressed={type === key}
              onClick={() => setType(key)}
            >
              {t(key)}
            </button>
          ))}
        </div>
        <label className="inline-label">
          {t("theme")}
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="all">{t("all")}</option>
            {["return", "purpose", "curiosity", "rest"].map((x) => (
              <option key={x} value={x}>
                {t(("theme" + x[0].toUpperCase() + x.slice(1)) as CopyKey)}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
          />
          {t("saved")}
        </label>
      </div>
      {!entries.length ? (
        <div className="card empty-state">
          <p>{t("emptyLibrary")}</p>
          <button
            className="button secondary"
            onClick={() => {
              setType("all");
              setTheme("all");
              setSaved(false);
            }}
          >
            {t("clearFilters")}
          </button>
        </div>
      ) : (
        <div className="library-grid">
          {entries.map((e) => (
            <EntryCard key={e.id} entry={e} />
          ))}
        </div>
      )}
    </>
  );
}
