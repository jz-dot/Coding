// ============================================================
// Super Ashio Bros. 3 - Entity System
// SMB3 enemies, Koopalings, Boom-Boom, enhanced mechanics
// ============================================================

const Mario3Entities = {
    create(type, x, y, opts) {
        opts = opts || {};
        switch(type) {
            case 'goomba3': return new Goomba3(x, y, opts);
            case 'koopa3': return new Koopa3(x, y, opts);
            case 'parakoopa3': return new Koopa3(x, y, { ...opts, flying: true });
            case 'piranha3': return new Piranha3(x, y, opts);
            case 'boomBoom': return new BoomBoom(x, y, opts);
            case 'koopaling': return new Koopaling(x, y, opts);
            case 'bowser3': return new Bowser3(x, y, opts);
            case 'hammerBro3': return new HammerBro3(x, y, opts);
            case 'boomerangBro': return new BoomerangBro(x, y, opts);
            case 'fireBro': return new FireBro(x, y, opts);
            case 'dryBones': return new DryBones(x, y, opts);
            case 'thwomp': return new Thwomp(x, y, opts);
            case 'bobomb': return new BobOmb(x, y, opts);
            case 'lakitu3': return new Lakitu3(x, y, opts);
            case 'bulletBill3': return new BulletBill3(x, y, opts);
            case 'mushroom3': return new Mushroom3(x, y, opts);
            case 'fireFlower3': return new FireFlower3(x, y, opts);
            case 'superLeaf': return new SuperLeaf(x, y, opts);
            case 'star3': return new Star3(x, y, opts);
            case 'frogSuit': return new FrogSuit(x, y, opts);
            case 'tanookiSuit': return new TanookiSuit(x, y, opts);
            case 'hammerSuit': return new HammerSuit(x, y, opts);
            case 'fireball3': return new Fireball3(x, y, opts);
            case 'coin3': return new Coin3(x, y, opts);
            default:
                console.warn('Unknown SMB3 entity:', type);
                return new Goomba3(x, y, opts);
        }
    }
};

class SMB3Entity {
    constructor(type, x, y) {
        this.type = type;
        this.x = x; this.y = y;
        this.vx = 0; this.vy = 0;
        this.width = 16; this.height = 16;
        this.active = true; this.activated = false;
        this.direction = -1; this.frame = 0;
        this.isEnemy = false; this.isItem = false;
        this.canBeStomp = false; this.isDangerous = false;
        this.canBeKilledByBlock = false; this.fireproof = false;
        this.deathTimer = 0; this.grounded = false;
    }
    onActivate() {}
    update(engine) { this.frame++; }
    applyGravity(engine) {
        this.vy += 0.3;
        if (this.vy > 4) this.vy = 4;
        this.y += this.vy;
        const T = 16;
        const feetRow = Math.floor((this.y + this.height) / T);
        const lc = Math.floor(this.x / T);
        const rc = Math.floor((this.x + this.width - 1) / T);
        this.grounded = false;
        for (let c = lc; c <= rc; c++) {
            if (engine.isSolid(engine.getTile(c, feetRow))) {
                this.y = feetRow * T - this.height;
                this.vy = 0;
                this.grounded = true;
            }
        }
    }
    applyMovement(engine) {
        this.x += this.vx;
        const T = 16;
        const tr = Math.floor(this.y / T);
        const br = Math.floor((this.y + this.height - 1) / T);
        if (this.vx < 0) {
            const c = Math.floor(this.x / T);
            for (let r = tr; r <= br; r++) {
                if (engine.isSolid(engine.getTile(c, r))) {
                    this.x = (c + 1) * T; this.vx = -this.vx; this.direction = 1;
                }
            }
        } else if (this.vx > 0) {
            const c = Math.floor((this.x + this.width - 1) / T);
            for (let r = tr; r <= br; r++) {
                if (engine.isSolid(engine.getTile(c, r))) {
                    this.x = c * T - this.width; this.vx = -this.vx; this.direction = -1;
                }
            }
        }
    }
    die() { this.active = false; this.deathTimer = 15; }
    render(ctx, sx, sy, frame) {}
}

