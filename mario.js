// ============================================================
// Super Ashio Bros. Engine
// Core physics, player states, collision, game state, camera
// ============================================================

class SuperMarioEngine {
    constructor() {
        this.SCREEN_W = 256;
        this.SCREEN_H = 240;
        this.TILE = 16;
        // NES SMB authentic physics (values from disassembly, converted to px/frame)
        this.GRAVITY = 0.5;          // Normal falling gravity
        this.MAX_FALL = 5.0;
        this.WALK_ACCEL = 0.15;
        this.RUN_ACCEL = 0.2;
        this.WALK_MAX = 1.5625;
        this.RUN_MAX = 2.5625;
        this.FRICTION = 0.13;
        this.SKID_DECEL = 0.25;

        // Jump physics: NES SMB uses different gravity when holding vs releasing jump
        this.JUMP_VEL_STAND = -4.5;
        this.JUMP_VEL_WALK = -4.5;
        this.JUMP_VEL_RUN = -5.2;
        this.JUMP_GRAVITY_HELD = 0.13;   // Low gravity while holding jump (gives height control)
        this.JUMP_GRAVITY_RELEASE = 0.55; // Full gravity when jump released (snappy descent)

        // Swim physics
        this.SWIM_GRAVITY = 0.1;
        this.SWIM_KICK = -2.0;
        this.SWIM_MAX_FALL = 1.5;

        // Timer
        this.TIMER_TICK_FRAMES = 24; // ~0.4s per tick at 60fps

        // Stomp chain scores
        this.STOMP_SCORES = [100, 200, 400, 500, 800, 1000, 2000, 4000, 8000];
        this.FLAGPOLE_SCORES = [100, 400, 800, 2000, 5000];

        this.reset();
    }

    reset() {
        this.score = 0;
        this.coins = 0;
        this.lives = 3;
        this.level = 1; // world
        this.stage = 1;
        this.gameOver = false;
        this.paused = false;
        this.won = false;

        // Player
        this.playerX = 40;
        this.playerY = 192;
        this.playerVX = 0;
        this.playerVY = 0;
        this.playerW = 12;
        this.playerH = 16;
        this.playerState = 'small'; // small, super, fire
        this.playerDir = 1;
        this.grounded = false;
        this.jumping = false;
        this.jumpHeld = false;
        this.running = false;
        this.crouching = false;
        this.invincible = false;
        this.invTimer = 0;
        this.starPower = false;
        this.starTimer = 0;
        this.damageTimer = 0;
        this.dead = false;
        this.deathTimer = 0;
        this.animFrame = 0;
        this.animCounter = 0;
        this.stompChain = 0;
        this.pipeTransition = false;
        this.pipeTimer = 0;
        this.pipeDir = 'down';
        this.pipeTarget = null;
        this.flagSliding = false;
        this.flagTimer = 0;
        this.levelComplete = false;
        this.levelCompleteTimer = 0;
        this.growTimer = 0;
        this.shrinkTimer = 0;

        // Camera
        this.cameraX = 0;
        this.maxCameraX = 0;

        // Level
        this.tiles = null;
        this.levelWidth = 0;
        this.levelHeight = 13;
        this.levelType = 'overworld';
        this.timeLimit = 400;
        this.timer = 400;
        this.timerFrames = 0;
        this.timerWarning = false;
        this.underwater = false;

        // Entities
        this.entities = [];
        this.particles = [];
        this.scorePopups = [];
        this.activatedCols = 0;

        // Frame counter
        this.frameCount = 0;

        // Input state
        this.inputLeft = false;
        this.inputRight = false;
        this.inputDown = false;
        this.inputJump = false;
        this.inputRun = false;

        // 2 player
        this.playerNum = 1;
        this.playerName = 'ASHIO';
        this.needsSwitch = false;

        // Level data ref
        this.levelData = null;

        // Flagpole
        this.flagY = 0;
        this.flagBaseY = 0;

        // Bowser
        this.bowserDefeated = false;
        this.bridgeCollapsing = false;
        this.bridgeTimer = 0;
        this.showMessage = false;
        this.messageTimer = 0;
        this.message = '';
    }

    init(startWorld, playerNum) {
        this.reset();
        this.level = startWorld || 1;
        this.stage = 1;
        this.playerNum = playerNum || 1;
        this.playerName = playerNum === 2 ? 'AIDIO' : 'ASHIO';
        this.loadLevel(this.level, this.stage);
    }

