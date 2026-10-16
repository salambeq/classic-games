// Процедурный 8-битный Chiptune синтезатор на Web Audio API
class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // AudioContext инициализируется по первому пользовательскому взаимодействию
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  /**
   * Проигрывание тона определенной частоты и длительности
   */
  public playTone(
    freq: number,
    durationMs: number,
    type: OscillatorType = 'square',
    volume: number = 0.08
  ) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationMs / 1000);
    } catch (_) {}
  }

  /**
   * Щелчок / писк физической кнопки телефона
   */
  public playKeyClick() {
    this.playTone(750, 25, 'square', 0.05);
  }

  /**
   * Съедание обычного яблока в змейке
   */
  public playEat() {
    this.playTone(950, 50, 'square', 0.09);
  }

  /**
   * Появление или поедание бонусного жука в Snake II
   */
  public playBug() {
    this.playTone(1250, 40, 'square', 0.09);
    setTimeout(() => this.playTone(1500, 60, 'square', 0.09), 45);
  }

  /**
   * Звук гибели / столкновения со стеной (Game Over)
   */
  public playGameOver() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (_) {}
  }

  /**
   * Выстрел лазера в Space Impact
   */
  public playLaser() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';

      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {}
  }

  /**
   * Взрыв в Space Impact (генерация шума)
   */
  public playExplosion() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (_) {}
  }

  /**
   * Отскок шарика в Rapid Roll
   */
  public playBounce() {
    this.playTone(520, 40, 'triangle', 0.1);
  }

  /**
   * Толкание ящика в Stack Attack
   */
  public playPush() {
    this.playTone(180, 50, 'triangle', 0.12);
  }

  /**
   * Приземление ящика в Stack Attack
   */
  public playDrop() {
    this.playTone(140, 40, 'triangle', 0.1);
  }

  /**
   * Очистка ряда в Stack Attack
   */
  public playLineClear() {
    [523, 659, 783, 1046].forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 60, 'square', 0.08), idx * 60);
    });
  }

  /**
   * Культовый рингтон Nokia Tune (Франсиско Таррега - Gran Vals)
   */
  public playNokiaTune() {
    if (this.muted) return;
    // Ноты: E5, D5, F#4, G#4, C#5, B4, D4, E4, B4, A4, C#4, E4, A4
    const notes: [number, number][] = [
      [659.25, 120], // E5
      [587.33, 120], // D5
      [369.99, 240], // F#4
      [415.30, 240], // G#4
      [554.37, 120], // C#5
      [493.88, 120], // B4
      [293.66, 240], // D4
      [329.63, 240], // E4
      [493.88, 120], // B4
      [440.00, 120], // A4
      [277.18, 240], // C#4
      [329.63, 240], // E4
      [440.00, 480], // A4
    ];

    let delay = 0;
    notes.forEach(([freq, dur]) => {
      setTimeout(() => {
        this.playTone(freq, dur * 0.9, 'square', 0.08);
      }, delay);
      delay += dur;
    });
  }
}

export const retroAudio = new RetroAudioEngine();
