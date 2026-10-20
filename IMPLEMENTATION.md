# Connected semester implementation

The app now connects a recorded academic baseline, a CGPA target, course deadlines, editable study sessions and offline retrieval practice. No accounts, learner uploads, trackers or paid gates were added.

## Delivered

- **My semester:** recorded grades are separate from the Lab's scenario grades. Recorded CGPA uses the selected retake rule. Reverse targets use recorded results and explicitly entered remaining credits.
- **Planning:** assignments and exams, completion controls, seven-day time budgets, previewed suggestions, manual sessions, rescheduling and calendar export. Suggestions prioritise unfinished deadlines within seven days (including overdue work), then credit units. They do not predict grades. Calendar exports are independent all-day events, not synchronisation.
- **Today:** a course-specific next step links to the weekly plan, alongside practice access.
- **Practice:** all questions remain accessible; missed answers can be revisited immediately, and due reviews work offline. A correct response grows its review interval from one day to a maximum of 60 days; an incorrect response resets it to one day. Existing lesson answers update the same schedule. No new academic content or unsupported answer explanations were generated.
- **Local durability:** Dexie version 2 adds semester data without dropping version 1 tables. Snapshot v2 backups include the whole learner state. Restore validates data, duplicate identifiers, grades and course references before presenting a replacement confirmation. Legacy table and guest exports are migrated. Replacement is transactional for saved users. Guest restores stay in memory and imported consent cannot enable saving.
- **Offline visibility:** production exports include cached content version, build date and approximate uncompressed public-file size. Every new route is included in the generated precache.
- **Navigation:** Today, My semester and Practice describe the recurring tasks. Future Self Lab remains the scenario calculator; Library is reachable from Practice on mobile.

## Scope requiring people or external evidence

Two dated institution grading snapshots are now selectable in the Lab and My semester: Ilorin EEE (2024) and Lokoja Statistics (2020/21–2023/24). They are compared against official departmental handbooks, with edition/page evidence and explicit pending human review. Applying a pack preserves courses, grades and the retake setting; custom threshold/point edits are labelled. Generic course templates remain generic. No current-cohort applicability, retake policy, independent review or institutional endorsement is implied. See [the evidence register](review/institution-evidence.md).

Human Pidgin, editorial and accessibility reviews remain release work. New secondary copy uses the existing explicitly labelled English fallback in Pidgin mode. The content's existing automated source/answer checks are not independent human review.

Campus recruiting, sponsorship, willingness-to-pay research and improved academic outcomes cannot be established through repository changes. The [pilot kit](research/pilot-plan.md), participant-information script and observation template are ready for a human research lead. The app now offers a voluntary activity-summary preview/download that excludes identities, grades, raw dates, course titles and individual answers. It measures recorded study actions and complete relative-week windows, not app visits or grade improvement. New marked demos and simulated clocks are excluded. No messages, deployments or external accounts were created.

The [review packet](review/packet.json) contains 812 pending editorial/Pidgin/institution items. `npm run review:prepare` preserves signed reviews only while their versioned evidence matches; changed content becomes pending and superseded records are archived. `npm run release:check` currently exits nonzero as intended: no human approvals, device tests or campus study have been invented. [Review instructions](review/README.md) and [manual accessibility/device procedures](review/accessibility-protocol.md) explain the remaining work.

## Pilot plan

Recruit 50–100 consenting freshers across two or three institutions through course representatives and academic-support teams. Observe setup, adding an actual result and a deadline, completing a study session, revisiting a mistake, offline relaunch and restoring a backup. Include modest Android devices and screen-reader users.

Evaluate useful-plan activation, week-two and week-four return, study actions across distinct weeks, voluntary rescheduling, backup recovery and qualitative usefulness. Existing local session and semester data can support voluntary researcher-reviewed exports, but these exports contain personal learning data: explain their contents and request explicit consent. Do not silently transmit them or treat activity as evidence of better grades.

Keep core tools open. Test institutional sponsorship or implementation/support services through interviews before building payments or institutional dashboards.

## Verification

Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. With `npm start` running, run `npm run test:browser`, `npm run test:semester` and `node scripts/keyboard-check.mjs`. Browser checks use isolated Edge profiles and save reports under `artifacts/`. They do not use the user's browser profile.

Dexie now loads in a separate cached chunk after initial hydration; state types/defaults no longer import the storage runtime. Public onboarding also omits the signed-in sidebar and navigation. Welcome first-load JavaScript is approximately 121 KB, down from 152 KB. Latest simulated mobile performance is 83 (FCP 1.0 s, LCP 2.5 s, blocking 590 ms), with accessibility and best practices at 100. The shared Next runtime is about 103 KB by itself, so the earlier 100 KB aspiration remains unmet. Physical-device performance and human accessibility validation remain pending. See VALIDATION.md for measurement context.