    loadLevel(world, stage) {
        this.stage = stage;
        this.level = world;

        const data = MarioLevels.getLevel(world, stage);
        if (!data) {
            this.gameOver = true;
            return;
        }

        this.levelData = data;
        this.tiles = data.tiles;
        this.levelWidth = data.width;
        this.levelHeight = data.height || 13;
        this.levelType = data.type || 'overworld';
        this.timeLimit = data.timeLimit || 400;
        this.timer = this.timeLimit;
        this.timerFrames = 0;
        this.timerWarning = false;
        this.underwater = data.type === 'underwater';
        this.maxCameraX = Math.max(0, this.levelWidth * this.TILE - this.SCREEN_W);

        // Reset player position
        // Tile grid rows 0-12 map to screen rows 2-14 (rows 0-1 are HUD)
        // So screen pixel Y = (tileRow + 2) * TILE
        const spawn = data.spawn || { x: 3, y: 11 };
        this.playerX = spawn.x * this.TILE;
        const spawnScreenRow = spawn.y + 2; // convert tile row to screen row
        this.playerY = spawnScreenRow * this.TILE - this.playerH; // feet on top of spawn row
        this.playerVX = 0;
        this.playerVY = 0;
        this.cameraX = 0;
        this.grounded = false;
        this.jumping = false;
        this.dead = false;
        this.levelComplete = false;
        this.flagSliding = false;
        this.pipeTransition = false;
        this.showMessage = false;
        this.bowserDefeated = false;
        this.bridgeCollapsing = false;

        // Spawn entities
        this.entities = [];
        this.particles = [];
        this.scorePopups = [];
        this.activatedCols = 0;

        if (data.entities) {
            for (const e of data.entities) {
                // Entity row is tile row. Screen row = tileRow + 2. Pixel Y = screenRow * TILE.
                const entityScreenY = (e.row + 2) * this.TILE;
                this.entities.push(MarioEntities.create(e.type, e.col * this.TILE, entityScreenY, e));
            }
        }

        this.flagY = 0;
        this.flagBaseY = 0;
        if (data.flagpole) {
            this.flagY = (3 + 2) * this.TILE;  // tile row 3 -> screen row 5
            this.flagBaseY = (12 + 2) * this.TILE; // tile row 12 -> screen row 14
        }
    }

    // ---- INPUT ----

    handleDAS(dir) {
        if (dir === -1) this.inputLeft = true;
        else if (dir === 1) this.inputRight = true;
    }

    resetDAS() {
        this.inputLeft = false;
        this.inputRight = false;
    }

    moveLeft() { this.inputLeft = true; }
    moveRight() { this.inputRight = true; }
    rotateClockwise() { this.pressJump(); }
    rotateCounterClockwise() { this.pressRun(); }

    pressJump() {
        if (this.dead || this.pipeTransition || this.flagSliding || this.levelComplete) return;
        if (this.underwater) {
            // Swim kick
            this.playerVY = this.SWIM_KICK;
            nesAudio.playSFX('smb_swim');
            return;
        }
        if (this.grounded && !this.jumping) {
            this.jumping = true;
            this.jumpHeld = true;
            this.grounded = false;
            this.stompChain = 0;
            // Jump velocity based on horizontal speed
            const speed = Math.abs(this.playerVX);
            if (speed > this.WALK_MAX) {
                this.playerVY = this.JUMP_VEL_RUN;
            } else if (speed > 0.5) {
                this.playerVY = this.JUMP_VEL_WALK;
            } else {
                this.playerVY = this.JUMP_VEL_STAND;
            }
            nesAudio.playSFX('smb_jump');
        }
    }

    releaseJump() {
        this.jumpHeld = false;
    }

    pressRun() {
        this.running = true;
        // Fire mode: throw fireball
        if (this.playerState === 'fire' && !this.dead && !this.pipeTransition) {
            this.throwFireball();
        }
    }

    releaseRun() {
        this.running = false;
    }

    pressCrouch() {
        this.inputDown = true;
        this.crouching = this.playerState !== 'small' && this.grounded;
    }

    releaseCrouch() {
        this.inputDown = false;
        this.crouching = false;
    }

    throwFireball() {
        // Max 2 fireballs on screen
        const fireballs = this.entities.filter(e => e.type === 'fireball' && e.active);
        if (fireballs.length >= 2) return;
        nesAudio.playSFX('smb_fireball');
        this.entities.push(MarioEntities.create('fireball',
            this.playerX + (this.playerDir === 1 ? 12 : -8),
            this.playerY + 4,
            { dir: this.playerDir }
        ));
    }

    // ---- TILE HELPERS ----

    getTile(col, row) {
        // row includes HUD offset: actual tile row = row - 2
        const tileRow = row - 2;
        if (!this.tiles) return 0;
        if (col < 0 || col >= this.levelWidth || tileRow < 0 || tileRow >= this.levelHeight) {
            return 0;
        }
        return this.tiles[tileRow * this.levelWidth + col] || 0;
    }

    setTile(col, row, val) {
        const tileRow = row - 2;
        if (!this.tiles || col < 0 || col >= this.levelWidth || tileRow < 0 || tileRow >= this.levelHeight) return;
        this.tiles[tileRow * this.levelWidth + col] = val;
    }

    isSolid(tile) {
        // GROUND=1, BRICK=2, Q variants=3-7, USED=8, HARD=9, PIPE=10-13
        // CASTLE=18, CLOUD=19, TREETOP=20, STAIR=22, CORAL=25, INVIS_BLOCK=26
        return (tile >= 1 && tile <= 13) || tile === 18 || tile === 19 || tile === 20 || tile === 22 || tile === 25 || tile === 26;
    }

    isBreakable(tile) {
        return tile === 2; // brick
    }

    isQuestion(tile) {
        return tile >= 3 && tile <= 7;
    }

    isPipe(tile) {
        return tile >= 10 && tile <= 13;
    }

    // ---- COLLISION ----

