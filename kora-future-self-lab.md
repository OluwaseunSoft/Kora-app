# Kora: Future Self Lab (5-day solo hackathon plan)

## 1. Summary
Kora is an offline-first, privacy-first learning companion for Nigerian school leavers and university freshers.
It helps learners stay in their learning journey by combining:
- **Future Self Lab**: a CGPA simulator (mock courses, grades, targets) on the Nigerian 5.0 scale.
- **Motivation library**: verified quotes, 60-second story cards and proverbs, delivered at the moments learners need them.
- **Momentum engine**: on-device, rule-based drop-off detection with gentle recovery (rest tokens, 5-minute re-entry, welcome-back recap).
- **Fresher-skills micro-lessons**: 8-10 sourced lessons.
- **Small retrieval-only AI helper** (optional, last): "explain simply" over vetted lesson text only.

Core principle: help learners keep going without shame, lock-outs or data exposure.

## 2. Constraints and how each is handled
| Constraint | Feature |
|---|---|
| Quality and credibility | Source badge on every lesson/quote/story; verification status; no AI-generated quotes; report-error link; AI limited to retrieved text with citations |
| Low bandwidth / basic devices | Offline-first PWA, static JSON content, no backend for core features, small bundles, no media by default |
| Accessibility and inclusion | Text-to-speech, large text, high contrast, icon-led low-literacy mode, plain-language toggle, no timed quizzes, WCAG 2.2 AA basics |
| Personalization without exclusion | Everything unlocked; all profile fields optional; adaptations are offered, not imposed; off switch; no "at risk" labels |
| Privacy and security | Nickname only; all grades/plans/progress in IndexedDB on device; consent screen; export and delete my data; AI calls send no identifiers |
| Multilingual | i18n for all strings; English + Nigerian Pidgin; machine translation clearly labeled; original language kept on quotes |
| Local relevance | Nigeria pack: NUC-style grading scale and classes, typical first-year/GST courses (editable), Nigerian voices and proverbs, exam-calendar rest-token suggestions |

## 3. Scope (5 days, 1 person)
**In scope**
1. Onboarding (nickname, language, all else optional)
2. CGPA simulator: courses with credit units, grade picker, live GPA/CGPA and class, what-if changes, reverse target planner with stepped targets
3. Motivation library: about 25-30 verified entries with source badges
4. 8-10 fresher-skills micro-lessons plus a reviewed quiz bank
5. On-device momentum engine, rest tokens, learning-week progress, welcome-back recap
6. Triggers: momentum dip, hard target, first week, pre-exam
7. Accessibility features and privacy controls
8. Offline support (service worker)
9. Small retrieval-only AI "explain simply" helper (only if Days 1-4 are done)

**Deferred (roadmap slide)**
SMS/WhatsApp, buddy/cohort views, school-leaver admissions simulator, other country packs, community contributions, scenario comparison, retake modelling, more languages.

## 4. Tech stack
- Next.js (TypeScript) PWA, mobile-first, service worker for offline
- IndexedDB via Dexie for all learner data (no accounts, no learner data on a server)
- Static versioned JSON for content: lessons, quotes/stories, grading scale, course templates, trigger rules
- i18n with externalized strings (en, pcm)
- Unit tests for CGPA and momentum logic
- Deploy to Vercel or Netlify; keep a local-run fallback for the demo
- AI helper (stretch): one small serverless route (Next.js API route) that holds the API key, receives only the question plus retrieved lesson passages, strips identifiers, and requires citations. Offline, the button is hidden or shows "needs internet". This is the only server-side piece.

## 5. Nigerian grading scale (verify against an official source on Day 1)
Typical NUC-style 5.0 scale, shipped as an editable scale labeled "Typical scale. Check your institution's handbook."

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

Formula: CGPA = sum(points x credit units) / sum(credit units).
Every output says: "Estimate only. Your institution's rules decide your official result."
Course templates (typical, editable) draw on the NUC CCMAS framework and common GST courses; do not claim they match any specific school.

## 6. Motivation library: policy and shortlist

### Policy
- Fields per entry: id, type (quote/story/proverb/tip), text or summary, author, source work, year, page/URL, original language, translation type (original/human/machine), license or fair-use basis, verification status, themes, reading level, audio reference (optional).
- Only entries verified against a primary or reputable source are published. "Commonly attributed" means skip.
- The AI never generates, edits or improves quotes. Selection is rule-based by trigger, theme and language.
- Quotes are short and linked. Longer modern-book material is a paraphrased story summary plus a link, to avoid copyright issues.
- Story cards end with "Try this today", linked to a micro-goal.
- Do not rely on memory for wording. Verify every quote against the source on Day 2.

### Shortlist (people and sources to verify, extendable later)
Nigerian and African voices (priority):
- Chinua Achebe: *Things Fall Apart* (proverbs), biography (switched from medicine to English at Ibadan)
- Chimamanda Ngozi Adichie: TED "The Danger of a Single Story", commencement speeches
- Wole Soyinka: *Ake*, Nobel lecture
- Ngozi Okonjo-Iweala: memoir and interviews on education and perseverance
- William Kamkwamba: *The Boy Who Harnessed the Wind*, TED talk (self-taught from library books)
- Wangari Maathai: *Unbowed*, 2004 Nobel lecture
- Nelson Mandela: *Long Walk to Freedom* (Fort Hare expulsion and return)