// ---- BASIC ENEMIES ----

class Goomba3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('goomba3', x, y);
        this.isEnemy = true; this.canBeStomp = true;
        this.canBeKilledByBlock = true; this.isDangerous = true;
        this.vx = -0.5; this.squished = false;
    }
    onActivate() { this.vx = -0.5; }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        if (this.squished) { this.deathTimer--; if (this.deathTimer <= 0) this.active = false; return; }
        this.applyMovement(engine); this.applyGravity(engine);
    }
    onStomp(engine) {
        this.squished = true; this.isDangerous = false; this.canBeStomp = false;
        this.deathTimer = 30; this.vx = 0;
    }
    render(ctx, sx, sy, frame) {
        if (this.squished) { ctx.fillStyle = '#C84C0C'; ctx.fillRect(sx + 2, sy + 10, 12, 6); return; }
        Mario3Renderer.drawGoomba(ctx, sx, sy, frame);
    }
}

class Koopa3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('koopa3', x, y);
        this.isEnemy = true; this.canBeStomp = true;
        this.canBeKilledByBlock = true; this.isDangerous = true;
        this.height = 24; this.vx = -0.5;
        this.inShell = false; this.shellMoving = false; this.shellKickTimer = 0;
        this.flying = opts.flying || false;
        this.flyPhase = 0;
        this.startY = y;
    }
    onActivate() { this.vx = -0.5; }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        if (this.shellKickTimer > 0) this.shellKickTimer--;
        if (this.inShell && this.shellMoving) {
            for (const e of engine.entities) {
                if (e !== this && e.active && e.isEnemy) {
                    if (this.x < e.x + e.width && this.x + this.width > e.x &&
                        this.y < e.y + e.height && this.y + this.height > e.y) {
                        e.die(); engine.addScore(500);
                    }
                }
            }
        }
        this.applyMovement(engine);
        if (this.flying && !this.inShell) {
            this.flyPhase += 0.04;
            this.y = this.startY + Math.sin(this.flyPhase) * 30;
        } else {
            this.applyGravity(engine);
        }
    }
    onStomp(engine) {
        if (this.flying) { this.flying = false; return; }
        if (!this.inShell) {
            this.inShell = true; this.shellMoving = false;
            this.vx = 0; this.height = 16; this.isDangerous = false;
        } else if (!this.shellMoving) {
            this.shellMoving = true; this.isDangerous = true;
            this.vx = engine.playerX < this.x ? 3 : -3;
            this.shellKickTimer = 10;
            nesAudio.playSFX('smb_kick');
        } else {
            this.shellMoving = false; this.vx = 0; this.isDangerous = false;
        }
    }
    render(ctx, sx, sy, frame) {
        if (this.inShell) {
            ctx.fillStyle = '#00A800';
            ctx.fillRect(sx + 2, sy + 2, 12, 12);
            ctx.fillStyle = '#FCFCFC';
            ctx.fillRect(sx + 4, sy + 4, 8, 8);
        } else {
            Mario3Renderer.drawKoopa(ctx, sx, sy, frame, this.flying);
        }
    }
}

class Piranha3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('piranha3', x, y);
        this.isEnemy = true; this.isDangerous = true;
        this.canBeStomp = false; this.fireproof = true;
        this.baseY = y; this.emergeOffset = 24;
        this.state = 'hidden'; this.stateTimer = 60;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        const T = 16;
        const nearPipe = Math.abs(engine.playerX - this.x) < 32;
        if (this.state === 'hidden') {
            this.y = this.baseY + this.emergeOffset;
            this.stateTimer--;
            if (this.stateTimer <= 0 && !nearPipe) { this.state = 'emerging'; this.stateTimer = 24; }
        } else if (this.state === 'emerging') {
            this.y -= 1; this.stateTimer--;
            if (this.stateTimer <= 0) { this.state = 'up'; this.stateTimer = 60; }
        } else if (this.state === 'up') {
            this.stateTimer--;
            if (this.stateTimer <= 0) { this.state = 'retreating'; this.stateTimer = 24; }
        } else if (this.state === 'retreating') {
            this.y += 1; this.stateTimer--;
            if (this.stateTimer <= 0) { this.state = 'hidden'; this.stateTimer = 60; }
        }
    }
    render(ctx, sx, sy) {
        ctx.fillStyle = '#D82800';
        ctx.fillRect(sx + 2, sy, 12, 8);
        ctx.fillRect(sx + 4, sy + 8, 8, 8);
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(sx + 3, sy + 2, 3, 2);
        ctx.fillRect(sx + 10, sy + 2, 3, 2);
    }
}