    // Player -> Tile collision (fixed order: X first, then Y, with fresh bounds each time)
    collideTiles() {
        const T = this.TILE;
        const pw = this.playerW;
        const ph = this.playerH;

        // --- HORIZONTAL COLLISION (X-axis) ---
        // Use a slightly inset hitbox vertically to avoid catching on edges
        const inset = 2;
        let topRow = Math.floor((this.playerY + inset) / T);
        let bottomRow = Math.floor((this.playerY + ph - 1 - inset) / T);

        if (this.playerVX < 0) {
            // Moving left - check left edge
            const leftCol = Math.floor(this.playerX / T);
            for (let r = topRow; r <= bottomRow; r++) {
                if (this.isSolid(this.getTile(leftCol, r))) {
                    this.playerX = (leftCol + 1) * T;
                    this.playerVX = 0;
                    break;
                }
            }
        } else if (this.playerVX > 0) {
            // Moving right - check right edge
            const rightCol = Math.floor((this.playerX + pw - 1) / T);
            for (let r = topRow; r <= bottomRow; r++) {
                if (this.isSolid(this.getTile(rightCol, r))) {
                    this.playerX = rightCol * T - pw;
                    this.playerVX = 0;
                    break;
                }
            }
        }

        // --- VERTICAL COLLISION (Y-axis) --- recalculate columns after X resolved
        const leftCol = Math.floor(this.playerX / T);
        const rightCol = Math.floor((this.playerX + pw - 1) / T);

        // Check ground (feet) - falling or standing
        let onGround = false;
        if (this.playerVY >= 0) {
            const feetRow = Math.floor((this.playerY + ph) / T);
            for (let c = leftCol; c <= rightCol; c++) {
                if (this.isSolid(this.getTile(c, feetRow))) {
                    onGround = true;
                    this.playerY = feetRow * T - ph;
                    this.playerVY = 0;
                    break;
                }
            }
            // Also check if we're embedded in a tile (fast fall tunneling protection)
            if (!onGround) {
                const embedRow = Math.floor((this.playerY + ph - 1) / T);
                for (let c = leftCol; c <= rightCol; c++) {
                    if (this.isSolid(this.getTile(c, embedRow))) {
                        onGround = true;
                        this.playerY = embedRow * T - ph;
                        this.playerVY = 0;
                        break;
                    }
                }
            }
        }

        this.grounded = onGround;
        if (onGround) {
            this.jumping = false;
            this.stompChain = 0;
        }

        // Check head (bonk blocks from below) - only when moving up
        if (this.playerVY < 0) {
            const headRow = Math.floor(this.playerY / T);
            for (let c = leftCol; c <= rightCol; c++) {
                const tile = this.getTile(c, headRow);
                if (this.isSolid(tile)) {
                    this.playerY = (headRow + 1) * T;
                    this.playerVY = 0;
                    this.bonkBlock(c, headRow, tile);
                    break;
                }
            }
        }

        // --- COIN COLLECTION ---
        topRow = Math.floor(this.playerY / T);
        bottomRow = Math.floor((this.playerY + ph - 1) / T);
        for (let r = topRow; r <= bottomRow; r++) {
            for (let c = leftCol; c <= rightCol; c++) {
                const tile = this.getTile(c, r);
                if (tile === 21) { // coin
                    this.setTile(c, r, 0);
                    this.collectCoin();
                }
            }
        }

        // --- PIPE ENTRY ---
        if (this.inputDown && this.grounded && !this.pipeTransition) {
            const playerCenterCol = Math.floor((this.playerX + pw / 2) / T);
            if (this.levelData && this.levelData.pipes) {
                for (const pipe of this.levelData.pipes) {
                    // Player must be standing on/near the pipe entrance
                    // enterCol is the left tile of the pipe, pipe is 2 tiles wide
                    const onPipeX = playerCenterCol >= pipe.enterCol && playerCenterCol <= pipe.enterCol + 1;
                    const pipeEnterScreenRow = pipe.enterRow + 2;
                    const feetRow = Math.floor((this.playerY + ph) / T);
                    const onPipeY = feetRow === pipeEnterScreenRow || feetRow === pipeEnterScreenRow + 1;
                    if (onPipeX && onPipeY) {
                        this.enterPipe(pipe);
                        break;
                    }
                }
            }
        }

        // --- AXE CHECK (castle) ---
        // BUG FIX #4: Widen axe detection to <= 2 rows to account for bridge/axe mismatch
        if (this.levelData && this.levelData.axe && !this.bowserDefeated) {
            const axeCol = this.levelData.axe.col;
            const axeRow = this.levelData.axe.row + 2;
            const playerCol = Math.floor((this.playerX + pw / 2) / T);
            const playerRow = Math.floor((this.playerY + ph / 2) / T);
            if (Math.abs(playerCol - axeCol) <= 1 && Math.abs(playerRow - axeRow) <= 2) {
                this.defeatBowser();
            }
        }

        // --- PIT DEATH ---
        if (this.playerY > this.SCREEN_H + 16) {
            this.die();
        }
    }

    bonkBlock(col, row, tile) {
        if (this.isQuestion(tile)) {
            this.activateQuestionBlock(col, row, tile);
            nesAudio.playSFX('smb_bump');
        } else if (this.isBreakable(tile)) {
            if (this.playerState !== 'small') {
                // Break brick
                this.setTile(col, row, 0);
                nesAudio.playSFX('smb_break');
                this.addScore(50);
                // Spawn brick particles
                for (let i = 0; i < 4; i++) {
                    this.particles.push({
                        type: 'brick',
                        x: col * this.TILE + (i % 2) * 8,
                        y: row * this.TILE,
                        vx: (i % 2 === 0 ? -1.5 : 1.5) + Math.random(),
                        vy: -3 - Math.random() * 2,
                        life: 30
                    });
                }
                // Check if enemy on top
                for (const e of this.entities) {
                    if (e.active && e.canBeKilledByBlock) {
                        const eCol = Math.floor((e.x + 8) / this.TILE);
                        const eRow = Math.floor(e.y / this.TILE);
                        if (eCol === col && eRow === row - 1) {
                            e.die();
                            this.addScore(100);
                        }
                    }
                }
            } else {
                nesAudio.playSFX('smb_bump');
                // Bump enemies on top
                for (const e of this.entities) {
                    if (e.active && e.canBeKilledByBlock) {
                        const eCol = Math.floor((e.x + 8) / this.TILE);
                        const eRow = Math.floor(e.y / this.TILE);
                        if (eCol === col && eRow === row - 1) {
                            e.die();
                            this.addScore(100);
                        }
                    }
                }
            }
        } else if (tile === 26) {
            // Invisible block - reveal as used
            this.setTile(col, row, 8);
            this.spawnItemFromBlock(col, row, 'coin');
            nesAudio.playSFX('smb_bump');
        }
    }

