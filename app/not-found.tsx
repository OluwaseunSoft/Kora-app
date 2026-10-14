"use client";
import Link from "next/link";
import { useKora } from "../components/provider";
import { Icon } from "../components/icons";
export default function NotFound() {
  const { t } = useKora();
  return (
    <div className="welcome-done">
      <Icon name="leaf" size={48} />
      <p className="eyebrow">404</p>
      <h1>{t("notFound")}</h1>
      <Link className="button primary" href="/home/">
        {t("home")}
        <Icon name="arrow" />
      </Link>
    </div>
  );
}
