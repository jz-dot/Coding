// ============================================================
// Super Ashio Bros. 2 Engine
// US SMB2 (Doki Doki Panic) mechanics
// Character select, vegetable throwing, standing on enemies
// ============================================================

class SuperMario2Engine {
    constructor() {
        this.SCREEN_W = 256;
        this.SCREEN_H = 240;
        this.TILE = 16;
        this.GRAVITY = 0.35;
        this.MAX_FALL = 4;
        this.WALK_ACCEL = 0.12;
        this.WALK_MAX = 1.8;
        this.RUN_MAX = 2.5;
        this.FRICTION = 0.1;
        this.JUMP_VEL = -4.5;
        this.FLOAT_GRAVITY = 0.05; // Ava's float

        // Character stats: [jumpHeight, runSpeed, pullSpeed, floatTime]
        this.CHAR_STATS = {
            0: { name: 'ASHIO', jump: -4.5, speed: 1.8, pull: 12, float: 0 },       // Balanced
            1: { name: 'AIDIO', jump: -5.5, speed: 1.6, pull: 14, float: 0 },       // High jump
            2: { name: 'AVA',   jump: -4.0, speed: 1.6, pull: 16, float: 90 },      // Float
            3: { name: 'TOAD',  jump: -4.2, speed: 2.4, pull: 6,  float: 0 },       // Fast pull & speed
        };

        this.reset();
    }

    reset() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.stage = 1;
        this.gameOver = false;
        this.paused = false;
        this.won = false;
        this.gameWon = false;

        // Player
        this.playerX = 40;
        this.playerY = 192;
        this.playerVX = 0;
        this.playerVY = 0;
        this.playerW = 16;
        this.playerH = 24;
        this.playerDir = 1;
        this.grounded = false;
        this.groundedTimer = 0;
        this.jumping = false;
        this.jumpHeld = false;
        this.running = false;
        this.runHeld = false;
        this.crouching = false;
        this.floating = false;
        this.floatTimer = 0;
        this.dead = false;
        this.deathTimer = 0;
        this.animFrame = 0;
        this.animCounter = 0;

        // Health system (SMB2 uses hearts)
        this.hp = 2;
        this.maxHp = 4;
        this.invincible = false;
        this.invTimer = 0;
        this.damageTimer = 0;

        // Character
        this.charIdx = 0;
        this.charStats = this.CHAR_STATS[0];

        // Carrying / throwing
        this.carrying = null;
        this.pulling = false;
        this.pullTimer = 0;

        // Cherries
        this.cherries = 0;

        // Boss state
        this.bossDefeated = false;
        this.holdingKey = false;

        // Camera
        this.cameraX = 0;
        this.cameraY = 0;
        this.maxCameraX = 0;

        // Level
        this.tiles = null;
        this.levelWidth = 0;
        this.levelHeight = 15;
        this.levelType = 'overworld';
        this.entities = [];
        this.particles = [];
        this.scorePopups = [];
        this.activatedCols = 0;

        // Character select
        this.charSelecting = false;
        this.selectedChar = 0;

        // Frame
        this.frameCount = 0;

        // Input
        this.inputLeft = false;
        this.inputRight = false;
        this.inputDown = false;
        this.inputJump = false;
        this.inputRun = false;