    activateQuestionBlock(col, row, tile) {
        this.setTile(col, row, 8); // used block
        switch(tile) {
            case 3: // coin
                this.spawnItemFromBlock(col, row, 'coin');
                break;
            case 4: // mushroom/fire flower
                if (this.playerState === 'small') {
                    this.spawnItemFromBlock(col, row, 'mushroom');
                } else {
                    this.spawnItemFromBlock(col, row, 'flower');
                }
                break;
            case 5: // star
                this.spawnItemFromBlock(col, row, 'star');
                break;
            case 6: // 1-up
                this.spawnItemFromBlock(col, row, '1up');
                break;
            case 7: // multi-coin (10 coins)
                this.spawnItemFromBlock(col, row, 'coin');
                // Multi-coin blocks revert to ? until depleted
                // For simplicity, just give coin
                break;
        }
    }

    spawnItemFromBlock(col, row, itemType) {
        const x = col * this.TILE;
        const y = row * this.TILE;

        if (itemType === 'coin') {
            this.collectCoin();
            // Coin particle animation
            this.particles.push({
                type: 'coin',
                x: x + 4,
                y: y - 16,
                vy: -4,
                life: 20,
                frame: 0
            });
        } else {
            this.entities.push(MarioEntities.create(itemType, x, y - this.TILE, { fromBlock: true }));
            nesAudio.playSFX('smb_powerup_appear');
        }
    }

    collectCoin() {
        this.coins++;
        this.addScore(200);
        nesAudio.playSFX('smb_coin');
        if (this.coins >= 100) {
            this.coins -= 100;
            this.lives++;
            nesAudio.playSFX('smb_1up');
        }
    }

    addScore(points) {
        this.score += points;
    }

    showScorePopup(x, y, text) {
        this.scorePopups.push({ x, y, text: String(text), life: 30 });
    }

    // ---- PIPE TRANSITION ----

    enterPipe(pipe) {
        this.pipeTransition = true;
        this.pipeTimer = 30;
        this.pipeDir = pipe.direction || 'down';
        this.pipeTarget = pipe;
        nesAudio.playSFX('smb_pipe');
    }

    exitPipe() {
        const pipe = this.pipeTarget;
        if (!pipe) {
            this.pipeTransition = false;
            return;
        }

        if (pipe.exitWorld && pipe.exitStage) {
            // Warp to another level
            this.loadLevel(pipe.exitWorld, pipe.exitStage);
            if (pipe.exitCol !== undefined) {
                this.playerX = pipe.exitCol * this.TILE;
                this.playerY = (pipe.exitRow + 2) * this.TILE - this.playerH;
            }
        } else if (pipe.exitCol !== undefined) {
            // Same level warp
            this.playerX = pipe.exitCol * this.TILE;
            this.playerY = (pipe.exitRow + 2) * this.TILE - this.playerH;
            if (pipe.exitCameraX !== undefined) {
                this.cameraX = pipe.exitCameraX;
            }
        }

        this.pipeTransition = false;
        this.pipeTarget = null;
        this.pipeTimer = 0;
    }

    // ---- FLAGPOLE ----

    touchFlagpole() {
        if (this.flagSliding || this.levelComplete) return;
        if (!this.levelData || !this.levelData.flagpole) return;

        const flagCol = this.levelData.flagpole.col;
        const playerCol = Math.floor((this.playerX + this.playerW / 2) / this.TILE);

        if (Math.abs(playerCol - flagCol) <= 1) {
            this.flagSliding = true;
            this.flagTimer = 0;
            this.playerX = flagCol * this.TILE - 2;
            this.playerVX = 0;
            this.playerVY = 0;

            // Score based on height
            const poleTop = (3 + 2) * this.TILE;
            const poleBot = (12 + 2) * this.TILE;
            const ratio = 1 - (this.playerY - poleTop) / (poleBot - poleTop);
            const idx = Math.min(4, Math.floor(ratio * 5));
            const points = this.FLAGPOLE_SCORES[Math.max(0, idx)];
            this.addScore(points);
            this.showScorePopup(this.playerX, this.playerY, points);
            nesAudio.playSFX('smb_flagpole');

            nesAudio.stopMusic();
        }
    }

    // ---- BOWSER / CASTLE ----

    defeatBowser() {
        this.bowserDefeated = true;
        this.bridgeCollapsing = true;
        this.bridgeTimer = 60;
        nesAudio.stopMusic();
        nesAudio.playSFX('smb_bowserfall');

        // Kill Bowser entity
        for (const e of this.entities) {
            if (e.type === 'bowser' && e.active) {
                e.die();
            }
        }

        // Remove bridge tiles
        if (this.levelData.bridge) {
            const bridge = this.levelData.bridge;
            for (let c = bridge.startCol; c <= bridge.endCol; c++) {
                this.setTile(c, bridge.row + 2, 0);
            }
        }
    }

