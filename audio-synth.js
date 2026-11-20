'use strict';

// Preserves original chiptune2 (.xm / .mod) background music from main repo + crisp Web Audio SFX
class ArcadeAudio {
  constructor() {
    this.ctx = null;
    this.musicMuted = false;
    this.sfxMuted = false;
    this.currentTrack = null;
    this.stressMode = false;
    this.currentLevel = 1;
    this.chiptunePlayer = null;
    this.tracks = {
      game_over: { file: 'sound/game_over_old_keys.mod', gain: 0.15 },
      level_1:   { file: 'sound/level_1_raina_-_smile.xm', gain: 0.25 },
      level_2:   { file: 'sound/level_2_im_a_chip_melody.xm', gain: 0.15 },
      level_3:   { file: 'sound/level_3_arcane_toaster_-_warios_game_room.xm', gain: 0.15 },
      level_4:   { file: 'sound/level_4_god_no_love_me.mod', gain: 0.15 },
      level_5:   { file: 'sound/level_5_jazzberr.mod', gain: 0.15 },
      level_6:   { file: 'sound/level_5_jazzberr.mod', gain: 0.15 },
      stress:    { file: 'sound/last_10_sec_civilian.xm', gain: 0.18 },
      you_win:   { file: 'sound/you_win_cerror_-_ode_to_maktone.mod', gain: 0.18 }
    };
  }

  unlock() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.chiptunePlayer && typeof ChiptuneJsPlayer !== 'undefined' && typeof ChiptuneJsConfig !== 'undefined') {
      try {
        this.chiptunePlayer = new ChiptuneJsPlayer(new ChiptuneJsConfig(-1));
      } catch (_) {}
    }
  }

  playTrackKey(key) {
    if (this.musicMuted) return;
    this.unlock();
    const info = this.tracks[key];
    if (!info || !this.chiptunePlayer) return;
    if (this.currentTrack === key) return;
    this.currentTrack = key;
    try {
      this.chiptunePlayer.stop();
      this.chiptunePlayer.load(info.file, (buffer) => {
        if (!this.musicMuted && this.currentTrack === key) {
          this.chiptunePlayer.play(buffer);
        }
      });
    } catch (_) {}
  }

  playTone(freq, duration, type = 'triangle', vol = 0.12, slideTo = null) {
    if (this.sfxMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  bounce(combo = 0) {
    const base = 240 + Math.min(combo, 6) * 45;
    this.playTone(base, 0.11, 'sine', 0.14, base * 1.45);
  }

  passFloor(streak = 1) {
    const freq = 420 + Math.min(streak, 8) * 75;
    this.playTone(freq, 0.12, 'triangle', 0.11, freq * 1.25);
  }

  smash() {
    this.playTone(170, 0.24, 'sawtooth', 0.18, 52);
    this.playTone(520, 0.16, 'square', 0.1, 220);
  }

  collect(good = true) {
    if (good) {
      this.playTone(660, 0.08, 'triangle', 0.12, 990);
      setTimeout(() => this.playTone(990, 0.11, 'triangle', 0.1, 1320), 65);
    } else {
      this.playTone(220, 0.22, 'sawtooth', 0.12, 110);
    }
  }

  buff() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 0.09, 'square', 0.08), i * 55);
    });
  }

  damage() {
    this.playTone(190, 0.28, 'sawtooth', 0.16, 75);
  }

  crystalCrack() {
    this.playTone(880, 0.14, 'square', 0.13, 1480);
    setTimeout(() => this.playTone(1174, 0.18, 'triangle', 0.13, 1760), 80);
  }

  win() {
    this.playTrackKey('you_win');
  }

  gameOver() {
    this.playTrackKey('game_over');
  }

  startMusic(level) {
    this.currentLevel = level;
    this.stressMode = false;
    this.playTrackKey(`level_${level}`);
  }

  setStress(active) {
    if (this.stressMode !== active) {
      this.stressMode = active;
      if (active) {
        this.playTrackKey('stress');
      } else {
        this.playTrackKey(`level_${this.currentLevel}`);
      }
    }
  }

  stopMusic() {
    this.currentTrack = null;
    if (this.chiptunePlayer) {
      try { this.chiptunePlayer.stop(); } catch (_) {}
    }
  }
}
