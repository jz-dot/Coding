// ============================================================
// Super Ashio Bros. 3 - Renderer
// SMB3 visual style with suits, world map, enhanced sprites
// ============================================================

const Mario3Renderer = {
    TILE_SIZE: 16,
    SCREEN_W: 256,
    SCREEN_H: 240,

    COLORS: {
        SKY: '#5C94FC',
        DESERT_SKY: '#FCCC6C',
        ICE_SKY: '#9CBCFC',
        DARK_SKY: '#000020',
        PIPE_SKY: '#00A800',
    },

    WORLD_THEMES: {
        1: { name: 'GRASS LAND', bg: '#5C94FC', ground: '#C84C0C' },
        2: { name: 'DESERT LAND', bg: '#FCCC6C', ground: '#D8A830' },
        3: { name: 'WATER LAND', bg: '#5C94FC', ground: '#2038EC' },
        4: { name: 'GIANT LAND', bg: '#5C94FC', ground: '#C84C0C' },
        5: { name: 'SKY LAND', bg: '#9CBCFC', ground: '#FCFCFC' },
        6: { name: 'ICE LAND', bg: '#9CBCFC', ground: '#FCFCFC' },
        7: { name: 'PIPE LAND', bg: '#00A800', ground: '#005800' },
        8: { name: 'DARK LAND', bg: '#000020', ground: '#444444' },
    },

    ASHIO_PALETTE: {
        hair: '#FFE040', hairDark: '#C8A020',
        skin: '#FCA044', eyes: '#3070E0',
        outfit: '#B13425', outfitDark: '#6B1C11',
        shirt: '#6B8CFF',
    },

    drawBackground(ctx, levelType, scrollX, frame, world) {
        const theme = this.WORLD_THEMES[world] || this.WORLD_THEMES[1];
        if (levelType === 'fortress' || levelType === 'castle') {
            ctx.fillStyle = '#000';
        } else if (levelType === 'airship') {
            ctx.fillStyle = '#5C94FC';
        } else {
            ctx.fillStyle = theme.bg;
        }
        ctx.fillRect(0, 0, this.SCREEN_W, this.SCREEN_H);

        if (levelType === 'overworld') {
            this.drawClouds(ctx, scrollX);
        }
    },

    drawClouds(ctx, scrollX) {
        const offset = Math.floor(scrollX * 0.15) % 256;
        ctx.fillStyle = '#FCFCFC';
        for (let i = 0; i < 5; i++) {
            const cx = (i * 65 + 10 - offset + 500) % 320 - 30;
            ctx.fillRect(cx + 4, 30 + (i % 3) * 20, 20, 8);
            ctx.fillRect(cx, 34 + (i % 3) * 20, 28, 6);
        }
    },

    drawTile(ctx, tileType, x, y, frame) {
        const T = this.TILE_SIZE;
        switch(tileType) {
            case 1: // Ground
                ctx.fillStyle = '#C84C0C';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#E09C5C';
                ctx.fillRect(x, y, T, 2);
                break;
            case 2: // Brick
                ctx.fillStyle = '#C84C0C';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#A43000';
                ctx.fillRect(x, y + T - 1, T, 1);
                ctx.fillRect(x + 7, y, 1, T);
                break;
            case 3: // ? block
                const qf = Math.floor(frame / 15) % 4;
                ctx.fillStyle = qf < 2 ? '#FAC000' : '#C87400';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#FFF';
                ctx.font = '10px monospace';
                ctx.fillText('?', x + 4, y + 12);
                break;
            case 4: // Used block
                ctx.fillStyle = '#888';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#585858';
                ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
                break;
            case 5: // Wood block
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#C8A030';
                ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
                break;
            case 6: // Note block
                ctx.fillStyle = '#FAC000';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#FFF';
                ctx.fillRect(x + 4, y + 4, 8, 8);
                ctx.fillStyle = '#000';
                ctx.fillRect(x + 6, y + 5, 4, 4);
                ctx.fillRect(x + 5, y + 8, 2, 3);
                break;
            case 7: // Pipe TL
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#58F858';
                ctx.fillRect(x, y, 4, T);
                break;
            case 8: // Pipe TR
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#005800';
                ctx.fillRect(x + T - 4, y, 4, T);
                break;
            case 9: // Pipe body L
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#58F858';
                ctx.fillRect(x + 2, y, 2, T);
                break;
            case 10: // Pipe body R
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#005800';
                ctx.fillRect(x + T - 4, y, 2, T);
                break;
            case 11: // Coin
                const cf = Math.floor(frame / 8) % 4;
                ctx.fillStyle = '#FAC000';
                const cw = cf === 0 ? 8 : (cf === 2 ? 2 : 6);
                ctx.fillRect(x + (T - cw) / 2, y + 2, cw, T - 4);
                break;
            case 12: // Ice
                ctx.fillStyle = '#9CBCFC';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x + 2, y + 2, 4, 3);
                break;
            case 13: // Cloud
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x, y, T, 8);
                ctx.fillStyle = '#E0E0E0';
                ctx.fillRect(x + 2, y + 6, T - 4, 2);
                break;
            case 14: // Lava
                const lf = Math.floor(frame / 4) % 2;
                ctx.fillStyle = lf ? '#D82800' : '#FC7460';
                ctx.fillRect(x, y, T, T);
                break;
            case 15: // Castle block
                ctx.fillStyle = '#888';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#585858';
                ctx.fillRect(x + 7, y, 2, T);
                ctx.fillRect(x, y + 7, T, 2);
                break;
            case 16: // Slope right
                ctx.fillStyle = '#C84C0C';
                ctx.beginPath();
                ctx.moveTo(x, y + T);
                ctx.lineTo(x + T, y);
                ctx.lineTo(x + T, y + T);
                ctx.fill();
                break;
            case 17: // Slope left
                ctx.fillStyle = '#C84C0C';
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + T, y + T);
                ctx.lineTo(x, y + T);
                ctx.fill();
                break;
            case 18: // Stair
                ctx.fillStyle = '#888';
                ctx.fillRect(x, y, T, T);
                break;
            case 19: // Bridge
                ctx.fillStyle = '#8B6914';
                ctx.fillRect(x, y, T, 4);
                ctx.fillStyle = '#C8A030';
                ctx.fillRect(x + 2, y + 4, 4, 8);
                ctx.fillRect(x + 10, y + 4, 4, 8);
                break;
            case 20: // Flagpole
                ctx.fillStyle = '#888';
                ctx.fillRect(x + 7, y, 2, T);
                break;
            case 21: // Flag top
                ctx.fillStyle = '#888';
                ctx.fillRect(x + 7, y, 2, T);
                ctx.fillStyle = '#D82800';
                ctx.fillRect(x + 9, y, 8, 6);
                break;
            default:
                if (tileType > 0) {
                    ctx.fillStyle = '#888';
                    ctx.fillRect(x, y, T, T);
                }
        }
    },

    // Bug #16: Player with different suits - added ducking parameter
    drawPlayer(ctx, x, y, palette, frame, dir, suit, starPower, frameCount, ducking) {
        const p = palette || this.ASHIO_PALETTE;
        ctx.save();
        if (dir === -1) {
            ctx.translate(x + 16, 0);
            ctx.scale(-1, 1);
            x = 0;
        }

        // Bug #16: When ducking and big, draw shorter sprite
        if (ducking && suit !== 'small') {
            this.drawPlayerDucking(ctx, x, y, p, suit);
        } else if (suit === 'small') {
            this.drawPlayerSmall(ctx, x, y, p, frame);
        } else if (suit === 'raccoon') {
            this.drawPlayerRaccoon(ctx, x, y, p, frame);
        } else if (suit === 'frog') {
            this.drawPlayerFrog(ctx, x, y, p, frame);
        } else if (suit === 'tanooki') {
            this.drawPlayerTanooki(ctx, x, y, p, frame);
        } else if (suit === 'hammer') {
            this.drawPlayerHammer(ctx, x, y, p, frame);
        } else {
            this.drawPlayerBig(ctx, x, y, p, frame, suit === 'fire');
        }

        if (starPower && Math.floor(frameCount / 3) % 2 === 0) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = 'rgba(255,255,100,0.3)';
            ctx.fillRect(x, y, 16, suit === 'small' ? 16 : 28);
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();
    },

    // Bug #16: Ducking sprite - shorter, offset to bottom of hitbox
    drawPlayerDucking(ctx, x, y, p, suit) {
        const duckY = y + 14; // Offset so bottom aligns with standing position
        const isFire = suit === 'fire';
        // Hat
        ctx.fillStyle = isFire ? '#FFF' : p.outfit;
        ctx.fillRect(x + 2, duckY, 12, 3);
        // Hair
        ctx.fillStyle = p.hair;
        ctx.fillRect(x + 2, duckY + 3, 12, 3);
        ctx.fillRect(x + 12, duckY + 1, 3, 6);
        // Face
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 3, duckY + 5, 10, 3);
        ctx.fillStyle = p.eyes;
        ctx.fillRect(x + 5, duckY + 5, 2, 2);
        // Body (compressed)
        ctx.fillStyle = isFire ? '#D82800' : p.outfit;
        ctx.fillRect(x + 2, duckY + 8, 12, 6);
    },

    drawPlayerSmall(ctx, x, y, p, frame) {
        // Hat
        ctx.fillStyle = p.outfit;
        ctx.fillRect(x + 3, y, 10, 3);
        // Hair
        ctx.fillStyle = p.hair;
        ctx.fillRect(x + 3, y + 3, 10, 3);
        ctx.fillRect(x + 11, y + 2, 3, 5);
        // Face
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 4, y + 5, 8, 3);
        ctx.fillStyle = p.eyes;
        ctx.fillRect(x + 6, y + 5, 2, 2);
        // Body
        ctx.fillStyle = p.outfit;
        ctx.fillRect(x + 3, y + 8, 10, 4);
        // Legs
        const wf = frame % 3;
        ctx.fillStyle = p.outfit;
        if (wf === 0) {
            ctx.fillRect(x + 3, y + 12, 4, 4);
            ctx.fillRect(x + 9, y + 12, 4, 4);
        } else {
            ctx.fillRect(x + 2 + wf, y + 12, 4, 4);
            ctx.fillRect(x + 10 - wf, y + 12, 4, 4);
        }
    },

    drawPlayerBig(ctx, x, y, p, frame, fire) {
        // Hat
        ctx.fillStyle = fire ? '#FFF' : p.outfit;
        ctx.fillRect(x + 2, y, 12, 4);
        // Hair
        ctx.fillStyle = p.hair;
        ctx.fillRect(x + 2, y + 4, 12, 4);
        ctx.fillRect(x + 12, y + 2, 3, 8);
        // Face
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 3, y + 7, 10, 4);
        ctx.fillStyle = p.eyes;
        ctx.fillRect(x + 5, y + 8, 2, 2);
        // Body
        ctx.fillStyle = fire ? '#D82800' : p.outfit;
        ctx.fillRect(x + 2, y + 11, 12, 8);
        ctx.fillStyle = p.shirt;
        ctx.fillRect(x + 4, y + 13, 8, 4);
        // Arms
        ctx.fillStyle = p.skin;
        ctx.fillRect(x, y + 12, 3, 3);
        ctx.fillRect(x + 13, y + 12, 3, 3);
        // Legs
        ctx.fillStyle = fire ? '#D82800' : p.outfit;
        const wf = frame % 3;
        ctx.fillRect(x + 3 - wf % 2, y + 19, 5, 6);
        ctx.fillRect(x + 9 + wf % 2, y + 19, 5, 6);
        // Shoes
        ctx.fillStyle = p.outfitDark;
        ctx.fillRect(x + 2, y + 24, 6, 4);
        ctx.fillRect(x + 9, y + 24, 6, 4);
    },

    drawPlayerRaccoon(ctx, x, y, p, frame) {
        this.drawPlayerBig(ctx, x, y, p, frame, false);
        // Raccoon ears
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(x + 1, y - 4, 4, 5);
        ctx.fillRect(x + 11, y - 4, 4, 5);
        // Tail
        ctx.fillStyle = '#8B5A2B';
        const tf = Math.floor(frame / 2) % 2;
        ctx.fillRect(x - 4, y + 16 + tf * 2, 6, 6);
        ctx.fillStyle = '#C8A030';
        ctx.fillRect(x - 3, y + 17 + tf * 2, 4, 2);
    },

    drawPlayerFrog(ctx, x, y, p, frame) {
        // Frog suit body
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x + 1, y + 4, 14, 20);
        // Head
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 3, y + 6, 10, 4);
        ctx.fillStyle = p.eyes;
        ctx.fillRect(x + 5, y + 7, 2, 2);
        // Frog eyes on top
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x + 3, y, 4, 5);
        ctx.fillRect(x + 9, y, 4, 5);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x + 4, y + 1, 2, 2);
        ctx.fillRect(x + 10, y + 1, 2, 2);
        // Belly
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + 4, y + 14, 8, 8);
        // Feet
        ctx.fillStyle = '#005800';
        ctx.fillRect(x, y + 22, 7, 6);
        ctx.fillRect(x + 9, y + 22, 7, 6);
    },

    drawPlayerTanooki(ctx, x, y, p, frame) {
        this.drawPlayerRaccoon(ctx, x, y, p, frame);
        // Tanooki belly markings
        ctx.fillStyle = '#C8A030';
        ctx.fillRect(x + 4, y + 14, 8, 5);
    },

    drawPlayerHammer(ctx, x, y, p, frame) {
        // Hammer suit - black shell armor
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 1, y, 14, 6);
        // Face
        ctx.fillStyle = p.skin;
        ctx.fillRect(x + 3, y + 6, 10, 4);
        ctx.fillStyle = p.eyes;
        ctx.fillRect(x + 5, y + 7, 2, 2);
        // Armor body
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 1, y + 10, 14, 10);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(x + 4, y + 12, 8, 6);
        // Legs
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 2, y + 20, 5, 8);
        ctx.fillRect(x + 9, y + 20, 5, 8);
    },

    // World map
    drawWorldMap(ctx, world, mapNodes, playerPos, frame) {
        const theme = this.WORLD_THEMES[world] || this.WORLD_THEMES[1];
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, this.SCREEN_W, this.SCREEN_H);

        // Title
        ctx.fillStyle = '#FFF';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('WORLD ' + world, 88, 20);
        ctx.fillText(theme.name, 64, 36);

        // Draw paths
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        for (let i = 0; i < mapNodes.length - 1; i++) {
            const n1 = mapNodes[i];
            const n2 = mapNodes[i + 1];
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
        }

        // Draw nodes
        for (let i = 0; i < mapNodes.length; i++) {
            const node = mapNodes[i];
            if (node.type === 'level') {
                ctx.fillStyle = node.cleared ? '#888' : '#FAC000';
                ctx.fillRect(node.x - 6, node.y - 6, 12, 12);
                ctx.fillStyle = '#000';
                ctx.font = '6px monospace';
                ctx.fillText(node.label || String(i + 1), node.x - 3, node.y + 2);
            } else if (node.type === 'fortress') {
                ctx.fillStyle = node.cleared ? '#444' : '#888';
                ctx.fillRect(node.x - 8, node.y - 10, 16, 16);
                ctx.fillStyle = '#585858';
                ctx.fillRect(node.x - 4, node.y - 14, 3, 4);
                ctx.fillRect(node.x + 1, node.y - 14, 3, 4);
            } else if (node.type === 'airship') {
                ctx.fillStyle = node.cleared ? '#444' : '#8B6914';
                ctx.fillRect(node.x - 10, node.y - 6, 20, 10);
                ctx.fillRect(node.x - 6, node.y - 10, 12, 4);
                ctx.fillStyle = '#C8A030';
                ctx.fillRect(node.x - 4, node.y - 4, 8, 6);
            } else if (node.type === 'start') {
                ctx.fillStyle = '#00A800';
                ctx.fillRect(node.x - 4, node.y - 4, 8, 8);
            }
            ctx.font = '8px "Press Start 2P", monospace';
        }

        // Player on map
        const pNode = mapNodes[playerPos] || mapNodes[0];
        const bob = Math.sin(frame * 0.1) * 2;
        ctx.fillStyle = '#B13425';
        ctx.fillRect(pNode.x - 5, pNode.y - 18 + bob, 10, 12);
        ctx.fillStyle = '#FFE040';
        ctx.fillRect(pNode.x - 4, pNode.y - 14 + bob, 8, 4);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(pNode.x - 3, pNode.y - 10 + bob, 6, 3);

        // Inventory
        ctx.fillStyle = '#000';
        ctx.fillRect(0, this.SCREEN_H - 32, this.SCREEN_W, 32);
        ctx.fillStyle = '#FFF';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('INVENTORY', 8, this.SCREEN_H - 20);
    },

    drawHUD(ctx, score, coins, world, stage, time, suit, lives) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.SCREEN_W, 16);
        ctx.fillStyle = '#FFF';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(String(score).padStart(7, '0'), 4, 11);
        ctx.fillText('\u00D7' + String(coins).padStart(2, '0'), 80, 11);
        ctx.fillText('W' + world + '-' + stage, 130, 11);
        ctx.fillText(String(time).padStart(3, '0'), 180, 11);
        ctx.fillText('x' + lives, 224, 11);

        // P-meter
        const pWidth = 40;
        ctx.fillStyle = '#444';
        ctx.fillRect(80, 13, pWidth, 3);
    },

    // Enemies
    drawGoomba(ctx, x, y, frame) {
        ctx.fillStyle = '#C84C0C';
        ctx.fillRect(x + 2, y, 12, 10);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(x + 4, y + 3, 8, 5);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 5, y + 4, 2, 2);
        ctx.fillRect(x + 9, y + 4, 2, 2);
        ctx.fillStyle = '#C84C0C';
        const wf = Math.floor(frame / 8) % 2;
        ctx.fillRect(x + 1 + wf, y + 10, 6, 6);
        ctx.fillRect(x + 9 - wf, y + 10, 6, 6);
    },

    drawKoopa(ctx, x, y, frame, flying) {
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x + 2, y + 4, 12, 12);
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + 4, y + 6, 8, 8);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(x + 4, y, 8, 5);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 6, y + 1, 2, 2);
        ctx.fillRect(x + 10, y + 1, 2, 2);
        if (flying) {
            const wf = Math.floor(frame / 4) % 2;
            ctx.fillStyle = '#FCFCFC';
            ctx.fillRect(x - 2, y + 2 + wf * 3, 6, 4);
            ctx.fillRect(x + 12, y + 2 + wf * 3, 6, 4);
        }
    },

    drawBoomBoom(ctx, x, y, frame) {
        ctx.fillStyle = '#C84C0C';
        ctx.fillRect(x + 2, y + 2, 28, 24);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(x + 6, y + 6, 20, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 8, y + 7, 4, 4);
        ctx.fillRect(x + 20, y + 7, 4, 4);
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x + 4, y + 16, 24, 10);
        ctx.fillRect(x + 2, y + 20, 6, 8);
        ctx.fillRect(x + 24, y + 20, 6, 8);
    },

    drawKoopaling(ctx, x, y, frame, name) {
        // Generic Koopaling rendering
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x + 2, y + 4, 28, 24);
        // Hair color varies by Koopaling
        const hairColors = {
            'larry': '#2038EC', 'morton': '#888', 'wendy': '#FC74FC',
            'iggy': '#00A800', 'roy': '#FC74FC', 'lemmy': '#FAC000',
            'ludwig': '#2038EC',
        };
        ctx.fillStyle = hairColors[name] || '#FAC000';
        ctx.fillRect(x + 6, y - 4, 20, 8);
        // Face
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(x + 6, y + 6, 20, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 10, y + 8, 3, 3);
        ctx.fillRect(x + 19, y + 8, 3, 3);
        // Shell
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x + 4, y + 16, 24, 12);
    },

    drawBowser3(ctx, x, y, frame) {
        // SMB3 Bowser - larger
        ctx.fillStyle = '#00A800';
        ctx.fillRect(x + 4, y + 8, 36, 28);
        // Shell
        ctx.fillStyle = '#005800';
        ctx.fillRect(x + 8, y + 12, 28, 20);
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(x + 12, y + 16, 6, 6);
        ctx.fillRect(x + 22, y + 16, 6, 6);
        ctx.fillRect(x + 16, y + 24, 8, 6);
        // Head
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(x + 6, y, 20, 14);
        ctx.fillStyle = '#D82800';
        ctx.fillRect(x + 10, y + 4, 4, 4);
        ctx.fillRect(x + 18, y + 4, 4, 4);
        // Horns
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(x + 4, y - 6, 4, 8);
        ctx.fillRect(x + 24, y - 6, 4, 8);
        // Spikes
        ctx.fillStyle = '#FAC000';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(x + 12 + i * 8, y + 8, 4, 6);
        }
    },
};