    showCastleMessage() {
        this.showMessage = true;
        this.messageTimer = 240; // 4 seconds

        if (this.level === 8 && this.stage === 4) {
            this.message = `THANK YOU SUPER ${this.playerName}!\n\nYOUR QUEST IS OVER.\n\nPRINCESS AVA IS HERE.`;
        } else {
            this.message = `THANK YOU SUPER ${this.playerName}!\n\nBUT PRINCESS AVA IS\nIN ANOTHER CASTLE!`;
        }
    }

    // ---- DAMAGE / DEATH ----

    takeDamage() {
        if (this.invincible || this.damageTimer > 0 || this.starPower || this.dead) return;

        if (this.playerState === 'fire') {
            this.playerState = 'super';
            this.damageTimer = 120;
            this.shrinkTimer = 0; // no shrink anim for fire->super
            nesAudio.playSFX('smb_powerdown');
        } else if (this.playerState === 'super') {
            this.playerState = 'small';
            this.playerH = 16;
            this.playerY += 16; // adjust position
            this.damageTimer = 120;
            this.shrinkTimer = 30;
            nesAudio.playSFX('smb_powerdown');
        } else {
            this.die();
        }
    }

    powerUp(type) {
        if (type === 'mushroom') {
            if (this.playerState === 'small') {
                this.playerState = 'super';
                this.playerH = 28;
                this.playerY -= 12;
                this.growTimer = 30;
                nesAudio.playSFX('smb_powerup');
                this.addScore(1000);
            }
        } else if (type === 'flower') {
            if (this.playerState !== 'small') {
                this.playerState = 'fire';
                nesAudio.playSFX('smb_powerup');
                this.addScore(1000);
            } else {
                this.playerState = 'super';
                this.playerH = 28;
                this.playerY -= 12;
                this.growTimer = 30;
                nesAudio.playSFX('smb_powerup');
                this.addScore(1000);
            }
        } else if (type === 'star') {
            this.starPower = true;
            this.starTimer = 720; // ~12 seconds
            nesAudio.playSFX('smb_powerup');
            this.addScore(1000);
            nesAudio.playMusic('mario', 'STAR');
        } else if (type === '1up') {
            this.lives++;
            nesAudio.playSFX('smb_1up');
        }
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.deathTimer = 90;
        this.playerVY = -5;
        this.playerVX = 0;
        nesAudio.stopMusic();
        nesAudio.playSFX('smb_die');
    }

    // ---- ENTITY COLLISION ----

    checkEntityCollisions() {
        for (const e of this.entities) {
            if (!e.active || e.type === 'fireball' || e.noPlayerCollide) continue;

            // Check overlap
            const overlap = this.playerX < e.x + e.width &&
                           this.playerX + this.playerW > e.x &&
                           this.playerY < e.y + e.height &&
                           this.playerY + this.playerH > e.y;

            if (!overlap) continue;

            if (e.isItem) {
                // Collect item
                e.collect(this);
                continue;
            }

            if (this.starPower && e.isEnemy) {
                // Star kills enemies on contact
                e.die();
                this.addScore(200);
                this.showScorePopup(e.x, e.y, '200');
                continue;
            }

            if (e.isEnemy) {
                // Check if stomping (player moving down, feet near top of enemy)
                const playerBottom = this.playerY + this.playerH;
                const playerWasFalling = this.playerVY >= 0;

                // NES SMB stomp: player's feet must be above the enemy's vertical midpoint
                if (playerWasFalling && playerBottom <= e.y + e.height * 0.6 && e.canBeStomp) {
                    // Stomp!
                    e.onStomp(this);
                    this.playerVY = -3; // bounce
                    const scoreIdx = Math.min(this.stompChain, this.STOMP_SCORES.length - 1);
                    if (this.stompChain >= this.STOMP_SCORES.length) {
                        this.lives++;
                        this.showScorePopup(e.x, e.y, '1UP');
                    } else {
                        const pts = this.STOMP_SCORES[scoreIdx];
                        this.addScore(pts);
                        this.showScorePopup(e.x, e.y, pts);
                    }
                    this.stompChain++;
                    nesAudio.playSFX('smb_stomp');
                } else if (e.isDangerous) {
                    this.takeDamage();
                } else if (e.inShell && !e.shellMoving && e.shellKickTimer <= 0) {
                    // Kick a still shell from the side
                    e.onStomp(this);
                }
            }
        }
    }

    // ---- FIREBALL -> ENTITY COLLISION ----

    checkFireballCollisions() {
        for (const fb of this.entities) {
            if (fb.type !== 'fireball' || !fb.active) continue;
            for (const e of this.entities) {
                if (!e.active || !e.isEnemy) continue;
                if (fb.x < e.x + e.width && fb.x + 8 > e.x &&
                    fb.y < e.y + e.height && fb.y + 8 > e.y) {
                    if (e.type === 'bowser' && e.hitByFireball) {
                        // Bowser takes HP damage from fireballs
                        e.hitByFireball(this);
                        fb.active = false;
                        nesAudio.playSFX('smb_kick');
                    } else if (!e.fireproof) {
                        e.die();
                        fb.active = false;
                        this.addScore(200);
                        this.showScorePopup(e.x, e.y, '200');
                        nesAudio.playSFX('smb_kick');
                    }
                    // Fireproof enemies (BulletBill, BowserFire, BuzzyBeetle) destroy fireball but survive
                    else {
                        fb.active = false;
                    }
                    break; // fireball consumed
                }
            }
        }
    }

