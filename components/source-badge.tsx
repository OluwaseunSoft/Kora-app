"use client";
import type { z } from "zod";
import type { sourceSchema } from "../lib/content/schema";
import { useKora } from "./provider";
import { Icon } from "./icons";
export function SourceBadge({
  source,
}: {
  source: z.infer<typeof sourceSchema>;
}) {
  const { t } = useKora();
  return (
    <details className="source-badge">
      <summary>
        <Icon name="check" size={14} />
        {t("verified")} <span>· {source.author}</span>
      </summary>
      <div className="source-details">
        <p>
          <strong>{source.sourceWork}</strong> · {source.year}
        </p>
        <p>{source.license}</p>
        <p>
          {source.verifiedBy} · {source.verifiedAt}
        </p>
        <p className="hint">{t("review")}</p>
        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
          {t("readMore")} ↗
        </a>
      </div>
    </details>
  );
}
