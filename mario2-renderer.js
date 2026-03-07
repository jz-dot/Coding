// ============================================================
// Super Ashio Bros. 2 - Renderer
// SMB2 (US) visual style - all procedural pixel art
// ============================================================

const Mario2Renderer = {
    TILE_SIZE: 16,
    SCREEN_W: 256,
    SCREEN_H: 240,
    HUD_HEIGHT: 16,

    COLORS: {
        SKY: '#5C94FC',
        SKY_NIGHT: '#000020',
        GROUND: '#E09C5C',
        GROUND_DARK: '#C84C0C',
        SAND: '#FCCC6C',
        SAND_DARK: '#D8A830',
        GRASS: '#00A800',
        GRASS_DARK: '#005800',
        BRICK: '#C84C0C',
        BRICK_DARK: '#A43000',
        DOOR: '#8B4513',
        DOOR_GOLD: '#FAC000',
        CHERRY_RED: '#D82800',
        CHERRY_DARK: '#A40000',
        POW_BLUE: '#2038EC',
        VASE: '#00A800',
        VASE_DARK: '#005800',
        ICE: '#9CBCFC',
        ICE_DARK: '#6C8CCC',
        WHALE: '#FCFCFC',
        CLOUD: '#FCFCFC',
    },

    // Character palettes (same family as SMB1)
    ASHIO_PALETTE: {
        hair: '#FFE040', hairDark: '#C8A020',
        skin: '#FCA044', skinLight: '#FCDCB8',
        eyes: '#3070E0',
        outfit: '#B13425', outfitDark: '#6B1C11',
        shirt: '#6B8CFF',
    },
    AIDIO_PALETTE: {
        hair: '#8B5A2B', hairDark: '#5C3317',
        skin: '#FCA044', skinLight: '#FCDCB8',
        eyes: '#30A030',
        outfit: '#00A800', outfitDark: '#005800',
        shirt: '#6B8CFF',
    },
    AVA_PALETTE: {
        hair: '#5C3317', hairDark: '#3C1F0A',
        skin: '#D2A679', skinLight: '#FCDCB8',
        eyes: '#6B4226',
        outfit: '#FC74FC', outfitDark: '#BC3CBC',
        shirt: '#FCFCFC',
    },
    TOAD_PALETTE: {
        hat: '#FCFCFC', hatDots: '#D82800',
        skin: '#FCA044', skinLight: '#FCDCB8',
        eyes: '#000000',
        outfit: '#2038EC', outfitDark: '#0010A0',
        vest: '#D82800',
    },

    drawBackground(ctx, levelType, scrollX, scrollY, frame) {
        if (levelType === 'underground' || levelType === 'inside') {
            ctx.fillStyle = '#000000';
        } else if (levelType === 'night') {
            ctx.fillStyle = '#000020';
        } else if (levelType === 'desert') {
            ctx.fillStyle = '#FCCC6C';
        } else if (levelType === 'ice') {
            ctx.fillStyle = '#9CBCFC';
        } else {
            ctx.fillStyle = this.COLORS.SKY;
        }
        ctx.fillRect(0, 0, this.SCREEN_W, this.SCREEN_H);

        if (levelType === 'overworld' || levelType === 'desert') {
            this.drawClouds(ctx, scrollX);
            this.drawHills(ctx, scrollX, levelType);
        }
    },

    drawClouds(ctx, scrollX) {
        const offset = Math.floor(scrollX * 0.2) % 256;
        for (let i = 0; i < 5; i++) {
            const cx = (i * 70 + 20 - offset + 500) % 300 - 20;
            const cy = 25 + (i % 3) * 15;
            this.drawCloud(ctx, cx, cy, 24 + (i % 2) * 12);
        }
    },

    drawCloud(ctx, x, y, w) {
        ctx.fillStyle = this.COLORS.CLOUD;
        ctx.fillRect(x + 4, y, w - 8, 10);
        ctx.fillRect(x, y + 3, w, 6);
    },

    drawHills(ctx, scrollX, type) {
        const c1 = type === 'desert' ? this.COLORS.SAND_DARK : this.COLORS.GRASS;
        const c2 = type === 'desert' ? this.COLORS.SAND : this.COLORS.GRASS_DARK;
        const offset = Math.floor(scrollX * 0.3) % 256;
        for (let i = 0; i < 4; i++) {
            const hx = (i * 90 + 10 - offset + 500) % 400 - 50;
            const hw = 60 + (i % 2) * 30;
            const hh = 20 + (i % 3) * 10;
            ctx.fillStyle = c1;
            ctx.beginPath();
            ctx.moveTo(hx, 224);
            ctx.lineTo(hx + hw / 2, 224 - hh);
            ctx.lineTo(hx + hw, 224);
            ctx.fill();
        }
    },

    drawTile(ctx, tileType, x, y, frame) {
        const T = this.TILE_SIZE;
        switch(tileType) {
            case 1: // Ground
                ctx.fillStyle = this.COLORS.GROUND;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = this.COLORS.GROUND_DARK;
                ctx.fillRect(x, y, T, 2);
                ctx.fillRect(x + 4, y + 6, 8, 2);
                break;
            case 2: // Brick
                ctx.fillStyle = this.COLORS.BRICK;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = this.COLORS.BRICK_DARK;
                ctx.fillRect(x, y + T - 1, T, 1);
                ctx.fillRect(x + 7, y, 1, T);
                break;
            case 3: // Grass/vegetation top
                ctx.fillStyle = this.COLORS.GRASS;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = this.COLORS.GRASS_DARK;
                ctx.fillRect(x + 2, y + 2, 4, 4);
                ctx.fillRect(x + 10, y + 6, 4, 4);
                break;
            case 4: // Sand
                ctx.fillStyle = this.COLORS.SAND;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = this.COLORS.SAND_DARK;
                ctx.fillRect(x + 3, y + 5, 4, 2);
                ctx.fillRect(x + 10, y + 9, 3, 2);
                break;
            case 5: // Door
                ctx.fillStyle = this.COLORS.DOOR;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = this.COLORS.DOOR_GOLD;
                ctx.fillRect(x + 6, y + 6, 4, 4);
                break;
            case 6: // Ladder
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(x + 2, y, 3, T);
                ctx.fillRect(x + 11, y, 3, T);
                ctx.fillRect(x + 2, y + 4, 12, 2);
                ctx.fillRect(x + 2, y + 12, 12, 2);
                break;
            case 7: // POW block
                ctx.fillStyle = this.COLORS.POW_BLUE;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x + 1, y + 1, 2, T - 2);
                ctx.font = '7px monospace';
                ctx.fillText('P', x + 3, y + 11);
                break;
            case 8: // Vase/jar
                ctx.fillStyle = this.COLORS.VASE;
                ctx.fillRect(x + 2, y, 12, T);
                ctx.fillStyle = this.COLORS.VASE_DARK;
                ctx.fillRect(x + 4, y, 8, 3);
                break;
            case 9: // Mushroom block (pullable vegetation)
                ctx.fillStyle = this.COLORS.GRASS;
                ctx.fillRect(x + 3, y, 10, 8);
                ctx.fillStyle = this.COLORS.GRASS_DARK;
                ctx.fillRect(x + 6, y + 8, 4, 4);
                break;
            case 10: // Ice
                ctx.fillStyle = this.COLORS.ICE;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = this.COLORS.ICE_DARK;
                ctx.fillRect(x + 3, y + 3, 6, 2);
                ctx.fillRect(x + 8, y + 10, 5, 2);
                break;
            case 11: // Spikes
                ctx.fillStyle = '#888';
                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(x + i * 4, y + 4, 4, T - 4);
                    ctx.fillRect(x + i * 4 + 1, y + 2, 2, 2);
                    ctx.fillRect(x + i * 4 + 1, y, 1, 2);
                }
                break;
            case 12: // Waterfall
                ctx.fillStyle = '#6C8CCC';
                ctx.fillRect(x, y, T, T);
                const wf = Math.floor(frame / 4) % 4;
                ctx.fillStyle = '#9CBCFC';
                ctx.fillRect(x + wf * 4, y, 4, T);
                break;
            case 13: // Vine
                ctx.fillStyle = '#005800';
                ctx.fillRect(x + 6, y, 4, T);
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x + 3, y + 3, 4, 4);
                ctx.fillRect(x + 9, y + 10, 4, 4);
                break;
            case 14: // Chain
                ctx.fillStyle = '#888';
                ctx.fillRect(x + 6, y, 4, T);
                ctx.fillStyle = '#BBB';
                ctx.fillRect(x + 7, y + 2, 2, 4);
                ctx.fillRect(x + 7, y + 10, 2, 4);
                break;
            case 15: // Mushroom platform (top)
                ctx.fillStyle = '#D82800';
                ctx.fillRect(x, y, T, 6);
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x + 3, y + 1, 4, 3);
                ctx.fillRect(x + 10, y + 1, 3, 3);
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(x + 6, y + 6, 4, T - 6);
                break;
            case 16: // Cloud platform
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x, y, T, 8);
                ctx.fillStyle = '#E0E0E0';
                ctx.fillRect(x + 2, y + 6, T - 4, 2);
                break;
            case 17: // Crystal ball
                const cf = Math.floor(frame / 6) % 2;
                ctx.fillStyle = cf ? '#FC74FC' : '#BC3CBC';
                ctx.fillRect(x + 4, y + 2, 8, 12);
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x + 5, y + 3, 3, 3);
                break;
            case 18: // Cherry
                ctx.fillStyle = '#005800';
                ctx.fillRect(x + 7, y, 2, 6);
                ctx.fillStyle = this.COLORS.CHERRY_RED;
                ctx.fillRect(x + 4, y + 6, 6, 6);
                ctx.fillStyle = '#FC7460';
                ctx.fillRect(x + 5, y + 7, 2, 2);
                break;
            case 19: // Locked door
                ctx.fillStyle = '#585858';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#FAC000';
                ctx.fillRect(x + 5, y + 5, 6, 6);
                ctx.fillRect(x + 7, y + 11, 2, 4);
                break;
            case 20: // Key
                ctx.fillStyle = '#FAC000';
                ctx.fillRect(x + 4, y + 2, 8, 6);
                ctx.fillRect(x + 6, y + 8, 4, 4);
                ctx.fillRect(x + 7, y + 12, 2, 2);
                ctx.fillStyle = '#C87400';
                ctx.fillRect(x + 6, y + 3, 4, 4);
                break;
            default:
                if (tileType > 0) {
                    ctx.fillStyle = '#888';
                    ctx.fillRect(x, y, T, T);
                }
        }
    },

    // SMB2 characters are taller (16x24 normally, 16x16 when small)
    drawCharacter(ctx, x, y, charIdx, frame, dir, carrying, big) {
        const palettes = [this.ASHIO_PALETTE, this.AIDIO_PALETTE, this.AVA_PALETTE, this.TOAD_PALETTE];
        const p = palettes[charIdx] || palettes[0];
        const s = 2; // pixel scale

        ctx.save();
        if (dir === -1) {
            ctx.translate(x + 16, 0);
            ctx.scale(-1, 1);
            x = 0;
        }

        if (charIdx === 3) {
            // Toad - shorter, wider
            this.drawToadChar(ctx, x, y, p, frame, carrying);
        } else if (charIdx === 2) {
            // Ava/Princess - float ability shown in dress
            this.drawPrincessChar(ctx, x, y, p, frame, carrying);
        } else {
            // Ashio (0) or Aidio (1)
            this.drawMarioChar(ctx, x, y, p, frame, carrying, charIdx === 1);
        }

        ctx.restore();
    },

    drawMarioChar(ctx, x, y, p, frame, carrying, isLuigi) {
        // Head
        ctx.fillStyle = p.hair;
        ctx.fillRect(x + 4, y, 8, 4);
        if (isLuigi) {
            ctx.fillRect(x + 10, y - 2, 4, 4); // mullet
            ctx.fillRect(x + 12, y + 2, 2, 4);
        } else {
            ctx.fillRect(x + 10, y, 4, 4); // shoulder length
            ctx.fillRect(x + 12, y + 4, 2, 4);
        }
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 4, y + 4, 8, 4);
        ctx.fillStyle = p.eyes;
        ctx.fillRect(x + 6, y + 4, 2, 2);

        // Body
        ctx.fillStyle = p.outfit;
        ctx.fillRect(x + 2, y + 8, 12, 8);
        ctx.fillStyle = p.shirt;
        ctx.fillRect(x + 4, y + 10, 8, 4);

        // Legs - animate
        const walkFrame = frame % 3;
        ctx.fillStyle = p.outfit;
        if (walkFrame === 0) {
            ctx.fillRect(x + 3, y + 16, 4, 6);
            ctx.fillRect(x + 9, y + 16, 4, 6);
        } else if (walkFrame === 1) {
            ctx.fillRect(x + 2, y + 16, 4, 6);
            ctx.fillRect(x + 10, y + 16, 4, 4);
        } else {
            ctx.fillRect(x + 4, y + 16, 4, 4);
            ctx.fillRect(x + 8, y + 16, 4, 6);
        }

        // Carrying item above head
        if (carrying) {
            ctx.fillStyle = '#FAC000';
            ctx.fillRect(x + 2, y - 10, 12, 8);
        }

        // Arms
        ctx.fillStyle = p.skin;
        ctx.fillRect(x, y + 9, 3, 3);
        ctx.fillRect(x + 13, y + 9, 3, 3);
    },

    drawPrincessChar(ctx, x, y, p, frame, carrying) {
        // Crown
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(x + 5, y - 4, 6, 3);
        ctx.fillRect(x + 6, y - 6, 2, 2);
        ctx.fillRect(x + 9, y - 6, 2, 2);

        // Head
        ctx.fillStyle = p.hair;
        ctx.fillRect(x + 3, y, 10, 6);
        ctx.fillRect(x + 11, y + 2, 3, 8); // long hair
        ctx.fillRect(x + 12, y + 10, 2, 4);
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 4, y + 2, 8, 4);
        ctx.fillStyle = p.eyes;
        ctx.fillRect(x + 6, y + 3, 2, 2);

        // Dress
        ctx.fillStyle = p.outfit;
        ctx.fillRect(x + 2, y + 8, 12, 10);
        ctx.fillStyle = p.outfitDark;
        ctx.fillRect(x + 1, y + 14, 14, 4);

        // Legs peek under dress
        const walkFrame = frame % 2;
        ctx.fillStyle = p.skin;
        if (walkFrame === 0) {
            ctx.fillRect(x + 4, y + 18, 3, 4);
            ctx.fillRect(x + 9, y + 18, 3, 4);
        } else {
            ctx.fillRect(x + 3, y + 18, 3, 4);
            ctx.fillRect(x + 10, y + 18, 3, 4);
        }

        if (carrying) {
            ctx.fillStyle = '#FAC000';
            ctx.fillRect(x + 2, y - 12, 12, 8);
        }
    },

    drawToadChar(ctx, x, y, p, frame, carrying) {
        // Mushroom cap
        ctx.fillStyle = p.hat;
        ctx.fillRect(x + 1, y, 14, 8);
        ctx.fillStyle = p.hatDots;
        ctx.fillRect(x + 3, y + 1, 4, 4);
        ctx.fillRect(x + 9, y + 1, 4, 4);

        // Face
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 4, y + 8, 8, 4);
        ctx.fillStyle = p.eyes;
        ctx.fillRect(x + 5, y + 9, 2, 2);
        ctx.fillRect(x + 9, y + 9, 2, 2);

        // Body - vest
        ctx.fillStyle = p.outfit;
        ctx.fillRect(x + 3, y + 12, 10, 6);
        ctx.fillStyle = p.vest;
        ctx.fillRect(x + 5, y + 13, 6, 4);

        // Legs
        ctx.fillStyle = p.skin;
        const walkFrame = frame % 2;
        if (walkFrame === 0) {
            ctx.fillRect(x + 4, y + 18, 4, 4);
            ctx.fillRect(x + 9, y + 18, 4, 4);
        } else {
            ctx.fillRect(x + 3, y + 18, 4, 4);
            ctx.fillRect(x + 10, y + 18, 4, 4);
        }

        if (carrying) {
            ctx.fillStyle = '#FAC000';
            ctx.fillRect(x + 2, y - 8, 12, 8);
        }
    },

    // SMB2 Enemies
    drawShyGuy(ctx, x, y, frame, color) {
        const c = color === 'blue' ? '#2038EC' : '#D82800';
        const cd = color === 'blue' ? '#0010A0' : '#A40000';
        ctx.fillStyle = c;
        ctx.fillRect(x + 2, y, 12, 12);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(x + 4, y + 2, 8, 4);
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + 5, y + 3, 2, 2);
        ctx.fillRect(x + 9, y + 3, 2, 2);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 6, y + 3, 1, 1);
        ctx.fillRect(x + 10, y + 3, 1, 1);
        // Feet
        ctx.fillStyle = cd;
        const wf = frame % 2;
        ctx.fillRect(x + 3 - wf, y + 12, 4, 4);
        ctx.fillRect(x + 9 + wf, y + 12, 4, 4);
    },

    drawSnifit(ctx, x, y, frame) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 2, y, 12, 12);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(x + 4, y + 2, 8, 4);
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + 5, y + 3, 2, 2);
        ctx.fillRect(x + 9, y + 3, 2, 2);
        // Snout
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y + 5, 4, 3);
        // Feet
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 3, y + 12, 4, 4);
        ctx.fillRect(x + 9, y + 12, 4, 4);
    },

    drawNinji(ctx, x, y, frame) {
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 4, y, 8, 14);
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + 5, y + 2, 2, 3);
        ctx.fillRect(x + 9, y + 2, 2, 3);
        ctx.fillStyle = '#D82800';
        ctx.fillRect(x + 5, y + 3, 2, 1);
        ctx.fillRect(x + 9, y + 3, 2, 1);
    },

    drawBirdo(ctx, x, y, frame, color) {
        const c = color === 'green' ? '#00A800' : (color === 'red' ? '#D82800' : '#FC74FC');
        // Body
        ctx.fillStyle = c;
        ctx.fillRect(x + 2, y + 4, 20, 16);
        // Head
        ctx.fillRect(x, y, 14, 12);
        // Snout
        ctx.fillRect(x - 6, y + 4, 8, 6);
        // Bow
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + 8, y - 2, 6, 4);
        // Eye
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + 3, y + 3, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 4, y + 4, 2, 2);
        // Feet
        ctx.fillStyle = c;
        ctx.fillRect(x + 4, y + 20, 6, 4);
        ctx.fillRect(x + 14, y + 20, 6, 4);
    },

    drawBirdoEgg(ctx, x, y) {
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x, y + 2, 12, 8);
        ctx.fillRect(x + 2, y, 8, 12);
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(x + 3, y + 3, 4, 3);
    },

    drawMouser(ctx, x, y, frame) {
        // Mouse boss
        ctx.fillStyle = '#888';
        ctx.fillRect(x + 4, y, 24, 24);
        // Ears
        ctx.fillStyle = '#AAA';
        ctx.fillRect(x + 6, y - 4, 6, 6);
        ctx.fillRect(x + 20, y - 4, 6, 6);
        // Face
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(x + 8, y + 4, 16, 8);
        // Eyes
        ctx.fillStyle = '#D82800';
        ctx.fillRect(x + 10, y + 5, 4, 4);
        ctx.fillRect(x + 18, y + 5, 4, 4);
        // Sunglasses
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 8, y + 4, 16, 2);
        ctx.fillRect(x + 10, y + 4, 4, 5);
        ctx.fillRect(x + 18, y + 4, 4, 5);
    },

    drawBomb(ctx, x, y, frame, lit) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 2, y + 2, 12, 12);
        ctx.fillStyle = '#444';
        ctx.fillRect(x + 4, y + 4, 8, 8);
        if (lit) {
            const f = Math.floor(frame / 3) % 2;
            ctx.fillStyle = f ? '#FC7460' : '#FAC000';
            ctx.fillRect(x + 6, y - 4, 4, 6);
        }
    },

    drawVegetable(ctx, x, y, vegType) {
        switch(vegType) {
            case 'turnip':
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x + 2, y + 4, 12, 10);
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x + 5, y, 6, 6);
                ctx.fillStyle = '#FC74FC';
                ctx.fillRect(x + 4, y + 8, 2, 2);
                ctx.fillRect(x + 10, y + 8, 2, 2);
                break;
            case 'shell':
                ctx.fillStyle = '#D82800';
                ctx.fillRect(x + 2, y + 4, 12, 10);
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x + 4, y + 6, 8, 6);
                break;
            case 'potion':
                ctx.fillStyle = '#D82800';
                ctx.fillRect(x + 4, y, 8, 14);
                ctx.fillStyle = '#FAC000';
                ctx.fillRect(x + 5, y + 1, 6, 4);
                break;
            case 'rocket':
                ctx.fillStyle = '#D82800';
                ctx.fillRect(x + 4, y + 2, 8, 12);
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x + 5, y + 4, 6, 4);
                ctx.fillStyle = '#FAC000';
                ctx.fillRect(x + 5, y + 14, 6, 2);
                break;
            default:
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x + 2, y + 2, 12, 12);
                ctx.fillStyle = '#005800';
                ctx.fillRect(x + 5, y, 6, 4);
        }
    },

    drawWart(ctx, x, y, frame) {
        // Final boss - large frog
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x + 2, y + 4, 28, 24);
        // Crown
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(x + 8, y - 4, 16, 6);
        ctx.fillRect(x + 10, y - 8, 4, 4);
        ctx.fillRect(x + 18, y - 8, 4, 4);
        // Belly
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + 6, y + 12, 20, 12);
        // Eyes
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + 6, y + 4, 8, 6);
        ctx.fillRect(x + 18, y + 4, 8, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 8, y + 6, 4, 3);
        ctx.fillRect(x + 20, y + 6, 4, 3);
        // Mouth
        const mouthIsOpen = frame > 0;
        ctx.fillStyle = '#D82800';
        ctx.fillRect(x + 10, y + 22, 12, mouthIsOpen ? 6 : 3);
    },

    drawHUD(ctx, lives, charIdx, world, stage, score, cherries) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.SCREEN_W, this.HUD_HEIGHT);
        ctx.fillStyle = '#FFF';
        ctx.font = '8px "Press Start 2P", monospace';
        const names = ['ASHIO', 'AIDIO', 'AVA', 'TOAD'];
        ctx.fillText(names[charIdx] || 'ASHIO', 8, 11);
        ctx.fillText('\u2665'.repeat(Math.min(lives, 4)), 80, 11);
        ctx.fillText(world + '-' + stage, 140, 11);
        ctx.fillText(String(score).padStart(7, '0'), 180, 11);
    },

    drawCharSelectScreen(ctx, selectedChar, frame) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.SCREEN_W, this.SCREEN_H);

        ctx.fillStyle = '#FFF';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('PLAYER SELECT', 64, 30);

        const names = ['ASHIO', 'AIDIO', 'AVA', 'TOAD'];
        const descs = ['BALANCED', 'HIGH JUMP', 'FLOAT', 'FAST PULL'];
        for (let i = 0; i < 4; i++) {
            const cx = 24 + i * 56;
            const cy = 80;
            this.drawCharacter(ctx, cx, cy, i, Math.floor(frame / 8), 1, false, true);
            ctx.fillStyle = selectedChar === i ? '#FAC000' : '#FFF';
            ctx.fillText(names[i], cx - 4, cy + 36);
            ctx.fillStyle = '#888';
            ctx.font = '6px monospace';
            ctx.fillText(descs[i], cx - 6, cy + 48);
            ctx.font = '8px "Press Start 2P", monospace';

            if (selectedChar === i) {
                // Selection cursor - animated arrow above selected character
                const blink = Math.floor(frame / 8) % 2;
                const bounce = Math.floor(frame / 12) % 2 === 0 ? 0 : 2;
                ctx.fillStyle = '#FAC000';
                // Draw downward-pointing arrow
                ctx.fillRect(cx + 3, cy - 14 + bounce, 10, 3);
                ctx.fillRect(cx + 5, cy - 11 + bounce, 6, 2);
                ctx.fillRect(cx + 7, cy - 9 + bounce, 2, 2);
                // Highlight box around selected
                if (blink) {
                    ctx.strokeStyle = '#FAC000';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(cx - 8, cy - 4, 32, 30);
                }
            }
        }

        // Blinking prompt text
        const promptBlink = Math.floor(frame / 20) % 2;
        ctx.fillStyle = promptBlink ? '#FFF' : '#888';
        ctx.fillText('< >  ARROWS SELECT', 32, 170);
        ctx.fillStyle = promptBlink ? '#FAC000' : '#888';
        ctx.fillText('ENTER / Z  START', 40, 190);
        ctx.fillStyle = '#555';
        ctx.font = '6px monospace';
        ctx.fillText('or press 1-4 to pick directly', 32, 210);
        ctx.font = '8px "Press Start 2P", monospace';
    },

    drawSlotMachine(ctx, reels, spinning, frame) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.SCREEN_W, this.SCREEN_H);
        ctx.fillStyle = '#FAC000';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('BONUS CHANCE', 64, 40);

        for (let i = 0; i < 3; i++) {
            const rx = 60 + i * 50;
            ctx.fillStyle = '#FFF';
            ctx.fillRect(rx, 70, 40, 40);
            ctx.fillStyle = '#000';
            ctx.fillRect(rx + 2, 72, 36, 36);

            const symbols = ['cherry', 'star', 'veggie', 'shyguy', 'ashio'];
            const sym = spinning[i] ? symbols[Math.floor(frame / 3 + i * 2) % 5] : symbols[reels[i]];
            ctx.fillStyle = sym === 'cherry' ? '#D82800' : sym === 'star' ? '#FAC000' : sym === 'ashio' ? '#B13425' : '#00A800';
            ctx.fillRect(rx + 10, 80, 20, 20);
            ctx.fillStyle = '#FFF';
            ctx.font = '6px monospace';
            ctx.fillText(sym.substr(0, 3).toUpperCase(), rx + 10, 95);
            ctx.font = '8px "Press Start 2P", monospace';
        }
    },
};
