# PROJECT.md: Kora (Future Self Lab)

Instructions for the coding agent building this app. Read this whole file before writing code. Copy it to the project root (`C:\Interswitch\tinker\PROJECT.md`) when starting.

## 1. What we are building
Kora is an offline-first, privacy-first learning companion PWA for Nigerian school leavers and university freshers. It helps them stay in their learning journey and not drop off.

Core features:
1. **Future Self Lab**: CGPA simulator on the Nigerian 5.0 scale (mock courses, grades, what-if, reverse target planner).
2. **Motivation library**: verified quotes, 60-second story cards and proverbs, shown at the right moments.
3. **Momentum engine**: on-device, rule-based, explainable drop-off detection with gentle recovery (rest tokens, 5-minute re-entry, welcome-back recap).
4. **Fresher-skills micro-lessons** with a reviewed quiz bank.
5. **Optional AI "explain simply" helper**: retrieval-only, citations required. Build last, only if everything else works.

Context: 5-day solo hackathon prototype. Favor a working, demo-able, well-tested core over breadth. The app must be easy to extend by adding data files (content, languages, country packs).

## 2. Non-negotiable rules
These come from the hackathon's operating constraints. Never violate them.

1. **Credibility.** Every lesson, quote, story and proverb has a visible source badge (publisher/author, source work, year, link, license/fair-use note, verification status). Never invent, edit, paraphrase-as-quote or "improve" a quote. Only entries with `verificationStatus: "verified"` are shown in the UI. If you cannot verify a quote, do not make one up: add the entry as `"unverified"` with a TODO and leave it hidden, or leave it out.
2. **Low bandwidth.** Offline-first. Core flows (simulator, lessons, quizzes, library, momentum) must work with no network. No backend for core features. Budgets: app shell under 100 KB gzipped JS on the critical path where realistic, each lesson bundle under 200 KB, no images/video/audio by default, no heavy UI or animation libraries.
3. **Accessibility.** WCAG 2.2 AA baseline: semantic HTML, labels, visible focus, 44px minimum tap targets, sufficient contrast, keyboard operable, no time-limited quizzes, respects `prefers-reduced-motion`. Include text-to-speech, text size control, high-contrast mode, plain-language toggle and a low-literacy icon-led mode.
4. **No lock-outs.** Nothing is ever locked or gated. Every lesson is always open. All profile fields are optional. Adaptive suggestions are offers with a stated reason and an off switch. Never show "at risk", "failing" or similar labels to the learner.
5. **Privacy.** Only a nickname is needed. No accounts. All learner data (profile, mock plans, grades, progress, momentum) lives in IndexedDB on the device. Nothing about the learner is sent to any server in core flows. Provide plain-language consent, "Export my data" (JSON download) and "Delete my data". No third-party analytics or trackers.
6. **Multilingual.** Every UI string is externalized (no hard-coded copy in components). Languages: English (`en`) and Nigerian Pidgin (`pcm`). Mark machine-translated strings as such and keep the original language visible on quotes. Design layout so RTL could be added later (use logical CSS properties).
7. **Local relevance.** Nigeria country pack: NUC-style grading scale and classes, typical first-year/GST courses, Nigerian and African voices, Yoruba/Igbo/Hausa proverbs (credited to the culture), exam-season rest-token suggestions.
8. **Tone.** Warm, encouraging, never shaming. No streak-loss guilt. The simulator is a planning tool, not a predictor. Never say "you will fail". Always add: "Estimate only. Your institution's rules decide your official result."

## 3. Tech stack
- Next.js (App Router) + TypeScript (strict), React
- Tailwind CSS (small, purged build) or CSS modules; keep CSS light
- IndexedDB via Dexie for all local data
- Service worker for offline (Serwist/next-pwa or a small hand-written one); web app manifest; installable
- i18n: a lightweight approach (e.g. `next-intl` or a simple typed dictionary + hook); keep it small
- Static JSON content in `/content`, validated by a schema (Zod) at build/test time
- Vitest for unit tests; Playwright optional for one offline smoke test
- ESLint + Prettier, plus an accessibility lint (`eslint-plugin-jsx-a11y`)
- Deploy: static-friendly (Vercel/Netlify). Only the optional AI route needs a server function.

Avoid adding dependencies without a clear need. Keep the bundle small.

