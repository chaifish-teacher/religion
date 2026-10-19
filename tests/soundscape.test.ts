import { it, expect } from "vitest";
import { ambienceEvents, beatSeconds } from "../src/audio/soundscape";
it("uses a spacious pentatonic melody with bells and wood percussion", () => {
  const events = Array.from({ length: 16 }, (_, i) =>
    ambienceEvents("home", i),
  ).flat();
  expect(new Set(events.map((e) => e.instrument))).toEqual(
    new Set(["pluck", "bell", "wood"]),
  );
  const notes = events
    .filter((e) => e.instrument === "pluck")
    .map((e) => e.frequency);
  expect(
    notes.every((n) => [261.63, 293.66, 329.63, 392, 440].includes(n)),
  ).toBe(true);
  expect(notes.length).toBeLessThan(16);
  expect(ambienceEvents("home", 0)).toEqual(ambienceEvents("home", 16));
});
it("adds gentle processional drums without increasing peaks beyond the mix budget", () => {
  const game = Array.from({ length: 16 }, (_, i) =>
    ambienceEvents("game", i),
  ).flat();
  expect(game.filter((e) => e.instrument === "drum")).toHaveLength(4);
  expect(
    game.every(
      (e) =>
        Number.isFinite(e.frequency) && e.strength > 0 && e.strength <= 0.3,
    ),
  ).toBe(true);
  expect(beatSeconds("home")).toBeGreaterThan(beatSeconds("game"));
});
