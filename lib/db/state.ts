import type { Course, RetakeRule, Scale } from "../cgpa";
import type { Session } from "../momentum";
import type { Academic } from "../academic";
export interface Settings {
  quietMode: boolean;
  motivationFrequency: "off" | "daily" | "weekly";
  ttsEnabled: boolean;
  textScale: number;
  highContrast: boolean;
  plainLanguage: boolean;
  lowLiteracyMode: boolean;
  adaptiveSuggestions: boolean;
  consentAcceptedAt: number | null;
  hoursPerUnit: number;
  retakeRule: RetakeRule;
  demoOffset: number;
  examDate: string;
  preferredTime: string;
}
export interface Profile {
  id: string;
  nickname: string;
  language: "en" | "pcm";
  createdAt: number;
  optionalFields: Record<string, string>;
}
export interface Progress {
  lessonId: string;
  status: "started" | "completed";
  completedAt: number | null;
  quizResults: { at: number; score: number; total: number }[];
}
export interface Momentum {
  restTokens: number;
  restTokensUsed: number[];
  grantedWeeks: string[];
  lastOfferAt: number | null;
  lastReason: string | null;
  lastState: string;
  weekProgress: string[];
  recentEntries: string[];
  lastEntryAt: number | null;
  currentEntryId: string | null;
}
export interface Snapshot {
  academic: Academic;
  profile: Profile | null;
  settings: Settings;
  courses: Course[];
  progress: Progress[];
  sessions: Session[];
  momentum: Momentum;
  savedEntries: { libraryEntryId: string; savedAt: number }[];
  target: number;
  scale: Scale;
  reports: { id: string; entryId: string; at: number }[];
}
export const defaultSettings: Settings = {
  quietMode: false,
  motivationFrequency: "daily",
  ttsEnabled: true,
  textScale: 1,
  highContrast: false,
  plainLanguage: false,
  lowLiteracyMode: false,
  adaptiveSuggestions: true,
  consentAcceptedAt: null,
  hoursPerUnit: 2,
  retakeRule: "replace",
  demoOffset: 0,
  examDate: "",
  preferredTime: "17:00",
};
export const emptyMomentum = (): Momentum => ({
  restTokens: 2,
  restTokensUsed: [],
  grantedWeeks: [],
  lastOfferAt: null,
  lastReason: null,
  lastState: "steady",
  weekProgress: [],
  recentEntries: [],
  lastEntryAt: null,
  currentEntryId: null,
});
