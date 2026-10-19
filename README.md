# Mazu Adventure

The Journey of Faith & Culture — a static, bilingual English learning website for Taiwanese vocational high school students (CEFR A2–B1).

## Features

- Six independent learning modules: vocabulary, full original reading, complete conversation, illustrated cultural gallery, five listening scripts and writing practice.
- Each module includes a separate five-question retryable mini quiz.
- 60-question adventure bank: 10 per stage, five textbook-adapted and five extension questions. Every game draws 30 balanced questions across six sequential stages.
- Original SVG Taiwanese temple, consistent animated explorer, side-scrolling conceptual map, skippable story/transition animations and reduced-motion support.
- Three hearts, missed-question correction recovery, first-answer records, unlimited randomized Boss retries, frozen first-attempt scores and reviewable results/badges.
- Browser TTS with adjustable speed, line/full-dialogue playback, distinct speaker voices when available and transcript fallback. Original Web Audio music/effects with mute and volume controls. Music stops during speech and when the page is hidden.
- No login, database, API key or stored student progress. Refreshing starts a new session. Navigation away from a live adventure asks before discarding the session.

The authoritative 17-slide PPTX supplied by the user has been visually inspected and incorporated. See `docs/source-coverage.md` for fidelity notes and attribution. Source textbook images and the presentation are not bundled. Newly written vocabulary meanings/examples and extension questions are labeled. The unverified worldwide festival ranking is marked as a textbook claim.

## Develop

```sh
cd /workspace/religion
npm ci --cache /workspace/.npm-cache
npm run dev
```

Use the existing isolated checkout; do not create a Git worktree unless requested.

## Verify

```sh
npm test
npm run test:e2e
npm run build
```

Playwright uses `/usr/bin/chromium` if available, otherwise its installed Chromium. On another machine, install the browser using `PLAYWRIGHT_BROWSERS_PATH=/workspace/.cache/ms-playwright npx playwright install chromium`, or adjust the browser-cache path in `package.json`. Browsers/OS voices vary; text alternatives remain available.

## Edit content

- `src/data/content.ts`: 19 vocabulary entries, all dialogue turns, listening scripts, writing originals/models, gallery and picture-matching statements.
- `src/data/reading.json`: complete reading with Chinese translations.
- `src/data/questions.ts`: official adventure questions and independent mini quizzes.
- `src/data/lesson.ts`: module/stage metadata.
- `src/game/engine.ts`: schema, validation, sampling, score constants, hearts and recovery.

Each official question includes an ID, stage, interaction type, difficulty, source type/slide, objective, English/Chinese prompt, correct answer, explanation and vocabulary notes. Choice questions also include options, listening questions an audio script; source references are attached where useful. Keep exactly five textbook-adapted and five extension questions per stage. Tests reject invalid counts, duplicate IDs and broken answer identities. Review edited content against the source and rerun all checks before release.

Score: correct first answers / 30 × 70 + speed (20 at ≤900 seconds, falling linearly to 0 at 1800) + first-attempt remaining hearts / 3 × 10. The score is rounded/clamped to 0–100 and frozen after question 30. Recovery and Boss retries do not change it. A Boss pass requires ≥4/5, independently of score.

Open-ended writing uses model answers and a visible self-review checklist. It does not claim automatic general English grammar assessment. Fixed gaps/order tasks compare normalized text only.

## Deploy/update

Vercel-compatible static output is `dist`, build command `npm run build`. See `docs/deployment.md` for the publication process and truthful current deployment status. The site does not need runtime secrets.