    // ---- UPDATE ----

    update() {
        if (this.gameOver || this.paused) return;

        this.frameCount++;

        // Death animation
        if (this.dead) {
            this.deathTimer--;
            if (this.deathTimer > 60) {
                // Pause before rising
            } else if (this.deathTimer > 0) {
                this.playerVY += 0.3;
                this.playerY += this.playerVY;
            } else {
                // Respawn or game over
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver = true;
                    nesAudio.playSFX('smb_gameover');
                } else {
                    this.dead = false;
                    this.playerState = 'small';
                    this.playerH = 16;
                    this.loadLevel(this.level, this.stage);
                }
            }
            return;
        }

        // Level complete sequence
        if (this.levelComplete) {
            this.levelCompleteTimer--;
            if (this.levelCompleteTimer <= 0) {
                this.advanceLevel();
            } else if (this.timer > 0 && this.levelCompleteTimer < 180) {
                // Count down remaining time for points
                this.timer--;
                this.addScore(50);
            }
            return;
        }

        // Message display (castle)
        if (this.showMessage) {
            this.messageTimer--;
            if (this.messageTimer <= 0) {
                this.showMessage = false;
                if (this.level === 8 && this.stage === 4) {
                    this.won = true;
                    this.gameOver = true;
                } else {
                    this.advanceLevel();
                }
            }
            return;
        }

        // Bridge collapse
        if (this.bridgeCollapsing) {
            this.bridgeTimer--;
            if (this.bridgeTimer <= 0) {
                this.bridgeCollapsing = false;
                // Walk to the right to find toad/princess
                this.showCastleMessage();
            }
            return;
        }

        // Flag sliding
        if (this.flagSliding) {
            this.flagTimer++;
            this.playerY += 2;
            if (this.playerY >= this.flagBaseY - this.playerH) {
                this.playerY = this.flagBaseY - this.playerH;
                this.flagSliding = false;
                this.levelComplete = true;
                this.levelCompleteTimer = 240;
                nesAudio.playSFX('smb_stageclear');
            }
            return;
        }

        // Pipe transition
        if (this.pipeTransition) {
            this.pipeTimer--;
            if (this.pipeDir === 'down') this.playerY += 1;
            else if (this.pipeDir === 'up') this.playerY -= 1;
            if (this.pipeTimer <= 0) {
                this.exitPipe();
            }
            return;
        }

        // Grow/shrink animation
        if (this.growTimer > 0) {
            this.growTimer--;
            return;
        }
        if (this.shrinkTimer > 0) {
            this.shrinkTimer--;
            return;
        }

        // Timer
        if (this.damageTimer > 0) this.damageTimer--;
        if (this.invTimer > 0) this.invTimer--;

        // Star power
        if (this.starPower) {
            this.starTimer--;
            if (this.starTimer <= 0) {
                this.starPower = false;
                // Resume normal music based on level type
                if (this.levelType === 'underground') nesAudio.playMusic('mario', 'B');
                else if (this.levelType === 'castle') nesAudio.playMusic('mario', 'C');
                else if (this.levelType === 'underwater') nesAudio.playMusic('mario', 'UNDERWATER');
                else nesAudio.playMusic('mario', 'A');
            }
        }

        this.timerFrames++;
        if (this.timerFrames >= this.TIMER_TICK_FRAMES) {
            this.timerFrames = 0;
            if (this.timer > 0) {
                this.timer--;
                if (this.timer === 100 && !this.timerWarning) {
                    this.timerWarning = true;
                    nesAudio.playSFX('smb_timewarning');
                }
                if (this.timer <= 0) {
                    this.die();
                }
            }
        }

        // Player physics
        this.updatePlayer();

        // Tile collision
        this.collideTiles();

        // Check flagpole
        if (this.levelData && this.levelData.flagpole && !this.flagSliding && !this.levelComplete) {
            const flagCol = this.levelData.flagpole.col;
            const playerCol = Math.floor((this.playerX + this.playerW / 2) / this.TILE);
            if (playerCol >= flagCol && this.playerX > this.cameraX) {
                this.touchFlagpole();
            }
        }

        // Activate entities as they scroll into view
        this.activateEntities();

        // Update entities
        for (const e of this.entities) {
            if (e.active) {
                e.update(this);
            }
        }

        // Entity collisions
        this.checkEntityCollisions();
        this.checkFireballCollisions();

        // Update particles
        this.updateParticles();

        // Update score popups
        for (const sp of this.scorePopups) {
            sp.y -= 1;
            sp.life--;
        }
        this.scorePopups = this.scorePopups.filter(sp => sp.life > 0);

        // Clean dead entities
        this.entities = this.entities.filter(e => e.active || e.deathTimer > 0);

        // Camera
        this.updateCamera();