## 4. Suggested structure
```
/app
  /(onboarding)/welcome, /consent
  /(app)/home, /lab (simulator), /library, /learn, /learn/[lessonId], /settings, /privacy
  /api/explain (optional AI route)
/components        UI primitives, SourceBadge, GradePicker, CgpaSummary, StoryCard, QuizCard, RestTokenPrompt, Tts controls
/lib
  /cgpa            calculator, planner (pure functions + tests)
  /momentum        engine (pure functions + tests)
  /triggers        content selection rules
  /db              Dexie schema, repositories, export/delete
  /i18n            dictionaries (en, pcm), hook
  /a11y            TTS wrapper, preference handling
/content
  /ng              gradingScale.json, courseTemplates.json, examCalendar.json
  /library         entries.json (quotes, stories, proverbs, tips)
  /lessons         one JSON/MD file per lesson + quizzes.json
  /i18n            en.json, pcm.json
/public            manifest, icons (small)
/tests
```

## 5. Data model

### Local (IndexedDB via Dexie)
- `profile`: id, nickname, language, optionalFields (all optional), createdAt
- `settings`: quietMode, motivationFrequency, ttsEnabled, textScale, highContrast, plainLanguage, lowLiteracyMode, adaptiveSuggestions (on/off), consentAcceptedAt
- `mockPlans`: id, name, semesters[]
- `mockCourses`: id, planId, semesterIndex, code, title, creditUnits, plannedGrade (nullable), status (`planned`|`retake`)
- `targets`: id, planId, type (`cgpa`|`class`), value, derivedWeeklyHours
- `progress`: lessonId, status, completedAt, quizResults[]
- `sessions`: id, startedAt, durationSec, lessonsTouched, quizzesSkipped
- `momentum`: restTokens, restTokensUsed[], weekProgress[], lastState (internal), lastOfferAt, lastReason
- `savedEntries`: libraryEntryId, savedAt (favorites / "reasons I'm doing this")

### Static content schemas (validate with Zod)
`LibraryEntry`: id, type (`quote`|`story`|`proverb`|`tip`), text or summary, author, sourceWork, year, sourceUrl, page, originalLanguage, translations[{lang, text, translationType: `original`|`human`|`machine`}], license, verificationStatus (`verified`|`unverified`), verifiedBy, verifiedAt, themes[], moments[] (`firstWeek`|`dip`|`hardTarget`|`preExam`|`return`|`milestone`), readingLevel, country[], tryThisToday (optional micro-goal link)

`Lesson`: id, title (per language), sections[], estimatedMinutes, sources[], readingLevel, tags[], quizIds[]

`QuizItem`: id, lessonId, prompt, options[], correctIndex, explanation, source, reviewStatus (`reviewed`|`ai-generated`)

`GradingScale`: id, name, bands[{minScore, maxScore, grade, points}], maxPoints, classes[{minCgpa, maxCgpa, label}], sourceNote, editable

`CourseTemplate`: programme, level, semester, courses[{code, title, creditUnits}], note ("typical, editable")

## 6. Core logic specs

### 6.1 CGPA (pure functions in `/lib/cgpa`, fully unit-tested)
- Semester GPA and CGPA = sum(gradePoints x creditUnits) / sum(creditUnits), over courses that have a planned grade.
- Ignore courses with no grade; return `null` (not NaN/0) when there is nothing to compute. Guard divide-by-zero.
- Retakes: for MVP, a retake replaces the earlier attempt's grade in the CGPA (document this assumption in the UI as editable behavior; keep logic isolated so institutional rules can change it).
- Round for display to 2 decimals; never round before computing.
- Class label from CGPA using the scale's class bands. Handle boundaries exactly (e.g. 3.50 is Second Class Upper).
- Reverse planner: given current completed credit units and points, a target CGPA and remaining credit units, compute the required average grade points over the remaining units. Convert to a letter-grade hint. If the required average exceeds the scale maximum, report "not reachable" and propose the best reachable class and a stepped target. Provide steps (e.g. aim for 3.5 first, then reassess). Never discouraging language.
- Weekly study hours estimate: a simple, editable heuristic per credit unit (e.g. 2-3 hours per unit per week), labeled as an estimate.

Default Nigerian scale (VERIFY against an official NUC/institution source and record the source in `sourceNote`; keep it editable):
| Score | Grade | Points |
|---|---|---|
| 70-100 | A | 5 |
| 60-69 | B | 4 |
| 50-59 | C | 3 |
| 45-49 | D | 2 |
| 40-44 | E | 1 |
| 0-39 | F | 0 |

| CGPA | Class |
|---|---|
| 4.50-5.00 | First Class |
| 3.50-4.49 | Second Class Upper |
| 2.40-3.49 | Second Class Lower |
| 1.50-2.39 | Third Class |
| 1.00-1.49 | Pass |

