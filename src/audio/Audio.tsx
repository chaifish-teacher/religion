import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
type Effect = "correct" | "incorrect" | "stage" | "badge" | "boss" | "victory";
const melodies: Record<Effect, number[]> = {
  correct: [523, 659, 784],
  incorrect: [294, 220],
  stage: [392, 523, 659, 784],
  badge: [659, 784, 1047],
  boss: [196, 247, 294, 392],
  victory: [523, 659, 784, 1047, 784, 1047],
};
interface AudioAPI {
  muted: boolean;
  setMuted: (v: boolean) => void;
  music: number;
  setMusic: (v: number) => void;
  effects: number;
  setEffects: (v: number) => void;
  rate: number;
  setRate: (v: number) => void;
  status: string;
  speaking: boolean;
  supported: boolean;
  unlock: () => void;
  play: (e: Effect) => void;
  speak: (text: string, speaker?: string) => void;
  dialogue: (lines: { en: string; speaker: string }[]) => void;
  stop: () => void;
  setTheme: (v: "home" | "game") => void;
}
const Context = createContext<AudioAPI | null>(null);
export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(false),
    [music, setMusic] = useState(0.18),
    [effects, setEffects] = useState(0.45),
    [rate, setRate] = useState(1),
    [status, setStatus] = useState(""),
    [speaking, setSpeaking] = useState(false),
    [theme, setTheme] = useState<"home" | "game">("home");
  const context = useRef<AudioContext | null>(null),
    musicGain = useRef<GainNode | null>(null),
    step = useRef(0),
    speechActive = useRef(false);
  const supported =
    typeof window.speechSynthesis !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined";
  function unlock() {
    if (!context.current) {
      try {
        context.current = new AudioContext();
        musicGain.current = context.current.createGain();
        musicGain.current.connect(context.current.destination);
      } catch {
        setStatus(
          "Music is unavailable in this browser. 此瀏覽器無法播放音樂。",
        );
      }
    }
    if (context.current?.state === "suspended") void context.current.resume();
  }
  function tone(
    f: number,
    time: number,
    duration: number,
    gain: GainNode,
    volume = 0.12,
  ) {
    const c = context.current;
    if (!c) return;
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = "sine";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(volume, time + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    o.connect(g);
    g.connect(gain);
    o.start(time);
    o.stop(time + duration + 0.02);
  }
  useEffect(() => {
    const timer = window.setInterval(() => {
      const c = context.current,
        g = musicGain.current;
      if (!c || !g || muted || document.hidden || speechActive.current) return;
      g.gain.value = music;
      const home = [261.63, 329.63, 392, 440, 392, 329.63, 293.66, 329.63];
      const game = [293.66, 349.23, 440, 523.25, 440, 349.23, 392, 349.23];
      tone(
        (theme === "game" ? game : home)[step.current++ % 8],
        c.currentTime,
        0.8,
        g,
        0.12,
      );
    }, 650);
    return () => clearInterval(timer);
  }, [muted, music, theme]);
  useEffect(() => {
    if (musicGain.current)
      musicGain.current.gain.value = muted || speaking ? 0 : music;
  }, [muted, music, speaking]);
  function stop() {
    if (supported) window.speechSynthesis.cancel();
    speechActive.current = false;
    setSpeaking(false);
  }
  useEffect(() => {
    if (muted) stop();
  }, [muted]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        stop();
        void context.current?.suspend();
      } else if (context.current && !muted) void context.current.resume();
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [muted]);
  useEffect(
    () => () => {
      if (supported) window.speechSynthesis.cancel();
      void context.current?.close();
    },
    [],
  );
  function play(e: Effect) {
    unlock();
    const c = context.current;
    if (!c || muted) return;
    const g = c.createGain();
    g.gain.value = effects;
    g.connect(c.destination);
    melodies[e].forEach((f, i) =>
      tone(f, c.currentTime + i * 0.11, 0.3, g, 0.18),
    );
    setTimeout(() => g.disconnect(), 2000);
  }
  function utter(text: string, speaker?: string) {
    const u = new SpeechSynthesisUtterance(
      text.replace(/[\u3400-\u9fff]+/g, ""),
    );
    u.lang = "en-US";
    u.rate = rate;
    u.volume = effects;
    const voices = window.speechSynthesis
      .getVoices()
      .filter((v) => v.lang.startsWith("en"));
    u.voice = voices[speaker === "Laura" && voices.length > 1 ? 1 : 0] ?? null;
    return u;
  }
  function dialogue(lines: { en: string; speaker: string }[]) {
    unlock();
    stop();
    if (!supported) {
      setStatus(
        "Speech is unavailable. Read the text alternative. 此瀏覽器不支援語音，請使用文字替代。",
      );
      return;
    }
    if (muted) {
      setStatus("Sound is muted. 請先取消靜音。");
      return;
    }
    setStatus("");
    speechActive.current = true;
    setSpeaking(true);
    const run = (i: number) => {
      if (!speechActive.current) return;
      if (i >= lines.length) {
        stop();
        return;
      }
      const u = utter(lines[i].en, lines[i].speaker);
      u.onend = () => run(i + 1);
      u.onerror = () => {
        setStatus("Voice playback failed. 語音播放失敗，請使用文字替代。");
        stop();
      };
      window.speechSynthesis.speak(u);
    };
    run(0);
  }
  function speak(text: string, speaker?: string) {
    dialogue([{ en: text, speaker: speaker ?? "" }]);
  }
  return (
    <Context.Provider
      value={{
        muted,
        setMuted,
        music,
        setMusic,
        effects,
        setEffects,
        rate,
        setRate,
        status,
        speaking,
        supported,
        unlock,
        play,
        speak,
        dialogue,
        stop,
        setTheme,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAudio() {
  const a = useContext(Context);
  if (!a) throw new Error("AudioProvider required");
  return a;
}
export function SpeechControls() {
  const a = useAudio();
  return (
    <div className="speech-controls">
      <label>
        Speed 語速{" "}
        <select
          aria-label="Speech speed"
          value={a.rate}
          onChange={(e) => {
            a.stop();
            a.setRate(Number(e.target.value));
          }}
        >
          <option value=".75">0.75×</option>
          <option value="1">1×</option>
          <option value="1.25">1.25×</option>
        </select>
      </label>
      <button className="text-button" onClick={a.stop}>
        ■ Stop audio 停止
      </button>
      <span role="status">{a.status}</span>
    </div>
  );
}
