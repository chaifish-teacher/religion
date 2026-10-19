import { vocabulary, pictureReading } from "../../src/data/content";
import { test, expect, type Page, type Locator } from "@playwright/test";
import { adventureQuestions, learningQuizzes } from "../../src/data/questions";
import type { Question } from "../../src/game/engine";
async function answerQuestion(
  page: Page,
  q: Question,
  correct = true,
  root: Page | Locator = page,
) {
  if (q.options?.length) {
    const target = correct
      ? q.correctAnswer
      : q.options.find((a) => a !== q.correctAnswer)!;
    const labels = await root.locator(".answer-option").allTextContents();
    const i = labels.findIndex((t) => t.slice(1).trim() === target);
    expect(i, `option ${target}`).toBeGreaterThanOrEqual(0);
    await root.locator(".answer-option").nth(i).click();
  } else if (q.type === "ordering") {
    const words = q.correctAnswer.split(" ");
    const sequence = correct ? words : [...words].reverse();
    for (const word of sequence) {
      const matches = root.locator(".word-tokens button").filter({
        hasText: new RegExp(
          "^" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
        ),
      });
      let clicked = false;
      for (let i = 0; i < (await matches.count()); i++)
        if (await matches.nth(i).isEnabled()) {
          await matches.nth(i).click();
          clicked = true;
          break;
        }
      expect(clicked).toBe(true);
    }
    await root.getByRole("button", { name: "Check answer 確認答案" }).click();
  } else {
    await root
      .getByRole("textbox", { name: "Your answer" })
      .fill(correct ? q.correctAnswer : "wrong-answer");
    await root.getByRole("button", { name: "Check answer 確認答案" }).click();
  }
}
async function currentQuestion(page: Page) {
  const en = await page.locator(".question-card h2").textContent();
  const q = adventureQuestions.find((q) => q.questionEnglish === en);
  expect(q, `question ${en} exists`).toBeTruthy();
  return q!;
}
async function handleProgress(page: Page) {
  for (let i = 0; i < 6; i++) {
    if (await page.locator(".stage-transition").isVisible()) {
      await expect(page.locator(".stage-story")).toBeVisible();
      continue;
    }
    if (
      await page
        .getByRole("button", { name: "Begin stage 開始本關" })
        .isVisible()
    ) {
      await page.getByRole("button", { name: "Begin stage 開始本關" }).click();
      continue;
    }
    if (await page.locator(".recovery-hint").isVisible()) {
      const q = await currentQuestion(page);
      await answerQuestion(page, q);
      await expect(
        page.getByText("One heart restored! 愛心恢復一顆；首次答案不變。"),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Back to the adventure 返回冒險" })
        .click();
      continue;
    }
    break;
  }
}
test("six learning modules, mini quiz retry and source content", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Learning" }).click();
  await expect(page.locator(".learning-card")).toHaveCount(6);
  await page.getByRole("button", { name: /Vocabulary Lab/ }).click();
  await expect(
    page.getByRole("heading", { name: "Vocabulary Lab", exact: true }),
  ).toBeVisible();
  const mini = page.locator(".mini-quiz");
  const q0 = learningQuizzes.vocabulary[0];
  await answerWithinMini(page, q0, false);
  await expect(mini.getByText("A chance to learn. 一起訂正吧")).toBeVisible();
  await mini
    .getByRole("button", { name: "Retry this question 重試本題" })
    .click();
  for (const q of learningQuizzes.vocabulary) {
    await answerWithinMini(page, q, true);
    const next = mini.getByRole("button", { name: "Next question 下一題" });
    if (await next.isVisible()) await next.click();
    else if (
      await mini
        .getByRole("button", { name: "Finish module 完成本單元" })
        .isVisible()
    )
      await mini
        .getByRole("button", { name: "Finish module 完成本單元" })
        .click();
  }
  await expect(
    mini.getByRole("heading", { name: "Module complete. Nicely done!" }),
  ).toBeVisible();
  for (const title of [
    "Reading Explorer",
    "Conversation Studio",
    "Culture Gallery",
    "Listening Practice",
    "Writing Workshop",
  ]) {
    await page
      .getByRole("button", { name: "Explore & Learn", exact: true })
      .click();
    await page.getByRole("button", { name: new RegExp(title) }).click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  await expect(page.locator(".writing-card")).toHaveCount(4);
  await page
    .getByRole("button", { name: "Compare with model answer 比較參考答案" })
    .first()
    .click();
  await expect(
    page.getByText("People usually pray to Mazu for good luck and safety.", {
      exact: true,
    }),
  ).toBeVisible();
});
async function answerWithinMini(page: Page, q: Question, correct: boolean) {
  const mini = page.locator(".mini-quiz");
  const target = correct
    ? q.correctAnswer
    : q.options!.find((o) => o !== q.correctAnswer)!;
  const labels = await mini.locator(".answer-option").allTextContents();
  await mini
    .locator(".answer-option")
    .nth(labels.findIndex((t) => t.slice(1).trim() === target))
    .click();
}
test("bilingual reading, conversation roles and hidden listening transcripts", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore & Learn", exact: true })
    .click();
  await page.getByRole("button", { name: /Reading Explorer/ }).click();
  await expect(page.locator(".reading-paragraph")).toHaveCount(5);
  await page.getByRole("button", { name: "English only", exact: true }).click();
  await expect(page.locator(".reading-paragraph .translation")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Bilingual 雙語", exact: true })
    .click();
  await expect(page.locator(".reading-paragraph .translation")).toHaveCount(5);
  await page.locator(".vocab-inline").first().click();
  await expect(page.locator(".word-hint").first()).not.toBeEmpty();
  await page
    .getByRole("button", { name: "Explore & Learn", exact: true })
    .click();
  await page.getByRole("button", { name: /Conversation Studio/ }).click();
  await expect(page.locator(".dialogue")).toHaveCount(10);
  await page.getByLabel("Role-play", { exact: true }).selectOption("Ethan");
  await expect(page.locator(".role-prompt")).toHaveCount(5);
  await page
    .getByRole("button", { name: "Explore & Learn", exact: true })
    .click();
  await page.getByRole("button", { name: /Listening Practice/ }).click();
  await expect(page.locator(".listening-box")).toHaveCount(6);
  await expect(
    page.getByText(
      "It is an important philosophy based on the teachings of Confucius.",
      { exact: true },
    ),
  ).not.toBeVisible();
  await page
    .locator(".listening-box")
    .first()
    .getByRole("button", { name: "Text alternative 文字替代" })
    .click();
  await expect(
    page.getByText(
      "It’s a mixture of several beliefs concerning gods, ghosts, ancestors, and luck.",
      { exact: true },
    ),
  ).toBeVisible();
});
test("full 30-question adventure, recovery, Boss failure and retry, frozen results", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Start Adventure" }).click();
  await expect(page.locator(".hearts")).toHaveAttribute(
    "aria-label",
    "3 hearts remaining",
  );
  await page.getByRole("button", { name: "Begin stage 開始本關" }).click();
  for (let i = 0; i < 30; i++) {
    await handleProgress(page);
    const q = await currentQuestion(page);
    const correct = !(i < 3 || i === 25 || i === 26);
    await answerQuestion(page, q, correct);
    await expect(page.locator(".feedback")).toBeVisible();
    await page
      .getByRole("button", { name: "Continue 繼續", exact: true })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "So close. Keep exploring!" }),
  ).toBeVisible();
  const initialScore = await page.locator(".score-medal strong").textContent();
  await expect(page.getByText("3 / 5", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "Retry Boss 再挑戰" }).click();
  await page.getByRole("button", { name: "Start Boss retry 開始重試" }).click();
  for (let i = 0; i < 5; i++) {
    const q = await currentQuestion(page);
    await answerQuestion(page, q, true);
    await page
      .getByRole("button", { name: "Continue 繼續", exact: true })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Adventure cleared!" }),
  ).toBeVisible();
  expect(await page.locator(".score-medal strong").textContent()).toBe(
    initialScore,
  );
  await expect(page.locator(".result-stats")).toContainText("5 / 5");
  await expect(page.locator(".result-stats")).toContainText("2");
  await page.getByRole("button", { name: "All 30 answers 全部" }).click();
  await expect(page.locator(".answer-review details")).toHaveCount(30);
  await page.getByRole("button", { name: "Play again", exact: true }).click();
  await expect(page.locator(".hearts")).toHaveAttribute(
    "aria-label",
    "3 hearts remaining",
  );
  await expect(page.locator(".official-progress")).toContainText("0 / 30");
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test("sound controls, TTS fallback, focus trap and safe exit", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      configurable: true,
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Sound settings" }).click();
  await expect(
    page.getByText("此瀏覽器不支援語音，請使用文字替代。", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("button", { name: "Stop", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  await page.getByRole("button", { name: /Master sound/ }).click();
  await expect(
    page.getByRole("button", { name: /Master sound/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Speech speed").selectOption(".75");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Start Adventure" }).click();
  await page.getByRole("button", { name: "Begin stage 開始本關" }).click();
  await page.getByRole("button", { name: "Pause 暫停" }).click();
  await expect(
    page.getByRole("heading", { name: "Take a little breath." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume adventure 繼續冒險" }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Leave this adventure?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep playing 繼續" }).click();
  await expect(page.locator(".question-card")).toBeVisible();
});
test("mobile and tablet learning and game layouts have no horizontal overflow", async ({
  page,
}) => {
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Explore & Learn", exact: true })
      .click();
    await page.getByRole("button", { name: /Culture Gallery/ }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "The Adventure" }).click();
    await page.getByRole("button", { name: "Begin journey 開始旅程" }).click();
    await page.getByRole("button", { name: "Begin stage 開始本關" }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await page.getByRole("button", { name: "Leave adventure 離開" }).click();
  }
});

for (const [id, title] of [
  ["reading", "Reading Explorer"],
  ["conversation", "Conversation Studio"],
  ["culture", "Culture Gallery"],
  ["listening", "Listening Practice"],
  ["writing", "Writing Workshop"],
]) {
  test(`${title}: all five mini-quiz interactions complete`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Explore & Learn", exact: true })
      .click();
    await page.getByRole("button", { name: new RegExp(title) }).click();
    const mini = page.locator(".mini-quiz");
    for (const q of learningQuizzes[id]) {
      await answerQuestion(page, q, true, mini);
      await expect(mini.locator(".feedback")).toBeVisible();
      const finish = mini.getByRole("button", {
        name: "Finish module 完成本單元",
      });
      if (await finish.isVisible()) await finish.click();
      else
        await mini
          .getByRole("button", { name: "Next question 下一題" })
          .click();
    }
    await expect(
      mini.getByRole("heading", { name: "Module complete. Nicely done!" }),
    ).toBeVisible();
  });
}
test("TTS uses English voices and speed, cancels previous playback and stops", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __spoken: { text: string; rate: number; lang: string; voice: string }[];
      __cancels: number;
    };
    w.__spoken = [];
    w.__cancels = 0;
    class FakeUtterance {
      text: string;
      lang = "";
      rate = 1;
      volume = 1;
      voice: { name: string } | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: FakeUtterance,
      configurable: true,
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        getVoices: () => [
          { lang: "en-US", name: "English A" },
          { lang: "en-GB", name: "English B" },
        ],
        cancel: () => {
          w.__cancels++;
        },
        speak: (u: FakeUtterance) => {
          w.__spoken.push({
            text: u.text,
            rate: u.rate,
            lang: u.lang,
            voice: u.voice?.name ?? "",
          });
        },
      },
      configurable: true,
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Sound settings" }).click();
  await page.getByLabel("Speech speed").selectOption(".75");
  await page.getByRole("button", { name: "Test English voice" }).click();
  await page.getByRole("button", { name: "Test English voice" }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  const result = await page.evaluate(() => {
    const w = window as unknown as {
      __spoken: { text: string; rate: number; lang: string; voice: string }[];
      __cancels: number;
    };
    return { spoken: w.__spoken, cancels: w.__cancels };
  });
  expect(result.spoken).toHaveLength(2);
  expect(result.spoken[0].rate).toBe(0.75);
  expect(result.spoken[0].lang).toBe("en-US");
  expect(result.spoken[0].voice).toBe("English A");
  expect(result.cancels).toBeGreaterThanOrEqual(3);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Explore & Learn", exact: true })
    .click();
  await page.getByRole("button", { name: /Conversation Studio/ }).click();
  await page
    .getByRole("button", { name: "Play Laura line line1", exact: true })
    .click();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __spoken: { voice: string }[] }).__spoken.at(-1)
          ?.voice,
    ),
  ).toBe("English B");
});

