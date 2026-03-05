// ============================================================
// Super Ashio Bros. 3 - Game Engine
// Full SMB3 clone with world map, suits, P-meter, flight
// ============================================================

class SuperMario3Engine {
    constructor() {
        this.reset();
    }

    reset() {
        // Game state
        this.gameState = 'title'; // title, worldmap, playing, dead, gameover, paused, victory
        this.paused = false;
        this.gameOver = false;
        this.frameCount = 0;

        // Player
        this.lives = 5;
        this.score = 0;
        this.coins = 0;
        this.suit = 0; // 0=small, 1=big, 2=fire, 3=raccoon, 4=frog, 5=tanooki, 6=hammer
        this.starPower = 0;

        // World map
        this.currentWorld = 0;
        this.currentNode = 0;
        this.mapCursor = 0;
        this.nodesCleared = {};
        this.worldCleared = {};

        // Inventory (up to 28 items like original)
        this.inventory = [];

        // Level state
        this.levelData = null;
        this.tiles = null;
        this.levelW = 0;
        this.levelH = 0;
        this.timer = 0;
        this.timerTick = 0;
        this.hurryUp = false;

        // Player physics
        this.px = 0;
        this.py = 0;
        this.pvx = 0;
        this.pvy = 0;
        this.pdir = 1; // 1=right, -1=left
        this.onGround = false;
        this.ducking = false;
        this.dead = false;
        this.deathTimer = 0;
        this.invincible = 0;
        this.pMeter = 0;
        this.flying = false;
        this.flyTimer = 0;
        this.tailAttack = 0;
        this.pipeTransition = 0;

        // Camera
        this.camX = 0;
        this.camY = 0;

        // Entities
        this.entities = [];
        this.particles = [];

        // Animation
        this.walkFrame = 0;
        this.walkTimer = 0;

        // Input state
        this.keys = { left: false, right: false, up: false, down: false, jump: false, run: false };
        this.jumpPressed = false;
        this.jumpHeld = false;

        // Goal
        this.goalReached = false;
        this.goalTimer = 0;
        this.cardGet = ''; // mushroom, flower, star

        // Level type for music
        this.levelType = 'overworld';

        // 2-player
        this.twoPlayer = false;
        this.currentPlayer = 1;
        this.needsSwitch = false;

        // Player 2 state backup
        this.p2 = {
            lives: 5, score: 0, coins: 0, suit: 0,
            currentWorld: 0, currentNode: 0,
            nodesCleared: {}, inventory: []
        };

        // DAS stubs for game.js compatibility
        this.dasTimer = 0;
        this.dasDirection = 0;
        this.dasActive = false;
        this.lastDirection = 0;
    }

    init(twoPlayer) {
        this.reset();
        this.twoPlayer = !!twoPlayer;
        this.gameState = 'worldmap';
        this.currentWorld = 0;
        this.currentNode = 0;
        this.mapCursor = 0;
    }

    // ========== CONSTANTS ==========
    static get TILE_SIZE() { return 16; }
    static get GRAVITY() { return 0.4; }
    static get MAX_FALL() { return 4.5; }
    static get WALK_ACCEL() { return 0.1; }
    static get RUN_ACCEL() { return 0.15; }
    static get MAX_WALK() { return 1.5; }
    static get MAX_RUN() { return 2.8; }
    static get FRICTION() { return 0.15; }
    static get JUMP_VEL() { return -4.5; }
    static get JUMP_VEL_RUN() { return -5.2; }
    static get FLY_VEL() { return -2.5; }
    static get P_METER_MAX() { return 112; }
    static get SWIM_GRAVITY() { return 0.15; }
    static get SWIM_JUMP() { return -2.5; }
    static get ICE_FRICTION() { return 0.03; }

    // ========== WORLD MAP ==========
    updateWorldMap() {
        // Map navigation handled by input
    }

    mapMove(dx, dy) {
        if (this.gameState !== 'worldmap') return;
        const world = Mario3Levels.worlds[this.currentWorld];
        if (!world) return;

        const currentId = world.nodes[this.mapCursor].id;
        // Find connected nodes via paths
        for (const [a, b] of world.paths) {
            let targetId = null;
            if (a === currentId) targetId = b;
            else if (b === currentId) targetId = a;
            if (!targetId) continue;

            const targetNode = world.nodes.find(n => n.id === targetId);
            const currentNode = world.nodes[this.mapCursor];
            if (!targetNode) continue;

            const tdx = targetNode.x - currentNode.x;
            const tdy = targetNode.y - currentNode.y;

            if ((dx > 0 && tdx > 0) || (dx < 0 && tdx < 0) ||
                (dy > 0 && tdy > 0) || (dy < 0 && tdy < 0)) {
                // Check if path is accessible
                const targetIdx = world.nodes.indexOf(targetNode);
                // Can always move to cleared nodes or the next uncleared one
                const prevNodeId = world.nodes[targetIdx - 1]?.id;
                if (targetIdx === 0 || this.nodesCleared[targetNode.id] ||
                    this.nodesCleared[prevNodeId] || targetNode.type === 'start') {
                    this.mapCursor = targetIdx;
                    nesAudio.playSFX('smb3_mapMove');
                    break;
                }
            }
        }
    }

