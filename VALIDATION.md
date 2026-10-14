# Prototype validation · 14 October 2026

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
