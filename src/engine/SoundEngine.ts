/**
 * SoundEngine.ts
 * 
 * Generates game sounds using Web Audio API
 * No external audio files needed - all sounds are synthesized
 */

type SoundType = 'pour' | 'select' | 'drop' | 'win' | 'error' | 'frozen';

class SoundEngine {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  /**
   * Initialize audio context (must be called after user interaction)
   */
  init(): void {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Play a sound effect
   */
  play(type: SoundType): void {
    if (!this.enabled || !this.audioContext) {
      // Try to initialize on first play
      if (!this.initialized) {
        this.init();
      }
      if (!this.audioContext) return;
    }

    // Resume audio context if suspended (required by browsers)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (type) {
      case 'select':
        this.playSelect();
        break;
      case 'pour':
        this.playPour();
        break;
      case 'drop':
        this.playDrop();
        break;
      case 'win':
        this.playWin();
        break;
      case 'error':
        this.playError();
        break;
      case 'frozen':
        this.playFrozen();
        break;
    }
  }

  /**
   * Bottle select sound - short click/pop
   */
  private playSelect(): void {
    const ctx = this.audioContext!;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }

  /**
   * Pour sound - liquid pouring effect
   */
  private playPour(): void {
    const ctx = this.audioContext!;
    const duration = 0.3;

    // Create noise for liquid sound
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate filtered noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    // Bandpass filter for liquid-like sound
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1000, ctx.currentTime);
    bandpass.frequency.linearRampToValueAtTime(600, ctx.currentTime + duration);
    bandpass.Q.setValueAtTime(2, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + duration);

    noiseSource.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseSource.start(ctx.currentTime);
    noiseSource.stop(ctx.currentTime + duration);

    // Add a subtle bubble/plop
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.frequency.setValueAtTime(400, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.25);
    osc.type = 'sine';

    oscGain.gain.setValueAtTime(0, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.15);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.start(ctx.currentTime + 0.15);
    osc.stop(ctx.currentTime + 0.3);
  }

  /**
   * Drop sound - when liquid lands
   */
  private playDrop(): void {
    const ctx = this.audioContext!;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }

  /**
   * Win sound - celebratory melody
   */
  private playWin(): void {
    const ctx = this.audioContext!;
    
    // Play a happy ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const noteDuration = 0.15;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * noteDuration);
      osc.type = 'sine';

      const startTime = ctx.currentTime + i * noteDuration;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.setValueAtTime(0.2, startTime + noteDuration - 0.05);
      gain.gain.linearRampToValueAtTime(0.01, startTime + noteDuration + 0.1);

      osc.start(startTime);
      osc.stop(startTime + noteDuration + 0.1);
    });

    // Add a final sparkle
    setTimeout(() => {
      if (!this.audioContext) return;
      const sparkle = this.audioContext.createOscillator();
      const sparkleGain = this.audioContext.createGain();

      sparkle.connect(sparkleGain);
      sparkleGain.connect(this.audioContext.destination);

      sparkle.frequency.setValueAtTime(2000, this.audioContext.currentTime);
      sparkle.frequency.exponentialRampToValueAtTime(3000, this.audioContext.currentTime + 0.2);
      sparkle.type = 'sine';

      sparkleGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      sparkle.start(this.audioContext.currentTime);
      sparkle.stop(this.audioContext.currentTime + 0.3);
    }, notes.length * noteDuration * 1000);
  }

  /**
   * Error sound - invalid move
   */
  private playError(): void {
    const ctx = this.audioContext!;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  }

  /**
   * Frozen sound - icy rejection sound when trying to use frozen bottle
   */
  private playFrozen(): void {
    const ctx = this.audioContext!;
    
    // High pitched crystalline sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Ice-like high frequency with slight detuning
    osc1.frequency.setValueAtTime(1800, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    osc1.type = 'sine';

    osc2.frequency.setValueAtTime(1850, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1250, ctx.currentTime + 0.15);
    osc2.type = 'sine';

    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.2);
  }
}

// Export singleton instance
export const soundEngine = new SoundEngine();