        // Animation
        this.animCounter++;
        if (this.animCounter >= 6) {
            this.animCounter = 0;
            if (Math.abs(this.playerVX) > 0.1 && this.grounded) {
                this.animFrame = (this.animFrame + 1) % 3;
            }
        }
    }

    updatePlayer() {
        // BUG FIX #10: Set player height at START of updatePlayer to avoid 1-frame desync
        this.playerH = this.playerState === 'small' ? 16 : 28;

        const maxSpeed = this.running ? this.RUN_MAX : this.WALK_MAX;
        const accel = this.running ? this.RUN_ACCEL : this.WALK_ACCEL;

        // Horizontal
        if (this.inputLeft && !this.crouching) {
            this.playerDir = -1;
            if (this.playerVX > 0) {
                // Skidding
                this.playerVX -= this.SKID_DECEL;
            } else {
                this.playerVX -= accel;
                if (this.playerVX < -maxSpeed) this.playerVX = -maxSpeed;
            }
        } else if (this.inputRight && !this.crouching) {
            this.playerDir = 1;
            if (this.playerVX < 0) {
                this.playerVX += this.SKID_DECEL;
            } else {
                this.playerVX += accel;
                if (this.playerVX > maxSpeed) this.playerVX = maxSpeed;
            }
        } else {
            // Friction
            if (this.playerVX > 0) {
                this.playerVX -= this.FRICTION;
                if (this.playerVX < 0) this.playerVX = 0;
            } else if (this.playerVX < 0) {
                this.playerVX += this.FRICTION;
                if (this.playerVX > 0) this.playerVX = 0;
            }
        }

        this.playerX += this.playerVX;

        // Keep player on screen (can't scroll left past camera)
        if (this.playerX < this.cameraX) {
            this.playerX = this.cameraX;
            this.playerVX = 0;
        }

        // Gravity - NES SMB: holding jump reduces gravity for higher jumps
        if (this.underwater) {
            this.playerVY += this.SWIM_GRAVITY;
            if (this.playerVY > this.SWIM_MAX_FALL) this.playerVY = this.SWIM_MAX_FALL;
        } else {
            if (this.jumpHeld && this.playerVY < 0) {
                // Holding jump button while ascending = reduced gravity (higher jump)
                this.playerVY += this.JUMP_GRAVITY_HELD;
            } else if (this.playerVY < 0) {
                // Released jump while ascending = quick gravity (cut jump short)
                this.playerVY += this.JUMP_GRAVITY_RELEASE;
            } else {
                // Falling = normal gravity
                this.playerVY += this.GRAVITY;
            }
            if (this.playerVY > this.MAX_FALL) this.playerVY = this.MAX_FALL;
        }

        this.playerY += this.playerVY;

        // BUG FIX #6: Underwater ceiling bounds check
        if (this.underwater && this.playerY < 32) {
            this.playerY = 32;
            this.playerVY = 0;
        }
    }

    updateCamera() {
        // NES SMB: camera follows player, keeps them ~80px from left edge
        const targetX = this.playerX - 80;
        if (targetX > this.cameraX) {
            this.cameraX = targetX;
        }
        this.cameraX = Math.max(0, Math.min(this.cameraX, this.maxCameraX));
    }

    activateEntities() {
        const activateX = this.cameraX + this.SCREEN_W + 16;
        for (const e of this.entities) {
            if (!e.activated && e.x < activateX && e.x > this.cameraX - 32) {
                e.activated = true;
                e.onActivate();
            }
        }
    }

    updateParticles() {
        for (const p of this.particles) {
            if (p.type === 'brick') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3;
            } else if (p.type === 'coin') {
                p.y += p.vy;
                p.vy += 0.3;
                p.frame++;
            }
            p.life--;
        }
        this.particles = this.particles.filter(p => p.life > 0);
    }

    advanceLevel() {
        if (this.stage < 4) {
            this.stage++;
        } else {
            this.level++;
            this.stage = 1;
            if (this.level > 8) {
                this.won = true;
                this.gameOver = true;
                return;
            }
        }
        this.loadLevel(this.level, this.stage);
        // Play correct music for the new level type
        if (this.levelType === 'underground') nesAudio.playMusic('mario', 'B');
        else if (this.levelType === 'castle') nesAudio.playMusic('mario', 'C');
        else if (this.levelType === 'underwater') nesAudio.playMusic('mario', 'UNDERWATER');
        else nesAudio.playMusic('mario', 'A');
    }

    // ---- RENDER ----

    render(ctx, nextCtx) {
        const T = this.TILE;
        const R = MarioRenderer;

        // Resize canvas if needed
        if (ctx.canvas.width !== 256 || ctx.canvas.height !== 240) {
            ctx.canvas.width = 256;
            ctx.canvas.height = 240;
        }

        // Background
        R.drawBackground(ctx, this.levelType, this.cameraX, this.frameCount);

        // Draw tiles (only visible ones)
        const startCol = Math.floor(this.cameraX / T);
        const endCol = Math.min(startCol + 17, this.levelWidth);

        for (let r = 0; r < this.levelHeight; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tile = this.getTile(c, r + 2);
                if (tile > 0) {
                    const sx = c * T - Math.floor(this.cameraX);
                    const sy = (r + 2) * T;
                    R.drawTile(ctx, tile, sx, sy, this.frameCount);
                }
            }
        }

        // Draw entities
        for (const e of this.entities) {
            if (!e.active && e.deathTimer <= 0) continue;
            const sx = e.x - Math.floor(this.cameraX);
            const sy = e.y;
            if (sx > -32 && sx < this.SCREEN_W + 32) {
                e.render(ctx, sx, sy, this.frameCount);
            }
        }

        // Draw player
        if (!this.dead || this.deathTimer > 60) {
            if (this.damageTimer > 0 && Math.floor(this.damageTimer / 3) % 2 === 0) {
                // Flashing invincibility - skip drawing
            } else if (this.growTimer > 0 && Math.floor(this.growTimer / 3) % 2 === 0) {
                // Growing animation - flash
            } else {
                const sx = this.playerX - Math.floor(this.cameraX);
                const sy = this.playerY;
                const palette = this.playerNum === 2 ? R.AIDIO_PALETTE : R.ASHIO_PALETTE;

                // Determine frame
                let frame = 0;
                if (!this.grounded) {
                    frame = 3; // jump
                } else if (Math.abs(this.playerVX) > 0.1 && ((this.playerVX > 0 && this.inputLeft) || (this.playerVX < 0 && this.inputRight))) {
                    frame = 5; // skid
                } else if (Math.abs(this.playerVX) > 0.1) {
                    frame = this.animFrame; // walk 0,1,2
                }

                if (this.playerState === 'small') {
                    R.drawPlayerSmall(ctx, sx, sy, palette, frame, this.playerDir, this.starPower, this.frameCount);
                } else {
                    R.drawPlayerBig(ctx, sx, sy, palette, frame, this.playerDir, this.starPower, this.frameCount, this.playerState === 'fire');
                }
            }
        } else if (this.dead && this.deathTimer <= 60) {
            // Death sprite floating up
            const sx = this.playerX - Math.floor(this.cameraX);
            const sy = this.playerY;
            const palette = this.playerNum === 2 ? R.AIDIO_PALETTE : R.ASHIO_PALETTE;
            R.drawPlayerSmall(ctx, sx, sy, palette, 4, this.playerDir, false, 0);
        }

        // Draw particles
        for (const p of this.particles) {
            const sx = p.x - Math.floor(this.cameraX);
            if (p.type === 'brick') {
                R.drawBrickParticle(ctx, sx, p.y);
            } else if (p.type === 'coin') {
                R.drawCoinParticle(ctx, sx, p.y, p.frame);
            }
        }

        // Draw score popups
        for (const sp of this.scorePopups) {
            const sx = sp.x - Math.floor(this.cameraX);
            R.drawScorePopup(ctx, sx, sp.y, sp.text);
        }

        // Flag on flagpole
        if (this.levelData && this.levelData.flagpole) {
            const flagCol = this.levelData.flagpole.col;
            const flagScreenX = flagCol * T - Math.floor(this.cameraX);
            let flagDrawY = this.flagY;
            if (this.flagSliding) {
                flagDrawY = Math.min(this.playerY - 8, this.flagBaseY - 16);
            }
            R.drawTile(ctx, 29, flagScreenX - 8, flagDrawY, this.frameCount);
        }

        // BUG FIX #8: Warp Zone text display
        if (this.levelData && this.levelData.warpZone) {
            const wz = this.levelData.warpZone;
            const wzScreenX = wz.col * T - Math.floor(this.cameraX);
            if (wzScreenX < this.SCREEN_W && wzScreenX > -200) {
                // Draw "WELCOME TO WARP ZONE!" text
                ctx.fillStyle = '#FFF';
                ctx.font = '8px "Press Start 2P", monospace';
                const textX = wzScreenX + 8;
                ctx.fillText('WELCOME TO', textX, 60);
                ctx.fillText('WARP ZONE!', textX, 74);
                // Draw pipe destination numbers
                if (wz.destinations) {
                    const pipeSpacing = 8 * T; // pipes are 8 tiles apart
                    for (let i = 0; i < wz.destinations.length; i++) {
                        const pipeX = (wz.col + 5 + i * 8) * T - Math.floor(this.cameraX);
                        ctx.fillText(String(wz.destinations[i]), pipeX + 4, 52);
                    }
                }
            }
        }

        // HUD
        R.drawHUD(ctx, this.score, this.coins, this.level, this.stage, this.timer, this.playerName, this.lives);

        // Messages
        if (this.showMessage) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(0, 60, this.SCREEN_W, 120);
            ctx.fillStyle = '#FFF';
            ctx.font = '8px "Press Start 2P", monospace';
            const lines = this.message.split('\n');
            lines.forEach((line, i) => {
                ctx.fillText(line, 16, 80 + i * 14);
            });

            // Draw character in castle complete
            if (this.level === 8 && this.stage === 4) {
                R.drawPrincessAva(ctx, 120, 130);
            } else {
                R.drawToad(ctx, 130, 140);
            }
        }

        // Won overlay
        if (this.won) {
            ctx.fillStyle = 'rgba(0,0,0,0.9)';
            ctx.fillRect(0, 0, this.SCREEN_W, this.SCREEN_H);
            ctx.fillStyle = '#FFF';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillText('CONGRATULATIONS!', 40, 80);
            ctx.fillText(`SUPER ${this.playerName}`, 56, 100);
            ctx.fillText('SAVED PRINCESS AVA!', 32, 120);
            R.drawPrincessAva(ctx, 116, 140);
        }

        // Next canvas - show lives info
        if (nextCtx) {
            nextCtx.fillStyle = '#000';
            nextCtx.fillRect(0, 0, 80, 80);
            nextCtx.fillStyle = '#FFF';
            nextCtx.font = '8px "Press Start 2P", monospace';
            nextCtx.fillText(this.playerName, 4, 16);
            nextCtx.fillText('x ' + this.lives, 8, 40);
            nextCtx.fillText('W' + this.level + '-' + this.stage, 8, 60);
        }
    }
}
