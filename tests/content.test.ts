import { describe, it, expect } from "vitest";
import { adventureQuestions, learningQuizzes } from "../src/data/questions";
import {
  vocabulary,
  reading,
  conversation,
  listening,
  writing,
  pictureReading,
  culture,
} from "../src/data/content";
import {
  validateBank,
  selectAttempt,
  selectBossRetry,
} from "../src/game/engine";
describe("verified production content", () => {
  it("validates the real 60 question bank", () => {
    expect(validateBank(adventureQuestions)).toEqual([]);
    expect(
      adventureQuestions.filter((q) => q.sourceType === "textbook"),
    ).toHaveLength(30);
    expect(
      adventureQuestions.filter((q) => q.sourceType === "extension"),
    ).toHaveLength(30);
  });
  it("covers all source material", () => {
    expect(vocabulary).toHaveLength(19);
    expect(conversation).toHaveLength(10);
    expect(listening).toHaveLength(5);
    expect(writing).toHaveLength(3);
    expect(pictureReading).toHaveLength(4);
    expect(reading).toHaveLength(5);
    expect(reading.map((p) => p.en).join(" ")).toContain("unpredictable path");
    expect(conversation[9].en).toContain(
      "eight messengers from the underworld",
    );
    for (const name of [
      "Donggang Burning the King Boat",
      "Tamsui Chingshui Yan Cultural Festival",
      "Song Jiang Battle Array",
      "God General Battle Array",
      "White Crane Battle Array",
    ])
      expect(culture.some((c) => c.en === name)).toBe(true);
  });
  it("keeps six 5-question learning quizzes separate", () => {
    const keys = Object.keys(learningQuizzes);
    expect(keys).toHaveLength(6);
    const qs = Object.values(learningQuizzes).flat();
    expect(qs).toHaveLength(30);
    expect(new Set(qs.map((q) => q.id)).size).toBe(30);
    expect(qs.some((q) => adventureQuestions.some((a) => a.id === q.id))).toBe(
      false,
    );
    for (const set of Object.values(learningQuizzes))
      expect(set).toHaveLength(5);
  });
  it("draws balanced attempts with preserved answers", () => {
    for (let i = 0; i < 100; i++) {
      const qs = selectAttempt(adventureQuestions);
      expect(qs).toHaveLength(30);
      expect(new Set(qs.map((q) => q.id)).size).toBe(30);
      expect(qs.filter((q) => q.sourceType === "textbook")).toHaveLength(15);
      expect(
        qs.every((q) => !q.options || q.options.includes(q.correctAnswer)),
      ).toBe(true);
    }
  });
  it("includes each source listening script in the adventure bank", () => {
    for (const script of listening)
      expect(
        adventureQuestions.some(
          (q) => q.audioText === script.en && q.sourceType === "textbook",
        ),
      ).toBe(true);
  });
});

it("Boss retry changes its set even with a fixed random generator", () => {
  const previous = selectAttempt(adventureQuestions, () => 0.5).slice(25);
  const next = selectBossRetry(adventureQuestions, previous, () => 0.5);
  expect(next).toHaveLength(5);
  expect(next.some((q) => !previous.some((p) => p.id === q.id))).toBe(true);
  expect(next.filter((q) => q.sourceType === "textbook")).toHaveLength(2);
});

it("student questions never require an external slide or presentation", () => {
  for (const q of [
    ...adventureQuestions,
    ...Object.values(learningQuizzes).flat(),
  ]) {
    const studentText = [
      q.questionEnglish,
      q.questionChinese,
      q.explanationChinese,
      ...(q.options ?? []),
    ].join(" ");
    expect(studentText, q.id).not.toMatch(
      /\b(slides?|powerpoint|textbook|pptx)\b|投影片|簡報|第\s*\d+[、\d\s]*頁/i,
    );
  }
});
it("reading tasks carry their own visible clues", () => {
  const ids = [
    "s2-text-1",
    "s2-text-2",
    "s2-text-3",
    "s3-text-1",
    "s3-text-2",
    "s3-text-3",
    "s5-text-1",
    "s5-text-2",
    "s6-text-2",
    "s6-text-4",
    "s6-ext-1",
  ];
  for (const id of ids)
    expect(
      adventureQuestions.find((q) => q.id === id)?.referenceText,
      id,
    ).toBeTruthy();
  expect(
    adventureQuestions.find((q) => q.id === "s6-text-2")!.referenceText,
  ).toContain("Fifth month");
  expect(
    adventureQuestions.find((q) => q.id === "s3-ext-5")!.questionEnglish,
  ).toContain("festival app");
});