        // Level data
        this.levelData = null;
    }

    init(startWorld) {
        this.reset();
        this.level = startWorld || 1;
        this.stage = 1;
        this.charSelecting = true;
    }

    selectCharacter(idx) {
        this.charIdx = idx;
        this.charStats = this.CHAR_STATS[idx];
        this.charSelecting = false;
        this.loadLevel(this.level, this.stage);
    }

    loadLevel(world, stage) {
        this.level = world;
        this.stage = stage;
        const data = Mario2Levels.getLevel(world, stage);
        if (!data) { this.gameOver = true; return; }

        this.levelData = data;
        this.tiles = data.tiles;
        this.levelWidth = data.width;
        this.levelHeight = data.height || 15;
        this.levelType = data.type || 'overworld';
        this.maxCameraX = Math.max(0, this.levelWidth * this.TILE - this.SCREEN_W);

        const spawn = data.spawn || { x: 3, y: 12 };
        this.playerX = spawn.x * this.TILE;
        this.playerY = spawn.y * this.TILE;
        this.playerVX = 0;
        this.playerVY = 0;
        this.cameraX = 0;
        this.grounded = false;
        this.dead = false;
        this.bossDefeated = false;
        this.carrying = null;
        this.pulling = false;
        this.holdingKey = false;

        this.entities = [];
        this.particles = [];
        this.scorePopups = [];
        this.activatedCols = 0;

        if (data.entities) {
            for (const e of data.entities) {
                const ent = Mario2Entities.create(e.type, e.col * this.TILE, e.row * this.TILE, e);
                this.entities.push(ent);
            }
        }
    }

    // ---- TILE HELPERS ----

    getTile(col, row) {
        if (!this.tiles || col < 0 || col >= this.levelWidth || row < 0 || row >= this.levelHeight) return 0;
        return this.tiles[row * this.levelWidth + col] || 0;
    }

    setTile(col, row, val) {
        if (!this.tiles || col < 0 || col >= this.levelWidth || row < 0 || row >= this.levelHeight) return;
        this.tiles[row * this.levelWidth + col] = val;
    }

    isSolid(tile) {
        return tile === 1 || tile === 2 || tile === 3 || tile === 4 || tile === 7 || tile === 10 || tile === 15 || tile === 16;
    }

    // ---- INPUT ----

    pressJump() {
        if (this.dead) return;
        if (this.charSelecting) {
            this.selectCharacter(this.selectedChar);
            return;
        }
        if ((this.grounded || this.groundedTimer > 0) && !this.jumping) {
            this.jumping = true;
            this.jumpHeld = true;
            this.grounded = false;
            this.playerVY = this.charStats.jump;
            this.floatTimer = this.charStats.float;
            nesAudio.playSFX('smb2_jump');
        }
    }

    releaseJump() { this.jumpHeld = false; }

    pressRun() {
        this.running = true;
        if (!this.runHeld) {
            this.runHeld = true;
            if (!this.carrying && !this.dead) {
                this.tryPickUp();
            } else if (this.carrying) {
                this.throwItem();
            }
        }
    }

    releaseRun() { this.running = false; this.runHeld = false; }

    pressCrouch() {
        this.inputDown = true;
        this.crouching = this.grounded;
    }

    releaseCrouch() {
        this.inputDown = false;
        this.crouching = false;
    }

    // ---- PICK UP / THROW ----

    tryPickUp() {
        if (this.carrying) return;

        // Check for pullable vegetation at player center and above
        const T = this.TILE;
        const playerCol = Math.floor((this.playerX + this.playerW / 2) / T);
        const checkRow1 = Math.floor((this.playerY + this.playerH / 2) / T); // center
        const checkRow2 = Math.floor(this.playerY / T); // top
        const checkRow3 = Math.floor((this.playerY + this.playerH) / T); // feet

        // Check multiple rows for veggie
        const tile1 = this.getTile(playerCol, checkRow1);
        const tile2 = this.getTile(playerCol, checkRow2);
        const tile3 = this.getTile(playerCol, checkRow3);
        const pullRow = tile1 === 9 ? checkRow1 : tile2 === 9 ? checkRow2 : tile3 === 9 ? checkRow3 : -1;
        if (pullRow >= 0) {
            this.pulling = true;
            this.pullTimer = this.charStats.pull;
            this._pullCol = playerCol;
            this._pullRow = pullRow;
            return;
        }

        // Check nearby enemies to pick up
        for (const e of this.entities) {
            if (!e.active || !e.canBePickedUp) continue;
            const dx = Math.abs(this.playerX + this.playerW / 2 - e.x - e.width / 2);
            const dy = Math.abs(this.playerY + this.playerH / 2 - e.y - e.height / 2);
            if (dx < 20 && dy < 20) {
                this.carrying = e;
                e.active = false; // Remove from world while carried
                nesAudio.playSFX('smb2_pluck');
                return;
            }
        }
    }

    throwItem() {
        if (!this.carrying) return;
        const item = this.carrying;
        this.carrying = null;

        // Create throwable vegetable
        const veg = Mario2Entities.create('vegetable',
            this.playerX + (this.playerDir === 1 ? 14 : -14),
            this.playerY - 4,
            { vegType: item.type === 'shyguy' ? 'shell' : (item.type === 'birdoEgg' ? 'shell' : 'turnip') }
        );
        veg.thrown = true;
        veg.vx = this.playerDir * 3;
        veg.vy = -2;
        veg.activated = true;
        this.entities.push(veg);
        nesAudio.playSFX('smb2_throw');
    }

    // ---- COLLISION ----

    collideTiles() {
        const T = this.TILE;
        const pw = this.playerW;
        const ph = this.playerH;

        // --- HORIZONTAL COLLISION (X-axis first, like NES) ---
        const inset = 2;
        let topRow = Math.floor((this.playerY + inset) / T);
        let bottomRow = Math.floor((this.playerY + ph - 1 - inset) / T);

        if (this.playerVX < 0) {
            const leftCol = Math.floor(this.playerX / T);
            for (let r = topRow; r <= bottomRow; r++) {
                if (this.isSolid(this.getTile(leftCol, r))) {
                    this.playerX = (leftCol + 1) * T;
                    this.playerVX = 0;
                    break;
                }
            }
        } else if (this.playerVX > 0) {
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

        // Ground (feet)
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
        }

        this.grounded = onGround;
        if (onGround) {
            this.jumping = false;
            this.floating = false;
            this.groundedTimer = 5;
        } else {
            if (this.groundedTimer > 0) this.groundedTimer--;
        }

        // Head
        if (this.playerVY < 0) {
            const headRow = Math.floor(this.playerY / T);
            for (let c = leftCol; c <= rightCol; c++) {
                if (this.isSolid(this.getTile(c, headRow))) {
                    this.playerY = (headRow + 1) * T;
                    this.playerVY = 0;
                    break;
                }
            }
        }

        // Spike damage
        for (let r = topRow; r <= feetRow; r++) {
            for (let c = leftCol; c <= rightCol; c++) {
                if (this.getTile(c, r) === 11) { this.takeDamage(); return; }
            }
        }

        // POW block hit from below
        if (this.playerVY < 0) {
            const headRow = Math.floor(this.playerY / T);
            const midCol = Math.floor((this.playerX + pw / 2) / T);
            if (this.getTile(midCol, headRow) === 7) {
                this.setTile(midCol, headRow, 0);
                nesAudio.playSFX('smb2_pow');
                for (const e of this.entities) {
                    if (e.active && e.isEnemy && e.grounded) e.die(this);
                }
            }
        }

        // Collect items from tiles
        for (let r = topRow; r <= feetRow; r++) {
            for (let c = leftCol; c <= rightCol; c++) {
                const tile = this.getTile(c, r);
                if (tile === 18) { // Cherry
                    this.setTile(c, r, 0);
                    this.cherries++;
                    this.addScore(100);
                    nesAudio.playSFX('smb2_cherry');
                    if (this.cherries >= 5) {
                        this.cherries = 0;
                        this.spawnStar();
                    }
                } else if (tile === 17) { // Crystal ball
                    this.setTile(c, r, 0);
                    this.bossDefeated = true;
                    nesAudio.playSFX('smb2_crystal');
                } else if (tile === 20) { // Key
                    this.setTile(c, r, 0);
                    this.holdingKey = true;
                }
            }
        }

        // Fall into pit
        if (this.playerY > this.SCREEN_H + 16) {
            this.die();
        }
    }

    spawnStar() {
        const star = Mario2Entities.create('star2', this.playerX, this.playerY - 20, {});
        star.activated = true;
        this.entities.push(star);
        nesAudio.playSFX('smb2_1up');
    }

    // ---- ENTITY COLLISION ----

    checkEntityCollisions() {
        for (const e of this.entities) {
            if (!e.active || e.type === 'vegetable') continue;

            const overlap = this.playerX < e.x + e.width &&
                           this.playerX + this.playerW > e.x &&
                           this.playerY < e.y + e.height &&
                           this.playerY + this.playerH > e.y;
            if (!overlap) continue;

            if (e.isItem) {
                if (e.collect) e.collect(this);
                continue;
            }

            if (this.invincible && e.isEnemy) {
                if (!e.isBoss) {
                    e.die();
                    this.addScore(200);
                }
                continue;
            }

            if (e.isEnemy) {
                const playerBottom = this.playerY + this.playerH;
                const playerFalling = this.playerVY > 0;

                if (playerFalling && playerBottom - e.y < 10 && e.canBeStoodOn) {
                    // Stand on enemy (SMB2 mechanic)
                    this.playerY = e.y - this.playerH;
                    this.playerVY = 0;
                    this.grounded = true;
                    // Can pick up while standing on
                } else if (e.isDangerous && this.damageTimer <= 0) {
                    this.takeDamage();
                }
            }
        }
    }

    // ---- DAMAGE / DEATH ----

    takeDamage() {
        if (this.invincible || this.damageTimer > 0 || this.dead) return;
        this.hp--;
        this.damageTimer = 90;
        nesAudio.playSFX('smb2_hit');
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        if (this.dead) return;
        this.dead = true;
        this.deathTimer = 90;
        this.playerVY = -4;
        this.playerVX = 0;
        this.carrying = null;
        nesAudio.stopMusic();
        nesAudio.playSFX('smb_die');
    }

    addScore(pts) { this.score += pts; }
    showScorePopup(x, y, text) { this.scorePopups.push({ x, y, text: String(text), life: 30 }); }

    // ---- UPDATE ----

    update() {
        this.frameCount++; // Always increment so char select screen animates
        if (this.gameOver || this.paused || this.charSelecting) return;

        // Death
        if (this.dead) {
            this.deathTimer--;
            if (this.deathTimer > 60) { /* pause */ }
            else if (this.deathTimer > 0) {
                this.playerVY += 0.3;
                this.playerY += this.playerVY;
            } else {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver = true;
                } else {
                    this.dead = false;
                    this.hp = 2;
                    this.charSelecting = true;
                }
            }
            return;
        }

        // Boss defeated
        if (this.bossDefeated) {
            if (this.gameWon) {
                this.won = true;
                this.gameOver = true;
                return;
            }
            this.advanceLevel();
            this.bossDefeated = false;
            return;
        }

        // Timers
        if (this.damageTimer > 0) this.damageTimer--;
        if (this.invincible) {
            this.invTimer--;
            if (this.invTimer <= 0) this.invincible = false;
        }

        // Pulling vegetation
        if (this.pulling) {
            this.pullTimer--;
            if (this.pullTimer <= 0) {
                this.pulling = false;
                const col = this._pullCol;
                const row = this._pullRow;
                if (col !== undefined && row !== undefined && this.getTile(col, row) === 9) {
                    this.setTile(col, row, 0);
                    // Create carried vegetable
                    const veg = Mario2Entities.create('vegetable', this.playerX, this.playerY - 16, { vegType: 'turnip' });
                    this.carrying = veg;
                    nesAudio.playSFX('smb2_pluck');
                }
            }
            return;
        }

        // Player physics
        this.updatePlayer();
        this.collideTiles();

        // Activate entities
        this.activateEntities();

        // Update entities
        for (const e of this.entities) {
            if (e.active) e.update(this);
        }

        // Entity collisions
        this.checkEntityCollisions();

        // Particles
        for (const p of this.particles) {
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            p.vy = (p.vy || 0) + 0.2;
            p.life--;
        }
        this.particles = this.particles.filter(p => p.life > 0);

        // Score popups
        for (const sp of this.scorePopups) { sp.y -= 1; sp.life--; }
        this.scorePopups = this.scorePopups.filter(sp => sp.life > 0);

        // Clean dead entities
        this.entities = this.entities.filter(e => e.active || e.deathTimer > 0);

        // Camera
        this.updateCamera();

        // Animation - speed scales with player velocity
        this.animCounter++;
        const animSpeed = Math.abs(this.playerVX) > this.charStats.speed ? 3 : 6;
        if (this.animCounter >= animSpeed) {
            this.animCounter = 0;
            if (Math.abs(this.playerVX) > 0.1 && this.grounded) {
                this.animFrame = (this.animFrame + 1) % 3;
            }
        }
    }

    updatePlayer() {
        const maxSpeed = (this.running || this.inputRun) ? this.RUN_MAX : this.charStats.speed;

        // Ice physics: reduce friction/accel when on ice
        const T = this.TILE;
        const standCol = Math.floor((this.playerX + this.playerW / 2) / T);
        const standRow = Math.floor((this.playerY + this.playerH + 1) / T);
        const onIce = this.grounded && this.getTile(standCol, standRow) === 10;
        const accel = onIce ? 0.06 : this.WALK_ACCEL;
        const friction = onIce ? 0.02 : this.FRICTION;

        // Horizontal
        if (this.inputLeft && !this.crouching) {
            this.playerDir = -1;
            this.playerVX -= accel;
            if (this.playerVX < -maxSpeed) this.playerVX = -maxSpeed;
        } else if (this.inputRight && !this.crouching) {
            this.playerDir = 1;
            this.playerVX += accel;
            if (this.playerVX > maxSpeed) this.playerVX = maxSpeed;
        } else {
            if (this.playerVX > 0) {
                this.playerVX -= friction;
                if (this.playerVX < 0) this.playerVX = 0;
            } else if (this.playerVX < 0) {
                this.playerVX += friction;
                if (this.playerVX > 0) this.playerVX = 0;
            }
        }

        this.playerX += this.playerVX;
        if (this.playerX < 0) { this.playerX = 0; this.playerVX = 0; }

        // Gravity
        if (this.charIdx === 2 && !this.grounded && this.jumpHeld && this.playerVY > 0 && this.floatTimer > 0) {
            // Ava's float ability
            this.floating = true;
            this.floatTimer--;
            this.playerVY += this.FLOAT_GRAVITY;
        } else {
            this.floating = false;
            if (this.jumping && this.jumpHeld && this.playerVY < 0) {
                this.playerVY += this.GRAVITY * 0.5;
            } else {
                this.playerVY += this.GRAVITY;
            }
        }
        if (this.playerVY > this.MAX_FALL) this.playerVY = this.MAX_FALL;
        this.playerY += this.playerVY;
    }

    updateCamera() {
        const targetX = this.playerX - 80;
        this.cameraX = targetX;
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

    advanceLevel() {
        if (this.stage < 3) {
            this.stage++;
        } else {
            this.level++;
            this.stage = 1;
            if (this.level > 7) {
                this.won = true;
                this.gameOver = true;
                return;
            }
        }
        this.charSelecting = true; // SMB2 lets you pick character each level
    }

    // ---- RENDER ----

    render(ctx, nextCtx) {
        const T = this.TILE;
        const R = Mario2Renderer;

        if (ctx.canvas.width !== 256 || ctx.canvas.height !== 240) {
            ctx.canvas.width = 256;
            ctx.canvas.height = 240;
        }

        // Character select screen
        if (this.charSelecting) {
            R.drawCharSelectScreen(ctx, this.selectedChar, this.frameCount);
            return;
        }

        // Background
        R.drawBackground(ctx, this.levelType, this.cameraX, 0, this.frameCount);

        // Draw tiles
        const startCol = Math.floor(this.cameraX / T);
        const endCol = Math.min(startCol + 17, this.levelWidth);

        for (let r = 0; r < this.levelHeight; r++) {
            for (let c = startCol; c <= endCol; c++) {
                const tile = this.getTile(c, r);
                if (tile > 0) {
                    const sx = c * T - Math.floor(this.cameraX);
                    const sy = r * T + R.HUD_HEIGHT;
                    R.drawTile(ctx, tile, sx, sy, this.frameCount);
                }
            }
        }

        // Entities
        for (const e of this.entities) {
            if (!e.active && e.deathTimer <= 0) continue;
            const sx = e.x - Math.floor(this.cameraX);
            const sy = e.y + R.HUD_HEIGHT;
            if (sx > -32 && sx < this.SCREEN_W + 32) {
                e.render(ctx, sx, sy, this.frameCount);
            }
        }

        // Player
        if (!this.dead || this.deathTimer > 60) {
            if (this.damageTimer > 0 && Math.floor(this.damageTimer / 3) % 2 === 0) {
                // Flashing
            } else {
                const sx = this.playerX - Math.floor(this.cameraX);
                const sy = this.playerY + R.HUD_HEIGHT;
                R.drawCharacter(ctx, sx, sy, this.charIdx, this.animFrame, this.playerDir, this.carrying, true);
            }
        } else if (this.dead && this.deathTimer <= 60) {
            const sx = this.playerX - Math.floor(this.cameraX);
            const sy = this.playerY + R.HUD_HEIGHT;
            R.drawCharacter(ctx, sx, sy, this.charIdx, 0, this.playerDir, false, true);
        }

        // Particles
        for (const p of this.particles) {
            const sx = p.x - Math.floor(this.cameraX);
            ctx.fillStyle = p.color || '#FFF';
            ctx.fillRect(sx, p.y + R.HUD_HEIGHT, 4, 4);
        }

        // Score popups
        ctx.fillStyle = '#FFF';
        ctx.font = '8px "Press Start 2P", monospace';
        for (const sp of this.scorePopups) {
            const sx = sp.x - Math.floor(this.cameraX);
            ctx.fillText(sp.text, sx, sp.y + R.HUD_HEIGHT);
        }

        // HUD
        R.drawHUD(ctx, this.lives, this.charIdx, this.level, this.stage, this.score, this.cherries);

        // Game won overlay
        if (this.won) {
            ctx.fillStyle = 'rgba(0,0,0,0.9)';
            ctx.fillRect(0, 0, this.SCREEN_W, this.SCREEN_H);
            ctx.fillStyle = '#FFF';
            ctx.font = '8px "Press Start 2P", monospace';
            ctx.fillText('CONGRATULATIONS!', 48, 80);
            ctx.fillText('THE DREAM IS OVER!', 40, 100);
            ctx.fillText(this.charStats.name + ' SAVED', 56, 120);
            ctx.fillText('SUBCON!', 88, 140);
        }

        // Next panel (lives info)
        if (nextCtx) {
            nextCtx.fillStyle = '#000';
            nextCtx.fillRect(0, 0, 80, 80);
            nextCtx.fillStyle = '#FFF';
            nextCtx.font = '8px "Press Start 2P", monospace';
            nextCtx.fillText(this.charStats.name, 4, 16);
            nextCtx.fillText('\u2665'.repeat(Math.min(this.hp, 4)), 4, 32);
            nextCtx.fillText('W' + this.level + '-' + this.stage, 4, 48);
        }
    }

    // DAS compatibility stubs
    handleDAS(dir) {
        if (dir === -1) this.inputLeft = true;
        else if (dir === 1) this.inputRight = true;
    }
    resetDAS() { this.inputLeft = false; this.inputRight = false; }
    moveLeft() {
        if (this.charSelecting) {
            this.selectedChar = (this.selectedChar + 3) % 4;
            return;
        }
        this.inputLeft = true;
    }
    moveRight() {
        if (this.charSelecting) {
            this.selectedChar = (this.selectedChar + 1) % 4;
            return;
        }
        this.inputRight = true;
    }
    rotateClockwise() { this.pressJump(); }
    rotateCounterClockwise() { this.pressRun(); }
}
