# Manual accessibility and physical-device protocol

Status: not run by a human. Automated browser and axe results are separate evidence.

Record the actual tester, date, device/model, OS, browser, assistive technology/version, input method and app content version. Capture issues with task, expected result, observed result and severity. Do not include learner names or grades in shared screenshots.

## Screen reader

Use TalkBack on a physical Android phone and, where available, NVDA with Edge on Windows. Ask a screen-reader user to complete the following without assistance beyond the task prompt:

1. Read onboarding and storage choices; continue without saving.
2. Navigate by headings and landmarks to the Lab and My semester.
3. Add a course, identify each credit/grade label, and distinguish recorded grades from a scenario.
4. Read the target estimate and its limitations. Open grading rules and identify the document edition, source link and pending review status.
5. Add an assignment, complete it, add/reschedule a study session, and verify that completion controls identify the correct task.
6. Answer a practice question incorrectly, understand the feedback and correct answer, move to the next question, and revisit the mistake. Check focus and live announcements.
7. Export and restore a backup, understand the replacement preview, and recover after an invalid file. Identify the research summary as different from a full learner backup.
8. Switch text size, contrast and language; check reading order, accessible names, Pidgin fallback notices and content reflow.

Record whether the user succeeded independently, needed a hint or could not complete the task. Ask which wording or focus movement caused confusion. A zero-violation axe report is not a pass for these tasks.

## Physical Android and storage resilience

Use at least one modest Android device with limited free storage and one newer device. Record actual hardware rather than describing an emulated desktop as a phone.

1. Start from cleared site data; measure time until usable onboarding and until offline-ready. Record transferred bytes, network conditions and three repeated cold starts. Do not infer physical performance from Lighthouse alone.
2. Install the PWA. Add courses, a deadline and a session; relaunch from the installed icon in airplane mode. Complete a lesson and review, navigate all routes, export data, force-close, and relaunch offline.
3. Install an older build, create learner data, then serve a newer build. Disconnect during the update. The previous offline shell should remain usable until a complete new cache activates. Reconnect, finish the update and check learner data.
4. Test denied storage/private mode, an interrupted restore and storage exhaustion where the test environment permits it. Back up test data first. Record the actual error and whether the last saved snapshot survives.
5. Clear only browser storage using normal browser controls; reinstall, restore a test backup and verify course/plan/review counts. Browser eviction can remove local data; do not claim it is prevented.
6. At 200% text size and browser zoom, check labels, selects, date controls, the fixed mobile navigation, feedback and visible focus. Test landscape and reduced-motion settings.

Use `device-matrix.csv` to record results. Leave untested cases pending. Reference the completed report in `signoffs.json` only after a qualified person reviews the results.
