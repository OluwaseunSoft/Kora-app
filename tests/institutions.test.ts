import { describe, expect, it } from "vitest";
import { packs, applyInstitution } from "../lib/institutions";
import { institutionSchema } from "../lib/institutions/schema";
import { classFor } from "../lib/cgpa";
import { createBackup, parseBackup } from "../lib/db/backup";
import { defaultSettings, emptyMomentum, type Snapshot } from "../lib/db/state";
import { emptyAcademic } from "../lib/academic";
import scale from "../content/ng/gradingScale.json";
const snapshot = (): Snapshot => ({
  profile: null,
  settings: { ...defaultSettings },
  courses: [
    {
      id: "c",
      code: "GST",
      title: "GST",
      creditUnits: 3,
      plannedGrade: "A",
      actualGrade: "C",
      semesterIndex: 0,
      status: "planned",
      planId: "main",
    },
  ],
  progress: [],
  sessions: [],
  momentum: emptyMomentum(),
  savedEntries: [],
  target: 3.5,
  scale,
  reports: [],
  academic: emptyAcademic(),
});
describe("dated institution packs", () => {
  it("requires complete evidence and never invents human approval", () => {
    for (const pack of packs) {
      expect(() => institutionSchema.parse(pack)).not.toThrow();
      expect(pack.humanReview.status).toBe("pending");
      expect(pack.retakeRule).toBe("not-established");
    }
    const invalid = {
      ...packs[0],
      humanReview: { status: "approved", reviewer: null, reviewedAt: null },
    };
    expect(institutionSchema.safeParse(invalid).success).toBe(false);
  });
  it("preserves course grades and the user's retake choice", () => {
    const before = snapshot();
    before.settings.retakeRule = "all";
    const result = applyInstitution(before, "unilorin-eee-2024");
    expect(result.courses).toEqual(before.courses);
    expect(result.settings.retakeRule).toBe("all");
    expect(result.scale.packId).toBe("unilorin-eee-2024");
    expect(before.scale).toEqual(scale);
  });
  it("keeps source editions' different class lists and exact thresholds", () => {
    const ilorin = packs[0].scale,
      lokoja = packs[1].scale;
    expect(classFor(1.4, ilorin)).toBeNull();
    expect(classFor(1.4, lokoja)).toBe("pass");
    expect(classFor(3.499, ilorin)).toBe("lower");
    expect(classFor(3.5, ilorin)).toBe("upper");
  });
  it("round trips pack provenance and customized status in backups", () => {
    const data = applyInstitution(snapshot(), packs[0].id);
    data.scale.customized = true;
    expect(parseBackup(createBackup(data)).scale).toEqual(data.scale);
  });
  it("rejects unknown packs and incompatible grades", () => {
    expect(() => applyInstitution(snapshot(), "unknown")).toThrow();
    const data = snapshot();
    data.courses[0].actualGrade = "Z";
    expect(() => applyInstitution(data, packs[0].id)).toThrow();
  });
});
