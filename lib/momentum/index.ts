export const config = {
  steadyGap: 2,
  pausedGap: 6,
  lengthRatio: 0.6,
  shortSessions: 3,
  skippedQuizzes: 2,
  offerIntervalMs: 86400000,
  tokensPerWeek: 2,
};
export const dayMs = 86400000;
export interface Session {
  id: string;
  startedAt: number;
  durationSec: number;
  lessonsTouched: string[];
  quizzesSkipped: number;
}
export interface MomentumInput {
  now: number;
  sessions: Session[];
  quietMode: boolean;
  adaptiveSuggestions: boolean;
  lastOfferAt: number | null;
  restTokens: number;
  examSoon?: boolean;
  plannedStudy?: number;
  completedStudy?: number;
}
export function evaluateMomentum(input: MomentumInput) {
  const sessions = [...input.sessions].sort(
    (a, b) => b.startedAt - a.startedAt,
  );
  const gap = sessions.length
    ? Math.max(0, Math.floor((input.now - sessions[0].startedAt) / dayMs))
    : 0;
  const history = sessions.slice(3);
  const average = history.length
    ? history.reduce((s, x) => s + x.durationSec, 0) / history.length
    : 0;
  const short =
    average > 0 &&
    sessions.length >= config.shortSessions &&
    sessions
      .slice(0, 3)
      .every((s) => s.durationSec < average * config.lengthRatio);
  const skipped =
    sessions.length >= 2 &&
    sessions.slice(0, 2).every((s) => s.quizzesSkipped > 0);
  const behind =
    (input.plannedStudy ?? 0) > 0 &&
    (input.completedStudy ?? 0) < input.plannedStudy! * config.lengthRatio;
  const state =
    gap >= config.pausedGap
      ? "paused"
      : gap > config.steadyGap || short || skipped || behind
        ? "drifting"
        : "steady";
  const reason =
    gap > config.steadyGap
      ? "gap"
      : short
        ? "short"
        : skipped
          ? "skipped"
          : behind
            ? "planned"
            : input.examSoon
              ? "exam"
              : null;
  const allowed =
    !input.quietMode &&
    input.adaptiveSuggestions &&
    (input.lastOfferAt === null ||
      input.now - input.lastOfferAt >= config.offerIntervalMs);
  return {
    state,
    gap,
    reason,
    offer:
      allowed && (state !== "steady" || input.examSoon)
        ? state === "paused"
          ? "return"
          : input.examSoon && input.restTokens > 0
            ? "rest"
            : "minimum"
        : null,
  } as const;
}
export function weekKey(timestamp: number) {
  const date = new Date(timestamp);
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}
export function keptWeeks(sessions: Session[], restTokensUsed: number[]) {
  return [
    ...new Set([
      ...sessions.map((s) => weekKey(s.startedAt)),
      ...restTokensUsed.map(weekKey),
    ]),
  ].sort();
}
export interface Clock {
  now(): number;
}
export const createClock = (offsetDays = 0): Clock => ({
  now: () => Date.now() + offsetDays * dayMs,
});
