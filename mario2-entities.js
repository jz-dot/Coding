// ============================================================
// Super Ashio Bros. 2 - Entity System
// SMB2 (US) enemies, throwable items, bosses
// ============================================================

const Mario2Entities = {
    create(type, x, y, opts) {
        opts = opts || {};
        switch(type) {
            case 'shyguy': return new ShyGuy(x, y, opts);
            case 'shyguyBlue': return new ShyGuy(x, y, { ...opts, color: 'blue' });
            case 'snifit': return new Snifit(x, y, opts);
            case 'ninji': return new Ninji(x, y, opts);
            case 'birdo': return new Birdo(x, y, opts);
            case 'mouser': return new Mouser(x, y, opts);
            case 'wart': return new Wart(x, y, opts);
            case 'bomb': return new BombEntity(x, y, opts);
            case 'birdoEgg': return new BirdoEgg(x, y, opts);
            case 'snifitBullet': return new SnifitBullet(x, y, opts);
            case 'vegetable': return new Vegetable(x, y, opts);
            case 'cherry': return new Cherry(x, y, opts);
            case 'mushroom2': return new SMB2Mushroom(x, y, opts);
            case 'star2': return new SMB2Star(x, y, opts);
            case 'phanto': return new Phanto(x, y, opts);
            case 'pidgit': return new Pidgit(x, y, opts);
            case 'pokey': return new Pokey(x, y, opts);
            case 'panser': return new Panser(x, y, opts);
            case 'spark': return new Spark(x, y, opts);
            case 'trouter': return new Trouter(x, y, opts);
            default:
                console.warn('Unknown SMB2 entity type:', type);
                return new ShyGuy(x, y, opts);
        }
    }
};

// Base entity for SMB2
class SMB2Entity {
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
        this.canBePickedUp = false;
        this.canBeStoodOn = false;
        this.isDangerous = false;
        this.isBoss = false;
        this.deathTimer = 0;
        this.frame = 0;
        this.grounded = false;
    }

    onActivate() {}

    update(engine) {
        this.frame++;
    }

    applyGravity(engine) {
        this.vy += 0.3;
        if (this.vy > 4) this.vy = 4;
        this.y += this.vy;

        // Check ground collision
        const T = 16;
        const feetRow = Math.floor((this.y + this.height) / T);
        const leftCol = Math.floor(this.x / T);
        const rightCol = Math.floor((this.x + this.width - 1) / T);
        this.grounded = false;
        for (let c = leftCol; c <= rightCol; c++) {
            if (engine.isSolid(engine.getTile(c, feetRow))) {
                this.y = feetRow * T - this.height;
                this.vy = 0;
                this.grounded = true;
            }
        }
    }

    applyMovement(engine) {
        this.x += this.vx;
        // Wall collision
        const T = 16;
        const topRow = Math.floor(this.y / T);
        const bottomRow = Math.floor((this.y + this.height - 1) / T);
        if (this.vx < 0) {
            const col = Math.floor(this.x / T);
            for (let r = topRow; r <= bottomRow; r++) {
                if (engine.isSolid(engine.getTile(col, r))) {
                    this.x = (col + 1) * T;
                    this.vx = -this.vx;
                    this.direction = 1;
                }
            }
        } else if (this.vx > 0) {
            const col = Math.floor((this.x + this.width - 1) / T);
            for (let r = topRow; r <= bottomRow; r++) {
                if (engine.isSolid(engine.getTile(col, r))) {
                    this.x = col * T - this.width;
                    this.vx = -this.vx;
                    this.direction = -1;
                }
            }
        }
    }

    die() { this.active = false; this.deathTimer = 20; }
    render(ctx, sx, sy, frame) {}
}

// ---- BASIC ENEMIES ----

