import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import type { TimeSignature, Subdivision } from '../types/metronome';

// ── Internal step type used in the Tone.Sequence ────────────────────────────
interface StepData {
  beat:     number;   // which beat circle to light up (0-indexed)
  isBeat:   boolean;  // true on every beat, false on subdivision ticks
  isAccent: boolean;  // true only on beat 0 / step 0
}

// ── Lookup tables ────────────────────────────────────────────────────────────
const BEATS: Record<TimeSignature, number> = {
  '2/4': 2, '3/4': 3, '4/4': 4, '6/8': 6,
};

export const SUBDIVS: Record<Subdivision, number> = {
  quarter: 1, eighth: 2, sixteenth: 4, triplet: 3,
};

const INTERVAL: Record<Subdivision, string> = {
  quarter: '4n', eighth: '8n', sixteenth: '16n', triplet: '8t',
};

// Shared synth envelope — triangle wave, very short decay
const SYNTH_OPTS = {
  oscillator: { type: 'triangle' as const },
  envelope:   { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
};

const PRACTICE_GOAL_SECS = 600; // 10 minutes

// ── Hook ─────────────────────────────────────────────────────────────────────
export const useMetronome = () => {
  // React-rendered state
  const [bpm,           setBpmSt]   = useState(120);
  const [isPlaying,     setPlaying] = useState(false);
  const [timeSignature, setTSSt]    = useState<TimeSignature>('4/4');
  const [subdivision,   setSubSt]   = useState<Subdivision>('quarter');
  const [accentBeat1,   setAccent]  = useState(true);
  const [currentBeat,   setBeat]    = useState(0);
  const [volume,        setVolSt]   = useState(0.8);
  const [isTapping,     setTapping] = useState(false);

  // Refs read by Tone.js callbacks — never go stale
  const isPlayingRef = useRef(false);
  const accentRef    = useRef(true);
  const volRef       = useRef(0.8);
  const tsRef        = useRef<TimeSignature>('4/4');
  const subRef       = useRef<Subdivision>('quarter');

  // Tone.js object refs
  const accentSynth = useRef<Tone.Synth | null>(null);
  const clickSynth  = useRef<Tone.Synth | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seqRef      = useRef<any>(null);

  // Tap tempo
  const tapsRef    = useRef<number[]>([]);
  const tapTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Practice time
  const practiceStart   = useRef<number | null>(null);
  const totalPractice   = useRef(0);
  const achievedRef     = useRef(false);
  const achieveInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Sequence builder ────────────────────────────────────────────────────
  const buildSequence = useCallback(
    (ts: TimeSignature, sub: Subdivision, seamless: boolean) => {
      seqRef.current?.stop();
      seqRef.current?.dispose();
      seqRef.current = null;

      const beats    = BEATS[ts];
      const subdivs  = SUBDIVS[sub];
      const interval = INTERVAL[sub];

      const steps: StepData[] = [];
      for (let beat = 0; beat < beats; beat++) {
        for (let s = 0; s < subdivs; s++) {
          steps.push({ beat, isBeat: s === 0, isAccent: beat === 0 && s === 0 });
        }
      }

      const seq = new Tone.Sequence<StepData>(
        (time: number, step: StepData) => {
          const vol = volRef.current;
          if (step.isAccent && accentRef.current) {
            accentSynth.current?.triggerAttackRelease('C5', '32n', time, vol);
          } else if (step.isBeat) {
            clickSynth.current?.triggerAttackRelease('G4', '32n', time, vol);
          } else {
            clickSynth.current?.triggerAttackRelease('G3', '64n', time, vol * 0.6);
          }
          // Sync visual update to audio playback time via Draw
          try {
            Tone.getDraw().schedule(() => { setBeat(step.beat); }, time);
          } catch {
            setBeat(step.beat);
          }
        },
        steps,
        interval,
      );

      seqRef.current = seq;
      if (seamless && isPlayingRef.current) {
        seq.start('+0');
      }
    },
    [],
  );

  // ── Mount / unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    accentSynth.current = new Tone.Synth(SYNTH_OPTS).toDestination();
    clickSynth.current  = new Tone.Synth(SYNTH_OPTS).toDestination();
    buildSequence('4/4', 'quarter', false);

    return () => {
      const t = Tone.getTransport();
      t.stop();
      t.cancel();
      seqRef.current?.stop();
      seqRef.current?.dispose();
      accentSynth.current?.dispose();
      clickSynth.current?.dispose();
      if (achieveInterval.current) clearInterval(achieveInterval.current);
    };
  }, [buildSequence]);

  // ── Controls ─────────────────────────────────────────────────────────────
  const play = useCallback(async () => {
    if (isPlayingRef.current) return;
    await Tone.start();
    if (!seqRef.current) return;
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    seqRef.current.start(0);
    transport.start('+0');
    isPlayingRef.current = true;
    setPlaying(true);
    setBeat(0);

    practiceStart.current = Date.now();
    achieveInterval.current = setInterval(() => {
      if (achievedRef.current || practiceStart.current === null) return;
      const secs = totalPractice.current + (Date.now() - practiceStart.current) / 1000;
      if (secs >= PRACTICE_GOAL_SECS) {
        achievedRef.current = true;
        window.dispatchEvent(
          new CustomEvent('achievement', {
            detail: { id: 'timing-master', label: 'Timing Master', xp: 50 },
          }),
        );
      }
    }, 10_000);
  }, []);

  const stop = useCallback(() => {
    Tone.getTransport().stop();
    seqRef.current?.stop();
    isPlayingRef.current = false;
    setPlaying(false);
    setBeat(0);
    if (practiceStart.current !== null) {
      totalPractice.current += (Date.now() - practiceStart.current) / 1000;
      practiceStart.current = null;
    }
    if (achieveInterval.current) {
      clearInterval(achieveInterval.current);
      achieveInterval.current = null;
    }
  }, []);

  const setBPM = useCallback((newBpm: number) => {
    const v = Math.max(40, Math.min(240, Math.round(newBpm)));
    setBpmSt(v);
    Tone.getTransport().bpm.value = v;
  }, []);

  const setTimeSignature = useCallback(
    (ts: TimeSignature) => {
      tsRef.current = ts;
      setTSSt(ts);
      buildSequence(ts, subRef.current, isPlayingRef.current);
      setBeat(0);
    },
    [buildSequence],
  );

  const setSubdivision = useCallback(
    (sub: Subdivision) => {
      subRef.current = sub;
      setSubSt(sub);
      buildSequence(tsRef.current, sub, isPlayingRef.current);
      setBeat(0);
    },
    [buildSequence],
  );

  const toggleAccent = useCallback(() => {
    setAccent(a => {
      const next = !a;
      accentRef.current = next;
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    volRef.current = clamped;
    setVolSt(clamped);
  }, []);

  const tapTempo = useCallback(() => {
    const now  = Date.now();
    const taps = tapsRef.current;

    // Reset if more than 3 s since last tap
    if (taps.length > 0 && now - taps[taps.length - 1] > 3000) {
      tapsRef.current = [now];
      setTapping(true);
    } else {
      tapsRef.current = [...taps, now].slice(-4);
      setTapping(true);
    }

    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      setTapping(false);
      tapsRef.current = [];
    }, 3000);

    if (tapsRef.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapsRef.current.length; i++) {
        intervals.push(tapsRef.current[i] - tapsRef.current[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      setBPM(Math.round(60000 / avg));
    }
  }, [setBPM]);

  return {
    bpm, isPlaying, timeSignature, subdivision,
    accentBeat1, currentBeat, volume, isTapping,
    play, stop, setBPM, setTimeSignature, setSubdivision,
    toggleAccent, setVolume, tapTempo,
    beatsPerBar:    BEATS[timeSignature],
    subdivsPerBeat: SUBDIVS[subdivision],
  };
};
