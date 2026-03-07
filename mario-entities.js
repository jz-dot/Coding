// ============================================================
// Super Ashio Bros. - Entity System
// Enemies, items, fireballs, and interactive objects
// ============================================================

const MarioEntities = {
    create(type, x, y, opts) {
        opts = opts || {};
        switch(type) {
            case 'goomba': return new Goomba(x, y, opts);
            case 'koopa': return new KoopaTroopa(x, y, opts);
            case 'koopaRed': return new KoopaTroopa(x, y, { ...opts, color: 'red' });
            case 'piranha': return new PiranhaPlant(x, y, opts);
            case 'buzzy': return new BuzzyBeetle(x, y, opts);
            case 'bulletBill': return new BulletBill(x, y, opts);
            case 'hammerBro': return new HammerBro(x, y, opts);
            case 'lakitu': return new Lakitu(x, y, opts);
            case 'spiny': return new Spiny(x, y, opts);
            case 'cheepCheep': return new CheepCheep(x, y, opts);
            case 'blooper': return new Blooper(x, y, opts);
            case 'bowser': return new Bowser(x, y, opts);
            case 'fireBar': return new FireBar(x, y, opts);
            case 'mushroom': return new Mushroom(x, y, opts);
            case 'flower': return new FireFlower(x, y, opts);
            case 'star': return new StarItem(x, y, opts);
            case '1up': return new OneUpMushroom(x, y, opts);
            case 'fireball': return new Fireball(x, y, opts);
            case 'hammer': return new Hammer(x, y, opts);
            case 'bowserFire': return new BowserFire(x, y, opts);
            default:
                console.warn('Unknown entity type:', type);
                return new Goomba(x, y, opts);
        }
    }
};

// ---- BASE ENTITY ----

class MarioEntity {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 16;
        this.height = 16;
        this.active = true;
        this.activated = false;
        this.direction = -1;
        this.isEnemy = false;
        this.isItem = false;
        this.canBeStomp = false;
        this.canBeKilledByBlock = false;
        this.isDangerous = false;
        this.fireproof = false;
        this.noPlayerCollide = false;
        this.deathTimer = 0;
        this.frame = 0;
    }

    onActivate() {
        // Override in subclass
    }

    update(engine) {
        this.frame++;
    }

    render(ctx, sx, sy, globalFrame) {
        // Override in subclass
    }

    die() {
        this.active = false;
        this.deathTimer = 20;
    }

    onStomp(engine) {
        this.die();
    }

    collect(engine) {
        this.active = false;
    }

    // Basic tile collision for entities
    applyGravity(engine) {
        this.vy += 0.4;
        if (this.vy > 5) this.vy = 5;
        this.y += this.vy;

        // Ground check - check both left and right sides of entity
        const T = 16;
        const feetRow = Math.floor((this.y + this.height) / T);
        const leftCol = Math.floor(this.x / T);
        const rightCol = Math.floor((this.x + this.width - 1) / T);
        let grounded = false;
        for (let c = leftCol; c <= rightCol; c++) {
            if (engine.isSolid(engine.getTile(c, feetRow))) {
                this.y = feetRow * T - this.height;
                this.vy = 0;
                grounded = true;
                break;
            }
        }
        // Also check if embedded (tunneling protection)
        if (!grounded) {
            const embedRow = Math.floor((this.y + this.height - 1) / T);
            for (let c = leftCol; c <= rightCol; c++) {
                if (engine.isSolid(engine.getTile(c, embedRow))) {
                    this.y = embedRow * T - this.height;
                    this.vy = 0;
                    break;
                }
            }
        }

        // Off screen
        if (this.y > 260) {
            this.active = false;
        }
    }

    applyMovement(engine) {
        this.x += this.vx;

        // Wall collision - check multiple rows for tall entities
        const T = 16;
        const topRow = Math.floor((this.y + 2) / T);
        const midRow = Math.floor((this.y + this.height / 2) / T);
        const botRow = Math.floor((this.y + this.height - 2) / T);
        const checkRows = [topRow, midRow, botRow];

        if (this.vx < 0) {
            const col = Math.floor(this.x / T);
            for (const row of checkRows) {
                if (engine.isSolid(engine.getTile(col, row))) {
                    this.x = (col + 1) * T;
                    this.vx = -this.vx;
                    this.direction = 1;
                    break;
                }
            }
        } else if (this.vx > 0) {
            const col = Math.floor((this.x + this.width) / T);
            for (const row of checkRows) {
                if (engine.isSolid(engine.getTile(col, row))) {
                    this.x = col * T - this.width;
                    this.vx = -this.vx;
                    this.direction = -1;
                    break;
                }
            }
        }
    }
}