class ShyGuy extends SMB2Entity {
    constructor(x, y, opts) {
        super('shyguy', x, y);
        this.isEnemy = true;
        this.canBePickedUp = true;
        this.canBeStoodOn = true;
        this.isDangerous = true;
        this.color = opts.color || 'red';
        this.vx = -0.5;
    }
    onActivate() { this.vx = -0.5; }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.applyMovement(engine);
        this.applyGravity(engine);
    }
    render(ctx, sx, sy, frame) {
        Mario2Renderer.drawShyGuy(ctx, sx, sy, Math.floor(frame / 8), this.color);
    }
}

class Snifit extends SMB2Entity {
    constructor(x, y, opts) {
        super('snifit', x, y);
        this.isEnemy = true;
        this.canBePickedUp = true;
        this.canBeStoodOn = true;
        this.isDangerous = true;
        this.shootTimer = 120;
        this.vx = -0.3;
    }
    onActivate() { this.shootTimer = 60 + Math.floor(Math.random() * 60); }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.applyMovement(engine);
        this.applyGravity(engine);
        this.shootTimer--;
        if (this.shootTimer <= 0) {
            this.shootTimer = 90 + Math.floor(Math.random() * 60);
            const dir = engine.playerX < this.x ? -1 : 1;
            engine.entities.push(Mario2Entities.create('snifitBullet', this.x + dir * 8, this.y + 5, { dir }));
            engine.entities[engine.entities.length - 1].activated = true;
        }
    }
    render(ctx, sx, sy, frame) {
        Mario2Renderer.drawSnifit(ctx, sx, sy, Math.floor(frame / 8));
    }
}

class SnifitBullet extends SMB2Entity {
    constructor(x, y, opts) {
        super('snifitBullet', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.width = 8;
        this.height = 8;
        this.vx = (opts.dir || -1) * 2;
    }
    update(engine) {
        super.update(engine);
        this.x += this.vx;
        if (this.x < engine.cameraX - 16 || this.x > engine.cameraX + 272) this.active = false;
    }
    render(ctx, sx, sy) {
        ctx.fillStyle = '#000';
        ctx.fillRect(sx, sy, 8, 8);
    }
}

class Ninji extends SMB2Entity {
    constructor(x, y, opts) {
        super('ninji', x, y);
        this.isEnemy = true;
        this.canBePickedUp = true;
        this.canBeStoodOn = true;
        this.isDangerous = true;
        this.jumpTimer = 60;
        this.startY = y;
    }
    onActivate() { this.jumpTimer = 30 + Math.floor(Math.random() * 60); }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.applyGravity(engine);
        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.grounded) {
            this.vy = -4;
            this.jumpTimer = 60 + Math.floor(Math.random() * 40);
        }
    }
    render(ctx, sx, sy, frame) {
        Mario2Renderer.drawNinji(ctx, sx, sy, Math.floor(frame / 8));
    }
}

class Pidgit extends SMB2Entity {
    constructor(x, y, opts) {
        super('pidgit', x, y);
        this.isEnemy = true;
        this.canBeStoodOn = true;
        this.isDangerous = true;
        this.canBePickedUp = false;
        this.flyDir = 1;
        this.flyTimer = 60;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.flyTimer--;
        if (this.flyTimer <= 0) { this.flyDir = -this.flyDir; this.flyTimer = 60 + Math.floor(Math.random() * 30); }
        this.x += this.flyDir * 0.5;
        this.y += Math.sin(this.frame * 0.05) * 0.3;
    }
    render(ctx, sx, sy, frame) {
        ctx.fillStyle = '#D82800';
        ctx.fillRect(sx + 2, sy + 4, 12, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 4, sy + 5, 2, 2);
        // Wings
        const wf = Math.floor(frame / 6) % 2;
        ctx.fillStyle = '#888';
        ctx.fillRect(sx - 2, sy + wf * 2, 6, 4);
        ctx.fillRect(sx + 12, sy + wf * 2, 6, 4);
    }
}