Global voices:
- Malala Yousafzai: *I Am Malala*, UN speech
- Carol Dweck: *Mindset* (growth mindset, labeled paraphrase)
- Barbara Oakley: "Learning How to Learn"

Proverbs: Yoruba, Igbo, Hausa, credited to the culture, from published collections or Achebe's text; native-speaker check where possible.

Fresher guidance: open or institutional orientation and study-skills sources.

Known trap: widely shared quotes are often misattributed (e.g. the "Our deepest fear is that we are powerful beyond measure" passage is Marianne Williamson's, not Mandela's). Trace every quote to a primary source.

## 7. Trigger map
| Moment | Action |
|---|---|
| First week | Orientation tips, "you're not the only one lost" story, "Mock my first year" prompt |
| Momentum dip | Warm story/quote, 5-minute minimum win, offer rest token |
| Return after a gap | Welcome-back message and short recap quiz |
| Hard target in simulator | Resilience story, stepped target suggestion |
| Pre-exam period | Calm-focus tips, rest-token suggestion |
| Milestone | Short celebration |
All content optional, with quiet mode and a frequency control.

## 8. Momentum engine (on-device, explainable)
Inputs: days since last session, recent session length vs own average, skipped quizzes, planned vs completed study.
Output: internal state (steady / drifting / paused) used only to offer support; never shown as a label, never gates content.
Offers: shrink task, reschedule, rest token, recap. Each offer states why it is shown and can be turned off.
Progress counted in learning weeks; rest tokens protect against exams, power cuts, no data.

## 9. Data model (IndexedDB, local only)
- Profile: nickname, language, optional fields, settings (quiet mode, TTS, contrast, text size)
- MockPlan: id, name, semesters[]
- MockCourse: code, title, creditUnits, plannedGrade, status
- Target: type, value, derivedWeeklyHours
- Progress: lessonId, completedAt, quizResults, sessionLog
- Momentum: restTokens, weekProgress, lastState
- Content (static JSON): lessons, quotes/stories, gradingScale, courseTemplates, triggerRules

## 10. Day-by-day schedule
**Day 1: Foundations**
- Scaffold PWA, routing, mobile layout, design basics
- Dexie schemas
- Verify grading scale; CGPA module plus unit tests
- Draft typical first-year course list
- i18n setup (en, pcm)

**Day 2: Simulator and library**
- Simulator UI: courses, grade picker, live GPA/CGPA/class
- What-if changes, reverse target planner with stepped targets
- Source-badge component, report-error link
- Verify and enter first batch of library entries

**Day 3: Lessons and momentum**
- 8-10 micro-lessons with sources (time management, note-taking, exam prep, asking for help, using the library, etc.)
- Lesson reader and quiz from reviewed bank
- Momentum engine, rest tokens, learning-week progress

**Day 4: Triggers, accessibility, privacy**
- Trigger logic and welcome-back flow
- TTS, large text, high contrast, low-literacy icon mode, keyboard/screen-reader pass
- Consent copy, export and delete my data, quiet mode
- Pidgin translations of core strings (flag as machine-translated if not reviewed)

**Day 5: Offline, AI helper (if time), polish, demo**
- Service worker caching and airplane-mode test
- Throttled-network and low-end-device check
- AI "explain simply" helper (only if everything above works): retrieval-only, citations required, refusal when not covered, no identifiers
- Seed demo persona (Tunde) and a "simulate time passing" control
- Final accuracy read-through of every library entry
- Constraints checklist slide, roadmap slide, demo script

Cut order if time slips: AI helper, Pidgin coverage beyond core strings, low-literacy mode, pre-exam trigger.

## 11. Demo script (about 3 minutes)
1. Tunde opens the app with only a nickname.
2. Builds a mock first semester and sets a 3.5 target; sees a stepped plan with weekly study hours.
3. Opens a source-badged story card and taps "Try this today".
4. Simulate 4 missed days; engine offers a 5-minute re-entry with a verified story; he uses a rest token.
5. Airplane mode: lesson, simulator and quiz still work.
6. (If built) "Explain simply" answers with a citation, and refuses out-of-scope questions.
7. Constraints checklist slide.

## 12. Risks
- Content verification is slow: keep batches small; each verified entry is shippable.
- Grading rules vary by institution: editable scale and "estimate only" wording.
- Machine-translated Pidgin: label it, limit to core strings, get a speaker to review if possible.
- Solo time pressure: follow the cut order above.
- AI helper adds a server dependency: keep it optional so the app works fully without it.

## 13. Success measures (for the pitch)
- Works fully offline for core flows
- Lesson and app shell sizes within budget (target under 200 KB per lesson, under 100 KB app shell)
- Every content item has a visible source
- Zero learner data leaves the device in core flows
- Simulated cohort: day-7/14/30 return and gap-recovery rates, with a note that real measurement would follow a pilot

## 14. Open items
- Confirm the grading scale and class cutoffs against an official source (Day 1)
- Confirm the final shortlist of verified quotes after checking sources (Day 2)
- Find a Pidgin speaker to review translations
- Decide on the product name (working title: Kora)