// ---- FORTRESS / CASTLE ENEMIES ----

class BoomBoom extends SMB3Entity {
    constructor(x, y, opts) {
        super('boomBoom', x, y);
        this.isEnemy = true; this.isBoss = true;
        this.canBeStomp = true; this.isDangerous = true;
        this.width = 32; this.height = 28;
        this.hp = opts.hp || 3;
        this.stunTimer = 0; this.moveTimer = 0;
        this.jumpTimer = 60; this.startX = x;
    }
    onActivate() { this.moveTimer = 40; this.jumpTimer = 60; }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        if (this.stunTimer > 0) { this.stunTimer--; if (this.stunTimer <= 0 && this.hp > 0) this.isDangerous = true; return; }
        this.moveTimer--;
        if (this.moveTimer <= 0) { this.vx = engine.playerX < this.x ? -1 : 1; this.moveTimer = 40 + Math.floor(Math.random() * 20); }
        this.x += this.vx;
        if (this.x < this.startX - 64) { this.x = this.startX - 64; this.vx = 1; }
        if (this.x > this.startX + 32) { this.x = this.startX + 32; this.vx = -1; }
        this.applyGravity(engine);
        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.grounded) { this.vy = -4; this.jumpTimer = 50 + Math.floor(Math.random() * 30); }
    }
    onStomp(engine) {
        this.hp--; this.stunTimer = 60;
        this.isDangerous = false; this.vx = 0;
        nesAudio.playSFX('smb3_boom');
        if (this.hp <= 0) {
            this.die(); engine.addScore(3000);
            engine.showScorePopup(this.x, this.y, '3000');
            engine.bossDefeated = true;
        }
        // isDangerous restored when stunTimer expires in update()
    }
    render(ctx, sx, sy, frame) {
        if (!this.active) return;
        if (this.stunTimer > 0 && Math.floor(this.stunTimer / 3) % 2 === 0) return;
        Mario3Renderer.drawBoomBoom(ctx, sx, sy, frame);
    }
}

class Koopaling extends SMB3Entity {
    constructor(x, y, opts) {
        super('koopaling', x, y);
        this.isEnemy = true; this.isBoss = true;
        this.canBeStomp = true; this.isDangerous = true;
        this.width = 32; this.height = 28;
        this.hp = opts.hp || 3; this.name = opts.name || 'larry';
        this.stunTimer = 0; this.moveTimer = 0; this.attackTimer = 90;
        this.jumpTimer = 80; this.startX = x;
    }
    onActivate() { this.moveTimer = 30; this.attackTimer = 60; this.jumpTimer = 60; }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        if (this.stunTimer > 0) { this.stunTimer--; if (this.stunTimer <= 0 && this.hp > 0) this.isDangerous = true; return; }
        this.moveTimer--;
        if (this.moveTimer <= 0) { this.vx = engine.playerX < this.x ? -0.8 : 0.8; this.moveTimer = 30 + Math.floor(Math.random() * 30); }
        this.x += this.vx;
        if (this.x < this.startX - 80) this.vx = 0.8;
        if (this.x > this.startX + 48) this.vx = -0.8;
        this.applyGravity(engine);
        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.grounded) { this.vy = -5; this.jumpTimer = 60 + Math.floor(Math.random() * 40); }
        this.attackTimer--;
        if (this.attackTimer <= 0) {
            this.attackTimer = 80 + Math.floor(Math.random() * 40);
            // Shoot magic blast
            const fb = Mario3Entities.create('fireball3', this.x, this.y + 8, { dir: engine.playerX < this.x ? -1 : 1 });
            fb.activated = true; engine.entities.push(fb);
        }
    }
    onStomp(engine) {
        this.hp--; this.stunTimer = 90; this.isDangerous = false; this.vx = 0;
        nesAudio.playSFX('smb3_boom');
        if (this.hp <= 0) {
            this.die(); engine.addScore(5000);
            engine.showScorePopup(this.x, this.y, '5000');
            engine.bossDefeated = true;
        }
        // isDangerous restored when stunTimer expires in update()
    }
    render(ctx, sx, sy, frame) {
        if (!this.active) return;
        if (this.stunTimer > 0 && Math.floor(this.stunTimer / 3) % 2 === 0) return;
        Mario3Renderer.drawKoopaling(ctx, sx, sy, frame, this.name);
    }
}

