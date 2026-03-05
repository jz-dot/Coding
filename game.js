// ============================================================
// Main Game Controller
// Handles menus, input, game loop, high scores, game switching
// Supports: Tetris, Dr. Mario, Super Ashio Bros. (1P & 2P)
// ============================================================

(function() {
    'use strict';

    // ---- State ----
    const GAMES = ['tetris', 'drmario', 'mario'];
    const GAME_LABELS = { tetris: 'TETRIS', drmario: 'DR.MARIO', mario: 'SUPER ASHIO' };
    let currentGame = 'tetris';
    let gameState = 'title'; // title, options, highscores, playing
    let tetris = new TetrisEngine();
    let drmario = new DrMarioEngine();
    let marioP1 = new SuperMarioEngine();
    let marioP2 = new SuperMarioEngine();
    let engine = tetris;

    // 2-player mode
    let twoPlayer = false;
    let currentPlayer = 1; // 1 or 2
    let p1State = null; // saved state for player switching
    let p2State = null;

    // Options
    let startLevel = 0;
    let startHeight = 0;
    let speedSetting = 1;
    let musicType = 'A';
    let startWorld = 1;
    let startLives = 3;
    const MUSIC_OPTIONS = ['A', 'B', 'C', 'OFF'];

    // Input state
    const keys = {};

    // Canvas
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-canvas');
    const nextCtx = nextCanvas.getContext('2d');

    // High scores
    let highScores = { tetris: [], drmario: [], mario: [] };

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
            const saved = localStorage.getItem('nes_retro_highscores_v2');
            if (saved) {
                highScores = JSON.parse(saved);
                if (!highScores.mario) highScores.mario = [...DEFAULT_SCORES];
            } else {
                highScores = {
                    tetris: [...DEFAULT_SCORES],
                    drmario: [...DEFAULT_SCORES],
                    mario: [...DEFAULT_SCORES]
                };
                saveHighScores();
            }
        } catch(e) {
            highScores = { tetris: [...DEFAULT_SCORES], drmario: [...DEFAULT_SCORES], mario: [...DEFAULT_SCORES] };
        }
    }

    function saveHighScores() {
        try {
            localStorage.setItem('nes_retro_highscores_v2', JSON.stringify(highScores));
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

    function switchGame(dir) {
        dir = dir || 1;
        const idx = GAMES.indexOf(currentGame);
        const newIdx = (idx + dir + GAMES.length) % GAMES.length;
        currentGame = GAMES[newIdx];

        document.getElementById('current-game-label').textContent = GAME_LABELS[currentGame];

        // Toggle title logos
        document.getElementById('title-tetris').classList.toggle('active', currentGame === 'tetris');
        document.getElementById('title-drmario').classList.toggle('active', currentGame === 'drmario');
        document.getElementById('title-mario').classList.toggle('active', currentGame === 'mario');

        // Toggle options sections
        document.getElementById('tetris-options').style.display = currentGame === 'tetris' ? 'block' : 'none';
        document.getElementById('drmario-options').style.display = currentGame === 'drmario' ? 'block' : 'none';
        document.getElementById('mario-options').style.display = currentGame === 'mario' ? 'block' : 'none';

        // Level option label changes for mario
        const levelRow = document.getElementById('level-display').parentElement.parentElement;
        levelRow.style.display = currentGame === 'mario' ? 'none' : 'flex';

        // Toggle controls hints
        document.getElementById('controls-hint-puzzle').style.display = currentGame === 'mario' ? 'none' : 'block';
        document.getElementById('controls-hint-mario').style.display = currentGame === 'mario' ? 'block' : 'none';

        // Toggle start button vs mario player select
        document.getElementById('btn-start').style.display = currentGame === 'mario' ? 'none' : 'inline-block';
        document.getElementById('mario-player-select').style.display = currentGame === 'mario' ? 'flex' : 'none';
    }

    function setupCanvasForGame() {
        const layout = document.querySelector('.game-layout');
        if (currentGame === 'mario') {
            canvas.width = 256;
            canvas.height = 240;
            layout.classList.add('mario-mode');
            document.querySelector('.left-panel').style.display = 'none';
            document.querySelector('.right-panel').style.display = 'none';
        } else {
            canvas.width = 200;
            canvas.height = 360;
            canvas.style.width = '';
            canvas.style.height = '';
            layout.classList.remove('mario-mode');
            document.querySelector('.left-panel').style.display = '';
            document.querySelector('.right-panel').style.display = '';
        }
    }

    function getMarioMusicType() {
        if (musicType === 'OFF') return 'OFF';
        if (engine.starPower) return 'STAR';
        if (engine.levelType === 'underground') return 'B';
        if (engine.levelType === 'castle') return 'C';
        if (engine.levelType === 'underwater') return 'UNDERWATER';
        return 'A';
    }

    // ---- Game Start / Stop ----

    function startGame(numPlayers) {
        nesAudio.init();
        showScreen('game-screen');
        gameState = 'playing';
        setupCanvasForGame();

        document.getElementById('game-type-label').textContent = GAME_LABELS[currentGame];

        // Show/hide game-specific UI
        document.getElementById('virus-count-box').style.display = currentGame === 'drmario' ? 'block' : 'none';
        document.getElementById('tetris-stats').style.display = currentGame === 'tetris' ? 'block' : 'none';

        if (currentGame === 'tetris') {
            tetris.init(startLevel, startHeight);
            engine = tetris;
            initPieceStats();
        } else if (currentGame === 'drmario') {
            drmario.init(startLevel, speedSetting);
            engine = drmario;
        } else if (currentGame === 'mario') {
            twoPlayer = numPlayers === 2;
            currentPlayer = 1;

            marioP1 = new SuperMarioEngine();
            marioP1.lives = startLives;
            marioP1.init(startWorld, 1);
            engine = marioP1;

            if (twoPlayer) {
                marioP2 = new SuperMarioEngine();
                marioP2.lives = startLives;
                marioP2.init(startWorld, 2);
            }

            // Play music based on level type
            nesAudio.playMusic('mario', getMarioMusicType());
        }

        if (currentGame !== 'mario') {
            updateDisplays();
            document.getElementById('top-score-display').textContent = String(getTopScore()).padStart(6, '0');
            nesAudio.playMusic(currentGame, musicType);
        }

        hideOverlays();
        lastTime = 0;
        accumulator = 0;
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
        if (currentGame === 'mario') return; // Mario draws its own HUD

        document.getElementById('score-display').textContent = String(engine.score).padStart(6, '0');
        document.getElementById('game-level-display').textContent = String(engine.level).padStart(2, '0');

        if (currentGame === 'tetris') {
            document.getElementById('lines-display').textContent = String(tetris.lines).padStart(3, '0');
            ['I','O','T','S','Z','J','L'].forEach(p => {
                const el = document.getElementById(`stat-${p}`);
                if (el) el.textContent = String(tetris.pieceStats[p]).padStart(3, '0');
            });
        } else if (currentGame === 'drmario') {
            document.getElementById('lines-display').textContent = String(drmario.score).padStart(3, '0');
            document.getElementById('virus-display').textContent = String(drmario.virusCount).padStart(2, '0');
        }
    }

    // ---- 2-Player Switching ----

    function switchToNextPlayer() {
        if (!twoPlayer) return;

        // Switch players
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        engine = currentPlayer === 1 ? marioP1 : marioP2;

        // Start music for current level type
        nesAudio.playMusic('mario', getMarioMusicType());
    }

    // ---- Game Loop ----

    let lastTime = 0;
    const FRAME_DURATION = 1000 / 60.0988;
    let accumulator = 0;

    function gameLoop(timestamp) {
        if (gameState !== 'playing') return;

        if (!lastTime) lastTime = timestamp;
        const delta = Math.min(timestamp - lastTime, 50); // Cap delta to prevent spiral
        lastTime = timestamp;
        accumulator += delta;

        while (accumulator >= FRAME_DURATION) {
            accumulator -= FRAME_DURATION;

            // Check mario-specific states BEFORE update
            if (currentGame === 'mario' && twoPlayer) {
                // Handle 2-player switching on death - before engine respawns
                if (engine.dead && engine.deathTimer === 1 && !engine.gameOver) {
                    const otherEngine = currentPlayer === 1 ? marioP2 : marioP1;
                    if (!otherEngine.gameOver && !otherEngine.dead) {
                        // Let engine handle respawn normally, then switch
                        engine.needsSwitch = true;
                    }
                }
            }

            if (!engine.paused && !engine.gameOver) {
                if (currentGame === 'mario') {
                    // Continuous input for platformer
                    engine.inputLeft = keys['ArrowLeft'] || keys['KeyA'];
                    engine.inputRight = keys['ArrowRight'] || keys['KeyD'];
                    engine.inputDown = keys['ArrowDown'] || keys['KeyS'];
                    engine.running = keys['KeyX'] || keys['ShiftLeft'] || keys['ShiftRight'];
                    engine.crouching = engine.inputDown && engine.playerState !== 'small' && engine.grounded;
                } else {
                    // DAS for puzzle games
                    if (keys['ArrowLeft'] || keys['KeyA']) {
                        engine.handleDAS(-1);
                    } else if (keys['ArrowRight'] || keys['KeyD']) {
                        engine.handleDAS(1);
                    } else {
                        engine.resetDAS();
                    }

                    if (currentGame === 'tetris') {
                        tetris.softDropping = keys['ArrowDown'] || keys['KeyS'];
                    }
                }

                engine.update();
            }

            // Check mario-specific states after update
            if (currentGame === 'mario' && twoPlayer) {
                // After respawn, switch to other player
                if (engine.needsSwitch && !engine.dead) {
                    engine.needsSwitch = false;
                    switchToNextPlayer();
                    continue;
                }

                // 2-player: if current player game over, switch
                if (engine.gameOver) {
                    const otherEngine = currentPlayer === 1 ? marioP2 : marioP1;
                    if (!otherEngine.gameOver) {
                        switchToNextPlayer();
                        continue;
                    }
                }
            }

            // Check game over for all games
            if (engine.gameOver && !document.getElementById('gameover-overlay').classList.contains('visible')) {
                // For 2P mario, both must be game over
                if (currentGame === 'mario' && twoPlayer) {
                    if (!marioP1.gameOver || !marioP2.gameOver) continue;
                }

                nesAudio.stopMusic();
                if (!engine.won) {
                    nesAudio.playSFX('gameover');
                }
                document.getElementById('gameover-overlay').classList.add('visible');

                // Show score entry
                const bestScore = twoPlayer ? Math.max(marioP1.score, marioP2.score) : engine.score;
                if (isHighScore(bestScore)) {
                    document.getElementById('name-entry').style.display = 'flex';
                    document.getElementById('name-input').value = engine.playerName || 'AAA';
                    document.getElementById('name-input').focus();
                }
            }

            // Dr. Mario stage clear
            if (currentGame === 'drmario' && drmario.stageClear &&
                !document.getElementById('clear-overlay').classList.contains('visible')) {
                nesAudio.stopMusic();
                document.getElementById('clear-overlay').classList.add('visible');
            }
        }

        // Render
        engine.render(ctx, nextCtx);
        if (currentGame !== 'mario') {
            updateDisplays();
        }

        requestAnimationFrame(gameLoop);
    }

    // ---- Input Handling ----

    document.addEventListener('keydown', (e) => {
        if (gameState !== 'playing') return;

        const code = e.code;
        if (keys[code]) return;
        keys[code] = true;

        if (engine.gameOver || engine.paused) {
            if (code === 'KeyP' && !engine.gameOver) {
                engine.paused = false;
                document.getElementById('pause-overlay').classList.remove('visible');
                if (currentGame === 'mario') {
                    nesAudio.playMusic('mario', getMarioMusicType());
                } else {
                    nesAudio.playMusic(currentGame, musicType);
                }
            }
            e.preventDefault();
            return;
        }

        if (currentGame === 'mario') {
            // Platformer controls
            switch(code) {
                case 'KeyZ':
                case 'Space':
                    engine.pressJump();
                    break;
                case 'KeyX':
                case 'ShiftLeft':
                case 'ShiftRight':
                    engine.pressRun();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    engine.pressCrouch();
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
        } else {
            // Puzzle game controls
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
                    if (currentGame === 'tetris') tetris.hardDrop();
                    else drmario.hardDrop();
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    if (currentGame === 'drmario') drmario.softDrop();
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
        }

        e.preventDefault();
    });

    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;

        if (currentGame === 'mario' && gameState === 'playing') {
            if (e.code === 'KeyZ' || e.code === 'Space') {
                engine.releaseJump();
            }
            if (e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                engine.releaseRun();
            }
            if (e.code === 'ArrowDown' || e.code === 'KeyS') {
                engine.releaseCrouch();
            }
        }
    });

    // ---- Menu Button Handlers ----

    document.getElementById('toggle-left').addEventListener('click', () => switchGame(-1));
    document.getElementById('toggle-right').addEventListener('click', () => switchGame(1));

    // Puzzle start
    document.getElementById('btn-start').addEventListener('click', () => startGame(1));

    // Mario 1P/2P
    document.getElementById('btn-1player').addEventListener('click', () => startGame(1));
    document.getElementById('btn-2player').addEventListener('click', () => startGame(2));

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
        if (currentGame === 'tetris') startLevel = Math.min(startLevel + 1, 19);
        else startLevel = Math.min(startLevel + 1, 20);
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

    // World (Mario)
    document.getElementById('world-up').addEventListener('click', () => {
        startWorld = Math.min(startWorld + 1, 8);
        updateOptionDisplays();
    });
    document.getElementById('world-down').addEventListener('click', () => {
        startWorld = Math.max(startWorld - 1, 1);
        updateOptionDisplays();
    });

    // Lives (Mario)
    document.getElementById('lives-up').addEventListener('click', () => {
        startLives = Math.min(startLives + 1, 9);
        updateOptionDisplays();
    });
    document.getElementById('lives-down').addEventListener('click', () => {
        startLives = Math.max(startLives - 1, 1);
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
        document.getElementById('level-display').textContent = String(startLevel).padStart(2, '0');
        document.getElementById('height-display').textContent = String(startHeight);
        document.getElementById('speed-display').textContent = ['LOW', 'MED', 'HI'][speedSetting];
        document.getElementById('music-display').textContent = musicType;
        document.getElementById('world-display').textContent = String(startWorld);
        document.getElementById('lives-display').textContent = String(startLives);
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

    function setHSTab(game) {
        renderHighScoreList(game);
        document.getElementById('hs-tetris-tab').classList.toggle('active', game === 'tetris');
        document.getElementById('hs-drmario-tab').classList.toggle('active', game === 'drmario');
        document.getElementById('hs-mario-tab').classList.toggle('active', game === 'mario');
    }

    document.getElementById('hs-tetris-tab').addEventListener('click', () => setHSTab('tetris'));
    document.getElementById('hs-drmario-tab').addEventListener('click', () => setHSTab('drmario'));
    document.getElementById('hs-mario-tab').addEventListener('click', () => setHSTab('mario'));

    function updateHSTabs() {
        setHSTab(currentGame);
    }

    // Game over buttons
    document.getElementById('btn-submit-score').addEventListener('click', () => {
        const name = document.getElementById('name-input').value.trim() || 'AAA';
        const submitScore = (currentGame === 'mario' && twoPlayer) ?
            Math.max(marioP1.score, marioP2.score) : engine.score;
        const submitLevel = (currentGame === 'mario' && twoPlayer) ?
            Math.max(marioP1.level, marioP2.level) : engine.level;
        addHighScore(name, submitScore, submitLevel);
        document.getElementById('name-entry').style.display = 'none';
    });

    document.getElementById('btn-retry').addEventListener('click', () => {
        hideOverlays();
        startGame(twoPlayer ? 2 : 1);
    });

    document.getElementById('btn-back-menu').addEventListener('click', () => {
        nesAudio.stopMusic();
        hideOverlays();
        // Restore canvas for title screen
        canvas.width = 200;
        canvas.height = 360;
        canvas.style.width = '';
        canvas.style.height = '';
        const layout = document.querySelector('.game-layout');
        layout.classList.remove('mario-mode');
        document.querySelector('.left-panel').style.display = '';
        document.querySelector('.right-panel').style.display = '';
        showScreen('title-screen');
        gameState = 'title';
    });

    // Dr. Mario stage clear
    document.getElementById('btn-next-level').addEventListener('click', () => {
        hideOverlays();
        startLevel = Math.min(engine.level + 1, 20);
        startGame(1);
    });

    // ---- Keyboard shortcuts on title ----
    document.addEventListener('keydown', (e) => {
        if (gameState === 'title') {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                if (currentGame === 'mario') {
                    startGame(1); // Default 1P for keyboard start
                } else {
                    startGame(1);
                }
            }
            if (e.code === 'ArrowLeft') {
                e.preventDefault();
                switchGame(-1);
            }
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                switchGame(1);
            }
        }
    });

    // ---- Init ----
    loadHighScores();
    updateOptionDisplays();
    showScreen('title-screen');

})();
