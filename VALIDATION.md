# Release preparation validation · 20 October 2026

- All **58 unit tests** pass, including source-bound institution rules, review fingerprint invalidation, voluntary summary privacy and complete-window return calculations. TypeScript, lint and the production build pass.
- Production exports **22 pages**, with **102 precached assets**. Welcome first-load JavaScript is about **121 KB** (previously 152 KB); page totals range about 121–138 KB. All-route JavaScript is about 346 KB gzipped. Storage is deferred into a separately cached chunk, not removed from offline availability.
- Latest Lighthouse 11 simulated-mobile audit of the unauthenticated `/home/` onboarding screen: **83 performance, 100 accessibility, 100 best practices**; FCP **1.0 s**, LCP **2.5 s**, total blocking **590 ms**. This is a modest improvement over the previous 81/660 ms run, not a reproduction of the older 91 score. Intermediate runs varied; bundle reduction is a build measurement, while Lighthouse results remain host-dependent simulations.
- Updated offline browser suites and keyboard checks pass. They cover applying a dated pack without changing received grades, pack persistence, source evidence, research-summary export without raw learner fields, demo exclusion, and the earlier planning/review/restore/migration flows. Axe reports zero violations across **14 screen variants**, including the newly expanded institution evidence panel.
- Two handbook snapshots have primary-source comparison evidence. Both remain pending independent human review and current-cohort/retake confirmation. No unconfirmed four-/seven-point UI pack was added.
- Review preparation produced **812 pending items**. `npm run release:check` correctly returns nonzero with zero stale/missing items, 812 pending human reviews, two pending institution reviews and six pending manual signoffs. It is a release-readiness report, not a claim that independent review or physical-device work has happened.

See [review instructions](review/README.md), [institution evidence](review/institution-evidence.md), [manual device/accessibility protocol](review/accessibility-protocol.md) and [pilot kit](research/pilot-plan.md). Physical Android, human screen-reader, native Pidgin/editorial and actual campus-pilot results remain uncompleted.

## Earlier connected semester validation · 20 October 2026

The production build exports 22 pages and precaches 100 public shell/content assets. All 45 unit tests pass, including new recorded-grade, weekly allocation, review-schedule and backup-migration cases. TypeScript and lint pass.

The existing browser suite passes with the updated navigation and snapshot format. It also verifies invalid backup rejection, transaction rollback after an injected storage failure, a successful restore, guest restore without persistence, and a native version 10 (Dexie v1) database upgrading to native version 20 without losing courses.

`npm run test:semester` passes offline: recorded grades survive relaunch, deadlines and completed study sessions persist, suggested sessions fit the entered budget, calendar export downloads, practice answers feed mistake review, and offline download metadata is readable from cache. Axe reports zero violations across four new screen variants, including mobile, desktop, large text and high contrast. The original nine screen variants also pass. The keyboard-only regression passes.

Current Next.js first-load JavaScript is approximately 152–167 KB depending on the route; all-route JavaScript is about 340 KB gzipped. Backup validation is deferred from the app shell. The 100 KB critical-path aspiration remains unmet. Independent content/Pidgin review, verified institution packs and physical-device/screen-reader testing remain outstanding; see [IMPLEMENTATION.md](IMPLEMENTATION.md).

The latest Lighthouse 11 simulated-mobile run on the public onboarding screen (an unauthenticated `/home/` visit) reports performance **81**, accessibility **100**, and best practices **100**: FCP 1.1 s, LCP 2.5 s, total blocking time 660 ms. Earlier runs during this implementation scored 82–83. This does not reproduce the older saved performance score of 91; JavaScript blocking remains a performance issue. Navigation prefetching is disabled for the main mobile and settings links, but that change did not demonstrate a score improvement. These desktop-hosted simulations do not establish physical Android performance or signed-in screen performance.

## Earlier prototype validation · 14 October 2026

The Next.js static production build succeeds and exports 21 pages. Content validation checks 25 visible source-checked entries, ten lessons and thirty questions. Eleven unverified literary/proverb candidates remain outside the displayed content bundle.

| Check                                                              | Result                                                                                                                           |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| CGPA, retakes, exact class thresholds, reverse targets             | Unit tests pass                                                                                                                  |
| Momentum gaps, skipped quizzes, rate limits, rest weeks            | Unit tests pass                                                                                                                  |
| Verified-only selection, sources, dictionaries and content schemas | Unit tests pass, including rejection of missing sources                                                                          |
| Unit suite                                                         | 30 tests pass                                                                                                                    |
| TypeScript strict and accessibility/Next lint                      | Pass                                                                                                                             |
| Production build                                                   | Pass; native Windows compiler repaired and loads successfully                                                                    |
| Offline simulator, navigation, lesson and complete quiz            | Pass in Edge with the network disabled                                                                                           |
| Encoded dynamic-route JavaScript assets                            | Cache lookup normalizes encoded/literal brackets; offline regression passes                                                      |
| Export, full IndexedDB deletion, and persistence                   | Pass                                                                                                                             |
| Guest mode                                                         | Works without saving; memory export works; refreshing clears the visit                                                           |
| Privacy network checks                                             | Core requests are GET-only, with no learner request bodies or page errors                                                        |
| Axe WCAG AA                                                        | Zero violations across nine desktop/mobile screens and variants                                                                  |
| Keyboard only                                                      | Onboarding, consent, navigation, grade selection, complete quiz, export and deletion pass using Tab, Enter, Space and arrow keys |
| Mobile layout                                                      | No horizontal overflow at 390 px, including large text and contrast mode                                                         |
| Offline precache                                                   | 93 same-origin shell/content assets                                                                                              |
| Lighthouse 11, simulated mobile at 390 px                          | Performance 91; accessibility 100; best practices 100                                                                            |
| Mobile paint and blocking                                          | FCP 0.9 s; LCP 2.4 s; total blocking time 320 ms                                                                                 |

Browser reports, Lighthouse HTML/JSON and screenshots are in the ignored `artifacts/` directory. The browser checks use the existing Edge installation and a fresh isolated profile. They never interact with the user's regular browser profile. The preview server compresses text assets with gzip; the public welcome screen is rendered before local-data restoration, with its form disabled until restoration completes.

## Limits and remaining editorial work

- First-load JavaScript is approximately 148–158 KB as reported by Next.js, exceeding the aspirational 100 KB critical-path target. All-route JavaScript is about 316 KB gzipped. Every individual lesson remains below 200 KB. No external fonts or default media downloads are used.
- Pidgin translations are machine-labelled. Some quiz and secondary copy remains in English pending a speaker's review.
- Source checks and quiz answer review were automated. Independent human editorial and cultural review remain pending and are explicitly shown in source details. No unverified or invented attributed quotes are displayed.
- The institutional grading caveat, historical Pass band and prototype F=0 assumption are visible. Course templates and calendar patterns are examples, not institutional policies.
- Local speech depends on installed local voices. Screen-reader usability and a physical-device installation check would benefit from a human pass.
- The optional AI helper is omitted. The core has no backend, learner accounts or third-party analytics.