class Bowser3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('bowser3', x, y);
        this.isEnemy = true; this.isBoss = true;
        this.isDangerous = true; this.fireproof = true;
        this.width = 40; this.height = 40;
        this.hp = opts.hp || 10; this.moveTimer = 0;
        this.jumpTimer = 90; this.fireTimer = 60;
        this.startX = x; this.hitFlash = 0;
        this.phase = 1; // Gets harder at low HP
    }
    onActivate() { this.moveTimer = 40; this.jumpTimer = 60; this.fireTimer = 40; }
    hitByFireball(engine) {
        this.hp--; this.hitFlash = 15;
        if (this.hp <= 0) {
            this.die(); engine.addScore(50000);
            engine.showScorePopup(this.x, this.y, '50000');
            engine.bossDefeated = true; engine.gameWon = true;
            nesAudio.playSFX('smb_bowserfall');
        }
    }
    die() { this.deathTimer = 60; this.isDangerous = false; this.vy = -3; this.dying = true; }
    update(engine) {
        if (this.dying) {
            this.deathTimer--;
            this.vy += 0.3;
            this.y += this.vy;
            if (this.deathTimer <= 0) this.active = false;
            return;
        }
        super.update(engine);
        if (!this.activated) return;
        if (this.hitFlash > 0) this.hitFlash--;
        this.phase = this.hp <= 5 ? 2 : 1;
        const speed = this.phase === 2 ? 1.2 : 0.6;
        this.moveTimer--;
        if (this.moveTimer <= 0) { this.vx = engine.playerX < this.x ? -speed : speed; this.moveTimer = 30 + Math.floor(Math.random() * 20); }
        this.x += this.vx;
        if (this.x < this.startX - 80) this.vx = speed;
        if (this.x > this.startX + 48) this.vx = -speed;
        this.applyGravity(engine);
        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.grounded) {
            this.vy = this.phase === 2 ? -6 : -4.5;
            this.jumpTimer = this.phase === 2 ? 40 : 70;
        }
        this.fireTimer--;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.phase === 2 ? 30 : 50;
            const fb = Mario3Entities.create('fireball3', this.x - 16, this.y + 16, { dir: -1, big: true });
            fb.activated = true; engine.entities.push(fb);
            nesAudio.playSFX('smb_bowserfire');
        }
    }
    render(ctx, sx, sy, frame) {
        if (!this.active && this.deathTimer <= 0) return;
        if (this.hitFlash > 0 && Math.floor(this.hitFlash / 2) % 2 === 0) return;
        Mario3Renderer.drawBowser3(ctx, sx, sy, frame);
    }
}

// ---- MORE ENEMIES ----

