/** Original instrumental ambience inspired by temple courtyards, not ritual recordings. */
export type AmbienceTheme = "home" | "game";
export type Instrument = "pluck" | "bell" | "wood" | "drum";
export interface MusicEvent {
  instrument: Instrument;
  frequency: number;
  offset: number;
  strength: number;
}
// C, D, E, G, A pentatonic motifs; nulls leave space for reading and conversation.
const COURTYARD = [
  0,
  null,
  2,
  1,
  4,
  null,
  2,
  null,
  1,
  2,
  null,
  4,
  3,
  null,
  1,
  null,
];
const PROCESSION = [
  0,
  2,
  null,
  3,
  4,
  null,
  3,
  2,
  1,
  null,
  2,
  3,
  2,
  null,
  1,
  null,
];
const SCALE = [261.63, 293.66, 329.63, 392, 440];
export const beatSeconds = (theme: AmbienceTheme) =>
  60 / (theme === "home" ? 72 : 92);
export function ambienceEvents(
  theme: AmbienceTheme,
  step: number,
): MusicEvent[] {
  const index = step % 16,
    note = (theme === "home" ? COURTYARD : PROCESSION)[index];
  const events: MusicEvent[] = [];
  if (note !== null)
    events.push({
      instrument: "pluck",
      frequency: SCALE[note],
      offset: 0,
      strength: theme === "home" ? 0.28 : 0.25,
    });
  if (index === 0)
    events.push({
      instrument: "bell",
      frequency: 523.25,
      offset: 0,
      strength: 0.13,
    });
  if (index === 8)
    events.push({
      instrument: "bell",
      frequency: 392,
      offset: 0,
      strength: 0.09,
    });
  if (index % 4 === 2)
    events.push({
      instrument: "wood",
      frequency: 790,
      offset: 0.02,
      strength: 0.11,
    });
  if (theme === "game" && index % 4 === 0)
    events.push({
      instrument: "drum",
      frequency: 84,
      offset: 0,
      strength: 0.14,
    });
  return events;
}
function partial(
  c: BaseAudioContext,
  output: AudioNode,
  time: number,
  frequency: number,
  peak: number,
  decay: number,
  type: OscillatorType = "sine",
) {
  const oscillator = c.createOscillator(),
    envelope = c.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  envelope.gain.setValueAtTime(0, time);
  envelope.gain.linearRampToValueAtTime(peak, time + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  oscillator.connect(envelope);
  envelope.connect(output);
  oscillator.start(time);
  oscillator.stop(time + decay + 0.02);
  oscillator.onended = () => {
    oscillator.disconnect();
    envelope.disconnect();
  };
}
export function renderAmbienceBeat(
  c: BaseAudioContext,
  output: AudioNode,
  theme: AmbienceTheme,
  step: number,
  time: number,
) {
  for (const event of ambienceEvents(theme, step)) {
    const t = time + event.offset,
      f = event.frequency,
      v = event.strength;
    if (event.instrument === "pluck") {
      // A fast attack and progressively damped harmonics suggest a plucked string.
      partial(c, output, t, f, v, 0.95, "triangle");
      partial(c, output, t, f * 2, v * 0.18, 0.36);
      partial(c, output, t + 0.014, f * 3, v * 0.08, 0.2);
    } else if (event.instrument === "bell") {
      // Soft inharmonic partials create a lingering bronze chime.
      partial(c, output, t, f, v, 3.4);
      partial(c, output, t, f * 2.71, v * 0.24, 2.1);
      partial(c, output, t, f * 4.08, v * 0.08, 1.3);
    } else if (event.instrument === "wood") {
      partial(c, output, t, f, v, 0.085);
      partial(c, output, t, f * 1.48, v * 0.35, 0.055);
    } else {
      const drum = c.createOscillator(),
        envelope = c.createGain();
      drum.frequency.setValueAtTime(f * 1.7, t);
      drum.frequency.exponentialRampToValueAtTime(f, t + 0.09);
      envelope.gain.setValueAtTime(v, t);
      envelope.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
      drum.connect(envelope);
      envelope.connect(output);
      drum.start(t);
      drum.stop(t + 0.28);
      drum.onended = () => {
        drum.disconnect();
        envelope.disconnect();
      };
    }
  }
}