// ---- GOOMBA ----

class Goomba extends MarioEntity {
    constructor(x, y, opts) {
        super('goomba', x, y);
        this.isEnemy = true;
        this.canBeStomp = true;
        this.canBeKilledByBlock = true;
        this.isDangerous = true;
        this.squished = false;
        this.squishTimer = 0;
        this.vx = -0.5;
    }

    onActivate() {
        this.vx = -0.5;
    }

    update(engine) {
        super.update(engine);
        if (this.squished) {
            this.squishTimer--;
            if (this.squishTimer <= 0) this.active = false;
            return;
        }
        if (!this.activated) return;
        this.applyMovement(engine);
        this.applyGravity(engine);
    }

    onStomp(engine) {
        this.squished = true;
        this.squishTimer = 30;
        this.isDangerous = false;
        this.canBeStomp = false;
        this.vx = 0;
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawGoomba(ctx, sx, sy, this.squished ? 0 : frame, this.squished);
    }
}

// ---- KOOPA TROOPA ----

class KoopaTroopa extends MarioEntity {
    constructor(x, y, opts) {
        super('koopa', x, y);
        this.color = opts.color || 'green';
        this.isEnemy = true;
        this.canBeStomp = true;
        this.canBeKilledByBlock = true;
        this.isDangerous = true;
        this.inShell = false;
        this.shellMoving = false;
        this.height = 24;
        this.vx = -0.5;
        this.shellKickTimer = 0;
    }

    onActivate() {
        this.vx = -0.5; // Walk left on activation (like original SMB)
    }

    update(engine) {
        super.update(engine);
        if (!this.activated) return;

        if (this.shellKickTimer > 0) this.shellKickTimer--;

        if (this.inShell && this.shellMoving) {
            // Moving shell kills other enemies (including other shells)
            for (const e of engine.entities) {
                if (e !== this && e.active && e.isEnemy) {
                    if (this.x < e.x + e.width && this.x + this.width > e.x &&
                        this.y < e.y + e.height && this.y + this.height > e.y) {
                        e.die();
                        engine.addScore(500);
                        engine.showScorePopup(e.x, e.y, '500');
                    }
                }
            }
        }

        this.applyMovement(engine);
        this.applyGravity(engine);

        // Red Koopa turns at edges
        if (this.color === 'red' && !this.inShell) {
            const T = 16;
            const checkCol = Math.floor((this.x + (this.vx < 0 ? 0 : this.width)) / T);
            const checkRow = Math.floor((this.y + this.height + 4) / T);
            const tileBelow = engine.getTile(checkCol, checkRow);
            if (!engine.isSolid(tileBelow) && this.vy === 0) {
                this.vx = -this.vx;
                this.direction = this.vx < 0 ? -1 : 1;
            }
        }
    }

    onStomp(engine) {
        if (!this.inShell) {
            this.inShell = true;
            this.shellMoving = false;
            this.vx = 0;
            this.height = 16;
            this.isDangerous = false;
        } else if (!this.shellMoving) {
            // Kick shell
            this.shellMoving = true;
            this.isDangerous = true;
            this.vx = engine.playerX < this.x ? 3 : -3;
            this.shellKickTimer = 10;
            nesAudio.playSFX('smb_kick');
        } else {
            // Stop shell
            this.shellMoving = false;
            this.vx = 0;
            this.isDangerous = false;
        }
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawKoopa(ctx, sx, sy, frame, this.color, this.inShell);
    }
}

// ---- PIRANHA PLANT ----

