import { createHash } from "node:crypto";
export type ReviewStatus = "pending" | "approved" | "changes-requested";
export interface ReviewItem {
  id: string;
  category: "editorial" | "pidgin" | "institution";
  evidence: unknown;
  fingerprint: string;
  status: ReviewStatus;
  reviewer: string | null;
  reviewedAt: string | null;
  notes: string;
}
export function item(
  id: string,
  category: ReviewItem["category"],
  evidence: unknown,
): ReviewItem {
  return {
    id,
    category,
    evidence,
    fingerprint: createHash("sha256")
      .update(JSON.stringify({ id, category, evidence }))
      .digest("hex"),
    status: "pending",
    reviewer: null,
    reviewedAt: null,
    notes: "",
  };
}
export function mergeReviews(current: ReviewItem[], previous: ReviewItem[]) {
  const old = new Map(previous.map((v) => [v.id, v]));
  return current.map((entry) => {
    const prior = old.get(entry.id);
    return prior?.fingerprint === entry.fingerprint &&
      item(prior.id, prior.category, prior.evidence).fingerprint ===
        prior.fingerprint
      ? {
          ...entry,
          status: prior.status,
          reviewer: prior.reviewer,
          reviewedAt: prior.reviewedAt,
          notes: prior.notes,
        }
      : entry;
  });
}
export function outstanding(items: ReviewItem[]) {
  return items.filter((v) => {
    const date = v.reviewedAt ? new Date(`${v.reviewedAt}T00:00:00Z`) : null;
    return (
      v.status !== "approved" ||
      !v.reviewer?.trim() ||
      !v.reviewedAt ||
      !/^\d{4}-\d{2}-\d{2}$/.test(v.reviewedAt) ||
      !date ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== v.reviewedAt
    );
  });
}
