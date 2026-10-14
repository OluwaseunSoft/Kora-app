import en from "../../content/i18n/en.json";
import pcm from "../../content/i18n/pcm.json";
export type Language = "en" | "pcm";
export type CopyKey = keyof typeof en;
export const dictionary = (language: Language) =>
  language === "pcm" ? pcm : en;
