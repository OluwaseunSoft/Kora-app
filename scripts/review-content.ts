import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import {
  item,
  mergeReviews,
  outstanding,
  type ReviewItem,
} from "../lib/review";
import { institutionSchema } from "../lib/institutions/schema";
const read = (file: string) => JSON.parse(readFileSync(file, "utf8"));
const current: ReviewItem[] = [];
const en = read("content/i18n/en.json"),
  pcm = read("content/i18n/pcm.json");
for (const key of Object.keys(en).sort()) {
  current.push(item(`copy:${key}`, "editorial", { english: en[key] }));
  current.push(
    item(`pidgin:copy:${key}`, "pidgin", {
      english: en[key],
      pidgin: pcm[key],
      englishFallback: en[key] === pcm[key],
    }),
  );
}
for (const lesson of read("content/lessons/lessons.json")) {
  current.push(item(`lesson:${lesson.id}`, "editorial", lesson));
  current.push(item(`pidgin:lesson:${lesson.id}`, "pidgin", lesson));
}
for (const quiz of read("content/lessons/quizzes.json")) {
  current.push(item(`quiz:${quiz.id}`, "editorial", quiz));
  current.push(item(`pidgin:quiz:${quiz.id}`, "pidgin", quiz));
}
for (const entry of read("content/library/entries.json")) {
  current.push(item(`library:${entry.id}`, "editorial", entry));
  current.push(item(`pidgin:library:${entry.id}`, "pidgin", entry));
}
for (const pack of read("content/ng/institutions.json")) {
  const { humanReview: _review, ...evidence } = pack;
  void _review;
  current.push(item(`institution:${pack.id}`, "institution", evidence));
}
const path = "review/packet.json";
const previous = existsSync(path) ? read(path) : { items: [], archived: [] };
if (
  (previous.format && previous.format !== "kora-human-review-v1") ||
  !Array.isArray(previous.items) ||
  !Array.isArray(previous.archived)
)
  throw new Error("Unsupported or invalid review packet");
if (process.argv.includes("--check")) {
  const mismatched = current.filter(
    (entry) =>
      !previous.items.some(
        (v: ReviewItem) =>
          v.id === entry.id && v.fingerprint === entry.fingerprint,
      ),
  );
  const missing = outstanding(mergeReviews(current, previous.items));
  const signoffs = read("review/signoffs.json");
  const missingSignoffs = signoffs.filter(
    (v: {
      id: string;
      status: ReviewItem["status"];
      reviewer: string | null;
      reviewedAt: string | null;
      evidence: string;
    }) =>
      !v.evidence.trim() ||
      outstanding([
        {
          ...item(v.id, "editorial", v.evidence),
          status: v.status,
          reviewer: v.reviewer,
          reviewedAt: v.reviewedAt,
        },
      ]).length > 0,
  );
  const pendingPacks = read("content/ng/institutions.json")
    .map((p: unknown) => institutionSchema.parse(p))
    .filter(
      (p: { humanReview: { status: string } }) =>
        p.humanReview.status !== "approved",
    );
  console.log(
    JSON.stringify(
      {
        contentItems: current.length,
        staleOrMissingItems: mismatched.length,
        pendingHumanReviews: missing.length,
        pendingSignoffs: missingSignoffs.map((v: { id: string }) => v.id),
        pendingInstitutionReviews: pendingPacks.length,
      },
      null,
      2,
    ),
  );
  if (
    mismatched.length ||
    missing.length ||
    missingSignoffs.length ||
    pendingPacks.length
  )
    process.exitCode = 1;
} else {
  mkdirSync("review", { recursive: true });
  const changed = previous.items.filter(
    (old: ReviewItem) =>
      !current.some(
        (entry) => entry.id === old.id && entry.fingerprint === old.fingerprint,
      ),
  );
  const archived = [...previous.archived, ...changed];
  const items = mergeReviews(current, previous.items);
  writeFileSync(
    path,
    JSON.stringify(
      {
        format: "kora-human-review-v1",
        instructions:
          "A qualified human reviewer must inspect the referenced content. Edit source content first, regenerate this packet, then approve only the current wording. Do not mark automated checks as human approval. Changed content invalidates previous approval; old records are archived.",
        items,
        archived,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Prepared ${items.length} review items; ${outstanding(items).length} need human review. No approvals were created.`,
  );
}
