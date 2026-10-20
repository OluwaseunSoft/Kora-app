"use client";
import { useEffect, useState } from "react";
import { useKora } from "./provider";
export function OfflineDetails() {
  const { t } = useKora();
  const [info, setInfo] = useState<{
    revision: string;
    builtAt: string;
    bytes: number;
  } | null>(null);
  useEffect(() => {
    let active = true;
    const read = async () => {
      try {
        if (!("caches" in window)) return;
        const names = await caches.keys();
        const name = names.find((key) => key.startsWith("kora-v1-"));
        if (!name) return;
        const response = await (
          await caches.open(name)
        ).match("/offline-status.json");
        if (response && active) setInfo(await response.json());
      } catch {
        /* The shell's status indicator handles unavailable storage. */
      }
    };
    void read();
    navigator.serviceWorker?.addEventListener("message", read);
    return () => {
      active = false;
      navigator.serviceWorker?.removeEventListener("message", read);
    };
  }, []);
  return (
    <section className="card settings-card">
      <h2>{t("offlineDetails")}</h2>
      <p>{t("offlineContents")}</p>
      {info ? (
        <dl>
          <dt>{t("offlineVersion")}</dt>
          <dd>{info.revision}</dd>
          <dt>{t("offlineBuilt")}</dt>
          <dd>{new Date(info.builtAt).toLocaleDateString()}</dd>
          <dt>{t("offlineSize")}</dt>
          <dd>{(info.bytes / 1048576).toFixed(1)}</dd>
        </dl>
      ) : (
        <p>{t("offlineCheck")}</p>
      )}
    </section>
  );
}