class HammerBro3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('hammerBro3', x, y);
        this.isEnemy = true; this.canBeStomp = true;
        this.isDangerous = true; this.height = 24;
        this.throwTimer = 45; this.jumpTimer = 120;
    }
    onActivate() { this.throwTimer = 30; this.jumpTimer = 80; this.vx = 0.3; }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.applyMovement(engine); this.applyGravity(engine);
        this.throwTimer--;
        if (this.throwTimer <= 0) {
            this.throwTimer = 40 + Math.floor(Math.random() * 30);
            const h = Mario3Entities.create('fireball3', this.x, this.y - 8, { dir: engine.playerX < this.x ? -1 : 1 });
            h.vy = -3; h.activated = true; engine.entities.push(h);
        }
        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.grounded) { this.vy = -3; this.jumpTimer = 80 + Math.floor(Math.random() * 40); }
    }
    render(ctx, sx, sy, frame) {
        ctx.fillStyle = '#00A800';
        ctx.fillRect(sx + 2, sy, 12, 10);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(sx + 4, sy + 2, 8, 6);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(sx + 2, sy + 10, 12, 8);
        ctx.fillStyle = '#00A800';
        ctx.fillRect(sx + 4, sy + 12, 8, 4);
        ctx.fillRect(sx + 2, sy + 18, 5, 6);
        ctx.fillRect(sx + 9, sy + 18, 5, 6);
    }
}

class BoomerangBro extends HammerBro3 { constructor(x, y, opts) { super(x, y, opts); this.type = 'boomerangBro'; } }
class FireBro extends HammerBro3 { constructor(x, y, opts) { super(x, y, opts); this.type = 'fireBro'; } }

class DryBones extends SMB3Entity {
    constructor(x, y, opts) {
        super('dryBones', x, y);
        this.isEnemy = true; this.canBeStomp = true;
        this.isDangerous = true; this.fireproof = true;
        this.height = 24; this.vx = -0.3;
        this.collapsed = false; this.reviveTimer = 0;
    }
    onActivate() { this.vx = -0.3; }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        if (this.collapsed) {
            this.reviveTimer--;
            if (this.reviveTimer <= 0) {
                this.collapsed = false; this.isDangerous = true;
                this.canBeStomp = true; this.vx = -0.3;
            }
            return;
        }
        this.applyMovement(engine); this.applyGravity(engine);
    }
    onStomp() {
        this.collapsed = true; this.reviveTimer = 180;
        this.isDangerous = false; this.canBeStomp = false; this.vx = 0;
    }
    render(ctx, sx, sy, frame) {
        if (this.collapsed) {
            ctx.fillStyle = '#FCFCFC'; ctx.fillRect(sx + 3, sy + 16, 10, 8);
        } else {
            ctx.fillStyle = '#FCFCFC';
            ctx.fillRect(sx + 4, sy, 8, 24);
            ctx.fillStyle = '#000';
            ctx.fillRect(sx + 5, sy + 2, 2, 2);
            ctx.fillRect(sx + 9, sy + 2, 2, 2);
        }
    }
}

class Thwomp extends SMB3Entity {
    constructor(x, y, opts) {
        super('thwomp', x, y);
        this.isEnemy = true; this.isDangerous = true;
        this.fireproof = true; this.width = 24; this.height = 32;
        this.startY = y; this.state = 'waiting'; this.timer = 0;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        if (this.state === 'waiting') {
            if (Math.abs(engine.playerX - this.x) < 40) { this.state = 'falling'; }
        } else if (this.state === 'falling') {
            this.vy += 0.8; this.y += this.vy;
            if (this.y > this.startY + 100 || this.grounded) {
                this.state = 'waiting_rise'; this.timer = 60; this.vy = 0;
                nesAudio.playSFX('smb3_boom');
            }
            const feetRow = Math.floor((this.y + this.height) / 16);
            for (let c = Math.floor(this.x / 16); c <= Math.floor((this.x + this.width) / 16); c++) {
                if (engine.isSolid(engine.getTile(c, feetRow))) {
                    this.y = feetRow * 16 - this.height; this.vy = 0; this.grounded = true;
                    this.state = 'waiting_rise'; this.timer = 60;
                }
            }
        } else if (this.state === 'waiting_rise') {
            this.timer--;
            if (this.timer <= 0) { this.state = 'rising'; }
        } else if (this.state === 'rising') {
            this.y -= 0.5;
            if (this.y <= this.startY) { this.y = this.startY; this.state = 'waiting'; }
        }
    }
    render(ctx, sx, sy) {
        ctx.fillStyle = '#888';
        ctx.fillRect(sx, sy, 24, 32);
        ctx.fillStyle = '#585858';
        ctx.fillRect(sx + 2, sy + 2, 20, 28);
        // Face
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(sx + 4, sy + 8, 6, 6);
        ctx.fillRect(sx + 14, sy + 8, 6, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 6, sy + 10, 3, 3);
        ctx.fillRect(sx + 16, sy + 10, 3, 3);
        // Spikes
        ctx.fillStyle = '#888';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(sx + i * 8 + 2, sy - 4, 4, 6);
            ctx.fillRect(sx + i * 8 + 2, sy + 30, 4, 6);
        }
    }
}

