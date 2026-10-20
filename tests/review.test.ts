import { describe, expect, it } from "vitest";
import { item, mergeReviews, outstanding } from "../lib/review";
describe("human review evidence", () => {
  it("creates pending records without manufacturing approval", () => {
    expect(outstanding([item("copy:a", "editorial", "hello")])).toHaveLength(1);
  });
  it("preserves a signed review only while content and identity match", () => {
    const current = item("copy:a", "editorial", "hello");
    const signed = {
      ...current,
      status: "approved" as const,
      reviewer: "Test reviewer",
      reviewedAt: "2026-10-20",
    };
    expect(outstanding(mergeReviews([current], [signed]))).toHaveLength(0);
    expect(
      outstanding(
        mergeReviews([item("copy:a", "editorial", "changed")], [signed]),
      ),
    ).toHaveLength(1);
    expect(
      outstanding(
        mergeReviews([item("copy:b", "editorial", "hello")], [signed]),
      ),
    ).toHaveLength(1);
  });
  it("invalidates altered evidence with a copied fingerprint", () => {
    const current = item("a", "pidgin", "current");
    const tampered = {
      ...current,
      evidence: "different",
      status: "approved" as const,
      reviewer: "Test reviewer",
      reviewedAt: "2026-10-20",
    };
    expect(outstanding(mergeReviews([current], [tampered]))).toHaveLength(1);
  });
  it("rejects unsigned approval and impossible dates", () => {
    const current = item("a", "editorial", "hello");
    expect(
      outstanding([
        {
          ...current,
          status: "approved",
          reviewer: " ",
          reviewedAt: "2026-10-20",
        },
      ]),
    ).toHaveLength(1);
    expect(
      outstanding([
        {
          ...current,
          status: "approved",
          reviewer: "Test reviewer",
          reviewedAt: "2026-02-30",
        },
      ]),
    ).toHaveLength(1);
  });
});
