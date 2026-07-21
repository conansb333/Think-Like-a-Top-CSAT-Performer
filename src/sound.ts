/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (this.isMuted) return;
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.ctx) {
      this.ctx.suspend().catch(() => {});
    } else if (!this.isMuted && this.ctx) {
      this.ctx.resume().catch(() => {});
    }
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  public playTick() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  public playCorrect() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.2);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    } catch {}
  }

  public playIncorrect() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.35);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.start();
      osc.stop(now + 0.35);
    } catch {}
  }

  public playUnlock() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Sparkling wind chime
      for (let i = 0; i < 8; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000 + i * 200, now + i * 0.04);
        gain.gain.setValueAtTime(0.0, now + i * 0.04);
        gain.gain.linearRampToValueAtTime(0.04, now + i * 0.04 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.15);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.2);
      }
    } catch {}
  }

  public playCoins() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 5; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now + i * 0.07); // B5
        osc.frequency.setValueAtTime(1318.51, now + i * 0.07 + 0.03); // E6
        
        gain.gain.setValueAtTime(0.0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.05, now + i * 0.07 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.1);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.12);
      }
    } catch {}
  }

  public playSteal() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.15);
      osc.frequency.linearRampToValueAtTime(400, now + 0.3);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.start();
      osc.stop(now + 0.3);
    } catch {}
  }

  public playShield() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // A6
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.4); // E6

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.start();
      osc.stop(now + 0.4);
    } catch {}
  }

  public playDetractor() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Deep ominous alert hum
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(90, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(93, now); // detuned for beating

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch {}
  }

  public playGameOver() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const chords = [
        [261.63, 329.63, 392.00], // C4 major
        [349.23, 440.00, 523.25], // F4 major
        [392.00, 493.88, 587.33], // G4 major
        [523.25, 659.25, 783.99, 1046.50] // C5 major scale high
      ];

      chords.forEach((chord, chordIdx) => {
        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + chordIdx * 0.18);
          gain.gain.setValueAtTime(0.0, now + chordIdx * 0.18);
          gain.gain.linearRampToValueAtTime(0.05, now + chordIdx * 0.18 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + chordIdx * 0.18 + 0.35);

          osc.start(now + chordIdx * 0.18);
          osc.stop(now + chordIdx * 0.18 + 0.4);
        });
      });
    } catch {}
  }
}

export const sounds = new SoundSystem();