class PiranhaPlant extends MarioEntity {
    constructor(x, y, opts) {
        super('piranha', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.canBeStomp = false;
        this.canBeKilledByBlock = false;
        this.pipeCol = opts.pipeCol || Math.floor(x / 16);
        this.baseY = y;
        this.height = 24;
        this.emergeState = 'hidden'; // hidden, emerging, visible, retreating
        this.stateTimer = 0;
        this.emergeOffset = 24;
        this.noPlayerCollide = false;
    }

    onActivate() {
        this.emergeState = 'hidden';
        this.stateTimer = 60;
    }

    update(engine) {
        super.update(engine);
        if (!this.activated) return;

        // Don't emerge if player is adjacent to pipe
        const playerCol = Math.floor((engine.playerX + engine.playerW / 2) / 16);
        const nearPipe = Math.abs(playerCol - this.pipeCol) <= 1;

        this.stateTimer--;

        switch(this.emergeState) {
            case 'hidden':
                this.y = this.baseY + this.emergeOffset;
                this.isDangerous = false;
                if (this.stateTimer <= 0 && !nearPipe) {
                    this.emergeState = 'emerging';
                    this.stateTimer = 24;
                }
                break;
            case 'emerging':
                this.y -= 1;
                this.isDangerous = true;
                if (this.stateTimer <= 0) {
                    this.emergeState = 'visible';
                    this.stateTimer = 60;
                }
                break;
            case 'visible':
                this.isDangerous = true;
                if (this.stateTimer <= 0) {
                    this.emergeState = 'retreating';
                    this.stateTimer = 24;
                }
                break;
            case 'retreating':
                this.y += 1;
                if (this.stateTimer <= 0) {
                    this.emergeState = 'hidden';
                    this.stateTimer = 60;
                    this.isDangerous = false;
                }
                break;
        }
    }

    render(ctx, sx, sy, frame) {
        if (this.emergeState !== 'hidden') {
            MarioRenderer.drawPiranhaPlant(ctx, sx, sy, frame);
        }
    }
}

// ---- BUZZY BEETLE ----

class BuzzyBeetle extends MarioEntity {
    constructor(x, y, opts) {
        super('buzzy', x, y);
        this.isEnemy = true;
        this.canBeStomp = true;
        this.canBeKilledByBlock = true;
        this.isDangerous = true;
        this.fireproof = true;
        this.inShell = false;
        this.shellMoving = false;
        this.shellKickTimer = 0;
        this.vx = -0.5;
    }

    onActivate() { this.vx = -0.5; }

    update(engine) {
        super.update(engine);
        if (!this.activated) return;

        if (this.shellKickTimer > 0) this.shellKickTimer--;

        if (this.inShell && this.shellMoving) {
            // Moving shell kills other enemies
            for (const e of engine.entities) {
                if (e !== this && e.active && e.isEnemy) {
                    if (this.x < e.x + e.width && this.x + this.width > e.x &&
                        this.y < e.y + e.height && this.y + this.height > e.y) {
                        e.die();
                        engine.addScore(500);
                        engine.showScorePopup(e.x, e.y, '500');
                    }
                }
            }
        }

        this.applyMovement(engine);
        this.applyGravity(engine);
    }

    onStomp(engine) {
        if (!this.inShell) {
            this.inShell = true;
            this.shellMoving = false;
            this.vx = 0;
            this.isDangerous = false;
        } else if (!this.shellMoving) {
            this.shellMoving = true;
            this.isDangerous = true;
            this.vx = engine.playerX < this.x ? 3 : -3;
            this.shellKickTimer = 10;
            nesAudio.playSFX('smb_kick');
        } else {
            this.shellMoving = false;
            this.vx = 0;
            this.isDangerous = false;
        }
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawBuzzyBeetle(ctx, sx, sy, frame, this.inShell);
    }
}

// ---- BULLET BILL ----

class BulletBill extends MarioEntity {
    constructor(x, y, opts) {
        super('bulletBill', x, y);
        this.isEnemy = true;
        this.canBeStomp = true;
        this.isDangerous = true;
        this.fireproof = true;
        this.direction = opts.dir || -1;
        this.vx = this.direction * 2;
    }

