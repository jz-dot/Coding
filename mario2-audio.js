// ============================================================
// Super Ashio Bros. 2 - Audio
// Extends nesAudio with SMB2-specific SFX and music
// ============================================================

(function() {
    const origPlaySFX = nesAudio.playSFX.bind(nesAudio);
    const origPlayMusic = nesAudio.playMusic.bind(nesAudio);

    nesAudio.playSFX = function(type) {
        this.init();
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        switch(type) {
            case 'smb2_jump':
                this.createSquare(350, 0.08, t);
                this.createSquare(500, 0.06, t + 0.05);
                break;
            case 'smb2_pluck':
                this.createSquare(200, 0.06, t);
                this.createSquare(350, 0.05, t + 0.04);
                this.createSquare(500, 0.04, t + 0.08);
                break;
            case 'smb2_throw':
                this.createSquare(400, 0.06, t);
                this.createNoise(0.04, t);
                break;
            case 'smb2_hit':
                this.createSquare(200, 0.1, t);
                this.createSquare(150, 0.1, t + 0.08);
                break;
            case 'smb2_stomp':
                this.createSquare(180, 0.06, t);
                this.createNoise(0.05, t);
                break;
            case 'smb2_enemy_hit':
                this.createSquare(500, 0.06, t);
                this.createSquare(300, 0.08, t + 0.04);
                break;
            case 'smb2_cherry':
                this.createSquare(800, 0.04, t);
                this.createSquare(1000, 0.04, t + 0.03);
                break;
            case 'smb2_1up':
                for (let i = 0; i < 5; i++) {
                    this.createSquare(600 + i * 100, 0.06, t + i * 0.04);
                }
                break;
            case 'smb2_door':
                this.createSquare(400, 0.08, t);
                this.createSquare(500, 0.08, t + 0.06);
                this.createSquare(600, 0.08, t + 0.12);
                this.createSquare(800, 0.12, t + 0.18);
                break;
            case 'smb2_bomb':
                this.createNoise(0.3, t);
                this.createSquare(100, 0.3, t);
                this.createSquare(80, 0.2, t + 0.1);
                break;
            case 'smb2_boss_hit':
                this.createSquare(300, 0.08, t);
                this.createNoise(0.06, t);
                this.createSquare(200, 0.1, t + 0.06);
                break;
            case 'smb2_boss_die':
                for (let i = 0; i < 8; i++) {
                    this.createSquare(400 - i * 30, 0.08, t + i * 0.06);
                    this.createNoise(0.05, t + i * 0.06);
                }
                break;
            case 'smb2_crystal':
                for (let i = 0; i < 6; i++) {
                    this.createSquare(600 + i * 100, 0.08, t + i * 0.05);
                }
                this.createSquare(1200, 0.3, t + 0.3);
                break;
            case 'smb2_pow':
                this.createNoise(0.15, t);
                this.createSquare(80, 0.15, t);
                break;
            case 'smb2_shrink':
                this.createSquare(300, 0.06, t);
                this.createSquare(250, 0.06, t + 0.05);
                this.createSquare(200, 0.08, t + 0.1);
                break;
            case 'smb2_slot':
                this.createSquare(600, 0.04, t);
                break;
            case 'smb2_slotstop':
                this.createSquare(800, 0.06, t);
                this.createSquare(1000, 0.08, t + 0.04);
                break;
            case 'smb2_warp':
                for (let i = 0; i < 10; i++) {
                    this.createSquare(300 + i * 80, 0.05, t + i * 0.03);
                }
                break;
            case 'smb2_potion':
                this.createSquare(200, 0.1, t);
                this.createTriangle(100, 0.15, t);
                this.createSquare(300, 0.1, t + 0.1);
                break;
            case 'smb2_stageclear':
                const notes = [523, 587, 659, 784, 880, 1047];
                for (let i = 0; i < notes.length; i++) {
                    this.createSquare(notes[i], 0.12, t + i * 0.1);
                }
                this.createSquare(1047, 0.4, t + 0.6);
                break;
            default:
                origPlaySFX(type);
                return;
        }
    };

    nesAudio.playSMB2Overworld = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 160;
        const beat = 60 / bpm;
        const q = beat, e = beat / 2, h = beat * 2;

        const melody = [
            ['A', 4, e], ['A', 4, e], ['A', 4, q], ['A', 4, e], ['C', 5, e],
            ['A', 4, q], ['G', 4, e], ['A', 4, e], ['REST', 0, q], ['A', 4, e], ['A', 4, e],
            ['A', 4, q], ['A', 4, e], ['C', 5, e], ['A', 4, e], ['G', 4, e],
            ['E', 4, q], ['REST', 0, q],
            ['G', 4, e], ['A', 4, e], ['B', 4, q], ['B', 4, e], ['C', 5, e],
            ['D', 5, q], ['C', 5, e], ['B', 4, e], ['A', 4, q], ['REST', 0, q],
            ['A', 4, e], ['G', 4, e], ['A', 4, q], ['C', 5, q],
            ['D', 5, e], ['E', 5, e], ['C', 5, q], ['A', 4, h],
        ];

        const bass = [
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['F', 2, q], ['C', 3, q], ['F', 2, q], ['C', 3, q],
            ['G', 2, q], ['D', 3, q], ['G', 2, q], ['D', 3, q],
            ['A', 2, q], ['E', 3, q], ['A', 2, q], ['E', 3, q],
            ['G', 2, q], ['D', 3, q], ['G', 2, q], ['D', 3, q],
            ['F', 2, q], ['C', 3, q], ['F', 2, q], ['C', 3, q],
            ['A', 2, q], ['E', 3, q], ['C', 3, q], ['G', 3, q],
            ['D', 3, q], ['A', 3, q], ['A', 2, q], ['E', 3, q],
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
            if (i % 4 === 0) this.musicNodes.push(this.createNoise(0.03, t + i * e));
        }
        this.musicTimeout = setTimeout(() => { if (this.musicPlaying) this.playSMB2Overworld(); }, pos * 1000 - 50);
    };

    nesAudio.playSMB2Underground = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 130;
        const beat = 60 / bpm;
        const q = beat, e = beat / 2, h = beat * 2;

        const melody = [
            ['E', 4, e], ['G', 4, e], ['B', 4, q], ['A', 4, e], ['G', 4, e],
            ['E', 4, q], ['C', 4, q], ['D', 4, q], ['E', 4, q],
            ['G', 4, e], ['A', 4, e], ['B', 4, q], ['C', 5, q],
            ['B', 4, e], ['A', 4, e], ['G', 4, h],
            ['E', 4, e], ['F#', 4, e], ['G', 4, q], ['A', 4, e], ['B', 4, e],
            ['C', 5, q], ['A', 4, q], ['G', 4, q], ['E', 4, q],
            ['D', 4, q], ['E', 4, q], ['G', 4, h],
            ['E', 4, h], ['REST', 0, h],
        ];

        const bass = [
            ['E', 2, q], ['B', 2, q], ['E', 2, q], ['B', 2, q],
            ['C', 2, q], ['G', 2, q], ['D', 2, q], ['A', 2, q],
            ['E', 2, q], ['B', 2, q], ['C', 2, q], ['G', 2, q],
            ['D', 2, q], ['A', 2, q], ['G', 2, q], ['D', 3, q],
            ['E', 2, q], ['B', 2, q], ['A', 2, q], ['E', 3, q],
            ['C', 2, q], ['G', 2, q], ['A', 2, q], ['E', 3, q],
            ['D', 2, q], ['A', 2, q], ['G', 2, q], ['D', 3, q],
            ['E', 2, q], ['B', 2, q], ['E', 2, q], ['B', 2, q],
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
        this.musicTimeout = setTimeout(() => { if (this.musicPlaying) this.playSMB2Underground(); }, pos * 1000 - 50);
    };

    nesAudio.playSMB2Boss = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 180;
        const beat = 60 / bpm;
        const q = beat, e = beat / 2;

        const melody = [
            ['E', 5, e], ['D', 5, e], ['C', 5, e], ['D', 5, e],
            ['E', 5, q], ['E', 5, e], ['D', 5, e],
            ['C', 5, e], ['B', 4, e], ['A', 4, q],
            ['B', 4, e], ['C', 5, e], ['D', 5, e], ['E', 5, e],
            ['C', 5, q], ['A', 4, q],
            ['E', 5, e], ['D', 5, e], ['C', 5, e], ['B', 4, e],
            ['A', 4, q], ['C', 5, q],
            ['B', 4, q], ['A', 4, q],
        ];

        const bass = [
            ['A', 2, q], ['A', 3, q], ['A', 2, q], ['A', 3, q],
            ['A', 2, q], ['A', 3, q], ['A', 2, q], ['A', 3, q],
            ['F', 2, q], ['F', 3, q], ['F', 2, q], ['F', 3, q],
            ['G', 2, q], ['G', 3, q], ['G', 2, q], ['G', 3, q],
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
        for (let i = 0; i < pos / e; i++) {
            if (i % 2 === 0) this.musicNodes.push(this.createNoise(0.03, t + i * e));
        }
        this.musicTimeout = setTimeout(() => { if (this.musicPlaying) this.playSMB2Boss(); }, pos * 1000 - 50);
    };

    nesAudio.playSMB2CharSelect = function() {
        if (!this.musicPlaying) return;
        const t = this.ctx.currentTime;
        const bpm = 120;
        const beat = 60 / bpm;
        const q = beat, e = beat / 2, h = beat * 2;

        const melody = [
            ['C', 5, q], ['E', 5, q], ['G', 5, h],
            ['G', 5, q], ['F', 5, q], ['E', 5, q], ['D', 5, q],
            ['C', 5, h], ['E', 5, h],
            ['D', 5, q], ['C', 5, q], ['B', 4, q], ['D', 5, q],
            ['C', 5, h+h],
        ];

        let pos = 0;
        melody.forEach(([note, oct, dur]) => {
            if (note !== 'REST') {
                this.musicNodes.push(this.createSquare(this.noteFreq(note, oct), dur * 0.9, t + pos));
            }
            pos += dur;
        });
        this.musicTimeout = setTimeout(() => { if (this.musicPlaying) this.playSMB2CharSelect(); }, pos * 1000 - 50);
    };

    // Extend playMusic to handle mario2 types
    const origPlay = nesAudio.playMusic.bind(nesAudio);
    nesAudio.playMusic = function(game, type) {
        if (game === 'mario2') {
            this.init();
            this.stopMusic();
            this.currentMusic = { game, type };
            this.musicPlaying = true;
            if (type === 'OFF') return;
            if (type === 'OVERWORLD') this.playSMB2Overworld();
            else if (type === 'UNDERGROUND') this.playSMB2Underground();
            else if (type === 'BOSS') this.playSMB2Boss();
            else if (type === 'CHARSELECT') this.playSMB2CharSelect();
            else if (type === 'A') this.playSMB2Overworld();
            else this.playSMB2Overworld();
        } else {
            origPlay(game, type);
        }
    };
})();
