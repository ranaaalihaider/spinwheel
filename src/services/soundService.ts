/**
 * Zero-dependency Procedural Web Audio API Sound Synthesizer.
 * Generates:
 * 1. Crisp wooden/jewelled mechanical peg ticks as wheel segments pass the pointer
 * 2. Subtle accelerating turbine hum on spin launch
 * 3. Majestic 4-voice purple-gold celebratory chord fanfare on winner announcement
 *
 * Respects user interaction requirements (AudioContext created/resumed only after user gesture)
 * and global Mute state.
 */
class ProceduralSoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastTickTimeMs: number = 0;

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private ensureContext(): AudioContext | null {
    if (this.isMuted || typeof window === 'undefined') {
      return null;
    }
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Plays a subtle launch whoosh chime when the user presses "SPIN THE WHEEL".
   */
  public playSpinStart(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.28);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.34);
    } catch {
      // Ignore audio errors on restricted devices
    }
  }

  /**
   * Plays a short, tactile mechanical peg click when a wheel slice boundary passes the pointer.
   * Rate-limited to avoid audio clipping during peak angular velocity.
   */
  public playWheelTick(velocityFactor: number = 0.5): void {
    const nowMs = performance.now();
    if (nowMs - this.lastTickTimeMs < 28) {
      return;
    }
    this.lastTickTimeMs = nowMs;

    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Higher pitch at high velocity, deeper wooden resonance as wheel slows down
      const baseFreq = 580 + Math.min(1, Math.max(0, velocityFactor)) * 380;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.035);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, now);
      filter.Q.setValueAtTime(2.5, now);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.042);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Plays an uplifting arpeggiated celebratory chord when the winner modal opens.
   */
  public playWinnerFanfare(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // C5 Major9 uplifting chord frequencies (C5, E5, G5, B5, D6, G6)
      const notes = [
        { freq: 523.25, delay: 0.0, duration: 0.55 },
        { freq: 659.25, delay: 0.08, duration: 0.55 },
        { freq: 783.99, delay: 0.16, duration: 0.65 },
        { freq: 987.77, delay: 0.24, duration: 0.85 },
        { freq: 1174.66, delay: 0.32, duration: 1.15 },
        { freq: 1567.98, delay: 0.42, duration: 1.45 },
      ];

      for (const note of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        const startTime = now + note.delay;
        osc.frequency.setValueAtTime(note.freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.11, startTime + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0008, startTime + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + note.duration + 0.05);
      }
    } catch {
      // Ignore audio errors
    }
  }
}

export const soundService = new ProceduralSoundService();