class Pokey extends SMB2Entity {
    constructor(x, y, opts) {
        super('pokey', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.canBePickedUp = false;
        this.height = 48;
        this.segments = 3;
    }
    update(engine) {
        super.update(engine);
    }
    render(ctx, sx, sy, frame) {
        // Cactus segments
        ctx.fillStyle = '#00A800';
        for (let i = 0; i < this.segments; i++) {
            ctx.fillRect(sx + 2, sy + i * 16 + 2, 12, 14);
        }
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(sx + 4, sy + 2, 3, 3);
        ctx.fillRect(sx + 9, sy + 2, 3, 3);
    }
}

class Panser extends SMB2Entity {
    constructor(x, y, opts) {
        super('panser', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.fireTimer = 90;
    }
    onActivate() { this.fireTimer = 60; }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.fireTimer--;
        if (this.fireTimer <= 0) {
            this.fireTimer = 90 + Math.floor(Math.random() * 60);
            // Shoot fireball upward
            const fb = Mario2Entities.create('snifitBullet', this.x + 4, this.y - 8, { dir: 0 });
            fb.vy = -3;
            fb.vx = (engine.playerX < this.x ? -0.5 : 0.5);
            fb.activated = true;
            engine.entities.push(fb);
        }
    }
    render(ctx, sx, sy, frame) {
        ctx.fillStyle = '#D82800';
        ctx.fillRect(sx + 2, sy + 4, 12, 12);
        ctx.fillStyle = '#00A800';
        ctx.fillRect(sx + 4, sy + 10, 8, 6);
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(sx + 4, sy, 8, 6);
    }
}

class Spark extends SMB2Entity {
    constructor(x, y, opts) {
        super('spark', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.canBePickedUp = false;
        this.width = 8;
        this.height = 8;
        this.wallDir = opts.wallDir || 1;
        this.moveDir = opts.moveDir || 1;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        // Move along surfaces
        this.x += this.moveDir * 0.8;
        this.y += this.wallDir * 0.8;
    }
    render(ctx, sx, sy, frame) {
        const f = Math.floor(frame / 3) % 2;
        ctx.fillStyle = f ? '#FAC000' : '#FC7460';
        ctx.fillRect(sx, sy, 8, 8);
    }
}

class Trouter extends SMB2Entity {
    constructor(x, y, opts) {
        super('trouter', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.canBeStoodOn = true;
        this.canBePickedUp = true;
        this.startY = y;
        this.jumpPhase = Math.random() * Math.PI * 2;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.jumpPhase += 0.04;
        this.y = this.startY + Math.sin(this.jumpPhase) * 40;
    }
    render(ctx, sx, sy, frame) {
        ctx.fillStyle = '#D82800';
        ctx.fillRect(sx + 2, sy + 2, 12, 10);
        ctx.fillStyle = '#FC7460';
        ctx.fillRect(sx + 4, sy + 4, 8, 6);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(sx + 8, sy + 4, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 9, sy + 5, 1, 1);
    }
}

// ---- BOSSES ----

class Birdo extends SMB2Entity {
    constructor(x, y, opts) {
        super('birdo', x, y);
        this.isEnemy = true;
        this.isBoss = true;
        this.isDangerous = true;
        this.canBeStoodOn = false;
        this.width = 24;
        this.height = 24;
        this.hp = opts.hp || 3;
        this.color = opts.color || 'pink';
        this.shootTimer = 90;
        this.moveTimer = 60;
        this.jumpTimer = 120;
        this.startX = x;
    }
    onActivate() {
        this.shootTimer = 60;
        this.moveTimer = 40;
        this.jumpTimer = 90;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.applyGravity(engine);

        this.moveTimer--;
        if (this.moveTimer <= 0) {
            this.vx = engine.playerX < this.x ? -0.5 : 0.5;
            this.moveTimer = 60 + Math.floor(Math.random() * 40);
        }
        this.x += this.vx;
        // Bound patrol area
        if (this.x < this.startX - 64) { this.x = this.startX - 64; this.vx = 0.5; }
        if (this.x > this.startX + 32) { this.x = this.startX + 32; this.vx = -0.5; }

        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.grounded) {
            this.vy = -3;
            this.jumpTimer = 90 + Math.floor(Math.random() * 60);
        }

