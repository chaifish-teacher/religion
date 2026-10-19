import { describe, it, expect } from "vitest";
import {
  score,
  selectAttempt,
  validateBank,
  newGame,
  answerOfficial,
  recover,
  retryBoss,
  ActiveTimer,
  type Question,
} from "../src/game/engine";
// Synthetic fixtures test mechanics only. These are never imported into the application.
const bank: Question[] = Array.from({ length: 60 }, (_, i) => ({
  id: `fixture-${i}`,
  stageId: Math.floor(i / 10) + 1,
  type: "choice",
  difficulty: "A2",
  sourceType: i % 10 < 5 ? "textbook" : "extension",
  sourceSlide: (i % 17) + 1,
  learningObjective: "Test fixture",
  questionEnglish: `Synthetic test prompt ${i}`,
  questionChinese: "僅供測試",
  options: ["yes", "no"],
  correctAnswer: "yes",
  explanationChinese: "此為測試資料，不是教材。",
  vocabularyNotes: [],
}));
describe("bank and randomization", () => {
  it("checks all stages and source distributions", () => {
    expect(validateBank(bank)).toEqual([]);
    expect(validateBank([]).length).toBeGreaterThan(0);
  });
  it("selects 30 unique questions with exactly 15 of each source", () => {
    for (let i = 0; i < 30; i++) {
      const qs = selectAttempt(bank);
      expect(qs).toHaveLength(30);
      expect(new Set(qs.map((q) => q.id)).size).toBe(30);
      expect(qs.filter((q) => q.sourceType === "textbook")).toHaveLength(15);
      for (let stage = 1; stage <= 6; stage++)
        expect(qs.filter((q) => q.stageId === stage)).toHaveLength(5);
      expect(qs.every((q) => q.options?.includes(q.correctAnswer))).toBe(true);
    }
  });
  it("varies the selection", () => {
    expect(selectAttempt(bank).map((q) => q.id)).not.toEqual(
      selectAttempt(bank).map((q) => q.id),
    );
  });
  it("rejects invalid answers, slides and duplicates", () => {
    const copy = bank.map((q) => ({ ...q }));
    copy[0] = { ...copy[1], sourceSlide: 18, correctAnswer: "invalid" };
    expect(validateBank(copy).length).toBeGreaterThan(2);
  });
});
describe("game mechanics", () => {
  it("starts with three hearts; prevents duplicate and out of order answers", () => {
    let g = newGame(bank);
    expect(g.hearts).toBe(3);
    expect(answerOfficial(g, g.questions[1].id, "yes", 1)).toBe(g);
    g = answerOfficial(g, g.questions[0].id, "yes", 2);
    expect(g.hearts).toBe(3);
    expect(answerOfficial(g, g.questions[0].id, "no", 1)).toBe(g);
  });
  it("loses hearts, pauses at zero and recovers without rewriting answers", () => {
    let g = newGame(bank);
    for (let i = 0; i < 3; i++)
      g = answerOfficial(g, g.questions[i].id, "no", 2);
    expect(g.hearts).toBe(0);
    expect(g.recovering).toBe(true);
    expect(answerOfficial(g, g.questions[3].id, "yes", 1)).toBe(g);
    expect(recover(g, g.questions[0].id, "no")).toBe(g);
    const recovered = recover(g, g.questions[0].id, "yes");
    expect(recovered.hearts).toBe(1);
    expect(recovered.recovering).toBe(false);
    expect(recovered.answers).toEqual(g.answers);
  });
  it("completes all stages and freezes score during boss retries", () => {
    let g = newGame(bank);
    for (let i = 0; i < 30; i++)
      g = answerOfficial(g, g.questions[i].id, i >= 28 ? "no" : "yes", 5);
    expect(g.answers).toHaveLength(30);
    expect(g.boss.initial).toBe(3);
    expect(g.boss.passed).toBe(false);
    const frozen = g.frozen;
    g = retryBoss(g, 4);
    expect(g.boss.passed).toBe(true);
    expect(g.boss.attempts).toBe(2);
    expect(g.boss.initial).toBe(3);
    expect(g.frozen).toBe(frozen);
    expect(g.answers.filter((a) => a.correct)).toHaveLength(28);
  });
  it("boss passes on 4 correct", () => {
    let g = newGame(bank);
    for (let i = 0; i < 30; i++)
      g = answerOfficial(g, g.questions[i].id, i === 29 ? "no" : "yes", 1);
    expect(g.boss.passed).toBe(true);
    expect(g.boss.initial).toBe(4);
  });
});
describe("score and timer", () => {
  it("uses accuracy 70, speed 20, hearts 10", () => {
    expect(score(30, 900, 3)).toEqual({
      accuracy: 70,
      speed: 20,
      heart: 10,
      total: 100,
    });
    expect(score(15, 1350, 0)).toEqual({
      accuracy: 35,
      speed: 10,
      heart: 0,
      total: 45,
    });
    expect(score(0, 1800, 0).total).toBe(0);
    expect(score(99, 0, 99).total).toBe(100);
  });
  it("counts only active time; repeated resume/pause is safe", () => {
    const t = new ActiveTimer();
    t.resume(0);
    t.resume(1000);
    t.pause(2000);
    t.pause(9000);
    expect(t.seconds(10000)).toBe(2);
    t.resume(10000);
    expect(t.seconds(13000)).toBe(5);
  });
});
