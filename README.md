# Kora · Future Self Lab

Offline-first, device-only Next.js prototype for Nigerian freshers. Built from PROJECT.md in this repository. No account, backend, trackers, external fonts, or optional AI route.

## Run

Requires Node.js 20.9+.

```sh
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm.ps1`. Development serves at http://localhost:3000. Offline installation is a **production** feature:

```sh
npm run test
npm run lint
npm run typecheck
npm run build
npm start
```

Deploy `out/` on an HTTPS static host. All routes have trailing slashes. `npm start` runs the included production static server at http://localhost:3000. `scripts/offline.mjs` generates the complete precache from the exported build, including every lesson, route, and Next.js navigation payload. Wait for “Ready for offline learning” before disconnecting. External source links are not cached. No app data is uploaded. Device-local speech requires a locally installed English voice; Pidgin speech may use the English voice. Private browser modes/storage eviction may remove local data; JSON export is available.

With the production server running, `npm run test:browser` verifies offline flows, privacy and axe accessibility in the installed Windows Edge browser. `node scripts/keyboard-check.mjs` checks the main flows using only keyboard input. `node scripts/performance.mjs` runs the simulated mobile Lighthouse audit. Browser reports/screenshots are saved under `artifacts/`. See [VALIDATION.md](VALIDATION.md) for results and remaining editorial work.

## Demo

The connected semester workflow is available under **My semester**. Record received grades separately from Lab scenarios, add assignment/exam dates, preview a seven-day study allocation, and edit or complete sessions. Calendar export produces independent all-day events. **Practice** includes due reviews and mistake review; lesson answers feed the same offline schedule. **Your data** exports a versioned snapshot and validates old or new backups before a confirmed replacement. Guest restores remain in memory. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for delivered scope, pilot guidance and remaining review work.

With the production server running, `npm run test:semester` checks the new semester and practice flows offline, including persistence, responsive layouts and axe accessibility.

The Lab and My semester now offer dated, source-linked Ilorin EEE and Lokoja Statistics grading snapshots. Review the programme/edition and pending human-review status before applying; current-cohort and retake rules still require confirmation. **Your data** also offers a separate voluntary study-summary download that omits personal names, grades and raw sessions.

For release preparation, run `npm run review:prepare`, then follow [the review handoff](review/README.md). `npm run release:check` reports pending human approvals and intentionally fails until they are actually completed. The [pilot kit](research/pilot-plan.md) and [physical-device/accessibility protocol](review/accessibility-protocol.md) are ready for the human team; no outreach or testing results are implied.

Open `/welcome/`, enter a nickname (optional), continue, accept device-storage consent, and choose the Tunde demo. Existing users can select the demo in Settings after confirming that it replaces local data. In the Lab, modify grades, try a what-if change, or choose a 3.5 target. Open a source badge and use “Try this today”. In Settings, simulate four days; return to My journey for an optional five-minute recovery suggestion. Use a rest token. Disconnect after offline saving finishes; lessons, quizzes, library, and planning remain available.

## Content and review

- Library: add to `content/library/entries.json`, matching `entrySchema` in `lib/content/schema.ts`. All displayed entries must be source-checked and verified. Unverified candidates belong in `content/library/pending.json`, which is never imported by the UI. No attributed wording is included for pending entries.
- Lesson: add an object to `content/lessons/lessons.json`, with localized sections, source metadata, and at least three quiz IDs. Add matching questions to `quizzes.json`. Static lesson routes are generated automatically. `npm run validate` checks schemas, unique IDs, relationships, sources, and the 200 KB lesson budget before every build.
- Quote verification: locate the primary published work/transcript; compare wording exactly; record author, title, year, URL, page/section, original language, licence, verifier and date. Never mark a paraphrase as a quote. Record unverified wording only outside the displayed content file. An independent editor should check cultural attribution and quotation permissions before publication.
- Language: create a JSON dictionary with exactly the English keys; add it to `lib/i18n/index.ts`, the profile language type, and language selectors. Localize content titles/sections/questions separately. Pidgin core copy is machine translated and explicitly labelled; some learning copy currently falls back to English pending a speaker’s review.
- Country pack: add grading bands, editable course templates and exam defaults under `content/<country>/`; wire the chosen pack into the provider and country selector, and test its thresholds. Current country is NG only. Logical CSS properties accommodate future RTL layouts.

The original practice exercises are intentionally short. Source-derived OpenStax study guidance is attributed and licensed CC BY-NC-SA 4.0, with links to free access. Quiz `reviewStatus: reviewed` means an automated answer/content consistency pass, **not** an independent human editorial review; this limit is visible on source badges. Human review remains required for production release. `scripts/seed-content.mjs` and `seed-i18n.mjs` generated the starting data; do not rerun them over editorial changes.

## Planning assumptions

Credit-weighted means use unrounded values, ignore ungraded courses, and return null when no positive graded credits exist. Class cutoffs are continuous lower thresholds (3.499 is below 3.50 even if rounded display shows 3.50). The default replaces the earlier graded attempt only when a graded retake matches its course code and plan. Settings can count all attempts. A missing retake grade leaves the earlier attempt in place. Reverse targets treat the current mock plan as a completed baseline; remaining credits are user-entered. Weekly hours are an editable heuristic.

The NOUN BLIS handbook, sections 4.5 and 4.9, supports the historical five-point bands; it also says Pass is no longer recognised for first degrees. This caveat is shown in the Lab. F=0 below 40 is an explicit prototype assumption. Templates and generic exam weeks do not claim to match any institution or CCMAS document. Confirm current school rules.

## Momentum and privacy

Onboarding also offers **Continue without saving**. All lessons and tools remain available in memory without storage consent. Refreshing clears that visit. A guest export downloads the in-memory snapshot without writing it to IndexedDB; privacy settings offer explicit consent to enable saving later.

Rules are isolated in `lib/momentum/index.ts`. Only optional offers reach the UI; internal state labels are never shown. Offers are limited to once per day after action/dismissal and respect quiet/adaptive settings. Two tokens are granted when a new learning week is entered; unused tokens remain. A session or rest token keeps a week. Demo time is isolated behind `createClock`; it does not alter the system clock. The demo has completed material for a return recap. Returning learners revisit an existing lesson; nothing new is required.

Dexie tables in `lib/db/index.ts` contain the profile, settings, plans, courses, targets, progress, sessions, momentum, saved entries, scale preferences, local reports and semester data. Saving is queued and transactional. Export includes the complete learner snapshot; derived plan and target records are reconstructed when saving a restored snapshot. Deletion waits for queued saves, invalidates pending writes, and clears all learner tables without removing the public offline shell. External navigation and hosting requests are the only network activity; there are no analytics or learner-data request calls.

## Validation limits

Unit tests cover CGPA boundaries, retakes, empty/invalid inputs, reverse plans, momentum gaps, rate limits, skipped quizzes, exam suggestions, kept weeks, deterministic source-only selection and all content schemas. Accessibility uses semantic controls, visible focus, untimed quizzes, reduced motion, 44 px primary controls, local TTS, text size and contrast settings. Browser offline, keyboard, axe, and Lighthouse checks should be performed against the production static build. Next.js runtime may exceed the aspirational 100 KB critical JavaScript budget; the build reports gzip asset sizes. Full independent editorial review, full human-reviewed Pidgin, exact institutional rules and manually verified cultural proverbs remain open. Optional AI is intentionally omitted.