class BobOmb extends SMB3Entity {
    constructor(x, y, opts) {
        super('bobomb', x, y);
        this.isEnemy = true; this.canBeStomp = true;
        this.isDangerous = true; this.vx = -0.5;
        this.lit = false; this.fuseTimer = 0;
    }
    onActivate() { this.vx = -0.5; }
    onStomp() {
        this.lit = true; this.fuseTimer = 180; this.vx = 0; this.isDangerous = false; this.canBeStomp = false;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        if (this.lit) {
            this.fuseTimer--;
            if (this.fuseTimer <= 0) {
                this.active = false; nesAudio.playSFX('smb3_boom');
                for (const e of engine.entities) {
                    if (e !== this && e.active && e.isEnemy && Math.abs(e.x - this.x) < 48 && Math.abs(e.y - this.y) < 48) {
                        e.die(); engine.addScore(200);
                    }
                }
            }
        } else {
            this.applyMovement(engine); this.applyGravity(engine);
        }
    }
    render(ctx, sx, sy, frame) {
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 2, sy + 2, 12, 12);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(sx + 4, sy + 4, 3, 3);
        ctx.fillRect(sx + 9, sy + 4, 3, 3);
        if (this.lit) {
            const f = Math.floor(frame / 3) % 2;
            ctx.fillStyle = f ? '#FAC000' : '#FC7460';
            ctx.fillRect(sx + 6, sy - 4, 4, 6);
        }
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(sx + 5, sy + 10, 6, 4);
    }
}

class Lakitu3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('lakitu3', x, y);
        this.isEnemy = true; this.canBeStomp = true;
        this.isDangerous = true; this.spawnTimer = 120;
    }
    update(engine) {
        super.update(engine);
        if (!this.activated) return;
        this.x += (engine.playerX - this.x) * 0.02;
        this.y = 40;
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = 120 + Math.floor(Math.random() * 60);
            const s = Mario3Entities.create('goomba3', this.x, this.y + 16, {});
            s.activated = true; s.vy = 1; engine.entities.push(s);
        }
    }
    render(ctx, sx, sy, frame) {
        // Cloud
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(sx - 2, sy + 8, 20, 8);
        // Lakitu
        ctx.fillStyle = '#00A800';
        ctx.fillRect(sx + 2, sy, 12, 10);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(sx + 4, sy + 2, 8, 5);
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 5, sy + 3, 2, 2);
        ctx.fillRect(sx + 9, sy + 3, 2, 2);
    }
}

class BulletBill3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('bulletBill3', x, y);
        this.isEnemy = true; this.canBeStomp = true;
        this.isDangerous = true; this.fireproof = true;
        this.vx = (opts.dir || -1) * 2;
    }
    update(engine) {
        super.update(engine);
        this.x += this.vx;
        if (this.x < engine.cameraX - 32 || this.x > engine.cameraX + 280) this.active = false;
    }
    render(ctx, sx, sy) {
        ctx.fillStyle = '#000';
        ctx.fillRect(sx, sy + 2, 16, 12);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(sx + 2, sy + 4, 4, 4);
    }
}

