import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Home,
  Volume2,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  newGame,
  answerOfficial,
  recover,
  retryBoss,
  selectBossRetry,
  ActiveTimer,
  type Question,
  type Game,
} from "./engine";
import { adventureQuestions } from "../data/questions";
import { stages } from "../data/lesson";
import { useAudio, SpeechControls } from "../audio/Audio";
import { QuestionCard, Feedback, isCorrect } from "../components/QuestionCard";
import { CultureArt } from "../components/CultureArt";
import { Explorer } from "../components/Scene";
type Phase =
  | "intro"
  | "question"
  | "feedback"
  | "walk"
  | "recovery"
  | "recoveryFeedback"
  | "bossIntro"
  | "retry"
  | "results";
const arts = ["temple", "guardian", "lantern", "parade", "boat", "keeper"];
const stories = [
  [
    "The lantern gate",
    "A new word lights the way. Collect your first words at the temple entrance.",
    "每個新單字都是一盞燈，照亮你的文化旅程。",
  ],
  [
    "Stories of the guardians",
    "Explore the stories people share about gods, ancestors, and community.",
    "閱讀故事，認識不同信仰與守護者。",
  ],
  [
    "Follow the festival",
    "Discover how tradition meets technology. Compare the pilgrimages in the lesson.",
    "比較課文中的大甲與白沙屯，看看傳統如何與科技結合。",
  ],
  [
    "Listen to the parade",
    "The street is full of stories. Listen carefully and discover the performances.",
    "聽一聽遊行的故事，認識傳統陣頭。",
  ],
  [
    "A traveler’s question",
    "A friendly traveler wants to learn. Help the conversation flow.",
    "旅人想認識臺灣，運用英文展開對話。",
  ],
  [
    "The Lantern Keeper",
    "A fictional knowledge guardian welcomes you. Answer four of five correctly to clear the adventure.",
    "虛構的知識守護者「燈籠旅人」邀請你挑戰；五題答對四題即可過關。",
  ],
];
const formatTime = (s: number) =>
  `${Math.floor(s / 60)}m ${Math.floor(s % 60)}s`;
