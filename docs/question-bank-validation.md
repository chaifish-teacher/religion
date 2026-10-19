# Question bank validation

Validated against the uploaded 17-slide deck on 2026-10-19. Editable questions are in `src/data/questions.ts`; rules and the reusable validator are in `src/game/engine.ts`.

| Stage | Textbook-adapted | Extension | Total |
|---|---:|---:|---:|
| 1 Temple Entrance | 5 | 5 | 10 |
| 2 Meet the Guardians | 5 | 5 | 10 |
| 3 Festival Journey | 5 | 5 | 10 |
| 4 The Sacred Parade | 5 | 5 | 10 |
| 5 Talk to a Traveler | 5 | 5 | 10 |
| 6 The Final Blessing | 5 | 5 | 10 |
| **Total** | **30** | **30** | **60** |

Mechanical validation checks unique IDs, unique normalized English prompts, valid source slides (1–17), stage IDs, type/difficulty/source enums, required fields, options with an unambiguous answer identity, complete Traditional Chinese explanations, and listening-script presence. Optional notes and references can be omitted when not relevant; every question includes the vocabularyNotes field.

Each official attempt draws five questions per stage, alternating 3:2 and 2:3 textbook/extension distributions: exactly 15 of each across 30 questions. Selected questions, options and ordering word tokens are shuffled while preserving answer identity. Selection rejects an invalid bank. Production-bank randomization is exercised over 100 attempts in the unit suite.

Interaction types: multiple choice, text gap/spelling, listening and click/keyboard sentence ordering. Vocabulary matching and illustrated reading matching are additional learning activities. Production mini quizzes are a separate 30-item set (six groups of five); their IDs do not overlap the adventure bank.

Content review: questions were checked against the indicated slide and for A2–B1 readability, answer clarity and lesson relevance. Definitions adapted from the verified Word Bank count as textbook-derived; scenario applications, language construction and integrative tasks are labeled extension. All newly written questions are adaptations, not claims to reproduce an original textbook quiz verbatim. Normalized prompt validation detects exact textual duplication, not every possible semantic similarity. Related concepts intentionally recur across reading, conversation and integrated final-stage tasks.

Run `npm test` to rerun real-bank validation, source coverage, learning-bank separation and the engine tests. No teacher dashboard or answer-key route is added to the student UI.

## Classroom independence revision

All 90 prompts (60 official plus 30 learning questions) have been reviewed for dependence on an external deck. Page-number questions and references to unseen exercises/images have been rewritten as direct language/culture tasks or self-contained notices, messages and itineraries. A GPS-map comprehension task replaces the slide-ranking question. Reading clues appear expanded beside the question rather than behind a source accordion. Listening keeps replay and optional transcripts. Source types/slides remain in development data, but are not shown on student question cards. Bank size, source split, answer identities and scoring rules are unchanged.

New tests reject presentation/page references in student prompts, options and feedback and require reading clues for context-dependent tasks. These are learning adaptations of the verified material, not current event announcements or reproductions of actual temple notices.
