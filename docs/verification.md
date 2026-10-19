# Verification — 2026-10-19

## Passed

- Frozen-lockfile reinstall: `npm ci --cache /workspace/.npm-cache`.
- `npm run build`: TypeScript and Vite production build.
- `npm test`: **16 tests passed**, covering the real 60-question bank, 30 separate learning questions, all verified source groups, 100 balanced randomizations, answer identity, deterministic Boss-set variation, hearts/recovery, duplicate/out-of-order official submissions, frozen scoring, Boss thresholds and active timer pauses.
- `npm run test:e2e`: **12 browser tests passed** using system Chromium. Includes each of the six modules and all six five-question mini quizzes, retries, bilingual reading and vocabulary hints, 10 conversation turns/role-play, hidden listening transcripts/text alternatives, writing models, full 30-question adventure with deliberate heart loss/recovery, Boss failure and successful retry, frozen scores, results/review/restart, sound settings, TTS call behavior/speaker voices/speed/cancellation, fallback, keyboard focus trapping, safe navigation and mobile/tablet overflow checks at 390px/768px.
- The same 12 browser tests passed against the built production site using `MAZU_TEST_BASE_URL`.
- Original SVG desktop layout inspected in Chromium. Production server responds to local requests.

## What these checks do not establish

- Mocked speech API tests validate voice selection, cancellation and rate configuration, not the physical sound of voices installed on every school computer. Real TTS availability/quality remains browser and OS dependent, with explicit text fallback.
- Music/effects are original Web Audio synthesis; volume/mute and call paths are implemented. Physical speaker output was not heard during automated tests.
- No live classroom trial, independent cultural expert review or external audit has been performed.
- No Vercel deployment, public-domain interaction check or new-task environment snapshot restoration was performed.

## Failures investigated and resolved

- Earlier placeholder-era tests are replaced by source-backed coverage and full gameplay acceptance.
- The image-based Word Bank and grouped conversation text required visual PDF review plus recursive PPTX extraction; these were completed before content generation.
- Native JSON imports in the Node-based Playwright runner require `with {type: 'json'}`; the production build also accepts this form.
- A reduced-motion transition completed before a synthetic click could land. The test now waits for the documented next story state instead of racing a disappearing skip button; the full adventure then passed.
- A final mini-quiz answer originally jumped directly to completion. It now shows answer/explanation feedback before the student finishes the module.
- Playwright CDN download is blocked by network policy; the environment's existing system Chromium is used with a supported executable-path configuration. TLS/checksum checks were not bypassed.
