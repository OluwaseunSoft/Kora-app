import { LessonReader } from "../../../components/learn";
import lessons from "../../../content/lessons/lessons.json";
export function generateStaticParams() {
  return lessons.map((l) => ({ lessonId: l.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <LessonReader id={lessonId} />;
}