Course templates: build typical first-year/GST-style lists (e.g. GST courses plus a few programme courses like Computer Science). Credit units and titles must be marked "typical, editable". Do not claim they match any specific school or the official CCMAS document.

### 6.2 Momentum engine (pure functions in `/lib/momentum`, unit-tested)
Inputs: days since last session, recent session length vs the learner's own average, quizzes skipped, planned vs completed study, rest tokens, exam calendar.
Output state (internal only, never displayed as a label): `steady` | `drifting` | `paused`.
Suggested rules (keep as editable constants in one config file):
- `steady`: last session within 2 days and session length at least 60% of own average
- `drifting`: gap of 3-5 days, or session length under 60% of own average for 3 sessions, or 2+ consecutive skipped quizzes
- `paused`: gap of 6+ days
Offers (each shows its reason and can be dismissed or disabled; offers are never required):
- shrink to a 5-minute minimum win
- suggest a different time
- offer a rest token (grant a small number per learning week, e.g. 2; unused tokens do not expire within the term)
- welcome-back flow after a gap: warm message plus a short recap quiz from lessons already done, not new material
Learning-week progress: count weeks with at least one session or a used rest token as "kept".
Rate-limit offers (e.g. one per day) and respect `quietMode` and `adaptiveSuggestions: false`.
Provide a dev/demo "simulate time passing" control that advances the app clock for the demo persona. Isolate time behind an injectable clock so tests and the demo can control it.

### 6.3 Triggers (`/lib/triggers`)
Select library entries by moment + theme + language + reading level + country, only from `verified` entries, deterministic with a seeded rotation so the same entry is not repeated too soon. Moments: firstWeek, dip, return, hardTarget, preExam, milestone. Fall back to a neutral encouraging message from human-written UI copy if no entry matches. Respect quiet mode and frequency settings.

### 6.4 Optional AI helper (`/api/explain`), build last
- Input: question + the retrieved lesson passages (chosen client-side or server-side from static content). No profile data, no grades, no identifiers.
- Must answer only from the supplied passages and cite them (lesson id + section). If not covered, reply: "I don't know from this lesson" and link to the source.
- Never generates quotes or facts beyond the passages.
- API key only on the server in an environment variable. Provider must not retain/train on data where configurable.
- Hide the button or show "needs internet" when offline. App must work fully when this route is absent.
- Label the output "AI-generated from [source]".

## 7. Screens (mobile-first)
1. **Welcome / onboarding**: nickname (only required field), language (en/pcm), optional fields, plain-language consent. One task per screen.
2. **Home**: today's 5-minute step, learning-week progress, rest tokens, one contextual story/quote (if allowed), link to the Lab.
3. **Lab (simulator)**: choose a programme template or add courses; credit units; grade per course; live GPA/CGPA/class; what-if (change one grade, see the difference); target setter with the stepped plan and weekly study hours; edit grading scale; always show the estimate disclaimer.
4. **Library**: browse/filter verified entries by theme/type; source badge; save favorites; "Try this today" button; "Report an error" link; original language shown with translations.
5. **Learn**: lesson list (all unlocked), lesson reader (with TTS), quiz (untimed), source list.
6. **Welcome-back / recovery sheets**: gentle, optional, dismissible.
7. **Settings**: language, text size, high contrast, TTS, plain-language, low-literacy mode, quiet mode, frequency, adaptive suggestions on/off.
8. **Privacy**: what is stored, export my data, delete my data.

"Report an error": no backend required; use a `mailto:` link prefilled with the entry id, or store reports locally and let the user export them.

## 8. Content to author
- **Library (about 25-30 entries, grows later):** draw from the shortlist below. **Verify every quote against a primary source before marking it `verified`.** Prefer short excerpts, paraphrased story summaries with a link to the source, and public-domain/openly-licensed material. If you cannot access a source to verify, do not include the wording; add a placeholder entry marked `unverified` with the source to check, so a human can verify it.
  - Nigerian and African: Chinua Achebe (*Things Fall Apart* proverbs; switched from medicine to English at Ibadan), Chimamanda Ngozi Adichie (TED "The Danger of a Single Story"; commencement speeches), Wole Soyinka (*Ake*; Nobel lecture), Ngozi Okonjo-Iweala (memoir/interviews), William Kamkwamba (*The Boy Who Harnessed the Wind*; TED talk), Wangari Maathai (*Unbowed*; 2004 Nobel lecture), Nelson Mandela (*Long Walk to Freedom*; Fort Hare).
  - Global: Malala Yousafzai (*I Am Malala*; UN speech), Carol Dweck (*Mindset*, labeled paraphrase), Barbara Oakley ("Learning How to Learn").
  - Proverbs: Yoruba, Igbo, Hausa, credited to the culture, from published collections or Achebe's text.
  - Beware of misattributed quotes (e.g. the "Our deepest fear is that we are powerful beyond measure" passage is Marianne Williamson's, not Mandela's). If a quote is only "commonly attributed", skip it.
