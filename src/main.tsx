import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { motion, MotionConfig } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Headphones,
  MessageCircle,
  PenLine,
  Landmark,
  ScrollText,
  Volume2,
  VolumeX,
  X,
  Compass,
  Map,
  Heart,
  Clock,
  Check,
  ChevronLeft,
  Play,
  Square,
  Sparkles,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { Explorer, TempleScene } from "./components/Scene";
import { modules, stages } from "./data/lesson";
import { Learning } from "./learning/Learning";
import { Adventure } from "./game/Adventure";
import { AudioProvider, useAudio, SpeechControls } from "./audio/Audio";
import "./styles.css";
const icons: Record<string, typeof BookOpen> = {
  book: BookOpen,
  scroll: ScrollText,
  chat: MessageCircle,
  temple: Landmark,
  headphones: Headphones,
  pen: PenLine,
};
function App() {
  const [page, setPage] = useState("home"),
    [modal, setModal] = useState<string | null>(null),
    [leaveTarget, setLeaveTarget] = useState("home");
  const audio = useAudio();
  const selected = modules.find((m) => m.id === page);
  function go(next: string) {
    audio.unlock();
    audio.stop();
    if (page === "play" && next !== "play") {
      setLeaveTarget(next);
      setModal("leave");
      return;
    }
    setPage(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function confirmLeave() {
    setModal(null);
    setPage(leaveTarget);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  useEffect(() => {
    if (page !== "play") return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [page]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        audio.stop();
        setModal(null);
      }
      if (e.key === "Tab") {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[role="dialog"] button,[role="dialog"] input,[role="dialog"] select',
          ),
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    document.querySelector<HTMLElement>('[role="dialog"] button')?.focus();
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [modal]);
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="site">
        <header>
          <button
            className="brand"
            onClick={() => go("home")}
            aria-label="Mazu Adventure home"
          >
            <span className="brand-mark">
              <Landmark size={25} />
            </span>
            <span>
              mazu<span className="brand-dot">.</span>
              <small>AN ENGLISH LEARNING ADVENTURE</small>
            </span>
          </button>
          <nav aria-label="Main navigation">
            <button
              className={page === "home" ? "active" : ""}
              onClick={() => go("home")}
            >
              Home
            </button>
            <button
              className={page === "learn" || selected ? "active" : ""}
              onClick={() => go("learn")}
            >
              Explore & Learn
            </button>
            <button
              className={
                page === "adventure" || page === "play" ? "active" : ""
              }
              onClick={() => go("adventure")}
            >
              The Adventure <span className="nav-dot" />
            </button>
          </nav>
          <div className="header-tools">
            <span className="language">
              <Globe size={15} /> EN / 繁中
            </span>
            <button
              className="sound-button"
              onClick={() => {
                audio.unlock();
                setModal("sound");
              }}
              aria-label="Sound settings"
            >
              {audio.muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
          </div>
        </header>
        <main id="main">
          {page === "home" ? (
            <Home go={go} setModal={setModal} />
          ) : page === "learn" ? (
            <>
              <PageHeading
                label="YOUR LEARNING TOOLKIT"
                title="Find your own way to learn."
                zh="六個學習空間，隨時開始、自由探索。"
              />
              <LearningCards onSelect={go} full />
            </>
          ) : page === "play" ? (
            <Adventure
              suspended={modal !== null}
              onHome={() => {
                audio.stop();
                setPage("home");
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              onExit={() => go("adventure")}
            />
          ) : page === "adventure" ? (
            <>
              <PageHeading
                label="THE JOURNEY OF FAITH & CULTURE"
                title="Your adventure starts here."
                zh="這是學習用的虛構路線，不代表真實遶境地理路線。"
              />
              <div className="map-intro">
                <Explorer small />
                <p>
                  <strong>Hi, explorer! Ready to follow the lanterns?</strong>
                  <br />
                  Collect knowledge, meet traditions, and discover new words.
                  <br />
                  <span>三顆愛心・六個關卡・一次全新的學習旅程</span>
                </p>
                <button className="primary" onClick={() => go("play")}>
                  Begin journey 開始旅程 <ArrowRight size={16} />
                </button>
                <button className="secondary" onClick={() => setModal("how")}>
                  How to play
                </button>
              </div>
              <div className="adventure-map">
                {stages.map(([title, zh], i) => (
                  <motion.button
                    whileHover={{ y: -5 }}
                    className={`stage stage-${i}`}
                    key={title}
                    onClick={() => (i === 0 ? go("play") : setModal("stages"))}
                  >
                    <span className="stage-number">0{i + 1}</span>
                    <span className="stage-art">
                      {i === 0 ? (
                        <Landmark />
                      ) : i === 1 ? (
                        <ShieldCheck />
                      ) : i === 2 ? (
                        <Map />
                      ) : i === 3 ? (
                        <Sparkles />
                      ) : i === 4 ? (
                        <MessageCircle />
                      ) : (
                        <Compass />
                      )}
                    </span>
                    <strong>{title}</strong>
                    <small>{zh}</small>
                    <span className="stage-count">
                      5 CHALLENGES <ArrowRight size={13} />
                    </span>
                  </motion.button>
                ))}
              </div>
              <p className="map-note">
                60 questions in the bank · 30 per adventure · 15
                textbook-adapted + 15 extension questions each attempt
                <br />
                無須完成學習區即可開始；重新整理會清除本次進度，不儲存學生資料。
              </p>
            </>
          ) : selected ? (
            <>
              <button className="back" onClick={() => go("learn")}>
                <ChevronLeft size={16} /> All learning modules
              </button>
              <Learning key={page} id={page} />
            </>
          ) : null}
        </main>
        <footer>
          <span className="footer-brand">
            <Landmark size={17} /> Mazu Adventure <span>·</span> The Journey of
            Faith & Culture
          </span>
          <span>
            Made for curious minds. <span className="footer-flower">✳</span>{" "}
            臺灣文化 × 英語學習
          </span>
        </footer>
        <div className="build-status">
          <ShieldCheck size={13} /> 17 頁教材核對完成 · 19 個單字 · 60
          題冒險題庫{" "}
          <button onClick={() => setModal("source")}>
            教材與來源 <ArrowUpRight size={12} />
          </button>
        </div>
      </div>
      {modal && (
        <div
          className="modal-overlay"
          onClick={() => {
            audio.stop();
            setModal(null);
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="modal"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Close dialog"
              onClick={() => {
                audio.stop();
                setModal(null);
              }}
            >
              <X size={21} />
            </button>
            {modal === "how" ? (
              <>
                <span className="eyebrow">
                  A SMALL GUIDE TO A BIG ADVENTURE
                </span>
                <h2 id="modal-title">A curious mind is all you need.</h2>
                <p>自由學習與冒險互相獨立，不必先完成學習。</p>
                <ol className="how-list">
                  <li>
                    <Compass />
                    <div>
                      <strong>Follow the six stages.</strong>
                      <small>每關隨機抽 5 題，共 30 題。</small>
                    </div>
                  </li>
                  <li>
                    <Heart />
                    <div>
                      <strong>Keep learning, even when you miss.</strong>
                      <small>答錯失去一顆愛心，歸零後訂正錯題恢復一顆。</small>
                    </div>
                  </li>
                  <li>
                    <ShieldCheck />
                    <div>
                      <strong>Meet the knowledge guardian.</strong>
                      <small>最終關答對至少 4 題即過關，可無限重試。</small>
                    </div>
                  </li>
                  <li>
                    <Sparkles />
                    <div>
                      <strong>Celebrate your progress.</strong>
                      <small>
                        答對率 70 分、作答速度 20 分、剩餘愛心 10
                        分。訂正與重試不改寫首次分數。
                      </small>
                    </div>
                  </li>
                </ol>
                <button
                  className="primary"
                  onClick={() => {
                    setModal(null);
                    go("play");
                  }}
                >
                  Start adventure <ArrowRight size={17} />
                </button>
              </>
            ) : modal === "sound" ? (
              <>
                <span className="eyebrow">MAKE YOURSELF COMFORTABLE</span>
                <h2 id="modal-title">Sound & voice</h2>
                <p>
                  原創合成背景旋律與音效，無需付費
                  API。音樂只在互動後播放；語音播放期間背景音樂會靜音。
                </p>
                <button
                  className="mute-toggle"
                  aria-pressed={audio.muted}
                  onClick={() => audio.setMuted(!audio.muted)}
                >
                  {audio.muted ? <VolumeX /> : <Volume2 />} Master sound{" "}
                  <strong>{audio.muted ? "Muted 靜音" : "On 開啟"}</strong>
                </button>
                <label className="setting">
                  Music volume 音樂音量{" "}
                  <input
                    aria-label="Music volume"
                    type="range"
                    min="0"
                    max="1"
                    step=".05"
                    value={audio.music}
                    onChange={(e) => audio.setMusic(Number(e.target.value))}
                  />
                </label>
                <label className="setting">
                  Effects & voice 音效與語音{" "}
                  <input
                    aria-label="Effects and voice volume"
                    type="range"
                    min="0"
                    max="1"
                    step=".05"
                    value={audio.effects}
                    onChange={(e) => audio.setEffects(Number(e.target.value))}
                  />
                </label>
                <SpeechControls />
                <div className="audio-actions">
                  <button
                    className="primary"
                    onClick={() =>
                      audio.speak(
                        "Welcome to Mazu Adventure. Let’s explore, learn, and discover together.",
                      )
                    }
                  >
                    <Play size={15} /> Test English voice
                  </button>
                  <button className="secondary" onClick={audio.stop}>
                    <Square size={14} /> Stop
                  </button>
                </div>
                <p role="status">
                  {audio.status ||
                    (!audio.supported
                      ? "此瀏覽器不支援語音，請使用文字替代。"
                      : "Uses an available English browser voice. 使用瀏覽器內建英文語音。")}
                </p>
              </>
            ) : modal === "leave" ? (
              <>
                <h2 id="modal-title">Leave this adventure?</h2>
                <p>
                  這次冒險的進度只存在記憶體，離開會結束本局。要繼續留在旅程中嗎？
                </p>
                <div className="audio-actions">
                  <button className="primary" onClick={() => setModal(null)}>
                    Keep playing 繼續
                  </button>
                  <button className="secondary" onClick={confirmLeave}>
                    Leave adventure 離開
                  </button>
                </div>
              </>
            ) : modal === "stages" ? (
              <>
                <h2 id="modal-title">One discovery at a time.</h2>
                <p>
                  六個關卡依序前進。先從廟埕入口出發，再讓探險角色帶你走到下一站。
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setModal(null);
                    go("play");
                  }}
                >
                  Begin at stage 1 從第一關開始
                </button>
              </>
            ) : (
              <>
                <span className="eyebrow">LESSON SOURCE & ATTRIBUTION</span>
                <h2 id="modal-title">Built around your lesson.</h2>
                <p>
                  教材來源：使用者提供《Unit 05 Religions 宗教.pptx》，17
                  頁；原教材標示 Cosmos © All rights
                  reserved。本站保留閱讀、對話與練習原文，新增題目、釋義與摘要皆標示為改編或延伸。
                </p>
                <p>
                  19 個單字、完整閱讀與對話、5 段聽力、4 題圖文配對及 3
                  題寫作訂正。原圖未重製，圖像均為新繪的象徵插畫。
                </p>
                <p>
                  「世界三大宗教活動」為未獨立查證的教材說法。課文英文 millions
                  與中譯「數以萬計」有落差，本站保留原文、不以人數出題。
                </p>
                <p>
                  學習紀錄僅存記憶體；無登入、無資料庫、不儲存至 localStorage。
                </p>
                <button className="secondary" onClick={() => setModal(null)}>
                  Got it · 了解
                </button>
              </>
            )}
          </motion.section>
        </div>
      )}
    </MotionConfig>
  );
}

function Home({
  go,
  setModal,
}: {
  go: (p: string) => void;
  setModal: (p: string) => void;
}) {
  return (
    <>
      <section className="hero">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="eyebrow">
            <span /> UNIT 05 · RELIGIONS & CULTURE
          </div>
          <h1>
            A little curiosity.
            <br />A grand <span>adventure.</span>
            <svg viewBox="0 0 300 15" aria-hidden="true">
              <path
                d="M5 10Q145-4 293 7"
                fill="none"
                stroke="#e5b45d"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </h1>
          <p className="hero-description">
            Follow the lanterns. Discover Taiwan.
            <br />
            Learn English, one adventure at a time.
          </p>
          <p className="chinese-intro">
            跟著燈籠出發，探索臺灣信仰與文化，
            <br />
            讓每一次冒險，都成為英語進步的一小步。
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => go("play")}>
              <Compass size={19} />
              <span>
                Start Adventure<small>開始冒險</small>
              </span>
              <ArrowRight size={20} />
            </button>
            <button className="secondary" onClick={() => go("learn")}>
              <BookOpen size={19} />
              <span>
                Start Learning<small>自由學習</small>
              </span>
            </button>
          </div>
          <button className="how-button" onClick={() => setModal("how")}>
            <span>
              <Play size={11} fill="currentColor" />
            </span>
            New here? Here’s how to play <ArrowUpRight size={14} />
          </button>
          <div className="hero-note">
            <ShieldCheck size={15} /> No sign-up. Just a curious mind.
            <span>無須登入・免費探索</span>
          </div>
        </motion.div>
        <motion.div
          className="hero-art"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65 }}
        >
          <div className="art-label">
            <span className="live-dot" /> YOUR JOURNEY BEGINS HERE
          </div>
          <TempleScene />
          <div className="scene-explorer">
            <Explorer />
          </div>
          <div className="floating-note">
            <span className="note-icon">✦</span>
            <span>
              A world of stories awaits.<small>準備好一起探索了嗎？</small>
            </span>
          </div>
          <div className="scene-caption">
            <Map size={15} /> TAIWAN · A JOURNEY OF DISCOVERY{" "}
            <span>01 / 06</span>
          </div>
        </motion.div>
      </section>
      <section className="facts" aria-label="Adventure overview">
        <div>
          <span className="fact-icon">
            <Map />
          </span>
          <p>
            <strong>6 unique stages</strong>
            <small>六個場景，一段文化旅程</small>
          </p>
        </div>
        <div>
          <span className="fact-icon">
            <Sparkles />
          </span>
          <p>
            <strong>30 little challenges</strong>
            <small>單字、閱讀、聽力與對話</small>
          </p>
        </div>
        <div>
          <span className="fact-icon">
            <Clock />
          </span>
          <p>
            <strong>25–30 minutes</strong>
            <small>一堂課，剛剛好的冒險</small>
          </p>
        </div>
        <div>
          <span className="fact-icon">
            <Heart />
          </span>
          <p>
            <strong>Learn at your pace</strong>
            <small>答錯也沒關係，再試一次</small>
          </p>
        </div>
      </section>
      <LearningCards onSelect={go} />
      <section className="journey-banner">
        <div>
          <span className="eyebrow">EVERY STEP TELLS A STORY</span>
          <h2>
            From the temple gate
            <br />
            to your next discovery.
          </h2>
          <p>Six stops. New perspectives. One unforgettable journey.</p>
          <button onClick={() => go("adventure")}>
            Explore the adventure map <ArrowRight size={17} />
          </button>
        </div>
        <div className="mini-route">
          <span>
            01
            <Landmark />
          </span>
          <i />
          <span>
            02
            <ScrollText />
          </span>
          <i />
          <span>
            03
            <Sparkles />
          </span>
          <i />
          <span className="route-end">
            06
            <Compass />
          </span>
        </div>
      </section>
    </>
  );
}
function PageHeading({
  label,
  title,
  zh,
}: {
  label: string;
  title: string;
  zh: string;
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{label}</div>
      <h1>{title}</h1>
      <p>{zh}</p>
    </div>
  );
}
function LearningCards({
  onSelect,
  full = false,
}: {
  onSelect: (id: string) => void;
  full?: boolean;
}) {
  return (
    <section className={`learning-section ${full ? "full" : ""}`}>
      <div className="section-heading">
        <div>
          <div className="eyebrow">A LITTLE PRACTICE, A LOT TO DISCOVER</div>
          <h2>
            Learn your way.<span>從你喜歡的地方開始</span>
          </h2>
        </div>
        <span className="section-aside">
          Six ways to get a little closer to Taiwan <ArrowUpRight size={17} />
        </span>
      </div>
      <div className="learning-grid">
        {modules.map((m, i) => {
          const Icon = icons[m.icon];
          return (
            <button
              className={`learning-card ${m.color}`}
              key={m.id}
              onClick={() => onSelect(m.id)}
            >
              <div className="card-top">
                <span className="card-icon">
                  <Icon size={26} />
                </span>
                <span className="card-index">0{i + 1}</span>
              </div>
              <div className="card-tag">{m.tag}</div>
              <h3>{m.title}</h3>
              <span className="card-zh">{m.zh}</span>
              <p>{m.desc}</p>
              <div className="card-bottom">
                <span>Explore module</span>
                <ArrowUpRight size={18} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </React.StrictMode>,
);
