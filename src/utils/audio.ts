/**
 * Web Audio API synthesizer and Haptic feedback engine for Ludo
 * Generates arcade-quality sounds with zero external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public hapticsEnabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Trigger Android haptic vibration safely
  public vibrate(pattern: number | number[] = 25) {
    if (!this.hapticsEnabled || typeof window === 'undefined' || !('vibrate' in navigator)) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore if device or permission prohibits vibration
    }
  }

  // 1. Tactile UI Button Click
  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);

    this.vibrate(10);
  }

  // 2. Realistic Dice Rolling Rattle
  public playDiceRoll() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Simulate multi-bounce dice rattle
    for (let i = 0; i < 7; i++) {
      const timeOffset = now + i * 0.07 + Math.random() * 0.02;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const pitch = 350 + Math.random() * 300;

      osc.type = i % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(pitch, timeOffset);
      osc.frequency.exponentialRampToValueAtTime(120, timeOffset + 0.04);

      const vol = 0.25 - i * 0.025;
      gain.gain.setValueAtTime(vol > 0 ? vol : 0.05, timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(timeOffset);
      osc.stop(timeOffset + 0.05);
    }

    this.vibrate([15, 30, 15, 30]);
  }

  // 3. Token step sound (soft wooden tap)
  public playTokenStep() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);

    this.vibrate(15);
  }

  // 4. Token exiting yard on 6 (Triumphant Pop)
  public playTokenOut() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Upward pitch sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);

    this.vibrate([30, 40, 60]);
  }

  // 5. Six Rolled Fanfare (Excitement chime)
  public playSixRolled() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.28, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.15);
    });

    this.vibrate([20, 30, 20, 50]);
  }

  // 6. Capture / Knockout Opponent (Dramatic smash + sweep)
  public playCapture() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low impact boom
    const oscBoom = ctx.createOscillator();
    const gainBoom = ctx.createGain();
    oscBoom.type = 'sawtooth';
    oscBoom.frequency.setValueAtTime(180, now);
    oscBoom.frequency.exponentialRampToValueAtTime(45, now + 0.25);

    gainBoom.gain.setValueAtTime(0.4, now);
    gainBoom.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    oscBoom.connect(gainBoom);
    gainBoom.connect(ctx.destination);

    oscBoom.start(now);
    oscBoom.stop(now + 0.26);

    // High zap accent
    const oscZap = ctx.createOscillator();
    const gainZap = ctx.createGain();
    oscZap.type = 'sine';
    oscZap.frequency.setValueAtTime(800, now);
    oscZap.frequency.exponentialRampToValueAtTime(200, now + 0.18);

    gainZap.gain.setValueAtTime(0.3, now);
    gainZap.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    oscZap.connect(gainZap);
    gainZap.connect(ctx.destination);

    oscZap.start(now);
    oscZap.stop(now + 0.19);

    this.vibrate([60, 40, 80, 40, 100]);
  }

  // 7. Landing on a Safe Star square
  public playSafeSquare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [659.25, 880, 1174.66]; // E5, A5, D6 shimmer

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.19);
    });

    this.vibrate(25);
  }

  // 8. Token reaching Home (Goal chime)
  public playTokenHome() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.32);
    });

    this.vibrate([40, 30, 40, 30, 80]);
  }

  // 9. Match Victory Melody
  public playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chords = [
      { f: 523.25, d: 0.12 }, // C
      { f: 659.25, d: 0.12 }, // E
      { f: 783.99, d: 0.12 }, // G
      { f: 1046.5, d: 0.35 }, // C (high)
      { f: 880, d: 0.15 },    // A
      { f: 1046.5, d: 0.6 },  // C final
    ];

    let currentT = now;
    chords.forEach(({ f, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, currentT);

      gain.gain.setValueAtTime(0.35, currentT);
      gain.gain.exponentialRampToValueAtTime(0.001, currentT + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(currentT);
      osc.stop(currentT + d + 0.05);

      currentT += d + 0.03;
    });

    this.vibrate([100, 50, 100, 50, 200, 100, 300]);
  }
}

export const sound = new SoundEngine();