- **Lessons (8-10, each under 200 KB, each with sources):** time management in the first semester, note-taking, reading a course outline and credit units, understanding GPA/CGPA, exam preparation, asking for help (lecturers, course reps, counseling), avoiding burnout, using the library/open resources, staying consistent when life interrupts, and managing data/power constraints for study. Use credible open sources (e.g. OpenStax, university study-skills guides, Learning How to Learn); link them and note licenses.
- **Quizzes:** 3-5 reviewed items per lesson; mark `reviewStatus`.
- **Pidgin strings:** translate core UI and coaching copy; mark `translationType: "machine"` until a human reviews them.
- **Exam calendar:** a generic Nigerian university semester pattern, editable by the learner (no claims about specific institutions).

## 9. Build order
1. Scaffold Next.js + TS strict, lint/format, Vitest, PWA shell, mobile layout, i18n skeleton (en/pcm), Dexie schema.
2. `lib/cgpa` + tests first (including boundary and divide-by-zero cases), then the Lab UI, what-if and target planner.
3. Content schemas (Zod) + validation script; SourceBadge; library UI; seed verified entries.
4. Lessons, reader, quiz, TTS.
5. Momentum engine + tests, rest tokens, learning-week progress, triggers, welcome-back flow, demo clock.
6. Accessibility pass (keyboard, screen reader labels, contrast, text scale, low-literacy mode, reduced motion).
7. Privacy: consent, export, delete.
8. Offline: service worker, precache shell and content, airplane-mode test.
9. Seed demo persona "Tunde" (Computer Science fresher, 3.5 target) with data that shows a dip and recovery via the simulate-time control.
10. Optional AI helper.
11. Final accuracy review of every shown content entry; constraints checklist page/slide.

Cut order if time slips: AI helper, Pidgin coverage beyond core strings, low-literacy mode, pre-exam trigger.

## 10. Testing and definition of done
- Unit tests: CGPA (typical cases, boundaries 3.50/4.50/2.40, no graded courses, retakes, reverse planner including unreachable targets), momentum rules and rate-limiting, trigger selection (only verified, quiet mode honored), schema validation of all content files.
- A script/test fails the build if any displayed content lacks a source or has `verificationStatus` other than `verified`.
- Offline check: after first load, simulator, lessons, quizzes, library and momentum work with the network disabled.
- Accessibility: automated checks (axe/jsx-a11y) pass; manual keyboard-only pass of the main flows.
- Performance: Lighthouse mobile PWA/performance check on throttled network; stay within the bundle budgets.
- Privacy: confirm via the network tab that core flows make no requests with learner data; export and delete both work.
- Done when the demo script runs end to end:
  1. Open with only a nickname.
  2. Build a mock first semester, set a 3.5 target, see the stepped plan and weekly hours.
  3. Open a source-badged story card and tap "Try this today".
  4. Simulate 4 missed days; get a 5-minute re-entry offer with a verified story; use a rest token.
  5. Go offline; lesson, simulator and quiz still work.
  6. (If built) "Explain simply" answers with a citation and refuses out-of-scope questions.

## 11. Working agreements for the agent
- Follow the build order. Keep commits small and the app runnable at each step.
- Keep pure logic (cgpa, momentum, triggers) free of UI and storage so it is easy to test.
- Put all copy in the i18n dictionaries. Put all tunable thresholds in one config file.
- Do not add analytics, trackers or external fonts/CDNs. Self-host any fonts, subset them, or use system fonts.
- Do not fabricate sources, quotes, statistics, grading rules or institutional policies. When unsure, flag it with a TODO and mark content `unverified`.
- If a requirement here conflicts with time, cut features in the listed order and never the non-negotiable rules in section 2.
- Document in a short `README.md`: how to run, how to add a library entry, a lesson, a language and a country pack, and how to verify a quote.

## 12. Open items for the human
- Confirm the grading scale and class cutoffs against an official source.
- Verify each library entry's wording against the original source.
- Get a Pidgin speaker to review translations.
- Decide the final product name (working title: Kora).
- Provide the AI provider key if the optional helper is built.
