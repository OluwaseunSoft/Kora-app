export interface TriggerEntry {
  id: string;
  verificationStatus: string;
  moments: string[];
  themes: string[];
  country: string[];
  readingLevel: number;
  originalLanguage: string;
  translations: { lang: string }[];
}
export function selectEntry<T extends TriggerEntry>(
  entries: T[],
  options: {
    moment: string;
    theme?: string;
    language: string;
    readingLevel: number;
    country: string;
    seed: number;
    recent?: string[];
    quietMode: boolean;
    frequency: "off" | "daily" | "weekly";
    lastShownAt?: number | null;
    now?: number;
  },
) {
  if (options.quietMode || options.frequency === "off") return null;
  if (
    options.lastShownAt != null &&
    options.now != null &&
    options.now - options.lastShownAt <
      (options.frequency === "weekly" ? 7 : 1) * 86400000
  )
    return null;
  const matches = entries.filter(
    (e) =>
      e.verificationStatus === "verified" &&
      e.moments.includes(options.moment) &&
      (!options.theme || e.themes.includes(options.theme)) &&
      e.country.includes(options.country) &&
      e.readingLevel <= options.readingLevel &&
      (e.originalLanguage === options.language ||
        e.translations.some((t) => t.lang === options.language)),
  );
  const fresh = matches.filter((e) => !options.recent?.includes(e.id));
  const pool = fresh.length ? fresh : matches;
  return pool.length
    ? pool[((options.seed % pool.length) + pool.length) % pool.length]
    : null;
}