    onActivate() {}

    update(engine) {
        super.update(engine);
        this.x += this.vx;
        if (this.x < engine.cameraX - 32 || this.x > engine.cameraX + 280) {
            this.active = false;
        }
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawBulletBill(ctx, sx, sy, this.direction);
    }
}

// ---- HAMMER BRO ----

class HammerBro extends MarioEntity {
    constructor(x, y, opts) {
        super('hammerBro', x, y);
        this.isEnemy = true;
        this.canBeStomp = true;
        this.canBeKilledByBlock = true;
        this.isDangerous = true;
        this.moveTimer = 0;
        this.throwTimer = 0;
        this.jumpTimer = 0;
        this.vx = 0.3;
        this.height = 24;
    }

    onActivate() {
        this.moveTimer = 60;
        this.throwTimer = 45;
        this.jumpTimer = 120;
    }

    update(engine) {
        super.update(engine);
        if (!this.activated) return;

        // Move back and forth
        this.moveTimer--;
        if (this.moveTimer <= 0) {
            this.vx = -this.vx;
            this.moveTimer = 60 + Math.random() * 30;
        }

        this.applyMovement(engine);
        this.applyGravity(engine);

        // Throw hammer
        this.throwTimer--;
        if (this.throwTimer <= 0) {
            this.throwTimer = 40 + Math.floor(Math.random() * 30);
            // Create hammer entity
            engine.entities.push(new Hammer(this.x, this.y - 8, { dir: engine.playerX < this.x ? -1 : 1 }));
        }

        // Jump occasionally
        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.vy === 0) {
            this.vy = -3;
            this.jumpTimer = 90 + Math.floor(Math.random() * 60);
        }
    }

    render(ctx, sx, sy, frame) {
        // Use Koopa-like body with different coloring
        ctx.fillStyle = '#00A800';
        ctx.fillRect(sx + 2, sy, 12, 10);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(sx + 4, sy + 2, 8, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 5, sy + 3, 2, 2);
        ctx.fillRect(sx + 9, sy + 3, 2, 2);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(sx + 2, sy + 10, 12, 8);
        ctx.fillStyle = '#00A800';
        ctx.fillRect(sx + 4, sy + 12, 8, 4);
        ctx.fillRect(sx + 2, sy + 18, 5, 6);
        ctx.fillRect(sx + 9, sy + 18, 5, 6);
    }
}

// ---- HAMMER (projectile) ----

class Hammer extends MarioEntity {
    constructor(x, y, opts) {
        super('hammer', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.canBeStomp = false;
        this.noPlayerCollide = false;
        this.width = 12;
        this.height = 12;
        this.vx = (opts.dir || -1) * 1.5;
        this.vy = -4;
    }

    update(engine) {
        super.update(engine);
        this.x += this.vx;
        this.vy += 0.2;
        this.y += this.vy;
        if (this.y > 260) this.active = false;
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawHammer(ctx, sx, sy, frame);
    }
}

// ---- LAKITU ----

class Lakitu extends MarioEntity {
    constructor(x, y, opts) {
        super('lakitu', x, y);
        this.isEnemy = true;
        this.canBeStomp = true;
        this.isDangerous = true;
        this.dropTimer = 0;
        this.height = 24;
    }

    onActivate() {
        this.dropTimer = 120;
    }

    update(engine) {
        super.update(engine);
        if (!this.activated) return;

        // Follow player from above
        const targetX = engine.playerX;
        if (this.x < targetX - 20) this.x += 0.8;
        else if (this.x > targetX + 20) this.x -= 0.8;
        this.y = 52; // Stay near top

        // Drop Spinies
        this.dropTimer--;
        if (this.dropTimer <= 0) {
            this.dropTimer = 120 + Math.floor(Math.random() * 60);
            engine.entities.push(new Spiny(this.x, this.y + 16, {}));
            engine.entities[engine.entities.length - 1].activated = true;
            engine.entities[engine.entities.length - 1].onActivate();
        }
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawLakitu(ctx, sx, sy, frame);
    }
}

// ---- SPINY ----

class Spiny extends MarioEntity {
    constructor(x, y, opts) {
        super('spiny', x, y);
        this.isEnemy = true;
        this.canBeStomp = false; // Can't stomp spinies!
        this.canBeKilledByBlock = true;
        this.isDangerous = true;
        this.vx = -0.5;
    }

