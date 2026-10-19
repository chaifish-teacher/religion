import { useMemo, useState } from "react";
import { Volume2, RotateCcw } from "lucide-react";
import { shuffle, type Question } from "../game/engine";
import { useAudio } from "../audio/Audio";
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
export function isCorrect(q: Question, value: string) {
  return normalize(value) === normalize(q.correctAnswer);
}
export function QuestionCard({
  question: q,
  onAnswer,
  disabled = false,
  answer,
  showTranslation = true,
}: {
  question: Question;
  onAnswer: (v: string) => void;
  disabled?: boolean;
  answer?: string;
  showTranslation?: boolean;
}) {
  const a = useAudio();
  const [selected, setSelected] = useState("");
  const [tokens, setTokens] = useState<number[]>([]);
  const [transcript, setTranscript] = useState(false);
  const options = useMemo(() => shuffle(q.options ?? []), [q.id]);
  const words = useMemo(
    () =>
      shuffle(q.correctAnswer.split(" ").map((text, i) => ({ text, id: i }))),
    [q.id],
  );
  const value =
    q.type === "ordering"
      ? tokens.map((i) => words.find((w) => w.id === i)!.text).join(" ")
      : selected;
  function submit(v: string) {
    if (disabled || !v.trim()) return;
    onAnswer(isCorrect(q, v) ? q.correctAnswer : v.trim());
  }
  return (
    <article className="question-card">
      <div className="question-meta">
        <span>
          {q.type.toUpperCase()} · {q.difficulty}
        </span>
        <span>Discover · Think · Answer</span>
      </div>
      <h2>{q.questionEnglish}</h2>
      {showTranslation && <p className="question-zh">{q.questionChinese}</p>}
      {q.referenceText && (
        <section className="reference" aria-label="Reading clue">
          <h3>
            Reading clue <span>閱讀線索</span>
          </h3>
          <p>{q.referenceText}</p>
          <button
            onClick={() => a.speak(q.referenceText!)}
            className="text-button"
          >
            <Volume2 size={15} /> Read aloud
          </button>
        </section>
      )}
      {q.audioText && (
        <div className="listening-box">
          <button className="secondary" onClick={() => a.speak(q.audioText!)}>
            <Volume2 size={17} /> Play / Replay 聆聽
          </button>
          <button
            className="text-button"
            onClick={() => setTranscript(!transcript)}
          >
            {transcript ? "Hide transcript" : "Text alternative 文字替代"}
          </button>
          {transcript && <p>{q.audioText}</p>}
          <p className="muted-text">
            {a.supported
              ? "Listen first. If audio is unavailable, use the text alternative."
              : "此瀏覽器不支援語音，請使用文字替代。"}
          </p>
        </div>
      )}
      {q.options?.length ? (
        <div className="answer-options">
          {options.map((o, i) => (
            <button
              key={o}
              disabled={disabled}
              className={`answer-option ${answer === o ? "selected" : ""} ${disabled && o === q.correctAnswer ? "correct" : ""}`}
              onClick={() => submit(o)}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {o}
            </button>
          ))}
        </div>
      ) : q.type === "ordering" ? (
        <div className="ordering">
          <p className="muted-text">
            Click words in order. 依序點選，也可用 Tab 與 Enter。
          </p>
          <div className="sentence-slots" aria-live="polite">
            {value || "Your sentence appears here…"}
            {!disabled && tokens.length > 0 && (
              <button
                aria-label="Undo last word"
                onClick={() => setTokens(tokens.slice(0, -1))}
              >
                ↶
              </button>
            )}
          </div>
          <div className="word-tokens">
            {words.map((w) => (
              <button
                key={w.id}
                disabled={disabled || tokens.includes(w.id)}
                onClick={() => setTokens([...tokens, w.id])}
              >
                {w.text}
              </button>
            ))}
          </div>
          <button
            className="text-button"
            disabled={disabled}
            onClick={() => setTokens([])}
          >
            <RotateCcw size={14} /> Reset words
          </button>
          <button
            className="primary"
            disabled={disabled || tokens.length !== words.length}
            onClick={() => submit(value)}
          >
            Check answer 確認答案
          </button>
        </div>
      ) : (
        <form
          className="gap-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit(value);
          }}
        >
          <label>
            Your answer 你的答案
            <input
              autoComplete="off"
              aria-label="Your answer"
              disabled={disabled}
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            />
          </label>
          <button className="primary" disabled={disabled || !value.trim()}>
            Check answer 確認答案
          </button>
        </form>
      )}
    </article>
  );
}
export function Feedback({ q, answer }: { q: Question; answer: string }) {
  const ok = isCorrect(q, answer);
  return (
    <div
      className={`feedback ${ok ? "success" : "needs-review"}`}
      role="status"
    >
      <strong>
        {ok ? "Well done! 答對了" : "A chance to learn. 一起訂正吧"}
      </strong>
      <p>
        Correct answer: <b>{q.correctAnswer}</b>
      </p>
      {!ok && <p>Your answer: {answer}</p>}
      <p>{q.explanationChinese}</p>
    </div>
  );
}
