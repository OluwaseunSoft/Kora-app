"use client";
import Link from "next/link";
import { useKora } from "./provider";
import { SourceBadge } from "./source-badge";
import type { Entry } from "../lib/content/schema";
import { Icon } from "./icons";
export function EntryCard({
  entry,
  featured = false,
}: {
  entry: Entry;
  featured?: boolean;
}) {
  const { data, update, t, now, notice } = useKora(),
    lang = data.profile?.language ?? "en";
  const saved = data.savedEntries.some((e) => e.libraryEntryId === entry.id),
    translation = entry.translations.find((x) => x.lang === lang);
  if (entry.verificationStatus !== "verified") return null;
  return (
    <article className={`entry-card ${featured ? "featured-entry" : ""}`}>
      <div className="entry-top">
        <span className="eyebrow">{t(entry.type)}</span>
        <button
          className={`icon-button ${saved ? "is-saved" : ""}`}
          aria-label={t(saved ? "unsave" : "save")}
          aria-pressed={saved}
          onClick={() =>
            update((s) => ({
              ...s,
              savedEntries: saved
                ? s.savedEntries.filter((x) => x.libraryEntryId !== entry.id)
                : [
                    ...s.savedEntries,
                    { libraryEntryId: entry.id, savedAt: now() },
                  ],
            }))
          }
        >
          <Icon name="library" size={20} />
        </button>
      </div>
      <h3>{entry.title[lang]}</h3>
      <p className="entry-text">{translation?.text ?? entry.text}</p>
      <p className="hint">
        {t("original")}: {entry.originalLanguage.toUpperCase()} ·{" "}
        {entry.type === "story" ? t("summaryBadge") : t("tip")}
      </p>
      {translation?.translationType === "machine" && (
        <p className="hint">{t("translationBadge")}</p>
      )}
      <SourceBadge source={entry} />
      <div className="entry-actions">
        {entry.tryThisToday && (
          <Link className="text-link" href={`/learn/${entry.tryThisToday}/`}>
            {t("tryToday")}
            <Icon name="arrow" size={17} />
          </Link>
        )}
        <button
          className="text-button muted"
          onClick={() => {
            update((s) => ({
              ...s,
              reports: [
                ...s.reports,
                { id: crypto.randomUUID(), entryId: entry.id, at: now() },
              ],
            }));
            notice(t("reportSaved"));
          }}
        >
          {t("report")}
        </button>
      </div>
    </article>
  );
}