    onActivate() {
        this.vx = Math.random() < 0.5 ? -0.5 : 0.5;
    }

    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.applyMovement(engine);
        this.applyGravity(engine);
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawSpiny(ctx, sx, sy, frame);
    }
}

// ---- CHEEP CHEEP ----

class CheepCheep extends MarioEntity {
    constructor(x, y, opts) {
        super('cheepCheep', x, y);
        this.isEnemy = true;
        this.canBeStomp = true;
        this.isDangerous = true;
        this.color = opts.color || 'red';
        this.swimStyle = opts.swim || 'horizontal'; // horizontal or leaping
        this.vx = -0.8;
        this.vy = 0;
        this.startY = y;
    }

    onActivate() {
        if (this.swimStyle === 'leaping') {
            this.vy = -4;
            this.vx = -1;
        }
    }

    update(engine) {
        super.update(engine);
        if (!this.activated) return;

        this.x += this.vx;

        if (this.swimStyle === 'leaping') {
            this.vy += 0.15;
            this.y += this.vy;
            if (this.y > 260) this.active = false;
        } else {
            // Sine wave swimming
            this.y = this.startY + Math.sin(this.frame * 0.05) * 20;
        }

        if (this.x < engine.cameraX - 32) this.active = false;
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawCheepCheep(ctx, sx, sy, frame, this.color);
    }
}

// ---- BLOOPER ----

class Blooper extends MarioEntity {
    constructor(x, y, opts) {
        super('blooper', x, y);
        this.isEnemy = true;
        this.canBeStomp = false;
        this.isDangerous = true;
        this.height = 20;
        this.state = 'floating'; // floating, chasing
        this.stateTimer = 30;
        this.startY = y;
    }

    onActivate() {}

    update(engine) {
        super.update(engine);
        if (!this.activated) return;

        this.stateTimer--;
        if (this.stateTimer <= 0) {
            this.state = this.state === 'floating' ? 'chasing' : 'floating';
            this.stateTimer = 30 + Math.floor(Math.random() * 30);
        }

        if (this.state === 'chasing') {
            // Move toward player
            if (this.x < engine.playerX) this.x += 0.8;
            else this.x -= 0.8;
            if (this.y < engine.playerY) this.y += 0.5;
            else this.y -= 1.5;
        } else {
            // Float upward
            this.y -= 0.5;
            if (this.y < 50) this.y = 50;
        }
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawBlooper(ctx, sx, sy, frame);
    }
}

// ---- BOWSER ----

class Bowser extends MarioEntity {
    constructor(x, y, opts) {
        super('bowser', x, y);
        this.isEnemy = true;
        this.canBeStomp = false;
        this.isDangerous = true;
        this.fireproof = true; // Bowser takes HP damage from fireballs instead
        this.width = 32;
        this.height = 32;
        this.hp = opts.hp || 5;
        this.fireTimer = 0;
        this.jumpTimer = 0;
        this.moveTimer = 0;
        this.vx = -0.3;
        this.startX = x; // Track patrol bounds
        this.hitFlash = 0;
    }

    onActivate() {
        this.fireTimer = 90;
        this.jumpTimer = 150;
        this.moveTimer = 60;
        this.startX = this.x;
    }

    hitByFireball(engine) {
        this.hp--;
        this.hitFlash = 10;
        if (this.hp <= 0) {
            this.die();
            engine.addScore(5000);
            engine.showScorePopup(this.x, this.y, '5000');
        }
    }

    die() {
        this.deathTimer = 60;
        this.isDangerous = false;
        this.vy = -3;
        // Keep active briefly for death animation
    }