export function Adventure({
  onHome,
  onExit,
  suspended = false,
}: {
  onHome: () => void;
  onExit: () => void;
  suspended?: boolean;
}) {
  const [game, setGame] = useState<Game>(() => newGame(adventureQuestions));
  const [phase, setPhase] = useState<Phase>("intro"),
    [paused, setPaused] = useState(false),
    [answer, setAnswer] = useState<string | undefined>(),
    [retrySet, setRetrySet] = useState<Question[]>([]),
    [retryAnswers, setRetryAnswers] = useState<
      { q: Question; answer: string }[]
    >([]),
    [retryMode, setRetryMode] = useState(false),
    [retryDone, setRetryDone] = useState(false),
    [seconds, setSeconds] = useState(0),
    [elapsed, setElapsed] = useState(0),
    [sessionElapsed, setSessionElapsed] = useState(0),
    [review, setReview] = useState<"all" | "incorrect" | "correct">(
      "incorrect",
    );
  const started = useRef(Date.now()),
    timer = useRef(new ActiveTimer()),
    lock = useRef(false),
    feedbackQuestion = useRef<Question | null>(null);
  const audio = useAudio(),
    reduced = useReducedMotion();
  const index = game.answers.length;
  const official = game.questions[index];
  const recoveryRecord =
    game.answers.find((a) => !a.correct && !game.recoveredIds.includes(a.id)) ??
    game.answers.find((a) => !a.correct);
  const recoveryQ = game.questions.find((q) => q.id === recoveryRecord?.id);
  const q =
    phase === "recovery" || phase === "recoveryFeedback"
      ? recoveryQ
      : retryMode
        ? retrySet[retryAnswers.length]
        : official;
  const stage = retryMode
    ? 5
    : Math.min(
        5,
        Math.floor(
          (phase === "feedback" ||
          phase === "recovery" ||
          phase === "recoveryFeedback"
            ? Math.max(0, index - 1)
            : index) / 5,
        ),
      );
  const questionKey = q?.id ?? "end";
  useEffect(() => {
    timer.current = new ActiveTimer();
    setSeconds(0);
    lock.current = false;
  }, [questionKey, phase === "recovery", retryMode]);
  useEffect(() => {
    const sync = () => {
      if (
        phase === "question" &&
        !paused &&
        !suspended &&
        !document.hidden &&
        !retryMode
      )
        timer.current.resume(Date.now());
      else timer.current.pause(Date.now());
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => {
      timer.current.pause(Date.now());
      document.removeEventListener("visibilitychange", sync);
    };
  }, [phase, paused, suspended, questionKey, retryMode]);
  useEffect(() => {
    const id = setInterval(
      () => setSeconds(timer.current.seconds(Date.now())),
      500,
    );
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    audio.setTheme("game");
    return () => {
      audio.stop();
      audio.setTheme("home");
    };
  }, []);
  useEffect(() => {
    if (phase !== "walk") return;
    const badge = setTimeout(() => {
      if (game.answers.slice(-5).filter((a) => a.correct).length >= 4)
        audio.play("badge");
    }, 500);
    const id = setTimeout(
      () => setPhase(stage === 5 ? "bossIntro" : "intro"),
      reduced ? 50 : 1800,
    );
    return () => {
      clearTimeout(id);
      clearTimeout(badge);
    };
  }, [phase, stage, reduced]);
  useEffect(() => {
    document.querySelector(".map-stop.current")?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: reduced ? "instant" : "smooth",
    });
  }, [stage]);
  useEffect(() => {
    if (phase === "bossIntro") audio.play("boss");
  }, [phase]);
  function enterQuestion() {
    audio.stop();
    lock.current = false;
    setAnswer(undefined);
    setPhase("question");
  }
  function submit(v: string) {
    if (!q || lock.current || paused) return;
    lock.current = true;
    audio.stop();
    timer.current.pause(Date.now());
    feedbackQuestion.current = q;
    setAnswer(v);
    audio.play(isCorrect(q, v) ? "correct" : "incorrect");
    if (phase === "recovery") {
      if (isCorrect(q, v)) setGame((g) => recover(g, q.id, q.correctAnswer));
      setPhase("recoveryFeedback");
      return;
    }
    if (retryMode) {
      const next = [...retryAnswers, { q, answer: v }];
      setRetryAnswers(next);
      if (next.length === 5) {
        const updated = retryBoss(
          game,
          next.filter((a) => isCorrect(a.q, a.answer)).length,
        );
        setGame(updated);
        setRetryDone(true);
        if (updated.boss.passed) audio.play("victory");
      }
      setPhase("feedback");
      return;
    }
    const updated = answerOfficial(
      game,
      q.id,
      v,
      timer.current.seconds(Date.now()),
    );
    setGame(updated);
    if (updated.frozen) {
      setElapsed((Date.now() - started.current) / 1000);
      if (updated.boss.passed) audio.play("victory");
    }
    setPhase("feedback");
  }
  function continueAfterFeedback() {
    audio.stop();
    if (game.frozen) setSessionElapsed((Date.now() - started.current) / 1000);
    setAnswer(undefined);
    lock.current = false;
    if (retryMode) {
      if (retryDone) {
        setPhase("results");
        return;
      }
      setPhase("question");
      return;
    }
    if (game.frozen) {
      setPhase("results");
      return;
    }
    if (game.recovering) {
      setPhase("recovery");
      return;
    }
    if (game.answers.length % 5 === 0) {
      audio.play("stage");
      setPhase("walk");
      return;
    }
    setPhase("question");
  }
  function startRetry() {
    const next = selectBossRetry(
      adventureQuestions,
      retrySet.length ? retrySet : game.questions.slice(25),
    );
    setRetrySet(next);
    setRetryAnswers([]);
    setRetryDone(false);
    setRetryMode(true);
    setAnswer(undefined);
    setPaused(false);
    lock.current = false;
    setPhase("retry");
  }
  function reset() {
    audio.stop();
    setGame(newGame(adventureQuestions));
    setRetryMode(false);
    setRetryDone(false);
    setRetryAnswers([]);
    setRetrySet([]);
    setPaused(false);
    setAnswer(undefined);
    setSessionElapsed(0);
    setElapsed(0);
    started.current = Date.now();
    timer.current = new ActiveTimer();
    lock.current = false;
    setPhase("intro");
  }
  const firstCorrect = game.answers.filter((a) => a.correct).length;
  const active = game.answers.reduce((s, a) => s + a.seconds, 0);
  const totalElapsed = game.frozen
    ? elapsed
    : (Date.now() - started.current) / 1000;
  if (phase === "results") {
    const s = game.frozen!;
    const title =
      game.boss.passed && firstCorrect >= 27
        ? "Mazu Adventure Master"
        : firstCorrect >= 24
          ? "Festival Expert"
          : firstCorrect >= 18
            ? "Temple Adventurer"
            : "Culture Explorer";
    return (
      <section className="results-page">
        <div className="result-hero">
          <Explorer state={game.boss.passed ? "victory" : "thinking"} small />
          <span className="eyebrow">YOUR JOURNEY, YOUR DISCOVERIES</span>
          <h1>
            {game.boss.passed
              ? "Adventure cleared!"
              : "So close. Keep exploring!"}
          </h1>
          <p>
            {game.boss.passed
              ? "最終挑戰通過，文化之旅完成！"
              : "已完成首次 30 題；最終挑戰還需答對至少四題。"}
          </p>
          <div className="score-medal">
            <strong>{s.total}</strong>
            <span>/ 100</span>
          </div>
          <h2>{title}</h2>
          <p className="muted-text">
            稱號條件：答對 ≥27 且過關為 Master；≥24 為 Festival Expert；≥18 為
            Temple Adventurer；其餘為 Culture Explorer。
          </p>
        </div>
        <div className="score-breakdown">
          <div>
            <strong>{s.accuracy.toFixed(1)} / 70</strong>
            <span>Accuracy 首次答對率</span>
            <small>
              {firstCorrect} / 30 · {Math.round((firstCorrect / 30) * 100)}%
            </small>
          </div>
          <div>
            <strong>{s.speed.toFixed(1)} / 20</strong>
            <span>Active answering 作答速度</span>
            <small>{formatTime(active)} · 15 分鐘內滿分，30 分鐘歸零</small>
          </div>
          <div>
            <strong>{s.heart.toFixed(1)} / 10</strong>
            <span>Remaining hearts 剩餘愛心</span>
            <small>{game.hearts} / 3 · 首次 30 題結束時計分</small>
          </div>
        </div>
        <div className="result-stats">
          <p>
            Boss first attempt 首次：<b>{game.boss.initial} / 5</b>
          </p>
          <p>
            Boss latest 最新：<b>{game.boss.latest} / 5</b>
          </p>
          <p>
            Boss attempts 挑戰次數：<b>{game.boss.attempts}</b>
          </p>
          <p>
            Official attempt elapsed 首輪總經過時間：
            <b>{formatTime(totalElapsed)}</b>
          </p>
          <p>
            Total elapsed game time 遊戲總經過時間：
            <b>{formatTime(sessionElapsed)}</b>
          </p>
          <p>
            Completion status：
            <b>
              {game.boss.passed
                ? "Cleared 已過關"
                : "Retry Boss to clear 尚待最終關過關"}
            </b>
          </p>
        </div>
        <div className="badges">
          {stages.map((st, i) => {
            const correct = game.answers
              .slice(i * 5, i * 5 + 5)
              .filter((a) => a.correct).length;
            return (
              <span
                key={st[0]}
                className={correct >= 4 ? "earned" : "unearned"}
              >
                ✦ {st[0]}{" "}
                <small>
                  {correct >= 4
                    ? "Badge earned · ≥4 correct"
                    : "Keep practicing · 需答對 4 題"}
                </small>
              </span>
            );
          })}
        </div>
        <p className="muted-text">
          官方分數已凍結。訂正與 Boss
          重試都不會改變首次答案、速度、愛心分數或徽章。成就只依學習表現，不涉及宗教信仰。
        </p>
        <div className="result-actions">
          {!game.boss.passed && (
            <button className="primary" onClick={startRetry}>
              <RotateCcw size={16} /> Retry Boss 再挑戰
            </button>
          )}
          <button className="secondary" onClick={reset}>
            <Play size={16} /> Play again
          </button>
          <button className="secondary" onClick={onHome}>
            <Home size={16} /> Homepage
          </button>
        </div>
        {retryAnswers.length > 0 && (
          <section className="retry-review">
            <h2>Latest Boss review</h2>
            {retryAnswers.map((a) => (
              <details key={a.q.id}>
                <summary>
                  {isCorrect(a.q, a.answer) ? "✓" : "↺"} {a.q.questionEnglish}
                </summary>
                <Feedback q={a.q} answer={a.answer} />
              </details>
            ))}
          </section>
        )}
        <section className="answer-review">
          <h2>Your answer journal.</h2>
          <div className="mode-switch">
            {(["incorrect", "correct", "all"] as const).map((v) => (
              <button
                key={v}
                className={review === v ? "chosen" : ""}
                onClick={() => setReview(v)}
              >
                {v === "incorrect"
                  ? "Review mistakes 錯題"
                  : v === "correct"
                    ? "Correct answers 答對"
                    : "All 30 answers 全部"}
              </button>
            ))}
          </div>
          {game.answers
            .filter(
              (a) => review === "all" || a.correct === (review === "correct"),
            )
            .map((a) => {
              const q = game.questions.find((q) => q.id === a.id)!;
              return (
                <details key={a.id}>
                  <summary>
                    {a.correct ? "✓" : "↺"} {q.questionEnglish}
                  </summary>
                  {q.audioText && <p>Audio script: {q.audioText}</p>}
                  <Feedback q={q} answer={a.answer} />
                </details>
              );
            })}
        </section>
      </section>
    );
  }
  return (
    <section className="adventure-player">
      <div className="game-topbar">
        <button
          className="text-button"
          onClick={() => {
            audio.stop();
            onExit();
          }}
        >
          ← Adventure map 地圖
        </button>
        <div className="hearts" aria-label={`${game.hearts} hearts remaining`}>
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              fill={i < game.hearts ? "#bc6956" : "transparent"}
              color={i < game.hearts ? "#bc6956" : "#b8bdb0"}
              size={22}
            />
          ))}
        </div>
        <span className="official-progress">
          {retryMode
            ? `Boss attempt ${retryDone ? game.boss.attempts : game.boss.attempts + 1}`
            : `${game.answers.length} / 30 answered`}
        </span>
        {phase === "question" && (
          <button
            className="secondary"
            onClick={() => {
              audio.stop();
              setPaused(!paused);
            }}
          >
            {paused ? <Play size={15} /> : <Pause size={15} />}{" "}
            {paused ? "Resume 繼續" : "Pause 暫停"}
          </button>
        )}
      </div>
      <div className="game-world">
        <div className="side-map" aria-label="Adventure route">
          {stages.map((s, i) => (
            <div
              key={s[0]}
              className={`map-stop ${i === stage ? "current" : ""} ${i < stage ? "completed" : ""}`}
            >
              <span className="stop-number">
                {i < stage ? "✓" : `0${i + 1}`}
              </span>
              <CultureArt kind={arts[i]} label={s[0]} />
              <span>{s[0]}</span>
              {i === stage && (
                <motion.div
                  layoutId="walking-explorer"
                  transition={{ duration: reduced ? 0 : 0.8 }}
                  className="map-character"
                >
                  <Explorer
                    small
                    state={
                      phase === "walk"
                        ? "walking"
                        : phase === "feedback"
                          ? answer &&
                            feedbackQuestion.current &&
                            isCorrect(feedbackQuestion.current, answer)
                            ? "celebration"
                            : "incorrect"
                          : phase === "question"
                            ? "thinking"
                            : "idle"
                    }
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
        <div className="map-footnote">
          FICTIONAL LEARNING ROUTE · 學習用虛構路線，非真實遶境地圖
        </div>
      </div>
      {paused ? (
        <div className="pause-panel">
          <Pause size={36} />
          <h2>Take a little breath.</h2>
          <p>作答計時已暫停，你的進度仍在這個頁面中。</p>
          <button className="primary" onClick={() => setPaused(false)}>
            Resume adventure 繼續冒險
          </button>
        </div>
      ) : phase === "intro" || phase === "bossIntro" ? (
        <div
          className={`stage-story ${phase === "bossIntro" ? "boss-story" : ""}`}
        >
          <span className="eyebrow">
            STAGE 0{stage + 1} · {stages[stage][1]}
          </span>
          <h1>{stories[stage][0]}</h1>
          <p>{stories[stage][1]}</p>
          <p className="translation">{stories[stage][2]}</p>
          {stage === 5 && (
            <p className="muted-text">
              This is a fictional learning host, not a religious figure.
              這是虛構學習角色，並非神明或敵人。
            </p>
          )}
          <button className="primary" onClick={enterQuestion}>
            Begin stage 開始本關 <ArrowRight size={17} />
          </button>
          <button className="text-button" onClick={enterQuestion}>
            Skip story 跳過故事
          </button>
        </div>
      ) : phase === "walk" ? (
        <div className="stage-transition">
          <Explorer small state="stage" />
          <span className="eyebrow">STAGE COMPLETE</span>
          <h2>Another lantern lit.</h2>
          <p>Moving to {stages[stage][0]}… 前往下一個場景。</p>
          <button
            className="primary"
            onClick={() => setPhase(stage === 5 ? "bossIntro" : "intro")}
          >
            Skip transition 跳過動畫 <ArrowRight size={17} />
          </button>
        </div>
      ) : phase === "retry" ? (
        <div className="stage-story boss-story">
          <h1>The Lantern Keeper welcomes you back.</h1>
          <p>
            Five questions. Four correct to pass. You can try as many times as
            you need.
          </p>
          <p className="translation">
            已重新隨機選取五題；因題庫有限，可能遇到做過的題目。重試不更改首次官方分數。
          </p>
          <button className="primary" onClick={enterQuestion}>
            Start Boss retry 開始重試
          </button>
        </div>
      ) : phase === "feedback" ? (
        <>
          <div className="feedback-scene">
            <Explorer
              small
              state={
                feedbackQuestion.current &&
                answer &&
                isCorrect(feedbackQuestion.current, answer)
                  ? "celebration"
                  : "incorrect"
              }
            />
            <h2>
              {feedbackQuestion.current &&
              answer &&
              isCorrect(feedbackQuestion.current, answer)
                ? "A bright discovery!"
                : "Every try teaches you something."}
            </h2>
          </div>
          {feedbackQuestion.current && answer !== undefined && (
            <Feedback q={feedbackQuestion.current} answer={answer} />
          )}
          <button
            className="primary continue-button"
            onClick={continueAfterFeedback}
          >
            Continue 繼續 <ArrowRight size={17} />
          </button>
        </>
      ) : phase === "recoveryFeedback" ? (
        <>
          <Feedback q={feedbackQuestion.current!} answer={answer!} />
          <p className="recovery-note">
            {game.recovering
              ? "Read the hint and try once more. 再看看解釋，訂正後就能繼續。"
              : "One heart restored! 愛心恢復一顆；首次答案不變。"}
          </p>
          <button
            className="primary"
            onClick={() => {
              setAnswer(undefined);
              lock.current = false;
              if (game.recovering) setPhase("recovery");
              else continueAfterFeedback();
            }}
          >
            {game.recovering
              ? "Try recovery again 再試一次"
              : "Back to the adventure 返回冒險"}
          </button>
        </>
      ) : q ? (
        <>
          <div className="question-progress">
            <span>
              {phase === "recovery"
                ? "RECOVERY · 訂正挑戰，不計分"
                : retryMode
                  ? `BOSS RETRY · ${retryAnswers.length + 1} / 5`
                  : `STAGE ${stage + 1} · QUESTION ${(index % 5) + 1} / 5`}
            </span>
            <span>
              {phase === "question" && !retryMode
                ? `Active: ${formatTime(seconds)}`
                : "不列入官方作答時間"}
            </span>
          </div>
          {phase === "recovery" && (
            <div className="recovery-hint">
              <h2>A little help, a fresh start.</h2>
              <p>訂正曾答錯的題目，答對恢復一顆愛心。首次答案與分數不變。</p>
              <p>
                Original answer 原答案：<b>{recoveryRecord?.answer}</b>
              </p>
              <p>Hint 提示：{q.explanationChinese}</p>
              <p>
                Study this answer 參考答案：<strong>{q.correctAnswer}</strong>
              </p>
            </div>
          )}
          <SpeechControls />
          <QuestionCard
            key={`${questionKey}-${phase}-${retryMode}`}
            question={q}
            onAnswer={submit}
          />
          <div className="question-help">
            <button
              className="text-button"
              onClick={() => audio.speak(q.questionEnglish)}
            >
              <Volume2 size={15} /> Read the question
            </button>
            <span>One official answer per question · 每題僅計首次答案</span>
          </div>
        </>
      ) : null}
    </section>
  );
}