// ---- PROJECTILES ----

class Fireball3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('fireball3', x, y);
        this.isPlayerFireball = opts.isPlayerFireball || false;
        this.isEnemy = !this.isPlayerFireball;
        this.isDangerous = !this.isPlayerFireball;
        this.canBeStomp = false;
        this.width = 8; this.height = 8;
        this.vx = (opts.dir || -1) * 2.5;
        this.vy = opts.vy || 0;
        this.big = opts.big || false;
        this.isHammer = opts.isHammer || false;
        if (this.big) { this.width = 16; this.height = 16; }
    }
    update(engine) {
        super.update(engine);
        this.x += this.vx;
        if (this.vy) { this.y += this.vy; this.vy += 0.2; } // gravity for hammers
        if (this.x < engine.camX - 32 || this.x > engine.camX + 280) this.active = false;
        if (this.y > 256) this.active = false;
        // Player fireballs damage enemies
        if (this.isPlayerFireball) {
            for (const e of engine.entities) {
                if (e === this || !e.active || !e.isEnemy || e.isPlayerFireball) continue;
                if (this.x < e.x + e.width && this.x + this.width > e.x &&
                    this.y < e.y + e.height && this.y + this.height > e.y) {
                    if (typeof e.hitByFireball === 'function') e.hitByFireball(engine);
                    else if (typeof e.die === 'function') e.die();
                    this.active = false;
                    engine.score += 100;
                    break;
                }
            }
        }
    }
    render(ctx, sx, sy, frame) {
        const f = Math.floor(frame / 3) % 2;
        ctx.fillStyle = f ? '#D82800' : '#FC7460';
        ctx.fillRect(sx, sy, this.width, this.height);
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(sx + 2, sy + 2, this.width - 4, this.height - 4);
    }
}

// ---- ITEMS ----

class Mushroom3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('mushroom3', x, y);
        this.isItem = true; this.vx = 1;
        this.isLife = !!opts.isLife;
        this.emerging = !!opts.fromBlock; this.emergeTimer = this.emerging ? 16 : 0;
    }
    update(engine) {
        super.update(engine);
        if (this.emerging) { this.emergeTimer--; this.y -= 1; if (this.emergeTimer <= 0) this.emerging = false; return; }
        this.applyMovement(engine); this.applyGravity(engine);
    }
    collect(engine) { this.active = false; engine.powerUp('mushroom'); }
    render(ctx, sx, sy) {
        ctx.fillStyle = '#D82800';
        ctx.fillRect(sx + 2, sy, 12, 8);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(sx + 4, sy + 2, 4, 4);
        ctx.fillRect(sx + 10, sy + 2, 2, 4);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(sx + 4, sy + 8, 8, 6);
    }
}

class FireFlower3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('fireFlower3', x, y);
        this.isItem = true;
        this.emerging = !!opts.fromBlock; this.emergeTimer = this.emerging ? 16 : 0;
    }
    update(engine) {
        super.update(engine);
        if (this.emerging) { this.emergeTimer--; this.y -= 1; if (this.emergeTimer <= 0) this.emerging = false; }
    }
    collect(engine) { this.active = false; engine.powerUp('flower'); }
    render(ctx, sx, sy, frame) {
        const f = Math.floor(frame / 8) % 2;
        ctx.fillStyle = f ? '#D82800' : '#FC7460';
        ctx.fillRect(sx + 4, sy, 8, 6);
        ctx.fillStyle = '#00A800';
        ctx.fillRect(sx + 6, sy + 6, 4, 8);
        ctx.fillRect(sx + 3, sy + 8, 10, 4);
    }
}

