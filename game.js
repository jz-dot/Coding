// ============================================================
// Main Game Controller
// Handles menus, input, game loop, high scores, and game switching
// ============================================================

(function() {
    'use strict';

    // ---- State ----
    let currentGame = 'tetris'; // 'tetris' or 'drmario'
    let gameState = 'title'; // title, options, highscores, playing
    let tetris = new TetrisEngine();
    let drmario = new DrMarioEngine();
    let engine = tetris;

    // Options
    let startLevel = 0;
    let startHeight = 0; // Tetris only
    let speedSetting = 1; // Dr. Mario: 0=LOW, 1=MED, 2=HI
    let musicType = 'A'; // A, B, C, OFF
    const MUSIC_OPTIONS = ['A', 'B', 'C', 'OFF'];

    // Input state
    const keys = {};
    let dasActive = false;
    let dasDir = 0;

    // Canvas
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-canvas');
    const nextCtx = nextCanvas.getContext('2d');

    // High scores
    let highScores = {
        tetris: [],
        drmario: []
    };

    const MAX_HIGH_SCORES = 10;
    const DEFAULT_SCORES = [
        { name: 'MASTER', score: 100000, level: 9 },
        { name: 'EXPERT', score: 75000, level: 7 },
        { name: 'ADVANC', score: 50000, level: 5 },
        { name: 'PLAYER', score: 25000, level: 3 },
        { name: 'NEWBIE', score: 10000, level: 1 },
    ];

    // ---- High Score Management ----

    function loadHighScores() {
        try {
            const saved = localStorage.getItem('nes_retro_highscores');
            if (saved) {
                highScores = JSON.parse(saved);
            } else {
                highScores = {
                    tetris: [...DEFAULT_SCORES],
                    drmario: [...DEFAULT_SCORES]
                };
                saveHighScores();
            }
        } catch(e) {
            highScores = {
                tetris: [...DEFAULT_SCORES],
                drmario: [...DEFAULT_SCORES]
            };
        }
    }

    function saveHighScores() {
        try {
            localStorage.setItem('nes_retro_highscores', JSON.stringify(highScores));
        } catch(e) {}
    }

    function isHighScore(score) {
        const list = highScores[currentGame] || [];
        if (list.length < MAX_HIGH_SCORES) return true;
        return score > list[list.length - 1].score;
    }

    function addHighScore(name, score, level) {
        const list = highScores[currentGame] || [];
        list.push({ name: name.toUpperCase(), score, level });
        list.sort((a, b) => b.score - a.score);
        if (list.length > MAX_HIGH_SCORES) list.length = MAX_HIGH_SCORES;
        highScores[currentGame] = list;
        saveHighScores();
    }

    function getTopScore() {
        const list = highScores[currentGame] || [];
        return list.length > 0 ? list[0].score : 0;
    }

    function renderHighScoreList(game) {
        const list = highScores[game] || [];
        const container = document.getElementById('highscore-list');
        container.innerHTML = '';
        if (list.length === 0) {
            container.innerHTML = '<div style="text-align:center;color:#888;">NO SCORES YET</div>';
            return;
        }
        list.forEach((entry, i) => {
            const div = document.createElement('div');
            div.className = 'hs-entry';
            div.innerHTML = `
                <span class="hs-rank">${String(i + 1).padStart(2, ' ')}.</span>
                <span class="hs-name">${entry.name}</span>
                <span class="hs-score">${String(entry.score).padStart(6, '0')}</span>
                <span class="hs-level">LV${String(entry.level).padStart(2, '0')}</span>
            `;
            container.appendChild(div);
        });
    }

    // ---- Screen Management ----

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    function switchGame() {
        currentGame = currentGame === 'tetris' ? 'drmario' : 'tetris';
        engine = currentGame === 'tetris' ? tetris : drmario;

        document.getElementById('current-game-label').textContent =
            currentGame === 'tetris' ? 'TETRIS' : 'DR.MARIO';

        document.getElementById('title-tetris').classList.toggle('active', currentGame === 'tetris');
        document.getElementById('title-drmario').classList.toggle('active', currentGame === 'drmario');

        document.getElementById('tetris-options').style.display =
            currentGame === 'tetris' ? 'block' : 'none';
        document.getElementById('drmario-options').style.display =
            currentGame === 'drmario' ? 'block' : 'none';
    }

    // ---- Game Start / Stop ----

    function startGame() {
        nesAudio.init();
        showScreen('game-screen');
        gameState = 'playing';

        // Update UI labels
        document.getElementById('game-type-label').textContent =
            currentGame === 'tetris' ? 'TETRIS' : 'DR.MARIO';

        // Show/hide game-specific UI
        document.getElementById('virus-count-box').style.display =
            currentGame === 'drmario' ? 'block' : 'none';
        document.getElementById('tetris-stats').style.display =
            currentGame === 'tetris' ? 'block' : 'none';

        // Init the engine
        if (currentGame === 'tetris') {
            tetris.init(startLevel, startHeight);
            engine = tetris;
            initPieceStats();
        } else {
            drmario.init(startLevel, speedSetting);
            engine = drmario;
        }

        // Update displays
        updateDisplays();
        document.getElementById('top-score-display').textContent =
            String(getTopScore()).padStart(6, '0');

        // Start music
        nesAudio.playMusic(currentGame, musicType);

        // Hide overlays
        hideOverlays();

        // Start game loop
        requestAnimationFrame(gameLoop);
    }

    function hideOverlays() {
        document.getElementById('pause-overlay').classList.remove('visible');
        document.getElementById('gameover-overlay').classList.remove('visible');
        document.getElementById('clear-overlay').classList.remove('visible');
        document.getElementById('name-entry').style.display = 'none';
    }

    function initPieceStats() {
        const container = document.getElementById('piece-stats');
        container.innerHTML = '';
        const pieces = ['I','O','T','S','Z','J','L'];
        const colors = {
            'I': '#00F0F0', 'O': '#F0F000', 'T': '#A000F0',
            'S': '#00F000', 'Z': '#F00000', 'J': '#0000F0', 'L': '#F0A000'
        };
        pieces.forEach(p => {
            const row = document.createElement('div');
            row.className = 'piece-stat-row';
            row.innerHTML = `
                <span style="color:${colors[p]}">${p}</span>
                <span class="piece-stat-count" id="stat-${p}">000</span>
            `;
            container.appendChild(row);
        });
    }

    function updateDisplays() {
        document.getElementById('score-display').textContent =
            String(engine.score).padStart(6, '0');
        document.getElementById('game-level-display').textContent =
            String(engine.level).padStart(2, '0');

        if (currentGame === 'tetris') {
            document.getElementById('lines-display').textContent =
                String(tetris.lines).padStart(3, '0');

            // Update piece stats
            ['I','O','T','S','Z','J','L'].forEach(p => {
                const el = document.getElementById(`stat-${p}`);
                if (el) el.textContent = String(tetris.pieceStats[p]).padStart(3, '0');
            });
        } else {
            document.getElementById('lines-display').textContent =
                String(drmario.score).padStart(3, '0');
            document.getElementById('virus-display').textContent =
                String(drmario.virusCount).padStart(2, '0');
        }
    }

    // ---- Game Loop ----

    let lastTime = 0;
    const FRAME_DURATION = 1000 / 60.0988; // NES runs at ~60.0988 fps
    let accumulator = 0;

    function gameLoop(timestamp) {
        if (gameState !== 'playing') return;

        if (!lastTime) lastTime = timestamp;
        const delta = timestamp - lastTime;
        lastTime = timestamp;

        accumulator += delta;

        // Process frames at NES speed
        while (accumulator >= FRAME_DURATION) {
            accumulator -= FRAME_DURATION;

            if (!engine.paused && !engine.gameOver) {
                // Handle DAS
                if (keys['ArrowLeft'] || keys['KeyA']) {
                    engine.handleDAS(-1);
                } else if (keys['ArrowRight'] || keys['KeyD']) {
                    engine.handleDAS(1);
                } else {
                    engine.resetDAS();
                }

                // Handle soft drop
                if (currentGame === 'tetris') {
                    tetris.softDropping = keys['ArrowDown'] || keys['KeyS'];
                }

                engine.update();
            }

            // Check game over
            if (engine.gameOver && !document.getElementById('gameover-overlay').classList.contains('visible')) {
                nesAudio.stopMusic();
                nesAudio.playSFX('gameover');
                document.getElementById('gameover-overlay').classList.add('visible');

                if (isHighScore(engine.score)) {
                    document.getElementById('name-entry').style.display = 'flex';
                    document.getElementById('name-input').value = 'AAA';
                    document.getElementById('name-input').focus();
                }
            }

            // Check Dr. Mario stage clear
            if (currentGame === 'drmario' && drmario.stageClear &&
                !document.getElementById('clear-overlay').classList.contains('visible')) {
                nesAudio.stopMusic();
                document.getElementById('clear-overlay').classList.add('visible');
            }
        }

        // Render
        engine.render(ctx, nextCtx);
        updateDisplays();

        requestAnimationFrame(gameLoop);
    }

    // ---- Input Handling ----

    document.addEventListener('keydown', (e) => {
        if (gameState !== 'playing') return;

        const code = e.code;
        if (keys[code]) return; // Prevent key repeat
        keys[code] = true;

        if (engine.gameOver || engine.paused) {
            if (code === 'KeyP' && !engine.gameOver) {
                engine.paused = false;
                document.getElementById('pause-overlay').classList.remove('visible');
                nesAudio.playMusic(currentGame, musicType);
            }
            return;
        }

        switch(code) {
            case 'KeyZ':
                engine.rotateCounterClockwise();
                break;
            case 'KeyX':
            case 'ArrowUp':
            case 'KeyW':
                engine.rotateClockwise();
                break;
            case 'Space':
                if (currentGame === 'tetris') {
                    tetris.hardDrop();
                } else {
                    drmario.hardDrop();
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (currentGame === 'drmario') {
                    drmario.softDrop();
                }
                break;
            case 'KeyP':
                engine.paused = true;
                document.getElementById('pause-overlay').classList.add('visible');
                nesAudio.stopMusic();
                break;
            case 'KeyM':
                nesAudio.toggleMute();
                break;
        }

        e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // ---- Menu Button Handlers ----

    // Game toggle
    document.getElementById('toggle-left').addEventListener('click', switchGame);
    document.getElementById('toggle-right').addEventListener('click', switchGame);

    // Start
    document.getElementById('btn-start').addEventListener('click', startGame);

    // Options
    document.getElementById('btn-options').addEventListener('click', () => {
        showScreen('options-screen');
        gameState = 'options';
        updateOptionDisplays();
    });

    document.getElementById('btn-options-back').addEventListener('click', () => {
        showScreen('title-screen');
        gameState = 'title';
    });

    // Level
    document.getElementById('level-up').addEventListener('click', () => {
        if (currentGame === 'tetris') {
            startLevel = Math.min(startLevel + 1, 19);
        } else {
            startLevel = Math.min(startLevel + 1, 20);
        }
        updateOptionDisplays();
    });
    document.getElementById('level-down').addEventListener('click', () => {
        startLevel = Math.max(startLevel - 1, 0);
        updateOptionDisplays();
    });

    // Height (Tetris)
    document.getElementById('height-up').addEventListener('click', () => {
        startHeight = Math.min(startHeight + 1, 5);
        updateOptionDisplays();
    });
    document.getElementById('height-down').addEventListener('click', () => {
        startHeight = Math.max(startHeight - 1, 0);
        updateOptionDisplays();
    });

    // Speed (Dr. Mario)
    document.getElementById('speed-up').addEventListener('click', () => {
        speedSetting = Math.min(speedSetting + 1, 2);
        updateOptionDisplays();
    });
    document.getElementById('speed-down').addEventListener('click', () => {
        speedSetting = Math.max(speedSetting - 1, 0);
        updateOptionDisplays();
    });

    // Music
    document.getElementById('music-up').addEventListener('click', () => {
        const idx = MUSIC_OPTIONS.indexOf(musicType);
        musicType = MUSIC_OPTIONS[(idx + 1) % MUSIC_OPTIONS.length];
        updateOptionDisplays();
    });
    document.getElementById('music-down').addEventListener('click', () => {
        const idx = MUSIC_OPTIONS.indexOf(musicType);
        musicType = MUSIC_OPTIONS[(idx - 1 + MUSIC_OPTIONS.length) % MUSIC_OPTIONS.length];
        updateOptionDisplays();
    });

    function updateOptionDisplays() {
        document.getElementById('level-display').textContent =
            String(startLevel).padStart(2, '0');
        document.getElementById('height-display').textContent =
            String(startHeight);
        document.getElementById('speed-display').textContent =
            ['LOW', 'MED', 'HI'][speedSetting];
        document.getElementById('music-display').textContent = musicType;
    }

    // High Scores
    document.getElementById('btn-high-scores').addEventListener('click', () => {
        showScreen('highscore-screen');
        gameState = 'highscores';
        renderHighScoreList(currentGame);
        updateHSTabs();
    });

    document.getElementById('btn-hs-back').addEventListener('click', () => {
        showScreen('title-screen');
        gameState = 'title';
    });

    document.getElementById('hs-tetris-tab').addEventListener('click', () => {
        renderHighScoreList('tetris');
        document.getElementById('hs-tetris-tab').classList.add('active');
        document.getElementById('hs-drmario-tab').classList.remove('active');
    });

    document.getElementById('hs-drmario-tab').addEventListener('click', () => {
        renderHighScoreList('drmario');
        document.getElementById('hs-drmario-tab').classList.remove('active');
        document.getElementById('hs-drmario-tab').classList.add('active');
        document.getElementById('hs-tetris-tab').classList.remove('active');
    });

    function updateHSTabs() {
        document.getElementById('hs-tetris-tab').classList.toggle('active', currentGame === 'tetris');
        document.getElementById('hs-drmario-tab').classList.toggle('active', currentGame === 'drmario');
    }

    // Game over buttons
    document.getElementById('btn-submit-score').addEventListener('click', () => {
        const name = document.getElementById('name-input').value.trim() || 'AAA';
        addHighScore(name, engine.score, engine.level);
        document.getElementById('name-entry').style.display = 'none';
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
        hideOverlays();
        lastTime = 0;
        accumulator = 0;
        startGame();
    });

    document.getElementById('btn-back-menu').addEventListener('click', () => {
        nesAudio.stopMusic();
        hideOverlays();
        showScreen('title-screen');
        gameState = 'title';
    });

    // Dr. Mario stage clear
    document.getElementById('btn-next-level').addEventListener('click', () => {
        hideOverlays();
        startLevel = Math.min(engine.level + 1, 20);
        lastTime = 0;
        accumulator = 0;
        startGame();
    });

    // ---- Keyboard shortcuts on title ----
    document.addEventListener('keydown', (e) => {
        if (gameState === 'title') {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                startGame();
            }
            if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
                e.preventDefault();
                switchGame();
            }
        }
    });

    // ---- Init ----
    loadHighScores();
    updateOptionDisplays();
    showScreen('title-screen');

})();
