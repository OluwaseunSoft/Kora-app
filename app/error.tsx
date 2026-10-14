"use client";
import { useKora } from "../components/provider";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useKora();
  return (
    <div className="welcome-done" role="alert">
      <h1>{t("errorTitle")}</h1>
      <button className="button primary" onClick={reset}>
        {t("retry")}
      </button>
    </div>
  );
}
