// ============================================================
// Super Ashio Bros. 3 - Audio
// Extends nesAudio with SMB3-specific SFX and music
// ============================================================

(function() {
    if (typeof nesAudio === 'undefined') return;
    const origPlaySFX = nesAudio.playSFX.bind(nesAudio);

    nesAudio.playSFX = function(type) {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        switch(type) {
            case 'smb3_jump':
                this.createSquare(300, 0.06, t);
                this.createSquare(450, 0.06, t + 0.04);
                break;
            case 'smb3_stomp':
                this.createSquare(200, 0.05, t);
                this.createNoise(0.04, t);
                break;
            case 'smb3_tail':
                this.createSquare(600, 0.04, t);
                this.createSquare(400, 0.04, t + 0.03);
                this.createNoise(0.03, t + 0.02);
                break;
            case 'smb3_fly':
                this.createSquare(800, 0.03, t);
                this.createSquare(1000, 0.03, t + 0.02);
                break;
            case 'smb3_pswitch':
                for (let i = 0; i < 8; i++) {
                    this.createSquare(300 + i * 100, 0.06, t + i * 0.04);
                }
                break;
            case 'smb3_whistle':
                for (let i = 0; i < 12; i++) {
                    this.createSquare(800 + (i % 3) * 200, 0.08, t + i * 0.06);
                }
                break;
            case 'smb3_hammer':
                this.createSquare(250, 0.06, t);
                this.createNoise(0.05, t);
                break;
            case 'smb3_fireball':
                this.createSquare(400, 0.05, t);
                this.createSquare(300, 0.04, t + 0.03);
                break;
            case 'smb3_powerup':
                for (let i = 0; i < 6; i++) {
                    this.createSquare(400 + i * 80, 0.08, t + i * 0.05);
                }
                break;
            case 'smb3_pipe':
                this.createSquare(300, 0.1, t);
                this.createTriangle(150, 0.1, t);
                break;
            case 'smb3_coin':
                this.createSquare(988, 0.04, t);
                this.createSquare(1319, 0.08, t + 0.04);
                break;
            case 'smb3_1up':
                for (let i = 0; i < 5; i++) {
                    this.createSquare(500 + i * 120, 0.06, t + i * 0.04);
                }
                break;
            case 'smb3_boom':
                this.createNoise(0.2, t);
                this.createSquare(100, 0.2, t);
                break;
            case 'smb3_slide':
                this.createNoise(0.06, t);
                this.createSquare(200, 0.04, t);
                break;
            case 'smb3_mapMove':
                this.createSquare(500, 0.03, t);
                break;
            case 'smb3_stageclear':
                const n = [523, 587, 659, 784, 880, 988, 1047];
                for (let i = 0; i < n.length; i++) {
                    this.createSquare(n[i], 0.1, t + i * 0.08);
                }
                this.createSquare(1047, 0.4, t + 0.56);
                break;
            case 'smb3_card':
                this.createSquare(800, 0.06, t);
                this.createSquare(1000, 0.08, t + 0.04);
                break;
            default:
                origPlaySFX(type);
                return;
        }
    };

    nesAudio.playSMB3Overworld = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 170;
        const beat = 60 / bpm;
        const q = beat, e = beat / 2, h = beat * 2;

        const melody = [
            ['C', 5, e], ['E', 5, e], ['G', 5, q], ['G', 5, e], ['A', 5, e],
            ['G', 5, e], ['F', 5, e], ['E', 5, q], ['C', 5, e], ['E', 5, e],
            ['D', 5, q], ['D', 5, e], ['E', 5, e], ['F', 5, q], ['E', 5, e], ['D', 5, e],
            ['C', 5, h],

            ['C', 5, e], ['E', 5, e], ['G', 5, q], ['G', 5, e], ['A', 5, e],
            ['B', 5, q], ['A', 5, e], ['G', 5, e],
            ['F', 5, e], ['A', 5, e], ['G', 5, q], ['F', 5, e], ['E', 5, e],
            ['C', 5, h],

            ['A', 4, q], ['B', 4, q], ['C', 5, q], ['D', 5, q],
            ['E', 5, q], ['C', 5, q], ['A', 4, h],
            ['D', 5, q], ['E', 5, q], ['F', 5, q], ['G', 5, q],
            ['A', 5, h], ['REST', 0, h],
        ];

        const bass = [
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['G', 2, q], ['D', 3, q], ['F', 3, q], ['D', 3, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['G', 2, q], ['D', 3, q], ['G', 2, q], ['D', 3, q],
            ['F', 2, q], ['C', 3, q], ['G', 2, q], ['D', 3, q],
            ['C', 3, q], ['G', 3, q], ['C', 3, q], ['G', 3, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['D', 3, q], ['A', 3, q], ['G', 2, q], ['D', 3, q],
            ['F', 2, q], ['C', 3, q], ['F', 2, q], ['C', 3, q],
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
            if (i % 4 === 0 || i % 4 === 2) this.musicNodes.push(this.createNoise(0.02, t + i * e));
        }
        this.musicTimeout = setTimeout(() => { if (this.musicPlaying) this.playSMB3Overworld(); }, pos * 1000 - 50);
    };

    nesAudio.playSMB3Athletic = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 190;
        const beat = 60 / bpm;
        const q = beat, e = beat / 2, h = beat * 2;

        const melody = [
            ['G', 5, e], ['A', 5, e], ['B', 5, q], ['A', 5, e], ['G', 5, e],
            ['E', 5, q], ['C', 5, q], ['D', 5, h],
            ['E', 5, e], ['F#', 5, e], ['G', 5, q], ['F#', 5, e], ['E', 5, e],
            ['D', 5, q], ['B', 4, q], ['C', 5, h],
            ['G', 5, e], ['A', 5, e], ['B', 5, q], ['C', 6, e], ['B', 5, e],
            ['A', 5, q], ['G', 5, q], ['F#', 5, h],
            ['G', 5, q], ['D', 5, q], ['E', 5, q], ['C', 5, q],
            ['D', 5, h], ['REST', 0, h],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.8, t + pos));
            }
            pos += dur;
        });
        // Fast bass
        for (let i = 0; i < pos / e; i++) {
            const bassNote = ['C', 'G', 'A', 'E'][i % 4];
            this.musicNodes.push(this.createTriangle(this.noteFreq(bassNote, 3), e * 0.7, t + i * e));
        }
        this.musicTimeout = setTimeout(() => { if (this.musicPlaying) this.playSMB3Athletic(); }, pos * 1000 - 50);
    };

    nesAudio.playSMB3Fortress = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 140;
        const beat = 60 / bpm;
        const q = beat, e = beat / 2;

        const melody = [
            ['E', 4, e], ['F', 4, e], ['G', 4, e], ['Ab', 4, e],
            ['A', 4, q], ['G', 4, e], ['F', 4, e],
            ['E', 4, q], ['D', 4, e], ['E', 4, e],
            ['F', 4, q], ['E', 4, q],
            ['D', 4, e], ['E', 4, e], ['F', 4, e], ['G', 4, e],
            ['A', 4, q], ['G', 4, e], ['F', 4, e],
            ['E', 4, h], ['REST', 0, q+e],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.8, t + pos));
            }
            pos += dur;
        });
        for (let i = 0; i < pos / q; i++) {
            this.musicNodes.push(this.createTriangle(this.noteFreq('E', 2), q * 0.6, t + i * q));
            if (i % 2 === 0) this.musicNodes.push(this.createNoise(0.04, t + i * q));
        }
        this.musicTimeout = setTimeout(() => { if (this.musicPlaying) this.playSMB3Fortress(); }, pos * 1000 - 50);
    };

    nesAudio.playSMB3Airship = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 150;
        const beat = 60 / bpm;
        const q = beat, e = beat / 2;

        const melody = [
            ['A', 4, e], ['A', 4, e], ['C', 5, e], ['A', 4, e],
            ['D', 5, e], ['A', 4, e], ['E', 5, e], ['D', 5, e],
            ['C', 5, q], ['A', 4, q],
            ['G', 4, e], ['A', 4, e], ['C', 5, e], ['A', 4, e],
            ['D', 5, q], ['C', 5, e], ['A', 4, e],
            ['G', 4, h], ['REST', 0, q+e],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.75, t + pos));
            }
            pos += dur;
        });
        for (let i = 0; i < pos / e; i++) {
            this.musicNodes.push(this.createTriangle(this.noteFreq('A', 2), e * 0.5, t + i * e));
            if (i % 4 === 0) this.musicNodes.push(this.createNoise(0.04, t + i * e));
        }
        this.musicTimeout = setTimeout(() => { if (this.musicPlaying) this.playSMB3Airship(); }, pos * 1000 - 50);
    };

    nesAudio.playSMB3Map = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 130;
        const beat = 60 / bpm;
        const q = beat, e = beat / 2, h = beat * 2;

        const melody = [
            ['C', 5, q], ['E', 5, q], ['G', 5, h],
            ['F', 5, q], ['E', 5, q], ['D', 5, h],
            ['E', 5, q], ['D', 5, q], ['C', 5, q], ['B', 4, q],
            ['C', 5, h+h],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.9, t + pos));
            }
            pos += dur;
        });
        this.musicTimeout = setTimeout(() => { if (this.musicPlaying) this.playSMB3Map(); }, pos * 1000 - 50);
    };

    // Extend playMusic
    const origPlay = nesAudio.playMusic.bind(nesAudio);
    nesAudio.playMusic = function(game, type) {
        if (game === 'mario3') {
            this.init();
            this.stopMusic();
            this.currentMusic = { game, type };
            this.musicPlaying = true;
            if (type === 'OFF') return;
            if (type === 'OVERWORLD' || type === 'A') this.playSMB3Overworld();
            else if (type === 'ATHLETIC') this.playSMB3Athletic();
            else if (type === 'FORTRESS' || type === 'C') this.playSMB3Fortress();
            else if (type === 'AIRSHIP') this.playSMB3Airship();
            else if (type === 'MAP') this.playSMB3Map();
            else this.playSMB3Overworld();
        } else {
            origPlay(game, type);
        }
    };
})();