        this.shootTimer--;
        if (this.shootTimer <= 0) {
            this.shootTimer = 60 + Math.floor(Math.random() * 30);
            const egg = Mario2Entities.create('birdoEgg', this.x - 12, this.y + 6, {});
            egg.vx = engine.playerX < this.x ? -2 : 2;
            egg.activated = true;
            engine.entities.push(egg);
        }
    }
    hitByThrow(engine) {
        this.hp--;
        if (this.hp <= 0) {
            this.die();
            engine.addScore(2000);
            engine.showScorePopup(this.x, this.y, '2000');
            nesAudio.playSFX('smb2_boss_die');
            engine.bossDefeated = true;
        } else {
            nesAudio.playSFX('smb2_boss_hit');
        }
    }
    render(ctx, sx, sy, frame) {
        if (!this.active) return;
        Mario2Renderer.drawBirdo(ctx, sx, sy, Math.floor(frame / 8), this.color);
    }
}

class BirdoEgg extends SMB2Entity {
    constructor(x, y, opts) {
        super('birdoEgg', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.canBePickedUp = true;
        this.canBeStoodOn = true;
        this.width = 12;
        this.height = 12;
    }
    update(engine) {
        super.update(engine);
        this.x += this.vx;
        if (this.x < engine.cameraX - 20 || this.x > engine.cameraX + 272) this.active = false;
    }
    render(ctx, sx, sy) {
        Mario2Renderer.drawBirdoEgg(ctx, sx, sy);
    }
}

class Mouser extends SMB2Entity {
    constructor(x, y, opts) {
        super('mouser', x, y);
        this.isEnemy = true;
        this.isBoss = true;
        this.isDangerous = true;
        this.width = 32;
        this.height = 24;
        this.hp = opts.hp || 3;
        this.throwTimer = 90;
        this.jumpTimer = 120;
        this.startX = x;
    }
    onActivate() {
        this.throwTimer = 60;
        this.jumpTimer = 90;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.applyGravity(engine);
        this.throwTimer--;
        if (this.throwTimer <= 0) {
            this.throwTimer = 90 + Math.floor(Math.random() * 60);
            const bomb = Mario2Entities.create('bomb', this.x - 8, this.y - 8, { lit: true, thrown: true });
            bomb.vx = engine.playerX < this.x ? -2 : 2;
            bomb.vy = -3;
            bomb.activated = true;
            engine.entities.push(bomb);
        }
        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.grounded) {
            this.vy = -4;
            this.jumpTimer = 100 + Math.floor(Math.random() * 60);
        }
    }
    hitByThrow(engine) {
        this.hp--;
        if (this.hp <= 0) {
            this.die();
            engine.addScore(3000);
            engine.showScorePopup(this.x, this.y, '3000');
            nesAudio.playSFX('smb2_boss_die');
            engine.bossDefeated = true;
        } else {
            nesAudio.playSFX('smb2_boss_hit');
        }
    }
    render(ctx, sx, sy, frame) {
        if (!this.active) return;
        Mario2Renderer.drawMouser(ctx, sx, sy, Math.floor(frame / 8));
    }
}

class Wart extends SMB2Entity {
    constructor(x, y, opts) {
        super('wart', x, y);
        this.isEnemy = true;
        this.isBoss = true;
        this.isDangerous = true;
        this.width = 32;
        this.height = 32;
        this.hp = opts.hp || 6;
        this.mouthOpen = false;
        this.mouthTimer = 0;
        this.bubbleTimer = 60;
        this.startX = x;
    }
    onActivate() {
        this.bubbleTimer = 60;
        this.mouthTimer = 90;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;

        // Wart opens mouth periodically - only vulnerable then
        this.mouthTimer--;
        if (this.mouthTimer <= 0) {
            this.mouthOpen = !this.mouthOpen;
            this.mouthTimer = this.mouthOpen ? 60 : 90;
        }

        // Shoot bubbles
        this.bubbleTimer--;
        if (this.bubbleTimer <= 0 && !this.mouthOpen) {
            this.bubbleTimer = 30 + Math.floor(Math.random() * 30);
            const b = Mario2Entities.create('snifitBullet', this.x - 8, this.y + 12, { dir: -1 });
            b.activated = true;
            engine.entities.push(b);
        }

        // Slow movement
        this.x += Math.sin(this.frame * 0.02) * 0.5;
    }
    hitByVegetable(engine) {
        if (!this.mouthOpen) return false;
        this.hp--;
        if (this.hp <= 0) {
            this.die();
            engine.addScore(10000);
            engine.showScorePopup(this.x, this.y, '10000');
            nesAudio.playSFX('smb2_boss_die');
            engine.bossDefeated = true;
            engine.gameWon = true;
        } else {
            nesAudio.playSFX('smb2_boss_hit');
        }
        return true;
    }
    render(ctx, sx, sy, frame) {
        if (!this.active) return;
        Mario2Renderer.drawWart(ctx, sx, sy, this.mouthOpen ? frame : 0);
    }
}

// ---- THROWABLE ITEMS ----

class BombEntity extends SMB2Entity {
    constructor(x, y, opts) {
        super('bomb', x, y);
        this.isItem = !opts.thrown;
        this.isEnemy = !!opts.thrown;
        this.isDangerous = !!opts.thrown;
        this.canBePickedUp = true;
        this.lit = opts.lit || false;
        this.fuseTimer = opts.lit ? 180 : 0;
        this.exploding = false;
        this.explodeTimer = 0;
    }
    update(engine) {
        super.update(engine);
        if (this.lit) {
            this.fuseTimer--;
            if (this.fuseTimer <= 0 && !this.exploding) {
                this.explode(engine);
            }
        }
        if (this.exploding) {
            this.explodeTimer--;
            if (this.explodeTimer <= 0) this.active = false;
        } else {
            this.applyGravity(engine);
            this.x += this.vx;
            this.vx *= 0.98;
        }
    }
    explode(engine) {
        this.exploding = true;
        this.explodeTimer = 20;
        nesAudio.playSFX('smb2_bomb');
        // Damage nearby enemies/blocks
        for (const e of engine.entities) {
            if (e !== this && e.active && e.isEnemy) {
                const dx = e.x - this.x;
                const dy = e.y - this.y;
                if (Math.abs(dx) < 48 && Math.abs(dy) < 48) {
                    if (e.hitByThrow) e.hitByThrow(engine);
                    else e.die();
                }
            }
        }
    }
    render(ctx, sx, sy, frame) {
        if (this.exploding) {
            ctx.fillStyle = Math.floor(frame / 2) % 2 ? '#FC7460' : '#FAC000';
            ctx.fillRect(sx - 8, sy - 8, 32, 32);
        } else {
            Mario2Renderer.drawBomb(ctx, sx, sy, frame, this.lit);
        }
    }
}

class Vegetable extends SMB2Entity {
    constructor(x, y, opts) {
        super('vegetable', x, y);
        this.isItem = false; // Becomes throwable projectile
        this.isDangerous = false;
        this.vegType = opts.vegType || 'turnip';
        this.thrown = false;
        this.damage = 1;
    }
    update(engine) {
        super.update(engine);
        if (this.thrown) {
            this.x += this.vx;
            this.vy += 0.2;
            this.y += this.vy;
            // Check enemy collision
            for (const e of engine.entities) {
                if (e !== this && e.active && e.isEnemy && !e.isItem) {
                    if (this.x < e.x + e.width && this.x + this.width > e.x &&
                        this.y < e.y + e.height && this.y + this.height > e.y) {
                        if (e.hitByThrow) {
                            e.hitByThrow(engine);
                        } else if (e.hitByVegetable) {
                            e.hitByVegetable(engine);
                        } else {
                            e.die();
                            engine.addScore(200);
                            engine.showScorePopup(e.x, e.y, '200');
                        }
                        this.active = false;
                        nesAudio.playSFX('smb2_enemy_hit');
                        return;
                    }
                }
            }
            if (this.y > 260) this.active = false;
        }
    }
    render(ctx, sx, sy, frame) {
        Mario2Renderer.drawVegetable(ctx, sx, sy, this.vegType);
    }
}

class Cherry extends SMB2Entity {
    constructor(x, y, opts) {
        super('cherry', x, y);
        this.isItem = true;
    }
    update(engine) { super.update(engine); }
    collect(engine) {
        this.active = false;
        engine.cherries++;
        engine.addScore(100);
        nesAudio.playSFX('smb2_cherry');
        if (engine.cherries >= 5) {
            engine.cherries = 0;
            engine.spawnStar();
        }
    }
    render(ctx, sx, sy, frame) {
        Mario2Renderer.drawTile(ctx, 18, sx, sy, frame); // Cherry tile
    }
}

class SMB2Mushroom extends SMB2Entity {
    constructor(x, y, opts) {
        super('mushroom2', x, y);
        this.isItem = true;
    }
    update(engine) {
        super.update(engine);
        this.applyGravity(engine);
        this.x += this.vx;
    }
    collect(engine) {
        this.active = false;
        engine.hp = Math.min(engine.hp + 1, engine.maxHp);
        engine.addScore(500);
        nesAudio.playSFX('smb_powerup');
    }
    render(ctx, sx, sy) {
        ctx.fillStyle = '#D82800';
        ctx.fillRect(sx + 2, sy, 12, 8);
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(sx + 4, sy + 2, 4, 4);
        ctx.fillRect(sx + 10, sy + 2, 2, 4);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(sx + 4, sy + 8, 8, 6);
    }
}

class SMB2Star extends SMB2Entity {
    constructor(x, y, opts) {
        super('star2', x, y);
        this.isItem = true;
        this.vy = -2;
        this.vx = 1;
    }
    update(engine) {
        super.update(engine);
        this.vy += 0.15;
        if (this.vy > 3) this.vy = 3;
        this.y += this.vy;
        this.x += this.vx;
        // Bounce off ground
        const T = 16;
        const feetRow = Math.floor((this.y + this.height) / T);
        const col = Math.floor((this.x + 8) / T);
        if (engine.isSolid(engine.getTile(col, feetRow))) {
            this.y = feetRow * T - this.height;
            this.vy = -2;
        }
        if (this.y > 260) this.active = false;
    }
    collect(engine) {
        this.active = false;
        engine.invincible = true;
        engine.invTimer = 600;
        engine.addScore(1000);
        nesAudio.playSFX('smb_powerup');
    }
    render(ctx, sx, sy, frame) {
        const f = Math.floor(frame / 4) % 2;
        ctx.fillStyle = f ? '#FAC000' : '#FC7460';
        ctx.fillRect(sx + 4, sy + 2, 8, 4);
        ctx.fillRect(sx + 2, sy + 4, 12, 6);
        ctx.fillRect(sx + 4, sy + 10, 8, 4);
    }
}

class Phanto extends SMB2Entity {
    constructor(x, y, opts) {
        super('phanto', x, y);
        this.isEnemy = true;
        this.isDangerous = true;
        this.chasing = false;
        this.startX = x;
        this.startY = y;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        // Phanto chases player when they hold the key
        if (engine.holdingKey) {
            this.chasing = true;
            const dx = engine.playerX - this.x;
            const dy = engine.playerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            this.x += (dx / dist) * 1.5;
            this.y += (dy / dist) * 1.5;
        } else {
            this.chasing = false;
            // Return to start position
            this.x += (this.startX - this.x) * 0.02;
            this.y += (this.startY - this.y) * 0.02;
        }
    }
    render(ctx, sx, sy, frame) {
        const f = Math.floor(frame / 4) % 2;
        ctx.fillStyle = this.chasing ? '#FCFCFC' : '#888';
        ctx.fillRect(sx + 2, sy + 2, 12, 12);
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 4, sy + 4, 3, 3);
        ctx.fillRect(sx + 9, sy + 4, 3, 3);
        ctx.fillRect(sx + 6, sy + 9, 4, 3);
    }
}
