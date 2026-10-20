import { z } from "zod";
import { scaleSchema } from "../content/schema";
export const institutionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    institution: z.string().min(1),
    programme: z.string().min(1),
    edition: z.string().min(1),
    scope: z.string().min(1),
    source: z.object({
      title: z.string().min(1),
      publisher: z.string().min(1),
      url: z.string().url(),
      printedPages: z.string().min(1),
      pdfPages: z.string().min(1),
      section: z.string().min(1),
      checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      checkMethod: z.literal("automated-primary-source-comparison"),
    }),
    humanReview: z
      .object({
        status: z.enum(["pending", "approved"]),
        reviewer: z.string().min(1).nullable(),
        reviewedAt: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullable(),
      })
      .refine(
        (r) => r.status !== "approved" || !!(r.reviewer && r.reviewedAt),
        "Approval needs an identified reviewer and date",
      ),
    retakeRule: z.literal("not-established"),
    scale: scaleSchema,
  })
  .refine(
    (p) => p.id === p.scale.id && p.source.url === p.scale.sourceUrl,
    "Pack source and scale must agree",
  );
