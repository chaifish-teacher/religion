import { useState, useMemo } from "react";
import { BookOpen, Volume2, ArrowRight, RotateCcw } from "lucide-react";
import { useAudio, SpeechControls } from "../audio/Audio";
import {
  vocabulary,
  reading,
  conversation,
  listening,
  writing,
  culture,
  pictureReading,
} from "../data/content";
import { learningQuizzes } from "../data/questions";
import { modules } from "../data/lesson";
import {
  QuestionCard,
  Feedback,
  normalize,
  isCorrect,
} from "../components/QuestionCard";
import { CultureArt } from "../components/CultureArt";
import { shuffle, type Question } from "../game/engine";
export function Learning({ id }: { id: string }) {
  const m = modules.find((m) => m.id === id)!;
  return (
    <section className="learning-module">
      <div className="page-heading">
        <div className="eyebrow">{m.tag}</div>
        <h1>{m.title}</h1>
        <p>
          {m.zh} · Study freely. Your practice does not affect adventure scores.
        </p>
      </div>
      <SpeechControls />
      {id === "vocabulary" ? (
        <Vocabulary />
      ) : id === "reading" ? (
        <Reading />
      ) : id === "conversation" ? (
        <Conversation />
      ) : id === "culture" ? (
        <Culture />
      ) : id === "listening" ? (
        <Listening />
      ) : (
        <Writing />
      )}
      <MiniQuiz key={id} id={id} />
    </section>
  );
}
function Practice({ q }: { q: Question }) {
  const [a, setA] = useState<string | undefined>();
  const audio = useAudio();
  return (
    <div className="practice-block">
      <QuestionCard
        key={q.id}
        question={q}
        onAnswer={(v) => {
          setA(v);
          audio.play(isCorrect(q, v) ? "correct" : "incorrect");
        }}
        disabled={a !== undefined}
        answer={a}
      />
      {a !== undefined && (
        <>
          <Feedback q={q} answer={a} />
          <button className="text-button" onClick={() => setA(undefined)}>
            <RotateCcw size={14} /> Try again 再練一次
          </button>
        </>
      )}
    </div>
  );
}
function MiniQuiz({ id }: { id: string }) {
  const [qIndex, setIndex] = useState(0),
    [answer, setAnswer] = useState<string | undefined>(),
    [done, setDone] = useState<string[]>([]);
  const qs = learningQuizzes[id],
    q = qs[qIndex];
  const audio = useAudio();
  return (
    <section className="mini-quiz">
      <div className="eyebrow">
        CHECK YOUR DISCOVERY · {done.length} / 5 MASTERED
      </div>
      <h2>Five little challenges.</h2>
      <p className="muted-text">
        單元小測驗與冒險分數分開計算。答錯可訂正後重試。
      </p>
      {done.length === 5 && answer === undefined ? (
        <div className="quiz-complete">
          <span>✦</span>
          <h3>Module complete. Nicely done!</h3>
          <p>五題都已掌握。繼續自由學習，或直接開始冒險。</p>
          <button
            className="secondary"
            onClick={() => {
              setDone([]);
              setIndex(0);
              setAnswer(undefined);
            }}
          >
            Practice again 再練一次
          </button>
        </div>
      ) : (
        <>
          <div className="quiz-position">Question {qIndex + 1} / 5</div>
          <QuestionCard
            key={`${q.id}-${done.length}-${answer === undefined ? "open" : "answered"}`}
            question={q}
            answer={answer}
            disabled={answer !== undefined}
            onAnswer={(v) => {
              setAnswer(v);
              audio.play(isCorrect(q, v) ? "correct" : "incorrect");
              if (isCorrect(q, v))
                setDone((old) => (old.includes(q.id) ? old : [...old, q.id]));
            }}
          />
          {answer !== undefined && (
            <>
              <Feedback q={q} answer={answer} />
              <button
                className="primary"
                onClick={() => {
                  if (isCorrect(q, answer)) setIndex((i) => Math.min(4, i + 1));
                  setAnswer(undefined);
                }}
              >
                {isCorrect(q, answer)
                  ? qIndex === 4
                    ? "Finish module 完成本單元"
                    : "Next question 下一題"
                  : "Retry this question 重試本題"}{" "}
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </>
      )}
    </section>
  );
}
function Vocabulary() {
  const [i, setI] = useState(0),
    [flipped, setFlipped] = useState(false),
    [spell, setSpell] = useState(""),
    [spellResult, setSpellResult] = useState("");
  const v = vocabulary[i];
  const audio = useAudio();
  const pairs = useMemo(() => shuffle(vocabulary).slice(0, 5), []),
    right = useMemo(() => shuffle(pairs), [pairs]);
  const [left, setLeft] = useState<string | null>(null),
    [matched, setMatched] = useState<string[]>([]),
    [message, setMessage] = useState("");
  return (
    <>
      <div className="vocab-layout">
        <div className="flashcard-wrap">
          <span className="eyebrow">
            VERIFIED WORD BANK · {i + 1} / {vocabulary.length}
          </span>
          <button
            className={`flashcard ${flipped ? "flipped" : ""}`}
            aria-label={`Flip flashcard for ${v.word}`}
            onClick={() => setFlipped(!flipped)}
          >
            {flipped ? (
              <>
                <span>{v.zh}</span>
                <small>{v.example}</small>
                <em>{v.exampleSource}</em>
              </>
            ) : (
              <>
                <BookOpen size={28} />
                <strong>{v.word}</strong>
                <small>{v.pos ?? "phrase · 詞組"}</small>
                <em>Click to flip · 點選翻面</em>
              </>
            )}
          </button>
          <div className="flash-controls">
            <button
              className="secondary"
              onClick={() => {
                setI((i + 18) % 19);
                setFlipped(false);
                setSpell("");
                setSpellResult("");
              }}
            >
              ← Previous
            </button>
            <button className="secondary" onClick={() => audio.speak(v.word)}>
              <Volume2 size={17} /> Pronounce
            </button>
            <button
              className="secondary"
              onClick={() => {
                setI((i + 1) % 19);
                setFlipped(false);
                setSpell("");
                setSpellResult("");
              }}
            >
              Next →
            </button>
          </div>
          <p className="muted-text">
            19 個文化單字，搭配中文釋義與教學例句，選擇卡片開始探索。
          </p>
        </div>
        <div className="spelling-panel">
          <h2>Spell a discovery.</h2>
          <p>
            Type the English word for <b>{v.zh}</b>.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ok = normalize(spell) === normalize(v.word);
              setSpellResult(
                ok ? "Correct! 拼字正確。" : `Not yet. 正確拼字：${v.word}`,
              );
              audio.play(ok ? "correct" : "incorrect");
            }}
          >
            <label>
              Spelling 拼字
              <input
                value={spell}
                onChange={(e) => setSpell(e.target.value)}
                autoComplete="off"
              />
            </label>
            <button className="primary">Check spelling</button>
          </form>
          <p role="status">{spellResult}</p>
        </div>
      </div>
      <section className="matching-panel">
        <h2>Make a match.</h2>
        <p className="muted-text">
          先選左側英文，再選右側中文。Match all five pairs.
        </p>
        <div className="matching-columns">
          <div>
            {pairs.map((v) => (
              <button
                disabled={matched.includes(v.id)}
                className={left === v.id ? "chosen" : ""}
                key={v.id}
                onClick={() => setLeft(v.id)}
              >
                {matched.includes(v.id) ? "✓ " : ""}
                {v.word}
              </button>
            ))}
          </div>
          <div>
            {right.map((v) => (
              <button
                disabled={matched.includes(v.id)}
                key={v.id}
                onClick={() => {
                  if (!left) {
                    setMessage("Choose an English word first. 請先選英文。");
                    return;
                  }
                  if (left === v.id) {
                    setMatched([...matched, v.id]);
                    setMessage("A match! 配對正確。");
                    audio.play("correct");
                  } else {
                    setMessage("Try another pair. 再試一組。");
                    audio.play("incorrect");
                  }
                  setLeft(null);
                }}
              >
                {v.zh}
              </button>
            ))}
          </div>
        </div>
        <p role="status">
          {matched.length === 5 ? "All five matched! 五組配對完成。" : message}
        </p>
      </section>
    </>
  );
}
function Gloss({ text }: { text: string }) {
  const [hint, setHint] = useState("");
  const words = vocabulary
    .map((v) => v.word)
    .sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  return (
    <>
      <p className="reading-english">
        {text.split(pattern).map((chunk, i) => {
          const v = vocabulary.find(
            (v) => v.word.toLowerCase() === chunk.toLowerCase(),
          );
          return v ? (
            <button
              className="vocab-inline"
              key={i}
              onClick={() => setHint(`${v.word} · ${v.zh}`)}
            >
              {chunk}
            </button>
          ) : (
            chunk
          );
        })}
      </p>
      <p className="word-hint" role="status">
        {hint}
      </p>
    </>
  );
}
function Reading() {
  const [mode, setMode] = useState("bilingual"),
    [hints, setHints] = useState<number[]>([]);
  const a = useAudio();
  return (
    <>
      <div
        className="mode-switch"
        role="group"
        aria-label="Reading language mode"
      >
        {[
          ["english", "English only"],
          ["bilingual", "Bilingual 雙語"],
          ["hint", "Chinese hints 中文提示"],
        ].map(([id, text]) => (
          <button
            key={id}
            className={mode === id ? "chosen" : ""}
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
          >
            {text}
          </button>
        ))}
      </div>
      <p className="muted-text">
        完整課文保留原文。點選畫線單字查看釋義；內容為教材敘述，不代表所有人的信仰或每年度實際行程。
      </p>
      {reading.map((p, i) => (
        <article className="reading-paragraph" key={i}>
          <div className="paragraph-head">
            <span>PASSAGE {i + 1} · CULTURE & BELIEFS</span>
            <button className="text-button" onClick={() => a.speak(p.en)}>
              <Volume2 size={15} /> Read paragraph
            </button>
          </div>
          <Gloss text={p.en} />
          {mode === "hint" && (
            <button
              className="text-button"
              onClick={() =>
                setHints(
                  hints.includes(i)
                    ? hints.filter((n) => n !== i)
                    : [...hints, i],
                )
              }
            >
              Show / hide Chinese hint 顯示／隱藏中譯
            </button>
          )}
          {(mode === "bilingual" || (mode === "hint" && hints.includes(i))) && (
            <p className="translation">{p.zh}</p>
          )}
          {i === 3 && (
            <p className="textbook-note">
              閱讀提醒：原文中的「世界三大宗教活動」排名尚未獨立查證。英文
              millions 與中文「數以萬計」不一致，網站保留原文，不以人數出題。
            </p>
          )}
        </article>
      ))}
      <PictureMatch />
      <Practice q={learningQuizzes.reading[4]} />
    </>
  );
}
function Conversation() {
  const [role, setRole] = useState("none"),
    [reveal, setReveal] = useState<string[]>([]);
  const a = useAudio();
  return (
    <>
      <div className="conversation-toolbar">
        <button
          className="primary"
          onClick={() =>
            a.dialogue(conversation.filter((l) => l.speaker !== role))
          }
        >
          <Volume2 size={17} />{" "}
          {role === "none" ? "Play complete dialogue" : "Play partner lines"}
        </button>
        <label>
          Role-play 扮演角色{" "}
          <select
            aria-label="Role-play"
            value={role}
            onChange={(e) => {
              a.stop();
              setRole(e.target.value);
              setReveal([]);
            }}
          >
            <option value="none">Listen to both</option>
            <option value="Ethan">I am Ethan</option>
            <option value="Laura">I am Laura</option>
          </select>
        </label>
      </div>
      <p className="muted-text">
        角色練習會隱藏你的台詞；點選即可查看。不同角色優先使用不同英文聲線，若僅有一種聲線則共用。
      </p>
      <div className="dialogue-list">
        {conversation.map((l) => (
          <article className={`dialogue ${l.speaker.toLowerCase()}`} key={l.id}>
            <span className="speaker-avatar">{l.speaker[0]}</span>
            <div>
              <div className="dialogue-name">
                {l.speaker} <small>LISTEN & SPEAK</small>
                <button
                  aria-label={`Play ${l.speaker} line ${l.id}`}
                  onClick={() => a.speak(l.en, l.speaker)}
                >
                  <Volume2 size={16} />
                </button>
              </div>
              {role === l.speaker && !reveal.includes(l.id) ? (
                <button
                  className="role-prompt"
                  onClick={() => setReveal([...reveal, l.id])}
                >
                  Your turn! 先試著說，再點選查看台詞。
                </button>
              ) : (
                <>
                  <p>{l.en}</p>
                  <p className="translation">{l.zh}</p>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      <h2 className="activity-title">Build the conversation.</h2>
      <Practice
        q={{
          ...learningQuizzes.conversation[3],
          id: "conversation-gap",
          type: "gap",
          options: undefined,
        }}
      />
      <Practice
        q={{
          ...learningQuizzes.writing[3],
          id: "conversation-order",
          correctAnswer: "People can live together in harmony.",
          questionEnglish: "Arrange a line about living together.",
          questionChinese: "將和諧共處的句子排成正確順序。",
          explanationChinese:
            "People can live together in harmony. 表示人們能和諧共處。",
        }}
      />
    </>
  );
}
function Culture() {
  const [search, setSearch] = useState("");
  return (
    <>
      <label className="search-label">
        Find a tradition 尋找文化
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mazu, festival, 媽祖…"
        />
      </label>
      <p className="muted-text">
        英文說明與中譯為依教材整理的學習摘要；插畫為原創象徵圖，不是儀式細節的重現。
      </p>
      <div className="culture-grid">
        {culture
          .filter((c) =>
            (c.en + c.zh).toLowerCase().includes(search.toLowerCase()),
          )
          .map((c) => (
            <article className="culture-card" key={c.en}>
              <CultureArt
                kind={c.art}
                label={`${c.en} symbolic illustration`}
              />
              <div>
                <span className="eyebrow">LIVING TRADITIONS</span>
                <h3>{c.en}</h3>
                <small>{c.zh}</small>
                <p>{c.description}</p>
                <p className="translation">{c.translation}</p>
              </div>
            </article>
          ))}
      </div>
      <PictureMatch />
    </>
  );
}
function PictureMatch() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState("");
  const choices = useMemo(
    () =>
      shuffle([
        { id: "parade", en: "Religious parade", zh: "宗教遊行" },
        { id: "fortune", en: "Fortune telling", zh: "算命" },
        { id: "mazu", en: "Mazu", zh: "媽祖" },
        { id: "guanyin", en: "Guanyin", zh: "觀音" },
      ]),
    [],
  );
  return (
    <section className="picture-match">
      <h2>Read the scene.</h2>
      <p className="muted-text">
        閱讀下方句子，從這裡的四張插畫中選擇符合的場景。
      </p>
      <div className="picture-options">
        {choices.map((c, i) => (
          <div key={c.id}>
            <CultureArt
              kind={c.id}
              label={`${String.fromCharCode(65 + i)}: ${c.en} — ${c.zh}`}
            />
            <strong>
              {String.fromCharCode(65 + i)} · {c.en}
            </strong>
          </div>
        ))}
      </div>
      {pictureReading.map((q, i) => (
        <label className="picture-prompt" key={q.en}>
          <span>
            {i + 1}. {q.en}
          </span>
          <select
            aria-label={`Picture for sentence ${i + 1}`}
            value={answers[i] ?? ""}
            onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
          >
            <option value="">Choose a scene 選圖</option>
            {choices.map((c, j) => (
              <option key={c.id} value={c.id}>
                {String.fromCharCode(65 + j)} · {c.en}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button
        className="primary"
        onClick={() =>
          setFeedback(
            pictureReading
              .map(
                (q, i) =>
                  `${i + 1}: ${answers[i] === q.answer ? "✓ 正確" : "請訂正"} — ${choices.find((c) => c.id === q.answer)!.en}`,
              )
              .join("；"),
          )
        }
      >
        Check matches 檢查配對
      </button>
      <p role="status" className="practice-message">
        {feedback}
      </p>
    </section>
  );
}
function Listening() {
  return (
    <>
      <p className="muted-text">
        五段教材聽力均保留原文。先聽再作答，提交後顯示中文解釋；需要時可開啟文字替代。
      </p>
      {listening.map((l, i) => (
        <Practice
          key={i}
          q={{
            ...learningQuizzes.listening[i],
            id: `script-${i}`,
            questionEnglish: `Listening ${i + 1}: Choose what you hear.`,
            questionChinese: "選出聽到的描述對象。",
          }}
        />
      ))}
    </>
  );
}
function Writing() {
  const [inputs, setInputs] = useState<Record<number, string>>({}),
    [shown, setShown] = useState<number[]>([]);
  const [own, setOwn] = useState(""),
    [model, setModel] = useState(false);
  return (
    <>
      <p className="muted-text">
        先試著訂正下方句子，再與參考答案比較。自由句不以單一字串判定文法正誤。
      </p>
      {writing.map((w, i) => (
        <article className="writing-card" key={w.original}>
          <span className="eyebrow">SENTENCE CORRECTION {i + 1}</span>
          <h3>{w.original}</h3>
          <label>
            Your correction 你的訂正
            <textarea
              value={inputs[i] ?? ""}
              onChange={(e) => setInputs({ ...inputs, [i]: e.target.value })}
            />
          </label>
          <button
            className="secondary"
            onClick={() => setShown(shown.includes(i) ? shown : [...shown, i])}
          >
            Compare with model answer 比較參考答案
          </button>
          {shown.includes(i) && (
            <div className="model-answer">
              <strong>Model answer:</strong>
              <p>{w.model}</p>
              <p>{w.hint}</p>
              <p>
                {normalize(inputs[i] ?? "") === normalize(w.model)
                  ? "與參考答案相符。"
                  : "你的句子可能有其他合理寫法；請比較資訊與句型，必要時請老師協助。"}
              </p>
            </div>
          )}
        </article>
      ))}
      <h2 className="activity-title">Put the pieces together.</h2>
      <Practice q={learningQuizzes.writing[3]} />
      <section className="writing-card">
        <h2>Your own cultural sentence.</h2>
        <p>Use: “People … because …” or “I would like to learn about …”</p>
        <label>
          Write one sentence 自由造句
          <textarea value={own} onChange={(e) => setOwn(e.target.value)} />
        </label>
        <button className="secondary" onClick={() => setModel(true)}>
          See a model & checklist 參考句與檢核
        </button>
        {model && (
          <div className="model-answer">
            <p>
              Model: People worship the land god because they want a good
              harvest.
            </p>
            <ul>
              <li>是否有主詞與動詞？</li>
              <li>是否使用課文相關單字？</li>
              <li>資訊是否正確，並尊重多元信仰？</li>
              <li>首字大寫、句末有標點嗎？</li>
            </ul>
            <p>本活動提供自我檢核，不做自動文法評分。</p>
          </div>
        )}
      </section>
    </>
  );
}