    mapSelect() {
        if (this.gameState !== 'worldmap') return;
        const world = Mario3Levels.worlds[this.currentWorld];
        if (!world) return;

        const node = world.nodes[this.mapCursor];
        if (node.type === 'start') return;
        if (this.nodesCleared[node.id]) return; // already cleared

        // Start level
        const levelIdx = node.levelIdx;
        if (levelIdx !== undefined && world.levels[levelIdx]) {
            this.startLevel(world.levels[levelIdx], node.id);
        }
    }

    startLevel(levelData, nodeId) {
        this.levelData = levelData;
        this.levelNodeId = nodeId;
        this.tiles = [];
        // Deep copy tiles
        for (let x = 0; x < levelData.width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < levelData.height; y++) {
                this.tiles[x][y] = levelData.tiles[x][y];
            }
        }
        this.levelW = levelData.width;
        this.levelH = levelData.height;
        this.timer = levelData.timer || 300;
        this.timerTick = 0;
        this.hurryUp = false;
        this.levelType = levelData.type || 'overworld';

        // Player start
        this.px = (levelData.playerStart?.x || 2) * 16;
        this.py = (levelData.playerStart?.y || 12) * 16;
        this.pvx = 0;
        this.pvy = 0;
        this.pdir = 1;
        this.onGround = false;
        this.ducking = false;
        this.dead = false;
        this.deathTimer = 0;
        this.goalReached = false;
        this.goalTimer = 0;
        this.pMeter = 0;
        this.flying = false;
        this.flyTimer = 0;
        this.tailAttack = 0;
        this.pipeTransition = 0;

        this.camX = 0;
        this.camY = 0;

        // Spawn entities
        this.entities = [];
        if (levelData.entities) {
            for (const e of levelData.entities) {
                const entity = Mario3Entities.create(e.type, e.x * 16, e.y * 16, e.opts || {});
                if (entity) this.entities.push(entity);
            }
        }

