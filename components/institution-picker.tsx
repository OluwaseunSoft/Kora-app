"use client";
import { useState } from "react";
import { useKora } from "./provider";
import { applyInstitution, packs } from "../lib/institutions";
import defaultScale from "../content/ng/gradingScale.json";
export function InstitutionPicker() {
  const { data, update, t, notice } = useKora();
  const active = packs.find((p) => p.id === data.scale.packId);
  const [selected, setSelected] = useState(data.scale.packId ?? "");
  const [error, setError] = useState(false);
  const preview = packs.find((p) => p.id === selected);
  return (
    <details className="card academic-card institution-picker">
      <summary>
        {t("institutionRules")} ·{" "}
        {active
          ? `${active.institution} (${active.edition})`
          : t("genericRules")}
        {data.scale.customized ? ` · ${t("editedRules")}` : ""}
      </summary>
      <p>{t("institutionIntro")}</p>
      <label>
        {t("chooseInstitutionRules")}
        <select
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setError(false);
          }}
        >
          <option value="">{t("genericRules")}</option>
          {packs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.institution} · {p.programme} · {p.edition}
            </option>
          ))}
        </select>
      </label>
      {preview ? (
        <div className="institution-source">
          <h3>
            {preview.institution} · {preview.programme}
          </h3>
          <p>{preview.scope}</p>
          <p>{preview.scale.sourceNote}</p>
          <p>
            {t("sourceCompared")} {preview.source.checkedAt} ·{" "}
            {t("humanReviewPending")}
          </p>
          <p>
            {preview.source.publisher} · {preview.source.title} ·{" "}
            {t("printedPages")} {preview.source.printedPages} · {t("pdfPages")}{" "}
            {preview.source.pdfPages}
          </p>
          <a
            className="text-link"
            href={preview.source.url}
            target="_blank"
            rel="noreferrer"
          >
            {t("openHandbook")}
          </a>
        </div>
      ) : (
        <p>{defaultScale.sourceNote}</p>
      )}
      <p className="hint">{t("packApplicationNote")}</p>
      {error && <p role="alert">{t("packGradeError")}</p>}
      <button
        type="button"
        className="button secondary"
        onClick={() => {
          try {
            const next = selected
              ? applyInstitution(data, selected)
              : { ...data, scale: structuredClone(defaultScale) };
            update(() => next);
            notice(t("rulesApplied"));
          } catch {
            setError(true);
          }
        }}
      >
        {t("applyRules")}
      </button>
    </details>
  );
}
