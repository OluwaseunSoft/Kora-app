"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { defaultSettings, emptyMomentum, type Snapshot } from "../lib/db/state";
import { loadSnapshot, saveSnapshot, deleteAll } from "../lib/db/lazy";
import scale from "../content/ng/gradingScale.json";
import templates from "../content/ng/courseTemplates.json";
import { dictionary, type CopyKey } from "../lib/i18n";
import { createClock, weekKey, config } from "../lib/momentum";
import { Icon } from "./icons";
import { emptyAcademic } from "../lib/academic";
type Context = {
  data: Snapshot;
  update: (change: (s: Snapshot) => Snapshot) => void;
  t: (key: CopyKey) => string;
  now: () => number;
  notice: (message: string) => void;
  demo: () => void;
  clear: () => Promise<void>;
  flush: () => Promise<void>;
  guest: boolean;
  useWithoutSaving: () => void;
  enableSaving: () => void;
  restoring: boolean;
  restore: (input: unknown) => Promise<void>;
};
const KoraContext = createContext<Context | null>(null);
export const useKora = () => {
  const ctx = useContext(KoraContext);
  if (!ctx) throw Error("Kora provider missing");
  return ctx;
};
export function KoraProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Snapshot | null>(() => ({
      profile: null,
      academic: emptyAcademic(),
      settings: { ...defaultSettings },
      courses: [],
      progress: [],
      sessions: [],
      momentum: emptyMomentum(),
      savedEntries: [],
      target: 3.5,
      scale,
      reports: [],
    })),
    [error, setError] = useState(false),
    [saveError, setSaveError] = useState(false),
    [message, setMessage] = useState(""),
    [online, setOnline] = useState(true),
    [offlineReady, setOfflineReady] = useState(false),
    [offlineFailed, setOfflineFailed] = useState(false);
  const [guest, setGuest] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const pathname = usePathname();
  const saveQueue = useRef(Promise.resolve());
  const loaded = useRef(false);
  const generation = useRef(0);
  const replacing = useRef(false);
  const boot = useCallback(() => {
    setError(false);
    setRestoring(true);
    loadSnapshot(scale)
      .then((s) => {
        const key = weekKey(createClock(s.settings.demoOffset).now());
        if (!s.momentum.grantedWeeks.length) s.momentum.grantedWeeks = [key];
        else if (!s.momentum.grantedWeeks.includes(key)) {
          s.momentum.restTokens += config.tokensPerWeek;
          s.momentum.grantedWeeks.push(key);
        }
        setData(s);
        loaded.current = true;
        setRestoring(false);
      })
      .catch(() => {
        setError(true);
        setRestoring(false);
      });
  }, []);
  useEffect(() => {
    boot();
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(async (reg) => {
          if ((await caches.keys()).some((key) => key.startsWith("kora-v1-")))
            setOfflineReady(true);
          reg.active?.postMessage({ type: "READY_CHECK" });
        })
        .catch(() => setOfflineFailed(true));
    else setOfflineFailed(true);
    const ready = (e: MessageEvent) => {
      if (e.data?.type === "OFFLINE_READY") setOfflineReady(true);
    };
    navigator.serviceWorker?.addEventListener("message", ready);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      navigator.serviceWorker?.removeEventListener("message", ready);
    };
  }, [boot]);
  useEffect(() => {
    if (!data || !loaded.current || !data.settings.consentAcceptedAt) return;
    const ticket = generation.current;
    saveQueue.current = saveQueue.current
      .catch(() => {})
      .then(async () => {
        if (ticket === generation.current) {
          await saveSnapshot(data);
          setSaveError(false);
        }
      })
      .catch(() => setSaveError(true));
  }, [data]);
  useEffect(() => {
    if (!data) return;
    document.documentElement.lang = data.profile?.language ?? "en";
    document.documentElement.style.setProperty(
      "--text-scale",
      String(data.settings.textScale),
    );
    document.documentElement.dataset.contrast = String(
      data.settings.highContrast,
    );
  }, [data]);
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timeout);
  }, [message]);
  const t = useCallback(
    (key: CopyKey) => dictionary(data?.profile?.language ?? "en")[key],
    [data?.profile?.language],
  );
  const update = useCallback(
    (change: (s: Snapshot) => Snapshot) =>
      setData((previous) =>
        previous && !replacing.current ? change(previous) : previous,
      ),
    [],
  );
  if (error)
    return (
      <main className="loading">
        <Icon name="leaf" size={40} />
        <h1>{t("storageError")}</h1>
        <button onClick={boot}>{t("retry")}</button>
      </main>
    );
  if (!data)
    return (
      <main className="loading">
        <span className="brand">
          kora<span>✳</span>
        </span>
        <p>{t("loading")}</p>
      </main>
    );
  const demo = () => {
    const now = Date.now(),
      key = weekKey(now);
    generation.current++;
    setData({
      academic: emptyAcademic(),
      profile: {
        id: "me",
        nickname: "Tunde",
        language: data.profile?.language ?? "en",
        createdAt: now,
        optionalFields: { koraDemo: "true" },
      },
      settings: { ...defaultSettings, consentAcceptedAt: guest ? null : now },
      courses: templates[0].courses.map((c, i) => ({
        ...c,
        id: crypto.randomUUID(),
        semesterIndex: 0,
        plannedGrade: ["B", "C", "B", "C", "A", "C"][i],
        status: "planned",
        planId: "main",
      })),
      target: 3.5,
      scale,
      progress: [
        {
          lessonId: "notes",
          status: "completed",
          completedAt: now - 86400000,
          quizResults: [],
        },
      ],
      sessions: [
        {
          id: crypto.randomUUID(),
          startedAt: now,
          durationSec: 300,
          lessonsTouched: ["notes"],
          quizzesSkipped: 0,
        },
      ],
      savedEntries: [],
      reports: [],
      momentum: { ...emptyMomentum(), grantedWeeks: [key] },
    });
  };
  const clear = async () => {
    generation.current++;
    await saveQueue.current.catch(() => {});
    await deleteAll();
    loaded.current = false;
    setGuest(false);
    setData({
      academic: emptyAcademic(),
      profile: null,
      settings: { ...defaultSettings },
      courses: [],
      target: 3.5,
      scale,
      progress: [],
      sessions: [],
      savedEntries: [],
      reports: [],
      momentum: emptyMomentum(),
    });
    loaded.current = true;
  };
  const accepted = !!data.settings.consentAcceptedAt || guest;
  const flush = async () => {
    await saveQueue.current;
    if (data.settings.consentAcceptedAt) await saveSnapshot(data);
  };
  return (
    <KoraContext.Provider
      value={{
        data,
        update,
        t,
        now: () => createClock(data.settings.demoOffset).now(),
        notice: setMessage,
        demo,
        clear,
        flush,
        guest,
        restoring,
        restore: async (input) => {
          if (replacing.current) throw new Error("Restore in progress");
          const { parseBackup } = await import("../lib/db/backup");
          const restored = parseBackup(input);
          restored.settings.consentAcceptedAt = guest
            ? null
            : data.settings.consentAcceptedAt;
          replacing.current = true;
          generation.current++;
          try {
            await saveQueue.current.catch(() => {});
            if (!guest && restored.settings.consentAcceptedAt)
              await saveSnapshot(restored);
            setData(restored);
          } finally {
            replacing.current = false;
          }
        },
        useWithoutSaving: () => setGuest(true),
        enableSaving: () => {
          update((s) => ({
            ...s,
            settings: { ...s.settings, consentAcceptedAt: Date.now() },
          }));
          setGuest(false);
        },
      }}
    >
      <a className="skip-link" href="#main">
        {t("skip")}
      </a>
      <div className="app-shell">
        {accepted && (
          <aside className="sidebar">
            <Link className="brand" href="/home/" aria-label={t("brand")}>
              kora<span>✳</span>
            </Link>
            <div className="brand-caption">{t("tagline")}</div>
            <nav aria-label={t("home")}>
              {(["home", "semester", "lab", "learn", "library"] as const).map(
                (key) => (
                  <Link
                    key={key}
                    prefetch={false}
                    href={`/${key}/`}
                    className={`nav-item ${pathname.startsWith("/" + key) ? "active" : ""}`}
                    aria-current={
                      pathname.startsWith("/" + key) ? "page" : undefined
                    }
                  >
                    <Icon name={key} />
                    <span>{t(key === "semester" ? "semesterNav" : key)}</span>
                    {pathname.startsWith("/" + key) && (
                      <span className="nav-dot" />
                    )}
                  </Link>
                ),
              )}
            </nav>
            <div className="sidebar-bottom">
              <div className="little-plant" aria-hidden="true">
                <Icon name="leaf" size={32} />
              </div>
              <p>{t("tagline")}</p>
              {(["settings", "privacy"] as const).map((key) => (
                <Link
                  prefetch={false}
                  className={`nav-item ${pathname.startsWith("/" + key) ? "active" : ""}`}
                  key={key}
                  href={`/${key}/`}
                >
                  <Icon name={key} />
                  {t(key)}
                </Link>
              ))}
              <div className="private-label">
                <Icon name="privacy" size={15} />
                {t("connected")}
              </div>
            </div>
          </aside>
        )}
        <div className={`workspace ${accepted ? "" : "public-workspace"}`}>
          <header className="topbar">
            <Link
              className={accepted ? "mobile-brand brand" : "brand"}
              href="/home/"
              prefetch={false}
            >
              kora<span>✳</span>
            </Link>
            {accepted && (
              <span className="desktop-tag">
                {t("lab").toUpperCase()} <span className="separator">/</span>{" "}
                {t("tagline")}
              </span>
            )}
            <div className="topbar-right">
              <span className="status">
                <span className="status-dot" />
                {!online
                  ? t("offline")
                  : offlineReady
                    ? t("offlineReady")
                    : offlineFailed
                      ? t("connected")
                      : t("offlineSaving")}
              </span>
              {accepted && (
                <Link
                  href="/settings/"
                  prefetch={false}
                  className="avatar"
                  aria-label={t("settings")}
                >
                  {data.profile?.nickname?.slice(0, 1).toUpperCase() ?? "K"}
                </Link>
              )}
            </div>
          </header>
          {saveError && (
            <div className="error-banner" role="alert">
              {t("saveError")}{" "}
              <button
                onClick={() =>
                  saveSnapshot(data)
                    .then(() => setSaveError(false))
                    .catch(() => setSaveError(true))
                }
              >
                {t("retry")}
              </button>
            </div>
          )}
          {guest && (
            <div className="error-banner" role="status">
              {t("memoryMode")}
            </div>
          )}
          <main
            id="main"
            tabIndex={-1}
            className={`main ${data.settings.lowLiteracyMode ? "icon-mode" : ""}`}
          >
            {data.profile?.language === "pcm" && (
              <p className="translation-note">{t("translation")}</p>
            )}
            {accepted || pathname === "/welcome/" || pathname === "/" ? (
              children
            ) : (
              <Welcome />
            )}
          </main>
          <footer>{t("footer")}</footer>
        </div>
      </div>
      {accepted && (
        <nav className="mobile-nav" aria-label={t("home")}>
          {(["home", "semester", "lab", "learn", "settings"] as const).map(
            (key) => (
              <Link
                key={key}
                prefetch={false}
                href={`/${key}/`}
                aria-current={
                  pathname.startsWith("/" + key) ? "page" : undefined
                }
              >
                <Icon name={key} />
                <span>{t(key === "semester" ? "semesterNav" : key)}</span>
              </Link>
            ),
          )}
        </nav>
      )}
      {message && (
        <div className="toast" role="status">
          <Icon name="check" />
          {message}
        </div>
      )}
    </KoraContext.Provider>
  );
}
export function Welcome() {
  const { data, update, t, now, demo, guest, useWithoutSaving, restoring } =
    useKora();
  const [step, setStep] = useState(0),
    [nickname, setNickname] = useState(data.profile?.nickname ?? ""),
    [consent, setConsent] = useState(false);
  if (data.settings.consentAcceptedAt || guest) return <HomeRedirect />;
  const profile = () =>
    update((s) => ({
      ...s,
      profile: {
        id: "me",
        nickname: nickname.trim() || t("defaultNickname"),
        language: s.profile?.language ?? "en",
        createdAt: now(),
        optionalFields: {},
      },
    }));
  return (
    <div className="welcome">
      <div className="welcome-art" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="seed">
          <Icon name="leaf" size={84} />
        </div>
        <span className="art-star">✳</span>
        <span className="art-dot" />
      </div>
      <section>
        <p className="eyebrow">{t("welcomeEyebrow")}</p>
        <h1>{t(step === 0 ? "welcomeTitle" : "consentTitle")}</h1>
        <p className="intro">{t(step === 0 ? "welcomeBody" : "consentBody")}</p>
        {step === 0 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              profile();
              setStep(1);
            }}
          >
            <label>
              {t("nickname")}
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={40}
                autoComplete="nickname"
                disabled={restoring}
              />
            </label>
            <p className="hint">{t("nicknameHint")}</p>
            <label>
              {t("language")}
              <select
                value={data.profile?.language ?? "en"}
                disabled={restoring}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    profile: {
                      id: "me",
                      nickname,
                      createdAt: now(),
                      optionalFields: {},
                      language: e.target.value as "en" | "pcm",
                    },
                  }))
                }
              >
                <option value="en">{t("english")}</option>
                <option value="pcm">{t("pidgin")}</option>
              </select>
            </label>
            {data.profile?.language === "pcm" && (
              <p className="hint">{t("translation")}</p>
            )}
            <button className="button primary" disabled={restoring}>
              {t("continue")}
              <Icon name="arrow" />
            </button>
            {restoring && (
              <p className="hint" role="status">
                {t("loading")}
              </p>
            )}
          </form>
        ) : (
          <div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>{t("consentCheck")}</span>
            </label>
            <button
              className="button primary"
              disabled={!consent}
              onClick={() => {
                update((s) => ({
                  ...s,
                  settings: { ...s.settings, consentAcceptedAt: now() },
                }));
              }}
            >
              {t("begin")}
              <Icon name="arrow" />
            </button>
            <button className="text-button" onClick={() => setStep(0)}>
              {t("back")}
            </button>
            <button className="button secondary" onClick={useWithoutSaving}>
              {t("withoutSaving")}
            </button>
            <button
              className="button secondary"
              disabled={!consent}
              onClick={demo}
            >
              {t("demo")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
function HomeRedirect() {
  const router = useRouter();
  const { t } = useKora();
  useEffect(() => {
    router.replace("/home/");
  }, [router]);
  return (
    <div className="welcome-done">
      <Icon name="leaf" size={52} />
      <h1>
        <Link href="/home/">{t("home")} →</Link>
      </h1>
    </div>
  );
}