class SuperLeaf extends SMB3Entity {
    constructor(x, y, opts) {
        super('superLeaf', x, y);
        this.isItem = true; this.vy = -2;
        this.swayPhase = 0;
        this.emerging = !!opts.fromBlock; this.emergeTimer = this.emerging ? 16 : 0;
    }
    update(engine) {
        super.update(engine);
        if (this.emerging) { this.emergeTimer--; this.y -= 1; if (this.emergeTimer <= 0) this.emerging = false; return; }
        this.swayPhase += 0.08;
        this.vx = Math.sin(this.swayPhase) * 1.5;
        this.vy += 0.05;
        if (this.vy > 1) this.vy = 1;
        this.x += this.vx; this.y += this.vy;
        if (this.y > 260) this.active = false;
    }
    collect(engine) { this.active = false; engine.powerUp('raccoon'); }
    render(ctx, sx, sy, frame) {
        ctx.fillStyle = '#C84C0C';
        ctx.fillRect(sx + 4, sy + 2, 8, 10);
        ctx.fillStyle = '#E09C5C';
        ctx.fillRect(sx + 5, sy + 3, 6, 6);
        ctx.fillStyle = '#005800';
        ctx.fillRect(sx + 7, sy, 2, 4);
    }
}

class Star3 extends SMB3Entity {
    constructor(x, y, opts) {
        super('star3', x, y);
        this.isItem = true; this.vx = 1.5; this.vy = -3;
        this.emerging = !!opts.fromBlock; this.emergeTimer = this.emerging ? 16 : 0;
    }
    update(engine) {
        super.update(engine);
        if (this.emerging) { this.emergeTimer--; this.y -= 1; if (this.emergeTimer <= 0) this.emerging = false; return; }
        this.applyMovement(engine);
        this.vy += 0.2; if (this.vy > 4) this.vy = 4;
        this.y += this.vy;
        const feetRow = Math.floor((this.y + this.height) / 16);
        const col = Math.floor((this.x + 8) / 16);
        if (engine.isSolid(engine.getTile(col, feetRow))) { this.y = feetRow * 16 - this.height; this.vy = -3; }
        if (this.y > 260) this.active = false;
    }
    collect(engine) { this.active = false; engine.powerUp('star'); }
    render(ctx, sx, sy, frame) {
        const f = Math.floor(frame / 4) % 2;
        ctx.fillStyle = f ? '#FAC000' : '#FC7460';
        ctx.fillRect(sx + 4, sy + 2, 8, 4);
        ctx.fillRect(sx + 2, sy + 4, 12, 6);
        ctx.fillRect(sx + 4, sy + 10, 8, 4);
    }
}

class FrogSuit extends SMB3Entity {
    constructor(x, y, opts) { super('frogSuit', x, y); this.isItem = true; }
    collect(engine) { this.active = false; engine.powerUp('frog'); }
    render(ctx, sx, sy) {
        ctx.fillStyle = '#00A800';
        ctx.fillRect(sx + 2, sy + 2, 12, 12);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(sx + 4, sy + 4, 3, 3);
        ctx.fillRect(sx + 9, sy + 4, 3, 3);
    }
}

class TanookiSuit extends SMB3Entity {
    constructor(x, y, opts) { super('tanookiSuit', x, y); this.isItem = true; }
    collect(engine) { this.active = false; engine.powerUp('tanooki'); }
    render(ctx, sx, sy) {
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(sx + 2, sy + 2, 12, 12);
        ctx.fillStyle = '#C8A030';
        ctx.fillRect(sx + 4, sy + 6, 8, 6);
    }
}

class HammerSuit extends SMB3Entity {
    constructor(x, y, opts) { super('hammerSuit', x, y); this.isItem = true; }
    collect(engine) { this.active = false; engine.powerUp('hammer'); }
    render(ctx, sx, sy) {
        ctx.fillStyle = '#000';
        ctx.fillRect(sx + 2, sy + 2, 12, 12);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(sx + 5, sy + 5, 6, 6);
    }
}

class Coin3 extends SMB3Entity {
    constructor(x, y, opts) { super('coin3', x, y); this.isItem = true; }
    collect(engine) { this.active = false; engine.collectCoin(); }
    render(ctx, sx, sy, frame) { Mario3Renderer.drawTile(ctx, 11, sx, sy, frame); }
}