    update(engine) {
        if (this.deathTimer > 0) {
            this.deathTimer--;
            this.vy += 0.3;
            this.y += this.vy;
            if (this.deathTimer <= 0) {
                this.active = false;
            }
            return;
        }
        if (!this.active) return;
        super.update(engine);
        if (!this.activated) return;

        if (this.hitFlash > 0) this.hitFlash--;

        // Movement - patrol within bounds
        this.moveTimer--;
        if (this.moveTimer <= 0) {
            this.vx = -this.vx;
            this.moveTimer = 60 + Math.floor(Math.random() * 40);
        }

        this.x += this.vx;
        // Keep Bowser in patrol area (startX +/- 48 pixels)
        if (this.x < this.startX - 48) { this.x = this.startX - 48; this.vx = Math.abs(this.vx); }
        if (this.x > this.startX + 48) { this.x = this.startX + 48; this.vx = -Math.abs(this.vx); }

        this.applyGravity(engine);

        // Jump
        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.vy === 0) {
            this.vy = -3.5;
            this.jumpTimer = 120 + Math.floor(Math.random() * 60);
        }

        // Fire breath
        this.fireTimer--;
        if (this.fireTimer <= 0) {
            this.fireTimer = 60 + Math.floor(Math.random() * 40);
            engine.entities.push(new BowserFire(this.x - 16, this.y + 12, {}));
            engine.entities[engine.entities.length - 1].activated = true;
            nesAudio.playSFX('smb_bowserfire');
        }
    }

    render(ctx, sx, sy, frame) {
        if (!this.active && this.deathTimer <= 0) return;
        // Flash when hit
        if (this.hitFlash > 0 && Math.floor(this.hitFlash / 2) % 2 === 0) return;
        MarioRenderer.drawBowser(ctx, sx, sy, frame);
    }
}

// ---- BOWSER FIRE ----

class BowserFire extends MarioEntity {
    constructor(x, y, opts) {
        super('bowserFire', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.canBeStomp = false;
        this.fireproof = true;
        this.width = 24;
        this.height = 8;
        this.vx = -2;
    }

    update(engine) {
        super.update(engine);
        this.x += this.vx;
        if (this.x < engine.cameraX - 32) this.active = false;
    }

    render(ctx, sx, sy, frame) {
        const f = Math.floor(frame / 3) % 2;
        ctx.fillStyle = f === 0 ? '#D82800' : '#FC7460';
        ctx.fillRect(sx, sy, 24, 8);
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(sx + 4, sy + 2, 16, 4);
    }
}

// ---- FIRE BAR ----

class FireBar extends MarioEntity {
    constructor(x, y, opts) {
        super('fireBar', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.canBeStomp = false;
        this.noPlayerCollide = true; // Handle collision manually
        this.length = opts.length || 6;
        this.speed = opts.speed || 0.03;
        this.angle = 0;
        this.width = 0;
        this.height = 0;
        this.clockwise = opts.clockwise !== false;
    }

    update(engine) {
        super.update(engine);
        this.angle += this.clockwise ? this.speed : -this.speed;

        // Check collision with player
        for (let i = 1; i < this.length; i++) {
            const bx = this.x + Math.cos(this.angle) * i * 8;
            const by = this.y + Math.sin(this.angle) * i * 8;
            if (Math.abs(bx - engine.playerX - engine.playerW / 2) < 8 &&
                Math.abs(by - engine.playerY - engine.playerH / 2) < 8) {
                engine.takeDamage();
                break;
            }
        }
    }

    render(ctx, sx, sy, frame) {
        const cx = sx;
        const cy = sy;
        MarioRenderer.drawFireBar(ctx, cx, cy, this.angle, this.length, frame);
    }
}

// ---- ITEMS ----

class Mushroom extends MarioEntity {
    constructor(x, y, opts) {
        super('mushroom', x, y);
        this.isItem = true;
        this.vx = 1;
        this.emerging = !!opts.fromBlock;
        this.emergeTimer = this.emerging ? 16 : 0;
        this.startY = y;
    }

    update(engine) {
        super.update(engine);
        if (this.emerging) {
            this.emergeTimer--;
            this.y -= 1;
            if (this.emergeTimer <= 0) this.emerging = false;
            return;
        }
        this.applyMovement(engine);
        this.applyGravity(engine);
    }

