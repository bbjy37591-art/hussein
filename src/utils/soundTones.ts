import {
  ChallengeNotificationTone,
  getChallengeNotificationToneOption,
} from './taskLogic';

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }
  return sharedAudioContext;
}

/**
 * Plays a distinct synthesized notification tone for a specific challenge
 * so the user can distinguish between different challenge alerts without opening the app.
 */
export function playChallengeNotificationTone(
  tone: ChallengeNotificationTone = 'royal-chime'
): boolean {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const option = getChallengeNotificationToneOption(tone);
    const startTime = ctx.currentTime + 0.02;
    const noteDurationSec = option.noteDurationMs / 1000;

    option.frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = option.waveType;
      osc.frequency.setValueAtTime(freq, startTime + idx * noteDurationSec);

      const noteStart = startTime + idx * noteDurationSec;
      const noteEnd = noteStart + noteDurationSec * 0.95;

      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.22, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteEnd);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteEnd + 0.02);
    });

    return true;
  } catch {
    return false;
  }
}