        this.particles = [];
        this.gameState = 'playing';
    }

    // ========== INPUT ==========
    pressJump() {
        if (this.gameState === 'worldmap') {
            this.mapSelect();
            return;
        }
        if (this.gameState !== 'playing' || this.dead) return;
        this.jumpPressed = true;
        this.jumpHeld = true;
    }

    releaseJump() {
        this.jumpHeld = false;
    }

    pressRun() {
        if (this.gameState === 'playing' && !this.dead) {
            // Tail attack for raccoon/tanooki
            if ((this.suit === 3 || this.suit === 5) && this.tailAttack <= 0) {
                this.tailAttack = 12;
                nesAudio.playSFX('smb3_tail');
            }
        }
    }

    releaseRun() {}

    // ========== MAIN UPDATE ==========
    update() {
        this.frameCount++;

        if (this.gameState === 'worldmap') {
            this.updateWorldMap();
            return;
        }

        if (this.gameState !== 'playing') return;
        if (this.paused) return;

        if (this.dead) {
            this.deathTimer--;
            if (this.deathTimer > 40) {
                // Rising
            } else {
                this.pvy += SuperMario3Engine.GRAVITY;
                this.py += this.pvy;
            }
            if (this.deathTimer <= 0) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameState = 'gameover';
                    this.gameOver = true;
                } else {
                    this.gameState = 'worldmap';
                }
            }
            return;
        }

        if (this.goalReached) {
            this.updateGoal();
            return;
        }

        // Timer
        this.timerTick++;
        if (this.timerTick >= 24) {
            this.timerTick = 0;
            this.timer--;
            if (this.timer === 100 && !this.hurryUp) {
                this.hurryUp = true;
            }
            if (this.timer <= 0) {
                this.die();
                return;
            }
        }

        // Star power
        if (this.starPower > 0) {
            this.starPower--;
            if (this.starPower <= 0) {
                this.starPower = 0;
            }
        }

        // Invincibility frames
        if (this.invincible > 0) this.invincible--;

        // Tail attack timer
        if (this.tailAttack > 0) this.tailAttack--;

        this.updatePlayer();
        this.updateEntities();
        this.checkPlayerEntityCollisions();
        this.updateParticles();
        this.updateCamera();
    }

    // ========== PLAYER PHYSICS ==========
    updatePlayer() {
        const isUnderwater = this.levelData?.isUnderwater;
        const isIce = this.levelData?.isIce;
        const friction = isIce ? SuperMario3Engine.ICE_FRICTION : SuperMario3Engine.FRICTION;
        const runHeld = this.keys.run;

        // Horizontal movement
        if (this.keys.left && !this.ducking) {
            this.pdir = -1;
            const accel = runHeld ? SuperMario3Engine.RUN_ACCEL : SuperMario3Engine.WALK_ACCEL;
            this.pvx -= accel;
        } else if (this.keys.right && !this.ducking) {
            this.pdir = 1;
            const accel = runHeld ? SuperMario3Engine.RUN_ACCEL : SuperMario3Engine.WALK_ACCEL;
            this.pvx += accel;
        } else {
            // Friction
            if (this.pvx > 0) {
                this.pvx -= friction;
                if (this.pvx < 0) this.pvx = 0;
            } else if (this.pvx < 0) {
                this.pvx += friction;
                if (this.pvx > 0) this.pvx = 0;
            }
        }

        // Speed cap
        const maxSpeed = runHeld ? SuperMario3Engine.MAX_RUN : SuperMario3Engine.MAX_WALK;
        if (this.pvx > maxSpeed) this.pvx = maxSpeed;
        if (this.pvx < -maxSpeed) this.pvx = -maxSpeed;

        // P-Meter
        if (runHeld && Math.abs(this.pvx) >= SuperMario3Engine.MAX_RUN - 0.1 && this.onGround) {
            this.pMeter = Math.min(this.pMeter + 2, SuperMario3Engine.P_METER_MAX);
        } else if (this.onGround) {
            this.pMeter = Math.max(this.pMeter - 1, 0);
        }

        // Ducking
        if (this.keys.down && this.onGround && this.suit > 0) {
            this.ducking = true;
        } else {
            this.ducking = false;
        }

        // Jump
        if (this.jumpPressed) {
            this.jumpPressed = false;
            if (isUnderwater) {
                this.pvy = SuperMario3Engine.SWIM_JUMP;
                nesAudio.playSFX('smb3_jump');
            } else if (this.onGround) {
                // Flight from P-meter
                if (this.pMeter >= SuperMario3Engine.P_METER_MAX && (this.suit === 3 || this.suit === 5)) {
                    this.flying = true;
                    this.flyTimer = 180; // ~3 seconds
                    this.pvy = SuperMario3Engine.FLY_VEL;
                } else {
                    const vel = Math.abs(this.pvx) > SuperMario3Engine.MAX_WALK ?
                        SuperMario3Engine.JUMP_VEL_RUN : SuperMario3Engine.JUMP_VEL;
                    this.pvy = vel;
                }
                this.onGround = false;
                nesAudio.playSFX('smb3_jump');
            } else if (this.flying && this.flyTimer > 0) {
                this.pvy = SuperMario3Engine.FLY_VEL;
            }
        }

        // Variable jump height
        if (!this.jumpHeld && this.pvy < -1 && !isUnderwater) {
            this.pvy = -1;
        }

        // Gravity
        if (isUnderwater) {
            this.pvy += SuperMario3Engine.SWIM_GRAVITY;
            if (this.pvy > 2) this.pvy = 2;
        } else {
            // Raccoon/tanooki slow fall
            if ((this.suit === 3 || this.suit === 5) && this.pvy > 0 && this.jumpHeld && !this.flying) {
                this.pvy += SuperMario3Engine.GRAVITY * 0.4;
            } else {
                this.pvy += SuperMario3Engine.GRAVITY;
            }
            if (this.pvy > SuperMario3Engine.MAX_FALL) this.pvy = SuperMario3Engine.MAX_FALL;
        }

        // Flying deceleration
        if (this.flying) {
            this.flyTimer--;
            if (this.flyTimer <= 0) {
                this.flying = false;
            }
        }

        // Apply horizontal movement with collision
        this.px += this.pvx;
        this.resolveHorizontalCollision();

        // Apply vertical movement with collision
        this.py += this.pvy;
        this.resolveVerticalCollision();

        // Fall death
        if (this.py > this.levelH * 16 + 32) {
            this.die();
            return;
        }

        // Left boundary
        if (this.px < 0) { this.px = 0; this.pvx = 0; }

        // Walk animation
        if (Math.abs(this.pvx) > 0.1 && this.onGround) {
            this.walkTimer++;
            if (this.walkTimer > (runHeld ? 3 : 5)) {
                this.walkTimer = 0;
                this.walkFrame = (this.walkFrame + 1) % 3;
            }
        } else if (this.onGround) {
            this.walkFrame = 0;
            this.walkTimer = 0;
        }

        // Check coin tiles
        this.checkCoinPickup();

        // Check ? blocks and bricks
        if (this.pvy < 0) {
            this.checkBlockHit();
        }
    }

    // ========== COLLISION ==========
    // Supports both isSolid(tx, ty) and isSolid(tileValue) for entity compatibility
    isSolid(tx, ty) {
        if (ty === undefined) {
            // Called as isSolid(tileValue) from entities
            const t = tx;
            if (t === undefined || t === null) return false;
            return t >= 1 && t <= 10 || t === 12 || t === 13 || t === 15 || t === 18;
        }
        if (tx < 0 || tx >= this.levelW || ty < 0 || ty >= this.levelH) {
            return ty >= this.levelH; // bottom is solid
        }
        const t = this.tiles[tx][ty];
        return t >= 1 && t <= 10 || t === 12 || t === 13 || t === 15 || t === 18;
        // ground, brick, qblock, used, wood, note, pipes, ice, cloud, castle, stair
    }

    getTile(col, row) {
        if (col < 0 || col >= this.levelW || row < 0 || row >= this.levelH) return 0;
        return this.tiles[col][row];
    }

    get playerX() { return this.px; }
    get playerY() { return this.py; }
    get cameraX() { return this.camX; }
    get cameraY() { return this.camY; }

    addScore(points) { this.score += points; }
    showScorePopup(x, y, text) { this.addParticle(x, y, 'score_popup'); }

    isLava(tx, ty) {
        if (tx < 0 || tx >= this.levelW || ty < 0 || ty >= this.levelH) return false;
        return this.tiles[tx][ty] === 14;
    }

    getPlayerBounds() {
        const w = 14;
        const h = this.suit > 0 && !this.ducking ? 28 : 14;
        return {
            x: this.px + 1,
            y: this.py + (this.suit > 0 && !this.ducking ? 4 : 2),
            w, h
        };
    }

    resolveHorizontalCollision() {
        const b = this.getPlayerBounds();
        const T = SuperMario3Engine.TILE_SIZE;

        const ty1 = Math.floor(b.y / T);
        const ty2 = Math.floor((b.y + b.h - 1) / T);

        if (this.pvx > 0) {
            const tx = Math.floor((b.x + b.w) / T);
            for (let ty = ty1; ty <= ty2; ty++) {
                if (this.isSolid(tx, ty)) {
                    this.px = tx * T - b.w - 1;
                    this.pvx = 0;
                    break;
                }
            }
        } else if (this.pvx < 0) {
            const tx = Math.floor(b.x / T);
            for (let ty = ty1; ty <= ty2; ty++) {
                if (this.isSolid(tx, ty)) {
                    this.px = (tx + 1) * T - 1;
                    this.pvx = 0;
                    break;
                }
            }
        }
    }

    resolveVerticalCollision() {
        const b = this.getPlayerBounds();
        const T = SuperMario3Engine.TILE_SIZE;
        this.onGround = false;

        const tx1 = Math.floor(b.x / T);
        const tx2 = Math.floor((b.x + b.w - 1) / T);

        if (this.pvy > 0) {
            const ty = Math.floor((b.y + b.h) / T);
            for (let tx = tx1; tx <= tx2; tx++) {
                if (this.isSolid(tx, ty)) {
                    this.py = ty * T - b.h - (this.suit > 0 && !this.ducking ? 4 : 2);
                    this.pvy = 0;
                    this.onGround = true;
                    break;
                }
                if (this.isLava(tx, ty)) {
                    this.die();
                    return;
                }
            }
        } else if (this.pvy < 0) {
            const ty = Math.floor(b.y / T);
            for (let tx = tx1; tx <= tx2; tx++) {
                if (this.isSolid(tx, ty)) {
                    this.py = (ty + 1) * T - (this.suit > 0 && !this.ducking ? 4 : 2);
                    this.pvy = 0;
                    break;
                }
            }
        }
    }

    checkBlockHit() {
        const b = this.getPlayerBounds();
        const T = SuperMario3Engine.TILE_SIZE;
        const ty = Math.floor(b.y / T);
        const tx1 = Math.floor(b.x / T);
        const tx2 = Math.floor((b.x + b.w - 1) / T);

        for (let tx = tx1; tx <= tx2; tx++) {
            if (tx < 0 || tx >= this.levelW || ty < 0 || ty >= this.levelH) continue;
            const tile = this.tiles[tx][ty];

            if (tile === 3) { // QBLOCK
                this.tiles[tx][ty] = 4; // USED
                this.spawnBlockItem(tx, ty);
                nesAudio.playSFX('smb3_coin');
            } else if (tile === 2) { // BRICK
                if (this.suit > 0) {
                    // Break brick
                    this.tiles[tx][ty] = 0;
                    this.addParticle(tx * T, ty * T, 'brick_break');
                    nesAudio.playSFX('smb3_boom');
                    this.score += 10;
                } else {
                    // Bump brick
                    nesAudio.playSFX('smb3_boom');
                }
            } else if (tile === 6) { // NOTE block
                // Bounce player up
                this.pvy = -6;
                nesAudio.playSFX('smb3_jump');
            }
        }
    }

    spawnBlockItem(tx, ty) {
        const key = `${tx},${ty}`;
        const contents = this.levelData?.blockContents?.[key] || 'coin';

        switch (contents) {
            case 'coin':
                this.coins++;
                this.score += 100;
                if (this.coins >= 100) { this.coins -= 100; this.lives++; nesAudio.playSFX('smb3_1up'); }
                this.addParticle(tx * 16, ty * 16, 'coin_sparkle');
                break;
            case 'mushroom':
                if (this.suit === 0) {
                    this.entities.push(Mario3Entities.create('mushroom3', tx * 16, (ty - 1) * 16, { fromBlock: true }));
                } else {
                    this.entities.push(Mario3Entities.create('superLeaf', tx * 16, (ty - 1) * 16, { fromBlock: true }));
                }
                break;
            case 'leaf':
                this.entities.push(Mario3Entities.create('superLeaf', tx * 16, (ty - 1) * 16, { fromBlock: true }));
                break;
            case 'fire_flower':
                this.entities.push(Mario3Entities.create('fireFlower3', tx * 16, (ty - 1) * 16, { fromBlock: true }));
                break;
            case 'star':
                this.entities.push(Mario3Entities.create('star3', tx * 16, (ty - 1) * 16, { fromBlock: true }));
                break;
            case '1up':
                this.entities.push(Mario3Entities.create('mushroom3', tx * 16, (ty - 1) * 16, { isLife: true, fromBlock: true }));
                nesAudio.playSFX('smb3_1up');
                break;
            case 'frog':
                this.entities.push(Mario3Entities.create('frogSuit', tx * 16, (ty - 1) * 16));
                break;
            case 'tanooki':
                this.entities.push(Mario3Entities.create('tanookiSuit', tx * 16, (ty - 1) * 16));
                break;
            case 'hammer':
                this.entities.push(Mario3Entities.create('hammerSuit', tx * 16, (ty - 1) * 16));
                break;
        }
    }

    checkCoinPickup() {
        const T = SuperMario3Engine.TILE_SIZE;
        const b = this.getPlayerBounds();
        const tx1 = Math.floor(b.x / T);
        const tx2 = Math.floor((b.x + b.w - 1) / T);
        const ty1 = Math.floor(b.y / T);
        const ty2 = Math.floor((b.y + b.h - 1) / T);

        for (let tx = tx1; tx <= tx2; tx++) {
            for (let ty = ty1; ty <= ty2; ty++) {
                if (tx >= 0 && tx < this.levelW && ty >= 0 && ty < this.levelH) {
                    if (this.tiles[tx][ty] === 11) { // COIN
                        this.tiles[tx][ty] = 0;
                        this.coins++;
                        this.score += 100;
                        if (this.coins >= 100) { this.coins -= 100; this.lives++; nesAudio.playSFX('smb3_1up'); }
                        nesAudio.playSFX('smb3_coin');
                    }
                }
            }
        }
    }

    // ========== ENTITIES ==========
    updateEntities() {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const e = this.entities[i];
            if (!e.active) { this.entities.splice(i, 1); continue; }

            // Activate when near screen
            if (!e.activated && e.x < this.camX + 272) {
                e.activated = true;
            }
            if (!e.activated) continue;

            e.update(this);

            // Off screen removal (below level)
            if (e.y > this.levelH * 16 + 64) {
                e.active = false;
            }
        }
    }

    checkPlayerEntityCollisions() {
        if (this.dead || this.goalReached) return;
        const pb = this.getPlayerBounds();

        for (const e of this.entities) {
            if (!e.active || !e.activated) continue;

            const eb = { x: e.x, y: e.y, w: e.width || 16, h: e.height || 16 };

            if (!this.rectsOverlap(pb, eb)) continue;

            if (e.isItem) {
                this.collectItem(e);
                continue;
            }

            if (!e.isEnemy) continue;

            // Star power kills
            if (this.starPower > 0) {
                if (typeof e.die === 'function') {
                    e.die(this);
                    this.score += 200;
                    this.addParticle(e.x, e.y, 'enemy_poof');
                }
                continue;
            }

            // Tail attack
            if (this.tailAttack > 0 && (this.suit === 3 || this.suit === 5)) {
                if (typeof e.die === 'function' && !e.fireproof) {
                    e.die(this);
                    this.score += 200;
                    this.addParticle(e.x, e.y, 'enemy_poof');
                }
                continue;
            }

            // Stomp check
            if (this.pvy > 0 && pb.y + pb.h - 4 < eb.y + eb.h / 2) {
                if (e.canBeStomp && typeof e.onStomp === 'function') {
                    e.onStomp(this);
                    this.pvy = -4;
                    this.score += 100;
                    nesAudio.playSFX('smb3_stomp');
                    continue;
                }
            }

            // Player takes damage (only from dangerous enemies)
            if (e.isDangerous && this.invincible <= 0) {
                this.takeDamage();
            }
        }
    }

    collectItem(e) {
        if (!e.active) return;
        e.active = false;

        if (e.type === 'coin3') {
            this.coins++;
            this.score += 100;
            if (this.coins >= 100) { this.coins -= 100; this.lives++; nesAudio.playSFX('smb3_1up'); }
            nesAudio.playSFX('smb3_coin');
        } else if (e.type === 'mushroom3') {
            if (e.isLife) {
                this.lives++;
                nesAudio.playSFX('smb3_1up');
            } else if (this.suit === 0) {
                this.suit = 1;
                nesAudio.playSFX('smb3_powerup');
            }
            this.score += 1000;
        } else if (e.type === 'fireFlower3') {
            if (this.suit < 2) this.suit = 2;
            nesAudio.playSFX('smb3_powerup');
            this.score += 1000;
        } else if (e.type === 'superLeaf') {
            this.suit = 3;
            nesAudio.playSFX('smb3_powerup');
            this.score += 1000;
        } else if (e.type === 'star3') {
            this.starPower = 600;
            nesAudio.playSFX('smb3_powerup');
            this.score += 1000;
        } else if (e.type === 'frogSuit') {
            this.suit = 4;
            nesAudio.playSFX('smb3_powerup');
            this.score += 1000;
        } else if (e.type === 'tanookiSuit') {
            this.suit = 5;
            nesAudio.playSFX('smb3_powerup');
            this.score += 1000;
        } else if (e.type === 'hammerSuit') {
            this.suit = 6;
            nesAudio.playSFX('smb3_powerup');
            this.score += 1000;
        }
    }

    rectsOverlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x &&
               a.y < b.y + b.h && a.y + a.h > b.y;
    }

    // ========== DAMAGE & DEATH ==========
    takeDamage() {
        if (this.invincible > 0) return;

        if (this.suit > 1) {
            // Lose power-up, go to big
            this.suit = 1;
            this.invincible = 90;
            nesAudio.playSFX('smb3_pipe'); // damage sound
        } else if (this.suit === 1) {
            this.suit = 0;
            this.invincible = 90;
            nesAudio.playSFX('smb3_pipe');
        } else {
            this.die();
        }
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.deathTimer = 60;
        this.pvy = -5;
        this.pvx = 0;
        this.suit = 0;
        this.flying = false;
        this.pMeter = 0;
        this.needsSwitch = this.twoPlayer;
        nesAudio.stopMusic();
    }

    // ========== GOAL ==========
    updateGoal() {
        this.goalTimer++;

        if (this.goalTimer < 30) {
            // Walk right
            this.pvx = 1;
            this.px += this.pvx;
            this.pvy += SuperMario3Engine.GRAVITY;
            this.py += this.pvy;
            this.resolveVerticalCollision();
        } else if (this.goalTimer === 30) {
            // Card get
            const cards = ['mushroom', 'flower', 'star'];
            const idx = Math.floor(this.frameCount / 4) % 3;
            this.cardGet = cards[idx];
            nesAudio.playSFX('smb3_card');

            // Time bonus
            this.score += this.timer * 50;
        } else if (this.goalTimer > 90) {
            // Level complete
            this.nodesCleared[this.levelNodeId] = true;

            // Check if world complete (airship cleared)
            const world = Mario3Levels.worlds[this.currentWorld];
            const airshipNode = world?.nodes.find(n => n.type === 'airship');
            if (airshipNode && this.nodesCleared[airshipNode.id]) {
                this.worldCleared[this.currentWorld] = true;
                // Advance to next world
                if (this.currentWorld < 7) {
                    this.currentWorld++;
                    this.mapCursor = 0;
                } else {
                    // Game complete!
                    this.gameState = 'victory';
                    return;
                }
            } else {
                // Find next uncleared node
                if (world) {
                    for (let i = 0; i < world.nodes.length; i++) {
                        if (!this.nodesCleared[world.nodes[i].id] && world.nodes[i].type !== 'start') {
                            this.mapCursor = i;
                            break;
                        }
                    }
                }
            }

            // Add card to inventory
            if (this.cardGet) {
                this.inventory.push(this.cardGet);
                // 3 matching cards = bonus
                if (this.inventory.length >= 3) {
                    const last3 = this.inventory.slice(-3);
                    if (last3[0] === last3[1] && last3[1] === last3[2]) {
                        if (last3[0] === 'star') { this.lives += 5; }
                        else if (last3[0] === 'flower') { this.lives += 3; }
                        else { this.lives += 2; }
                        nesAudio.playSFX('smb3_1up');
                    }
                }
            }

            this.gameState = 'worldmap';
        }
    }

    checkGoalReached() {
        if (this.goalReached) return;

        // Position-based goal check
        const goalX = this.levelData?.goalX;
        if (goalX) {
            const ptx = Math.floor(this.px / 16);
            if (ptx >= goalX) {
                this.goalReached = true;
                this.goalTimer = 0;
                nesAudio.playSFX('smb3_stageclear');
                return;
            }
        }

        // Boss defeat check for fortress/airship/castle
        if (this.levelData?.isFortress || this.levelData?.isAirship || this.levelData?.isCastle) {
            // Wait until bosses have been activated before checking
            const hasBoss = this.entities.some(e =>
                e.isBoss && e.activated
            );
            if (!hasBoss && !this._bossActivated) return;
            this._bossActivated = true;

            const bossAlive = this.entities.some(e =>
                e.active && e.isBoss
            );
            if (!bossAlive && !this._bossDefeated) {
                this._bossDefeated = true;
                this.goalReached = true;
                this.goalTimer = 0;
                if (this.levelData.isFinalBoss) {
                    this.gameState = 'victory';
                    return;
                }
                nesAudio.playSFX('smb3_stageclear');
            }
        }
    }

    // ========== PARTICLES ==========
    addParticle(x, y, type) {
        this.particles.push({ x, y, type, timer: 30, vx: 0, vy: -2 });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.timer--;
            p.y += p.vy;
            p.x += p.vx;
            if (p.timer <= 0) this.particles.splice(i, 1);
        }
    }

    // ========== CAMERA ==========
    updateCamera() {
        const screenW = 256;
        const screenH = 240;

        // Follow player horizontally (never scroll left)
        const targetX = this.px - screenW / 3;
        if (targetX > this.camX) this.camX = targetX;

        // Clamp
        const maxCamX = this.levelW * 16 - screenW;
        if (this.camX > maxCamX) this.camX = maxCamX;
        if (this.camX < 0) this.camX = 0;

        // Vertical (for athletic/vertical levels)
        const targetY = this.py - screenH / 2;
        this.camY = Math.max(0, Math.min(targetY, this.levelH * 16 - screenH));

        // Check goal
        this.checkGoalReached();
    }

    // ========== FIREBALLS (Hammer suit throws hammers) ==========
    throwFireball() {
        if (this.suit === 2) {
            // Fire
            const fx = this.px + (this.pdir > 0 ? 12 : -4);
            const fy = this.py + 8;
            this.entities.push(Mario3Entities.create('fireball3', fx, fy, {
                dir: this.pdir, isPlayerFireball: true
            }));
            nesAudio.playSFX('smb3_fireball');
        } else if (this.suit === 6) {
            // Hammer
            const hx = this.px + (this.pdir > 0 ? 12 : -4);
            const hy = this.py;
            this.entities.push(Mario3Entities.create('fireball3', hx, hy, {
                dir: this.pdir, isPlayerFireball: true, isHammer: true, vy: -4
            }));
            nesAudio.playSFX('smb3_hammer');
        }
    }

    // ========== RENDER ==========
    render(ctx, nextCtx) {
        if (this.gameState === 'worldmap') {
            this.renderWorldMap(ctx);
            return;
        }

        if (this.gameState === 'victory') {
            this.renderVictory(ctx);
            return;
        }

        if (this.gameState === 'gameover') {
            this.renderGameOver(ctx);
            return;
        }

        if (this.gameState === 'playing' || this.dead) {
            this.renderLevel(ctx);
        }
    }

    renderWorldMap(ctx) {
        const world = Mario3Levels.worlds[this.currentWorld];
        if (!world) return;

        // Background
        const themes = {
            grass: '#70B8FF', desert: '#F0C860', water: '#3870B8',
            giant: '#70B8FF', sky: '#A0D0FF', ice: '#D0E8FF',
            pipe: '#70C070', dark: '#383838'
        };
        ctx.fillStyle = themes[world.theme] || '#70B8FF';
        ctx.fillRect(0, 0, 256, 240);

        // World name
        ctx.fillStyle = '#FFF';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`WORLD ${this.currentWorld + 1}`, 128, 20);
        ctx.font = '10px monospace';
        ctx.fillText(world.name, 128, 34);

        // Draw paths
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        for (const [a, b] of world.paths) {
            const na = world.nodes.find(n => n.id === a);
            const nb = world.nodes.find(n => n.id === b);
            if (na && nb) {
                ctx.beginPath();
                ctx.moveTo(na.x, na.y);
                ctx.lineTo(nb.x, nb.y);
                ctx.stroke();
            }
        }

        // Draw nodes
        for (let i = 0; i < world.nodes.length; i++) {
            const n = world.nodes[i];
            const cleared = this.nodesCleared[n.id];

            if (n.type === 'start') {
                ctx.fillStyle = '#080';
                ctx.fillRect(n.x - 4, n.y - 4, 8, 8);
            } else if (n.type === 'fortress') {
                ctx.fillStyle = cleared ? '#888' : '#888';
                ctx.fillRect(n.x - 8, n.y - 12, 16, 16);
                // Tower
                ctx.fillRect(n.x - 4, n.y - 18, 8, 8);
                if (!cleared) { ctx.fillStyle = '#F00'; ctx.fillRect(n.x - 2, n.y - 6, 4, 4); }
            } else if (n.type === 'airship') {
                ctx.fillStyle = cleared ? '#666' : '#A06030';
                ctx.fillRect(n.x - 10, n.y - 6, 20, 10);
                ctx.fillRect(n.x - 6, n.y - 10, 12, 6);
                if (!cleared) { ctx.fillStyle = '#FF0'; ctx.fillRect(n.x - 2, n.y - 4, 4, 4); }
            } else {
                // Level node
                ctx.fillStyle = cleared ? '#0A0' : '#FFF';
                ctx.beginPath();
                ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
                ctx.fill();
                if (!cleared) {
                    ctx.fillStyle = '#000';
                    ctx.font = '8px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(n.id.split('-')[1], n.x, n.y + 3);
                }
            }
        }

        // Player on map (draw Ashio icon)
        const curNode = world.nodes[this.mapCursor];
        if (curNode) {
            const blink = Math.floor(this.frameCount / 8) % 2;
            if (blink) {
                ctx.fillStyle = '#F00';
                ctx.fillRect(curNode.x - 5, curNode.y - 18, 10, 14);
                ctx.fillStyle = '#FFE040'; // blonde hair
                ctx.fillRect(curNode.x - 4, curNode.y - 18, 8, 4);
                ctx.fillStyle = '#FFCC88'; // face
                ctx.fillRect(curNode.x - 3, curNode.y - 14, 6, 4);
            }
        }

        // Inventory bar at bottom
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 210, 256, 30);
        ctx.fillStyle = '#FFF';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`LIVES:${this.lives}  COINS:${this.coins}  SCORE:${this.score}`, 8, 225);

        // Cards
        const cardX = 180;
        for (let i = 0; i < Math.min(this.inventory.length, 3); i++) {
            const card = this.inventory[this.inventory.length - 1 - i];
            ctx.fillStyle = '#FFF';
            ctx.fillRect(cardX + i * 22, 214, 18, 18);
            ctx.fillStyle = card === 'mushroom' ? '#F00' : card === 'flower' ? '#F80' : '#FF0';
            ctx.font = '7px monospace';
            ctx.fillText(card[0].toUpperCase(), cardX + i * 22 + 5, 226);
        }

        ctx.textAlign = 'left';
    }

    renderLevel(ctx) {
        const T = SuperMario3Engine.TILE_SIZE;
        const screenW = 256, screenH = 240;

        // Background color based on theme
        const bgColors = {
            grass: '#6888FF', desert: '#F8C868', water: '#3868B8',
            fortress: '#000', airship: '#000', dark: '#181818',
            sky: '#68A8FF', ice: '#C0E0FF', pipe: '#6888FF',
            giant: '#6888FF'
        };
        ctx.fillStyle = bgColors[this.levelData?.theme] || '#6888FF';
        ctx.fillRect(0, 0, screenW, screenH);

        const startTX = Math.floor(this.camX / T);
        const endTX = Math.ceil((this.camX + screenW) / T);
        const startTY = Math.floor(this.camY / T);
        const endTY = Math.ceil((this.camY + screenH) / T);

        // Draw tiles
        for (let tx = startTX; tx <= endTX; tx++) {
            for (let ty = startTY; ty <= endTY; ty++) {
                if (tx < 0 || tx >= this.levelW || ty < 0 || ty >= this.levelH) continue;
                const tile = this.tiles[tx][ty];
                if (tile === 0) continue;

                const sx = tx * T - this.camX;
                const sy = ty * T - this.camY;

                Mario3Renderer.drawTile(ctx, tile, sx, sy, this.frameCount);
            }
        }

        // Draw entities
        for (const e of this.entities) {
            if (!e.active || !e.activated) continue;
            const sx = e.x - this.camX;
            const sy = e.y - this.camY;
            if (sx < -32 || sx > screenW + 32 || sy < -32 || sy > screenH + 32) continue;
            e.render(ctx, sx, sy, this.frameCount);
        }

        // Draw player
        if (!this.dead || this.deathTimer > 0) {
            const psx = this.px - this.camX;
            const psy = this.py - this.camY;
            if (this.invincible > 0 && this.frameCount % 4 < 2) {
                // Flash when invincible (skip drawing)
            } else {
                const palette = { body: '#F00', overall: '#00F', hair: '#FFE040', skin: '#FFCC88' };
                const suitNames = ['small', 'big', 'fire', 'raccoon', 'frog', 'tanooki', 'hammer'];
                Mario3Renderer.drawPlayer(ctx, psx, psy, palette,
                    this.walkFrame, this.pdir, suitNames[this.suit] || 'small', this.starPower > 0, this.frameCount);
            }
        }

        // Draw particles
        for (const p of this.particles) {
            const sx = p.x - this.camX;
            const sy = p.y - this.camY;
            ctx.fillStyle = '#FFF';
            ctx.fillRect(sx, sy, 4, 4);
        }

        // HUD
        this.renderHUD(ctx);
    }

    renderHUD(ctx) {
        // Top HUD bar
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 256, 24);

        ctx.fillStyle = '#FFF';
        ctx.font = '8px monospace';
        ctx.textAlign = 'left';

        const playerName = this.currentPlayer === 1 ? 'ASHIO' : 'AIDIO';
        ctx.fillText(playerName, 4, 10);
        ctx.fillText(`${this.score}`, 4, 20);

        ctx.textAlign = 'center';
        ctx.fillText(`x${this.coins}`, 100, 10);

        const world = Mario3Levels.worlds[this.currentWorld];
        ctx.fillText(`W${this.currentWorld + 1}`, 160, 10);

        ctx.textAlign = 'right';
        ctx.fillText(`TIME ${this.timer}`, 252, 10);
        ctx.fillText(`LIVES ${this.lives}`, 252, 20);

        // P-Meter
        const pBlocks = Math.floor(this.pMeter / (SuperMario3Engine.P_METER_MAX / 7));
        ctx.textAlign = 'left';
        for (let i = 0; i < 7; i++) {
            ctx.fillStyle = i < pBlocks ? '#FFF' : '#444';
            ctx.fillText('>', 105 + i * 8, 20);
        }
        ctx.fillStyle = this.pMeter >= SuperMario3Engine.P_METER_MAX ? '#FFF' : '#444';
        ctx.fillText('P', 105 + 56, 20);

        // Card display during goal
        if (this.goalReached && this.cardGet && this.goalTimer > 30) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(80, 80, 96, 80);
            ctx.fillStyle = '#FFF';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('COURSE CLEAR', 128, 100);
            ctx.fillText(`YOU GOT A`, 128, 120);
            ctx.fillStyle = this.cardGet === 'star' ? '#FF0' : '#FFF';
            ctx.fillText(this.cardGet.toUpperCase(), 128, 140);
        }
    }

    renderVictory(ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 256, 240);

        ctx.fillStyle = '#FFF';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CONGRATULATIONS!', 128, 60);
        ctx.font = '10px monospace';
        ctx.fillText('THANK YOU SUPER ASHIO!', 128, 90);
        ctx.fillText('YOUR QUEST IS OVER.', 128, 110);

        // Draw Princess Ava
        ctx.fillStyle = '#FFB0C0'; // pink dress
        ctx.fillRect(118, 130, 20, 30);
        ctx.fillStyle = '#D2A679'; // tan skin
        ctx.fillRect(122, 122, 12, 10);
        ctx.fillStyle = '#5C3317'; // dark brown hair
        ctx.fillRect(120, 118, 16, 8);
        ctx.fillRect(118, 126, 4, 20);
        ctx.fillRect(134, 126, 4, 20);

        // Draw Ashio
        ctx.fillStyle = '#F00'; // red outfit
        ctx.fillRect(90, 140, 16, 20);
        ctx.fillStyle = '#FFCC88'; // skin
        ctx.fillRect(93, 132, 10, 10);
        ctx.fillStyle = '#FFE040'; // blonde hair
        ctx.fillRect(91, 128, 14, 6);

        ctx.fillStyle = '#FFF';
        ctx.font = '8px monospace';
        ctx.fillText(`SCORE: ${this.score}`, 128, 190);
        ctx.fillText('PRESS START', 128, 210);

        ctx.textAlign = 'left';
    }

    renderGameOver(ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 256, 240);
        ctx.fillStyle = '#FFF';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', 128, 110);
        ctx.font = '10px monospace';
        ctx.fillText(`SCORE: ${this.score}`, 128, 140);
        ctx.fillText('PRESS START', 128, 170);
        ctx.textAlign = 'left';
    }

    // ========== GAME.JS COMPATIBILITY ==========
    get level() {
        return `${this.currentWorld + 1}-${this.mapCursor + 1}`;
    }
}
