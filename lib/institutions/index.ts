import packs from "../../content/ng/institutions.json";
import type { Snapshot } from "../db/state";
export { packs };
export function applyInstitution(snapshot: Snapshot, id: string): Snapshot {
  const pack = packs.find((p) => p.id === id);
  if (!pack) throw new Error("Unknown institution pack");
  if (
    snapshot.courses.some((c) =>
      [c.plannedGrade, c.actualGrade].some(
        (g) => g != null && !pack.scale.bands.some((b) => b.grade === g),
      ),
    )
  )
    throw new Error("Existing grades do not match this pack");
  return {
    ...snapshot,
    target: Math.min(snapshot.target, pack.scale.maxPoints),
    scale: {
      ...structuredClone(pack.scale),
      packId: pack.id,
      customized: false,
    },
  };
}
