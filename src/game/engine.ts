export type SourceType = "textbook" | "extension";
export interface Question {
  id: string;
  stageId: number;
  type: "choice" | "listening" | "ordering" | "gap";
  difficulty: "A2" | "B1";
  sourceType: SourceType;
  sourceSlide: number;
  learningObjective: string;
  questionEnglish: string;
  questionChinese: string;
  options?: string[];
  correctAnswer: string;
  explanationChinese: string;
  vocabularyNotes: string[];
  referenceText?: string;
  audioText?: string;
}
export const RULES = {
  stages: 6,
  perStage: 5,
  hearts: 3,
  speedFull: 900,
  speedZero: 1800,
};
export function shuffle<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function validateBank(bank: Question[]): string[] {
  const errors: string[] = [];
  if (bank.length !== 60) errors.push("Exactly 60 questions required");
  const ids = new Set<string>();
  const prompts = new Set<string>();
  for (const q of bank) {
    if (ids.has(q.id)) errors.push(`Duplicate ID: ${q.id}`);
    ids.add(q.id);
    const prompt = q.questionEnglish.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (prompts.has(prompt)) errors.push(`Duplicate prompt: ${q.id}`);
    prompts.add(prompt);
    if (
      !Number.isInteger(q.sourceSlide) ||
      q.sourceSlide < 1 ||
      q.sourceSlide > 17
    )
      errors.push(`Invalid slide: ${q.id}`);
    if (!["textbook", "extension"].includes(q.sourceType))
      errors.push(`Invalid source type: ${q.id}`);
    if (!["choice", "listening", "ordering", "gap"].includes(q.type))
      errors.push(`Invalid type: ${q.id}`);
    if (!["A2", "B1"].includes(q.difficulty))
      errors.push(`Invalid difficulty: ${q.id}`);
    if (!Array.isArray(q.vocabularyNotes))
      errors.push(`Missing vocabulary notes: ${q.id}`);
    if (
      (q.type === "choice" || q.type === "listening") &&
      (!q.options || q.options.length < 2)
    )
      errors.push(`Missing options: ${q.id}`);
    if (!Number.isInteger(q.stageId) || q.stageId < 1 || q.stageId > 6)
      errors.push(`Invalid stage: ${q.id}`);
    for (const key of [
      "id",
      "learningObjective",
      "questionEnglish",
      "questionChinese",
      "correctAnswer",
      "explanationChinese",
    ] as const)
      if (!q[key]?.trim()) errors.push(`Missing ${key}: ${q.id}`);
    if (
      q.options &&
      (new Set(q.options).size !== q.options.length ||
        !q.options.includes(q.correctAnswer))
    )
      errors.push(`Invalid options: ${q.id}`);
    if (q.type === "listening" && !q.audioText)
      errors.push(`Missing audio: ${q.id}`);
  }
  for (let stage = 1; stage <= 6; stage++) {
    const qs = bank.filter((q) => q.stageId === stage);
    if (qs.length !== 10) errors.push(`Stage ${stage}: exactly 10 required`);
    for (const source of ["textbook", "extension"])
      if (qs.filter((q) => q.sourceType === source).length !== 5)
        errors.push(`Stage ${stage}: five ${source} required`);
  }
  return errors;
}
export function selectAttempt(
  bank: Question[],
  random: () => number = Math.random,
): Question[] {
  const errors = validateBank(bank);
  if (errors.length) throw new Error(errors.join("; "));
  return Array.from({ length: 6 }, (_, i) => {
    const qs = bank.filter((q) => q.stageId === i + 1);
    return shuffle(
      [
        ...shuffle(
          qs.filter((q) => q.sourceType === "textbook"),
          random,
        ).slice(0, i % 2 === 0 ? 3 : 2),
        ...shuffle(
          qs.filter((q) => q.sourceType === "extension"),
          random,
        ).slice(0, i % 2 === 0 ? 2 : 3),
      ],
      random,
    ).map((q) => ({
      ...q,
      options: q.options ? shuffle(q.options, random) : undefined,
    }));
  }).flat();
}
export function selectBossRetry(
  bank: Question[],
  previous: Question[],
  random: () => number = Math.random,
): Question[] {
  const selected = selectAttempt(bank, random).filter((q) => q.stageId === 6);
  if (selected.every((q) => previous.some((p) => p.id === q.id))) {
    const last = selected[selected.length - 1];
    const replacement = bank.find(
      (q) =>
        q.stageId === 6 &&
        q.sourceType === last.sourceType &&
        !selected.some((s) => s.id === q.id),
    );
    if (replacement)
      selected[selected.length - 1] = {
        ...replacement,
        options: replacement.options
          ? shuffle(replacement.options, random)
          : undefined,
      };
  }
  return selected;
}
export interface Answer {
  id: string;
  answer: string;
  correct: boolean;
  seconds: number;
}
export interface Game {
  questions: Question[];
  answers: Answer[];
  hearts: number;
  recovering: boolean;
  recoveredIds: string[];
  frozen: ReturnType<typeof score> | null;
  boss: {
    initial: number | null;
    latest: number | null;
    attempts: number;
    passed: boolean;
  };
}
export function score(correct: number, seconds: number, hearts: number) {
  const accuracy = (Math.min(30, Math.max(0, correct)) / 30) * 70;
  const speed =
    20 *
    Math.max(
      0,
      Math.min(
        1,
        (RULES.speedZero - seconds) / (RULES.speedZero - RULES.speedFull),
      ),
    );
  const heart = (Math.min(3, Math.max(0, hearts)) / 3) * 10;
  return {
    accuracy,
    speed,
    heart,
    total: Math.max(0, Math.min(100, Math.round(accuracy + speed + heart))),
  };
}
export function newGame(bank: Question[]): Game {
  return {
    questions: selectAttempt(bank),
    answers: [],
    hearts: 3,
    recovering: false,
    recoveredIds: [],
    frozen: null,
    boss: { initial: null, latest: null, attempts: 0, passed: false },
  };
}
export function answerOfficial(
  game: Game,
  id: string,
  answer: string,
  seconds: number,
): Game {
  if (game.recovering || game.frozen || game.answers.some((a) => a.id === id))
    return game;
  const q = game.questions[game.answers.length];
  if (!q || q.id !== id) return game;
  const correct = answer === q.correctAnswer;
  const hearts = Math.max(0, game.hearts - (correct ? 0 : 1));
  const answers = [
    ...game.answers,
    { id, answer, correct, seconds: Math.max(0, seconds) },
  ];
  const final = answers.length === 30;
  const bossCorrect = answers.slice(25).filter((a) => a.correct).length;
  return {
    ...game,
    answers,
    hearts,
    recovering: hearts === 0 && !final,
    frozen: final
      ? score(
          answers.filter((a) => a.correct).length,
          answers.reduce((s, a) => s + a.seconds, 0),
          hearts,
        )
      : null,
    boss: final
      ? {
          initial: bossCorrect,
          latest: bossCorrect,
          attempts: 1,
          passed: bossCorrect >= 4,
        }
      : game.boss,
  };
}
export function recover(game: Game, id: string, answer: string): Game {
  const missed = game.answers.find((a) => a.id === id && !a.correct);
  const q = game.questions.find((q) => q.id === id);
  if (!game.recovering || !missed || !q || answer !== q.correctAnswer)
    return game;
  return {
    ...game,
    hearts: 1,
    recovering: false,
    recoveredIds: [...game.recoveredIds, id],
  };
}
export function retryBoss(game: Game, correct: number): Game {
  if (!game.frozen || !Number.isInteger(correct) || correct < 0 || correct > 5)
    return game;
  return {
    ...game,
    boss: {
      ...game.boss,
      latest: correct,
      attempts: game.boss.attempts + 1,
      passed: correct >= 4,
    },
  };
}
export class ActiveTimer {
  private started: number | null = null;
  private elapsed = 0;
  resume(now: number) {
    if (this.started === null) this.started = now;
  }
  pause(now: number) {
    if (this.started !== null) {
      this.elapsed += Math.max(0, now - this.started);
      this.started = null;
    }
  }
  seconds(now: number) {
    return (
      (this.elapsed +
        (this.started === null ? 0 : Math.max(0, now - this.started))) /
      1000
    );
  }
}