    collect(engine) {
        this.active = false;
        engine.powerUp('mushroom');
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawMushroom(ctx, sx, sy, false);
    }
}

class OneUpMushroom extends MarioEntity {
    constructor(x, y, opts) {
        super('1up', x, y);
        this.isItem = true;
        this.vx = 1;
        this.emerging = !!opts.fromBlock;
        this.emergeTimer = this.emerging ? 16 : 0;
    }

    update(engine) {
        super.update(engine);
        if (this.emerging) {
            this.emergeTimer--;
            this.y -= 1;
            if (this.emergeTimer <= 0) this.emerging = false;
            return;
        }
        this.applyMovement(engine);
        this.applyGravity(engine);
    }

    collect(engine) {
        this.active = false;
        engine.powerUp('1up');
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawMushroom(ctx, sx, sy, true);
    }
}

class FireFlower extends MarioEntity {
    constructor(x, y, opts) {
        super('flower', x, y);
        this.isItem = true;
        this.emerging = !!opts.fromBlock;
        this.emergeTimer = this.emerging ? 16 : 0;
    }

    update(engine) {
        super.update(engine);
        if (this.emerging) {
            this.emergeTimer--;
            this.y -= 1;
            if (this.emergeTimer <= 0) this.emerging = false;
        }
    }

    collect(engine) {
        this.active = false;
        engine.powerUp('flower');
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawFlower(ctx, sx, sy, frame);
    }
}

class StarItem extends MarioEntity {
    constructor(x, y, opts) {
        super('star', x, y);
        this.isItem = true;
        this.vx = 1.5;
        this.vy = -3;
        this.emerging = !!opts.fromBlock;
        this.emergeTimer = this.emerging ? 16 : 0;
    }

    update(engine) {
        super.update(engine);
        if (this.emerging) {
            this.emergeTimer--;
            this.y -= 1;
            if (this.emergeTimer <= 0) this.emerging = false;
            return;
        }
        this.applyMovement(engine);
        // Bouncing star
        this.vy += 0.2;
        if (this.vy > 4) this.vy = 4;
        this.y += this.vy;
        const T = 16;
        const feetRow = Math.floor((this.y + this.height) / T);
        const col = Math.floor((this.x + this.width / 2) / T);
        if (engine.isSolid(engine.getTile(col, feetRow))) {
            this.y = feetRow * T - this.height;
            this.vy = -3;
        }
        if (this.y > 260) this.active = false;
    }

    collect(engine) {
        this.active = false;
        engine.powerUp('star');
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawStar(ctx, sx, sy, frame);
    }
}

// ---- FIREBALL (player) ----

class Fireball extends MarioEntity {
    constructor(x, y, opts) {
        super('fireball', x, y);
        this.noPlayerCollide = true;
        this.width = 8;
        this.height = 8;
        this.vx = (opts.dir || 1) * 3;
        this.vy = 0;
        this.bounceCount = 0;
    }

    update(engine) {
        super.update(engine);
        this.x += this.vx;
        this.vy += 0.3;
        this.y += this.vy;

        // Bounce off ground
        const T = 16;
        const feetRow = Math.floor((this.y + this.height) / T);
        const col = Math.floor((this.x + this.width / 2) / T);
        if (engine.isSolid(engine.getTile(col, feetRow))) {
            this.y = feetRow * T - this.height;
            this.vy = -2.5;
            this.bounceCount++;
        }

        // Wall collision
        const wallCol = Math.floor((this.vx > 0 ? this.x + this.width : this.x) / T);
        const wallRow = Math.floor((this.y + this.height / 2) / T);
        if (engine.isSolid(engine.getTile(wallCol, wallRow))) {
            this.active = false;
        }

        if (this.bounceCount > 4 || this.y > 260 || this.x < engine.cameraX - 16 || this.x > engine.cameraX + 272) {
            this.active = false;
        }
    }

    render(ctx, sx, sy, frame) {
        MarioRenderer.drawFireball(ctx, sx, sy, frame);
    }
}
