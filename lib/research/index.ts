import type { Snapshot } from "../db/state";
const day = (at: number) => {
  const date = new Date(at);
  return (
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
};
export function researchSummary(data: Snapshot, at: number) {
  if (
    data.profile?.optionalFields.koraDemo === "true" ||
    data.settings.demoOffset !== 0
  )
    return null;
  const sessions = data.sessions.filter((s) => s.startedAt <= at);
  const days = [...new Set(sessions.map((s) => day(s.startedAt)))].sort(
    (a, b) => a - b,
  );
  const first = days[0];
  const daysObserved = first === undefined ? 0 : day(at) - first + 1;
  const activity = days.reduce<Record<number, number>>((weeks, date) => {
    const week = Math.floor((date - first) / 7) + 1;
    weeks[week] = (weeks[week] ?? 0) + 1;
    return weeks;
  }, {});
  return {
    format: "kora-research-summary-v1",
    observationOrigin: "first-recorded-study-action",
    daysObserved,
    activeStudyDays: days.length,
    recordedStudyActions: sessions.length,
    completedPlannedSessions: data.academic.study.filter((s) => s.done).length,
    questionsReviewed: data.academic.reviews.length,
    currentPlanHasCoursesAndSessions:
      data.courses.length > 0 && data.academic.study.length > 0,
    activityByRelativeWeek: Object.entries(activity).map(
      ([week, activeDays]) => ({ week: Number(week), activeDays }),
    ),
    // A whole week must finish before reporting its return outcome.
    returnedInWeekTwo: daysObserved > 14 ? (activity[2] ?? 0) > 0 : null,
    returnedInWeekFour: daysObserved > 28 ? (activity[4] ?? 0) > 0 : null,
    limitations: [
      "Counts recorded actions, not app opens or learning outcomes.",
      "Weeks start at the first recorded study action, not installation or onboarding.",
      "Completed sessions are self-reported; missing or restored history can affect results.",
      "Older demo backups may lack a demo marker and must be excluded by the researcher.",
    ],
  };
}
