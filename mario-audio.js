// ============================================================
// Super Ashio Bros. - Audio Extensions
// Music themes and SFX for the platformer
// Extends the global nesAudio instance
// ============================================================

(function() {
    'use strict';

    // Add Mario SFX to the existing playSFX
    const originalPlaySFX = nesAudio.playSFX.bind(nesAudio);
    nesAudio.playSFX = function(type) {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        switch(type) {
            case 'smb_jump':
                // Rising sweep
                this.createSquare(200, 0.08, t);
                this.createSquare(300, 0.06, t + 0.02);
                this.createSquare(450, 0.06, t + 0.04);
                this.createSquare(600, 0.04, t + 0.06);
                break;
            case 'smb_stomp':
                this.createSquare(400, 0.04, t);
                this.createSquare(200, 0.06, t + 0.02);
                break;
            case 'smb_bump':
                this.createSquare(150, 0.06, t);
                this.createSquare(100, 0.04, t + 0.03);
                break;
            case 'smb_break':
                this.createNoise(0.08, t);
                this.createSquare(200, 0.04, t);
                this.createSquare(100, 0.06, t + 0.03);
                break;
            case 'smb_coin':
                this.createSquare(988, 0.05, t);
                this.createSquare(1319, 0.15, t + 0.05);
                break;
            case 'smb_powerup':
                for (let i = 0; i < 8; i++) {
                    this.createSquare(300 + i * 100, 0.06, t + i * 0.04);
                }
                break;
            case 'smb_powerup_appear':
                this.createSquare(500, 0.06, t);
                this.createSquare(600, 0.06, t + 0.04);
                this.createSquare(700, 0.06, t + 0.08);
                break;
            case 'smb_powerdown':
                for (let i = 0; i < 6; i++) {
                    this.createSquare(600 - i * 80, 0.05, t + i * 0.03);
                }
                break;
            case 'smb_fireball':
                this.createSquare(800, 0.03, t);
                this.createSquare(400, 0.04, t + 0.02);
                this.createNoise(0.03, t + 0.01);
                break;
            case 'smb_kick':
                this.createSquare(300, 0.04, t);
                this.createSquare(500, 0.04, t + 0.02);
                break;
            case 'smb_1up':
                this.createSquare(660, 0.08, t);
                this.createSquare(880, 0.08, t + 0.06);
                this.createSquare(1100, 0.12, t + 0.12);
                this.createSquare(880, 0.08, t + 0.2);
                this.createSquare(1100, 0.15, t + 0.26);
                break;
            case 'smb_pipe':
                this.createSquare(100, 0.15, t);
                this.createTriangle(80, 0.15, t);
                break;
            case 'smb_flagpole':
                for (let i = 0; i < 10; i++) {
                    this.createSquare(400 + i * 50, 0.06, t + i * 0.04);
                }
                this.createSquare(900, 0.2, t + 0.4);
                break;
            case 'smb_bowserfire':
                this.createNoise(0.15, t);
                this.createSquare(100, 0.1, t);
                this.createSquare(80, 0.1, t + 0.05);
                break;
            case 'smb_bowserfall':
                for (let i = 0; i < 8; i++) {
                    this.createSquare(400 - i * 40, 0.08, t + i * 0.05);
                }
                this.createNoise(0.2, t + 0.3);
                this.createTriangle(50, 0.3, t + 0.3);
                break;
            case 'smb_die':
                this.createSquare(800, 0.1, t);
                this.createSquare(600, 0.1, t + 0.1);
                this.createSquare(500, 0.15, t + 0.2);
                this.createSquare(400, 0.15, t + 0.35);
                this.createSquare(300, 0.2, t + 0.5);
                this.createTriangle(150, 0.3, t + 0.5);
                break;
            case 'smb_timewarning':
                for (let i = 0; i < 3; i++) {
                    this.createSquare(600, 0.06, t + i * 0.12);
                    this.createSquare(800, 0.06, t + 0.06 + i * 0.12);
                }
                break;
            case 'smb_stageclear':
                const notes = [523, 659, 784, 1047, 784, 1047, 1319, 1047, 1319, 1568];
                for (let i = 0; i < notes.length; i++) {
                    this.createSquare(notes[i], 0.08, t + i * 0.06);
                }
                this.createSquare(1568, 0.3, t + 0.6);
                break;
            case 'smb_swim':
                this.createSquare(300, 0.04, t);
                this.createSquare(400, 0.04, t + 0.02);
                break;
            default:
                originalPlaySFX(type);
                break;
        }
    };

    // Extend playMusic for mario themes
    const originalPlayMusic = nesAudio.playMusic.bind(nesAudio);
    nesAudio.playMusic = function(game, type) {
        if (game !== 'mario') {
            originalPlayMusic(game, type);
            return;
        }

        this.init();
        this.stopMusic();
        this.currentMusic = { game, type };
        this.musicPlaying = true;

        if (type === 'OFF') return;

        switch(type) {
            case 'A': this.playMarioOverworld(); break;
            case 'B': this.playMarioUnderground(); break;
            case 'C': this.playMarioCastle(); break;
            case 'STAR': this.playMarioStar(); break;
            case 'UNDERWATER': this.playMarioUnderwater(); break;
            default: this.playMarioOverworld(); break;
        }
    };

    // Mario Overworld Theme
    nesAudio.playMarioOverworld = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 200;
        const beat = 60 / bpm;
        const e = beat / 2;
        const q = beat;
        const h = beat * 2;
        const s = beat / 4;

        const melody = [
            ['E', 5, e], ['E', 5, e], ['REST', 0, e], ['E', 5, e],
            ['REST', 0, e], ['C', 5, e], ['E', 5, q],
            ['G', 5, q], ['REST', 0, q],
            ['G', 4, q], ['REST', 0, q],

            ['C', 5, q+e], ['G', 4, e], ['REST', 0, q],
            ['E', 4, q+e], ['A', 4, q], ['B', 4, q],
            ['Bb', 4, e], ['A', 4, q],
            ['G', 4, e+e], ['E', 5, e+e], ['G', 5, q],
            ['A', 5, q], ['F', 5, e], ['G', 5, e],
            ['REST', 0, e], ['E', 5, q], ['C', 5, e],
            ['D', 5, e], ['B', 4, q+e],

            ['C', 5, q+e], ['G', 4, e], ['REST', 0, q],
            ['E', 4, q+e], ['A', 4, q], ['B', 4, q],
            ['Bb', 4, e], ['A', 4, q],
            ['G', 4, e+e], ['E', 5, e+e], ['G', 5, q],
            ['A', 5, q], ['F', 5, e], ['G', 5, e],
            ['REST', 0, e], ['E', 5, q], ['C', 5, e],
            ['D', 5, e], ['B', 4, q+e],
        ];

        const bass = [
            ['D', 3, e], ['D', 3, e], ['REST', 0, e], ['D', 3, e],
            ['REST', 0, e], ['D', 3, e], ['D', 3, q],
            ['G', 3, q], ['REST', 0, q],
            ['G', 2, q], ['REST', 0, q],

            ['G', 3, q], ['E', 3, q], ['C', 3, q],
            ['C', 3, q], ['F', 3, q], ['F', 3, q],
            ['F', 3, q], ['F', 3, q],
            ['C', 3, q], ['C', 3, q], ['C', 3, q],
            ['C', 3, q], ['C', 3, q], ['C', 3, q],
            ['G', 2, q], ['G', 2, q], ['G', 2, q],
            ['G', 2, q], ['G', 2, q],

            ['G', 3, q], ['E', 3, q], ['C', 3, q],
            ['C', 3, q], ['F', 3, q], ['F', 3, q],
            ['F', 3, q], ['F', 3, q],
            ['C', 3, q], ['C', 3, q], ['C', 3, q],
            ['C', 3, q], ['C', 3, q], ['C', 3, q],
            ['G', 2, q], ['G', 2, q], ['G', 2, q],
            ['G', 2, q], ['G', 2, q],
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
            if (note !== 'REST' && bpos < pos) {
                this.musicNodes.push(this.createTriangle(this.noteFreq(note, oct), dur * 0.75, t + bpos));
            }
            bpos += dur;
        });

        // Percussion
        for (let i = 0; i < Math.floor(pos / e); i++) {
            if (i % 4 === 0) this.musicNodes.push(this.createNoise(0.03, t + i * e));
        }

        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playMarioOverworld();
        }, pos * 1000 - 50);
    };

    // Mario Underground Theme
    nesAudio.playMarioUnderground = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 130;
        const beat = 60 / bpm;
        const e = beat / 2;
        const q = beat;
        const h = beat * 2;

        const melody = [
            ['C', 4, e], ['C', 5, e], ['A', 3, e], ['A', 4, e],
            ['Bb', 3, e], ['Bb', 4, e], ['REST', 0, q],
            ['C', 4, e], ['C', 5, e], ['A', 3, e], ['A', 4, e],
            ['Bb', 3, e], ['Bb', 4, e], ['REST', 0, q],

            ['F', 3, e], ['F', 4, e], ['D', 3, e], ['D', 4, e],
            ['Eb', 3, e], ['Eb', 4, e], ['REST', 0, q],
            ['F', 3, e], ['F', 4, e], ['D', 3, e], ['D', 4, e],
            ['Eb', 3, e], ['Eb', 4, e], ['REST', 0, q],
        ];

        const bass = [
            ['C', 2, q], ['C', 2, q], ['A', 1, q], ['Bb', 1, q],
            ['C', 2, q], ['C', 2, q], ['A', 1, q], ['Bb', 1, q],
            ['F', 2, q], ['F', 2, q], ['D', 2, q], ['Eb', 2, q],
            ['F', 2, q], ['F', 2, q], ['D', 2, q], ['Eb', 2, q],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.8, t + pos));
            }
            pos += dur;
        });

        let bpos = 0;
        bass.forEach(([note, oct, dur]) => {
            if (bpos < pos) {
                this.musicNodes.push(this.createTriangle(this.noteFreq(note, oct), dur * 0.7, t + bpos));
            }
            bpos += dur;
        });

        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playMarioUnderground();
        }, pos * 1000 - 50);
    };

    // Mario Castle Theme
    nesAudio.playMarioCastle = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 110;
        const beat = 60 / bpm;
        const e = beat / 2;
        const q = beat;

        const melody = [
            ['A', 4, e], ['A', 4, e], ['A', 4, q],
            ['G#', 4, e], ['A', 4, e], ['REST', 0, e], ['B', 4, e],
            ['REST', 0, e], ['A', 4, e], ['G#', 4, e], ['A', 4, e],
            ['REST', 0, q], ['E', 4, q],

            ['A', 4, e], ['A', 4, e], ['A', 4, q],
            ['G#', 4, e], ['A', 4, e], ['REST', 0, e], ['B', 4, e],
            ['REST', 0, q], ['REST', 0, q],
            ['REST', 0, q], ['E', 4, q],
        ];

        const bass = [
            ['A', 2, q], ['A', 2, q], ['A', 2, q], ['A', 2, q],
            ['A', 2, q], ['A', 2, q], ['A', 2, q], ['A', 2, q],
            ['A', 2, q], ['A', 2, q], ['A', 2, q], ['A', 2, q],
            ['E', 2, q], ['E', 2, q], ['E', 2, q], ['E', 2, q],
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
                this.musicNodes.push(this.createTriangle(this.noteFreq(note, oct), dur * 0.7, t + bpos));
            }
            bpos += dur;
        });

        for (let i = 0; i < Math.floor(pos / e); i++) {
            if (i % 2 === 0) this.musicNodes.push(this.createNoise(0.02, t + i * e));
        }

        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playMarioCastle();
        }, pos * 1000 - 50);
    };

    // Mario Star (Invincible) Theme
    nesAudio.playMarioStar = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 220;
        const beat = 60 / bpm;
        const e = beat / 2;
        const q = beat;

        const melody = [
            ['C', 6, e], ['C', 6, e], ['C', 6, e], ['REST', 0, e],
            ['C', 6, e], ['REST', 0, e], ['C', 6, e], ['E', 6, e],
            ['C', 6, e], ['REST', 0, e], ['G', 5, e], ['REST', 0, q+e],
            ['G', 5, q], ['REST', 0, q],

            ['C', 6, e], ['F#', 5, e], ['F#', 5, e], ['F#', 5, e],
            ['G', 5, e], ['REST', 0, e], ['E', 6, e], ['REST', 0, e],
            ['E', 6, e], ['C', 6, e], ['A', 5, e], ['G', 5, e],
            ['G', 5, q], ['REST', 0, q],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.8, t + pos));
            }
            pos += dur;
        });

        for (let i = 0; i < Math.floor(pos / e); i++) {
            if (i % 2 === 0) this.musicNodes.push(this.createNoise(0.02, t + i * e));
            this.musicNodes.push(this.createTriangle(220, e * 0.5, t + i * e));
        }

        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playMarioStar();
        }, pos * 1000 - 50);
    };

    // Mario Underwater Theme
    nesAudio.playMarioUnderwater = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 120;
        const beat = 60 / bpm;
        const e = beat / 2;
        const q = beat;
        const h = beat * 2;

        const melody = [
            ['C', 5, q], ['E', 5, q], ['G', 5, q], ['E', 5, q],
            ['F', 5, q], ['A', 5, h],
            ['G', 5, q], ['E', 5, q], ['C', 5, q], ['D', 5, q],
            ['E', 5, q], ['C', 5, h+q],

            ['A', 5, q], ['G', 5, q], ['F', 5, q], ['E', 5, q],
            ['D', 5, q], ['C', 5, h],
            ['B', 4, q], ['C', 5, q], ['D', 5, q], ['E', 5, q],
            ['C', 5, h+q], ['REST', 0, q],
        ];

        const bass = [
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['F', 3, q], ['C', 4, h],
            ['G', 3, q], ['E', 3, q], ['C', 3, q], ['G', 3, q],
            ['C', 3, q], ['G', 2, h+q],

            ['F', 3, q], ['E', 3, q], ['D', 3, q], ['C', 3, q],
            ['G', 2, q], ['C', 3, h],
            ['G', 2, q], ['C', 3, q], ['G', 2, q], ['C', 3, q],
            ['C', 3, h+q], ['REST', 0, q],
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

        this.musicTimeout = setTimeout(() => {
            if (this.musicPlaying) this.playMarioUnderwater();
        }, pos * 1000 - 50);
    };

})();
