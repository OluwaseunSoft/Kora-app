import { readFileSync } from "node:fs";
import { institutionSchema } from "../lib/institutions/schema";
import {
  entrySchema,
  lessonSchema,
  quizSchema,
  scaleSchema,
  templateSchema,
  examSchema,
} from "../lib/content/schema";
const read = (p: string) => JSON.parse(readFileSync(p, "utf8")) as unknown[];
export function validateContent() {
  const packs = read("content/ng/institutions.json").map((p) =>
    institutionSchema.parse(p),
  );
  if (new Set(packs.map((p) => p.id)).size !== packs.length)
    throw new Error("Duplicate institution pack");
  scaleSchema.parse(
    JSON.parse(readFileSync("content/ng/gradingScale.json", "utf8")),
  );
  read("content/ng/courseTemplates.json").forEach((t) =>
    templateSchema.parse(t),
  );
  examSchema.parse(
    JSON.parse(readFileSync("content/ng/examCalendar.json", "utf8")),
  );
  const en = JSON.parse(readFileSync("content/i18n/en.json", "utf8")),
    pcm = JSON.parse(readFileSync("content/i18n/pcm.json", "utf8"));
  if (
    JSON.stringify(Object.keys(en).sort()) !==
    JSON.stringify(Object.keys(pcm).sort())
  )
    throw Error("Dictionary keys differ");
  const entries = read("content/library/entries.json").map((e) =>
    entrySchema.parse(e),
  );
  const lessons = read("content/lessons/lessons.json").map((e) =>
    lessonSchema.parse(e),
  );
  const quizzes = read("content/lessons/quizzes.json").map((e) =>
    quizSchema.parse(e),
  );
  for (const l of lessons) {
    if (Buffer.byteLength(JSON.stringify(l)) > 200000)
      throw Error(`Lesson budget: ${l.id}`);
    for (const id of l.quizIds)
      if (!quizzes.some((q) => q.id === id && q.lessonId === l.id))
        throw Error(`Missing quiz ${id}`);
  }
  for (const collection of [entries, lessons, quizzes])
    if (new Set(collection.map((x) => x.id)).size !== collection.length)
      throw Error("Duplicate content id");
  return {
    entries: entries.length,
    lessons: lessons.length,
    quizzes: quizzes.length,
  };
}
console.log("Validated content:", validateContent());
