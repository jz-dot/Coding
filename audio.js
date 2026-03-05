// ============================================================
// NES Audio Engine - Authentic chiptune music & SFX
// Uses Web Audio API to synthesize NES-style square/triangle waves
// ============================================================

class NESAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicPlaying = false;
        this.currentMusic = null;
        this.musicNodes = [];
        this.musicTimeout = null;
        this.volume = 0.15;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        }
        return this.muted;
    }

    // Create a square wave oscillator (NES pulse channel)
    createSquare(freq, duration, startTime, dutyCycle = 0.5) {
        if (!this.ctx) return null;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
        return osc;
    }

    // Create triangle wave (NES triangle channel - bass)
    createTriangle(freq, duration, startTime) {
        if (!this.ctx) return null;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
        return osc;
    }

    // NES noise channel for percussion
    createNoise(duration, startTime) {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start(startTime);
        noise.stop(startTime + duration);
        return noise;
    }

    // NES note frequencies (A4 = 440Hz based)
    noteFreq(note, octave) {
        const notes = { 'C': -9, 'C#': -8, 'Db': -8, 'D': -7, 'D#': -6, 'Eb': -6,
                        'E': -5, 'F': -4, 'F#': -3, 'Gb': -3, 'G': -2, 'G#': -1,
                        'Ab': -1, 'A': 0, 'A#': 1, 'Bb': 1, 'B': 2 };
        const semitone = notes[note] + (octave - 4) * 12;
        return 440 * Math.pow(2, semitone / 12);
    }

    // ---- SOUND EFFECTS ----

    playSFX(type) {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        switch(type) {
            case 'move':
                this.createSquare(200, 0.05, t);
                break;
            case 'rotate':
                this.createSquare(400, 0.05, t);
                this.createSquare(500, 0.05, t + 0.03);
                break;
            case 'drop':
                this.createSquare(150, 0.08, t);
                this.createNoise(0.05, t);
                break;
            case 'lock':
                this.createSquare(300, 0.06, t);
                this.createNoise(0.04, t);
                break;
            case 'lineclear':
                this.createSquare(523, 0.1, t);
                this.createSquare(659, 0.1, t + 0.08);
                this.createSquare(784, 0.1, t + 0.16);
                this.createSquare(1047, 0.15, t + 0.24);
                break;
            case 'tetris':
                // 4-line clear fanfare
                this.createSquare(523, 0.08, t);
                this.createSquare(659, 0.08, t + 0.06);
                this.createSquare(784, 0.08, t + 0.12);
                this.createSquare(1047, 0.12, t + 0.18);
                this.createSquare(784, 0.08, t + 0.28);
                this.createSquare(1047, 0.2, t + 0.34);
                break;
            case 'levelup':
                for (let i = 0; i < 6; i++) {
                    this.createSquare(400 + i * 100, 0.06, t + i * 0.05);
                }
                break;
            case 'gameover':
                this.createSquare(400, 0.2, t);
                this.createSquare(350, 0.2, t + 0.2);
                this.createSquare(300, 0.2, t + 0.4);
                this.createSquare(250, 0.4, t + 0.6);
                this.createTriangle(100, 0.5, t + 0.6);
                break;
            case 'virus_clear':
                this.createSquare(660, 0.08, t);
                this.createSquare(880, 0.08, t + 0.06);
                this.createSquare(1100, 0.12, t + 0.12);
                break;
            case 'stage_clear':
                for (let i = 0; i < 8; i++) {
                    this.createSquare(523 + i * 80, 0.1, t + i * 0.08);
                }
                this.createSquare(1047, 0.4, t + 0.64);
                break;
            case 'pill_land':
                this.createSquare(250, 0.04, t);
                break;
        }
    }

    // ---- MUSIC ----

    stopMusic() {
        this.musicPlaying = false;
        if (this.musicTimeout) {
            clearTimeout(this.musicTimeout);
            this.musicTimeout = null;
        }
        this.musicNodes.forEach(n => { try { n.stop(); } catch(e){} });
        this.musicNodes = [];
    }

    playMusic(game, type) {
        this.init();
        this.stopMusic();
        this.currentMusic = { game, type };
        this.musicPlaying = true;

        if (type === 'OFF') return;

        if (game === 'tetris') {
            if (type === 'A') this.playTetrisMusicA();
            else if (type === 'B') this.playTetrisMusicB();
            else if (type === 'C') this.playTetrisMusicC();
        } else {
            if (type === 'A') this.playDrMarioFever();
            else if (type === 'B') this.playDrMarioChill();
            else if (type === 'C') this.playDrMarioFever(); // C reuses A with variation
        }
    }

    // Tetris Music A - Korobeiniki (authentic NES arrangement)
    playTetrisMusicA() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 150;
        const beat = 60 / bpm;
        const q = beat;       // quarter
        const e = beat / 2;   // eighth
        const h = beat * 2;   // half

        // Melody - Korobeiniki
        const melody = [
            ['E', 5, q], ['B', 4, e], ['C', 5, e], ['D', 5, q], ['C', 5, e], ['B', 4, e],
            ['A', 4, q], ['A', 4, e], ['C', 5, e], ['E', 5, q], ['D', 5, e], ['C', 5, e],
            ['B', 4, q+e], ['C', 5, e], ['D', 5, q], ['E', 5, q],
            ['C', 5, q], ['A', 4, q], ['A', 4, h],

            ['D', 5, q+e], ['F', 5, e], ['A', 5, q], ['G', 5, e], ['F', 5, e],
            ['E', 5, q+e], ['C', 5, e], ['E', 5, q], ['D', 5, e], ['C', 5, e],
            ['B', 4, q], ['B', 4, e], ['C', 5, e], ['D', 5, q], ['E', 5, q],
            ['C', 5, q], ['A', 4, q], ['A', 4, h],

            // Second part
            ['E', 4, h], ['C', 4, h],
            ['D', 4, h], ['B', 3, h],
            ['C', 4, h], ['A', 3, h],
            ['B', 3, h+q], ['REST', 0, q],

            ['E', 4, h], ['C', 4, h],
            ['D', 4, h], ['B', 3, h],
            ['C', 4, q], ['E', 4, q], ['A', 4, h],
            ['G#', 4, h+q], ['REST', 0, q],
        ];

        // Bass line
        const bass = [
            ['E', 2, q], ['E', 3, q], ['E', 2, q], ['E', 3, q],
            ['A', 2, q], ['A', 3, q], ['A', 2, q], ['A', 3, q],
            ['G#', 2, q], ['G#', 3, q], ['E', 2, q], ['E', 3, q],
            ['A', 2, q], ['A', 3, q], ['A', 2, q], ['A', 3, q],

            ['D', 2, q], ['D', 3, q], ['D', 2, q], ['D', 3, q],
            ['C', 2, q], ['C', 3, q], ['C', 2, q], ['C', 3, q],
            ['B', 1, q], ['B', 2, q], ['B', 1, q], ['B', 2, q],
            ['A', 2, q], ['A', 3, q], ['A', 2, q], ['A', 3, q],

            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['G#', 2, q], ['E', 3, q], ['G#', 2, q], ['E', 3, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['G#', 2, q], ['E', 3, q], ['G#', 2, q], ['E', 3, q],

            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['G#', 2, q], ['E', 3, q], ['G#', 2, q], ['E', 3, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['G#', 2, q], ['E', 3, q], ['G#', 2, q], ['E', 3, q],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.9, t + pos));
            }
            pos += dur;
        });

        let bpos = 0;
        bass.forEach(([note, oct, dur]) => {
            if (note !== 'REST' && bpos < pos) {
                this.musicNodes.push(this.createTriangle(this.noteFreq(note, oct), dur * 0.8, t + bpos));
            }
            bpos += dur;
        });

        // Add some percussion
        for (let i = 0; i < pos / q; i++) {
            if (i % 2 === 0) {
                this.musicNodes.push(this.createNoise(0.05, t + i * q));
            }
        }

        const loopLen = pos * 1000;
        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playTetrisMusicA();
        }, loopLen - 50);
    }

    // Tetris Music B - Arranged version of the NES B-type music
    playTetrisMusicB() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 120;
        const beat = 60 / bpm;
        const q = beat;
        const e = beat / 2;
        const h = beat * 2;

        const melody = [
            ['D', 5, q], ['F', 5, e], ['D', 5, e], ['C', 5, e], ['D', 5, e], ['E', 5, q],
            ['C', 5, q], ['A', 4, q], ['A', 4, h],
            ['F', 5, q], ['A', 5, e], ['F', 5, e], ['E', 5, e], ['F', 5, e], ['G', 5, q],
            ['E', 5, q], ['C', 5, q], ['C', 5, h],

            ['D', 5, q], ['F', 5, e], ['D', 5, e], ['C', 5, q], ['A', 4, q],
            ['D', 5, q], ['C', 5, e], ['B', 4, e], ['A', 4, q], ['G', 4, q],
            ['A', 4, q], ['B', 4, q], ['C', 5, q], ['D', 5, q],
            ['E', 5, h+q], ['REST', 0, q],
        ];

        const bass = [
            ['D', 3, q], ['A', 3, q], ['D', 3, q], ['A', 3, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['F', 3, q], ['C', 4, q], ['F', 3, q], ['C', 4, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['D', 3, q], ['A', 3, q], ['A', 2, q], ['E', 3, q],
            ['D', 3, q], ['A', 3, q], ['A', 2, q], ['E', 3, q],
            ['F', 3, q], ['C', 4, q], ['G', 3, q], ['D', 4, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.9, t + pos));
            }
            pos += dur;
        });

        let bpos = 0;
        bass.forEach(([note, oct, dur]) => {
            if (bpos < pos) {
                this.musicNodes.push(this.createTriangle(this.noteFreq(note, oct), dur * 0.8, t + bpos));
            }
            bpos += dur;
        });

        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playTetrisMusicB();
        }, pos * 1000 - 50);
    }

    // Tetris Music C - Arrangement inspired by NES Tetris C-type
    playTetrisMusicC() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 108;
        const beat = 60 / bpm;
        const q = beat;
        const e = beat / 2;
        const h = beat * 2;
        const w = beat * 4;

        const melody = [
            ['C', 5, h], ['E', 5, h], ['G', 5, h], ['E', 5, h],
            ['F', 5, h], ['A', 5, h], ['G', 5, w],
            ['E', 5, h], ['C', 5, h], ['D', 5, h], ['B', 4, h],
            ['C', 5, w], ['REST', 0, w],
        ];

        const bass = [
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['F', 3, q], ['C', 4, q], ['F', 3, q], ['C', 4, q],
            ['G', 3, q], ['D', 4, q], ['G', 3, q], ['D', 4, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['G', 2, q], ['D', 3, q], ['G', 2, q], ['D', 3, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.9, t + pos));
            }
            pos += dur;
        });

        let bpos = 0;
        bass.forEach(([note, oct, dur]) => {
            if (bpos < pos) {
                this.musicNodes.push(this.createTriangle(this.noteFreq(note, oct), dur * 0.8, t + bpos));
            }
            bpos += dur;
        });

        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playTetrisMusicC();
        }, pos * 1000 - 50);
    }

    // Dr. Mario - Fever theme
    playDrMarioFever() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 160;
        const beat = 60 / bpm;
        const q = beat;
        const e = beat / 2;
        const h = beat * 2;
        const s = beat / 4;

        const melody = [
            ['A', 5, e], ['G#', 5, e], ['A', 5, e], ['REST', 0, e],
            ['A', 5, e], ['G#', 5, e], ['A', 5, e], ['E', 5, e],
            ['F', 5, e], ['E', 5, e], ['D', 5, e], ['E', 5, e],
            ['A', 4, q], ['REST', 0, q],

            ['A', 5, e], ['G#', 5, e], ['A', 5, e], ['REST', 0, e],
            ['A', 5, e], ['G#', 5, e], ['A', 5, q],
            ['C', 6, e], ['B', 5, e], ['A', 5, e], ['G', 5, e],
            ['A', 5, q], ['REST', 0, q],

            ['E', 5, e], ['D', 5, e], ['C', 5, e], ['D', 5, e],
            ['E', 5, q], ['G', 5, q],
            ['F', 5, e], ['E', 5, e], ['D', 5, e], ['C', 5, e],
            ['D', 5, q], ['REST', 0, q],

            ['C', 5, e], ['B', 4, e], ['A', 4, e], ['B', 4, e],
            ['C', 5, q], ['E', 5, q],
            ['D', 5, e], ['C', 5, e], ['B', 4, e], ['A', 4, e],
            ['A', 4, q], ['REST', 0, q],
        ];

        const bass = [
            ['A', 3, q], ['E', 3, q], ['A', 3, q], ['E', 3, q],
            ['D', 3, q], ['A', 3, q], ['D', 3, q], ['A', 3, q],
            ['A', 3, q], ['E', 3, q], ['A', 3, q], ['E', 3, q],
            ['A', 3, q], ['E', 3, q], ['A', 3, q], ['E', 3, q],

            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['D', 3, q], ['A', 3, q], ['D', 3, q], ['A', 3, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.85, t + pos));
            }
            pos += dur;
        });

        let bpos = 0;
        bass.forEach(([note, oct, dur]) => {
            if (bpos < pos) {
                this.musicNodes.push(this.createTriangle(this.noteFreq(note, oct), dur * 0.75, t + bpos));
            }
            bpos += dur;
        });

        for (let i = 0; i < pos / e; i++) {
            if (i % 4 === 0 || i % 4 === 2) {
                this.musicNodes.push(this.createNoise(0.03, t + i * e));
            }
        }

        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playDrMarioFever();
        }, pos * 1000 - 50);
    }

    // Dr. Mario - Chill theme
    playDrMarioChill() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 110;
        const beat = 60 / bpm;
        const q = beat;
        const e = beat / 2;
        const h = beat * 2;
        const w = beat * 4;

        const melody = [
            ['C', 5, q], ['E', 5, e], ['G', 5, e], ['A', 5, h],
            ['G', 5, q], ['E', 5, q], ['C', 5, h],
            ['D', 5, q], ['F', 5, e], ['A', 5, e], ['G', 5, h],
            ['F', 5, q], ['D', 5, q], ['C', 5, h],

            ['E', 5, q], ['G', 5, q], ['B', 5, q], ['A', 5, q],
            ['G', 5, q], ['F', 5, q], ['E', 5, h],
            ['D', 5, q], ['E', 5, q], ['F', 5, q], ['G', 5, q],
            ['A', 5, h], ['G', 5, h],

            ['C', 5, q], ['D', 5, q], ['E', 5, h],
            ['F', 5, q], ['E', 5, q], ['D', 5, h],
            ['C', 5, q], ['B', 4, q], ['A', 4, q], ['B', 4, q],
            ['C', 5, w],
        ];

        const bass = [
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['D', 3, q], ['A', 3, q], ['D', 3, q], ['A', 3, q],
            ['F', 3, q], ['C', 4, q], ['F', 3, q], ['C', 4, q],

            ['E', 3, q], ['B', 3, q], ['E', 3, q], ['B', 3, q],
            ['G', 3, q], ['D', 4, q], ['G', 3, q], ['D', 4, q],
            ['D', 3, q], ['A', 3, q], ['G', 3, q], ['D', 4, q],
            ['F', 3, q], ['C', 4, q], ['G', 3, q], ['D', 4, q],

            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['D', 3, q], ['A', 3, q], ['D', 3, q], ['A', 3, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.9, t + pos));
            }
            pos += dur;
        });

        let bpos = 0;
        bass.forEach(([note, oct, dur]) => {
            if (bpos < pos) {
                this.musicNodes.push(this.createTriangle(this.noteFreq(note, oct), dur * 0.8, t + bpos));
            }
            bpos += dur;
        });

        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playDrMarioChill();
        }, pos * 1000 - 50);
    }
}

// Global audio instance
const nesAudio = new NESAudio();
