# Human review handoff

No human approval has been recorded. `packet.json` contains the current wording and source metadata for editorial, Nigerian Pidgin and institution review. It is a work queue, not evidence that a human checked the content.

1. Assign editorial items to an independent editor with subject knowledge, Pidgin items to a fluent Nigerian Pidgin speaker, and institution items to a qualified institutional reviewer. A single reviewer may cover several roles only if qualified for each.
2. Run `npm run review:prepare` before starting. Each item has a stable ID and a fingerprint covering its category, identity and current content.
3. Review wording in its actual app context. For quizzes, check the answer index, distractors, explanation and cited section. For library items, check original wording, attribution, cultural provenance, permissions and translations against the primary source. A source link or an automated consistency check does not establish independent review.
4. Put proposed corrections in `notes`, set `status` to `changes-requested`, and update the original file under `content/` when the wording is agreed. Run preparation again; changed content receives a fresh pending review. Superseded records move to `archived`.
5. Approve only the current source wording: set `status` to `approved`, enter the actual human `reviewer` name and `reviewedAt` as `YYYY-MM-DD`. Preserve `id`, `category`, `evidence` and `fingerprint`. Fabricated or automated reviewer identities are not approvals.
6. For institution packs, also update the corresponding `humanReview` object in `content/ng/institutions.json`, and record cohort/retake evidence in the institution signoff. A dated handbook remains a dated snapshot even after its transcription is checked.
7. Complete `signoffs.json` only after the stated work is done. Include a report path or source URL in `evidence`, the real reviewer/date, and relevant device/cohort details in notes. Native-speaker and editorial signoffs should describe reviewer qualifications. Pilot and device results must be observed, not inferred from automated checks.
8. Run `npm run release:check`. It exits nonzero for missing/stale content reviews, missing human signoffs or unreviewed institution packs. Development builds remain available so reviewers can use the app. This local check validates evidence fields and content versions; it does not authenticate a person's identity or independently establish their qualifications.

Pidgin source files remain machine-labelled and contain English fallbacks. Do not remove the visible translation warning merely because some items have been reviewed. Review the complete language experience first, then update source translation metadata and warnings as a separate reviewed change.

The generated packet and signoffs are repository files for review collaboration. They are not shipped in the app's offline cache. Never add learner backups, participant names or contact lists to them.