test("vocabulary flashcards, spelling, matching and shuffled picture identities", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Learning" }).click();
  await page.getByRole("button", { name: /Vocabulary Lab/ }).click();
  await page
    .getByRole("button", { name: "Flip flashcard for Buddhism" })
    .click();
  await expect(page.locator(".flashcard")).toContainText("佛教");
  await page.getByLabel("Spelling 拼字").fill("Buddhism");
  await page
    .getByRole("button", { name: "Check spelling", exact: true })
    .click();
  await expect(
    page.getByText("Correct! 拼字正確。", { exact: true }),
  ).toBeVisible();
  const words = await page
    .locator(".matching-columns > div")
    .first()
    .getByRole("button")
    .allTextContents();
  for (const word of words) {
    const v = vocabulary.find((v) => v.word === word)!;
    expect(v).toBeTruthy();
    await page
      .locator(".matching-columns > div")
      .first()
      .getByRole("button", { name: word, exact: true })
      .click();
    await page
      .locator(".matching-columns > div")
      .nth(1)
      .getByRole("button", { name: v.zh, exact: true })
      .click();
  }
  await expect(
    page.getByText("All five matched! 五組配對完成。", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Explore & Learn", exact: true })
    .click();
  await page.getByRole("button", { name: /Culture Gallery/ }).click();
  for (let i = 0; i < 4; i++)
    await page
      .getByLabel(`Picture for sentence ${i + 1}`)
      .selectOption(pictureReading[i].answer);
  await page.getByRole("button", { name: "Check matches 檢查配對" }).click();
  expect(
    (await page.locator(".practice-message").textContent())?.match(/✓ 正確/g),
  ).toHaveLength(4);
});

test("standalone clues are visible without opening a source or a presentation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Start Adventure" }).click();
  await page.getByRole("button", { name: "Begin stage 開始本關" }).click();
  for (let i = 0; i < 5; i++) {
    const q = await currentQuestion(page);
    await answerQuestion(page, q, true);
    await page
      .getByRole("button", { name: "Continue 繼續", exact: true })
      .click();
  }
  await expect(
    page.getByRole("button", { name: "Begin stage 開始本關" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Begin stage 開始本關" }).click();
  await expect(
    page.getByRole("region", { name: "Reading clue" }),
  ).toBeVisible();
  await expect(page.locator(".reference p")).not.toBeEmpty();
  await expect(page.locator(".question-card")).not.toContainText(
    /Slide|Textbook|簡報|投影片|第\s*\d+\s*頁/i,
  );
});
test("temple ambience produces audio and ducks for speech and master mute", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as unknown as {
      __ctx: AudioContext;
      __gains: GainNode[];
      __analyser: AnalyserNode;
    };
    w.__gains = [];
    const Native = window.AudioContext;
    class ObservedContext extends Native {
      constructor() {
        super();
        w.__ctx = this;
      }
      createGain() {
        const g = super.createGain();
        w.__gains.push(g);
        return g;
      }
    }
    Object.defineProperty(window, "AudioContext", {
      value: ObservedContext,
      configurable: true,
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: { getVoices: () => [], cancel: () => {}, speak: () => {} },
      configurable: true,
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Sound settings" }).click();
  await page.getByRole("button", { name: "Preview ambience 試聽音景" }).click();
  await page.evaluate(() => {
    const w = window as unknown as {
      __ctx: AudioContext;
      __gains: GainNode[];
      __analyser: AnalyserNode;
    };
    w.__analyser = w.__ctx.createAnalyser();
    w.__gains[1].connect(w.__analyser);
  });
  await page.waitForFunction(() => {
    const a = (window as unknown as { __analyser: AnalyserNode }).__analyser,
      b = new Float32Array(a.fftSize);
    a.getFloatTimeDomainData(b);
    return b.some((v) => Math.abs(v) > 0.0001);
  });
  await page.getByRole("button", { name: "Test English voice" }).click();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __gains: GainNode[] }).__gains[1].gain.value,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __gains: GainNode[] }).__gains[1].gain.value,
    ),
  ).toBeGreaterThan(0);
  await page.getByRole("button", { name: /Master sound/ }).click();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __gains: GainNode[] }).__gains[0].gain.value,
    ),
  ).toBe(0);
});
