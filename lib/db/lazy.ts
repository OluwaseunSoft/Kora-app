import type { Scale } from "../cgpa";
import type { Snapshot } from "./state";
// Keep Dexie evaluation out of the initial hydration task. The exported chunk is
// still precached, so these operations also work on an offline relaunch.
export async function loadSnapshot(scale: Scale) {
  return (await import(".")).loadSnapshot(scale);
}
export async function saveSnapshot(snapshot: Snapshot) {
  return (await import(".")).saveSnapshot(snapshot);
}
export async function deleteAll() {
  return (await import(".")).deleteAll();
}
