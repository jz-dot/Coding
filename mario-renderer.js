// ============================================================
// Super Ashio Bros. - Renderer
// Pixel-art sprite system, tile drawing, camera, HUD, backgrounds
// All sprites drawn procedurally (no external images)
// ============================================================

const MarioRenderer = {
    TILE_SIZE: 16,
    SCREEN_W: 256,
    SCREEN_H: 240,
    HUD_HEIGHT: 32, // 2 tile rows for HUD

    // NES color palette subset
    COLORS: {
        SKY_BLUE: '#5C94FC',
        BLACK: '#000000',
        WHITE: '#FCFCFC',
        GROUND_BROWN: '#C84C0C',
        GROUND_TAN: '#E09C5C',
        BRICK_RED: '#C84C0C',
        BRICK_DARK: '#A43000',
        BRICK_LIGHT: '#DC9C5C',
        QUESTION_YELLOW: '#FAC000',
        QUESTION_DARK: '#C87400',
        QUESTION_WHITE: '#FCFCFC',
        PIPE_GREEN: '#00A800',
        PIPE_DARK: '#005800',
        PIPE_LIGHT: '#58F858',
        CASTLE_GRAY: '#888888',
        CASTLE_DARK: '#585858',
        CASTLE_LIGHT: '#B8B8B8',
        UNDERGROUND_BG: '#000000',
        UNDERWATER_BG: '#2038EC',
        CASTLE_BG: '#000000',
        LAVA: '#D82800',
        LAVA_BRIGHT: '#FC7460',
        COIN_GOLD: '#FAC000',
        COIN_LIGHT: '#FCE4A0',
        USED_BLOCK: '#888888',
        USED_DARK: '#585858',
        FLAGPOLE_GREEN: '#00A800',
    },

    // Ashio (Player 1) palette - blonde hair, blue eyes, red outfit
    ASHIO_PALETTE: {
        hair: '#FFE040',
        hairDark: '#C8A020',
        skin: '#FCA044',
        skinLight: '#FCDCB8',
        eyes: '#3070E0',
        outfit: '#B13425',
        outfitDark: '#6B1C11',
        shirt: '#6B8CFF',
        shoes: '#6B1C11',
    },

    // Aidio (Player 2) palette - brown mullet, green eyes, green outfit
    AIDIO_PALETTE: {
        hair: '#8B5A2B',
        hairDark: '#5C3A1B',
        skin: '#FCA044',
        skinLight: '#FCDCB8',
        eyes: '#30A030',
        outfit: '#00A800',
        outfitDark: '#005800',
        shirt: '#6B8CFF',
        shoes: '#005800',
    },

    // Princess Ava palette
    AVA_PALETTE: {
        hair: '#5C3317',
        hairLight: '#7B4B2B',
        skin: '#D2A679',
        skinLight: '#E8C8A0',
        dress: '#FC7498',
        dressLight: '#FCDCDC',
        dressWhite: '#FCFCFC',
        crown: '#FAC000',
    },

    // ---- SPRITE DRAWING ----

    // Draw Small Ashio/Aidio (16x16)
    drawPlayerSmall(ctx, x, y, palette, frame, direction, invincible, invFrame) {
        const p = palette;
        const s = 1; // pixel scale
        const fx = Math.floor(x);
        const fy = Math.floor(y);

        if (invincible) {
            // Flash between palettes
            const flashColors = ['#FC0000', '#00FC00', '#0000FC', '#FCFC00'];
            const ci = Math.floor(invFrame / 2) % 4;
            // Create a flashing version
            const fp = { ...p, outfit: flashColors[ci], outfitDark: flashColors[(ci+1)%4], shirt: flashColors[(ci+2)%4] };
            this._drawSmallSprite(ctx, fx, fy, fp, frame, direction);
            return;
        }

        this._drawSmallSprite(ctx, fx, fy, p, frame, direction);
    },

    _drawSmallSprite(ctx, x, y, p, frame, dir) {
        // dir: 1 = right, -1 = left
        const d = dir === -1;
        // BUG FIX #2: Offset sprite to sit at bottom of 16px hitbox (sprite is ~10 rows drawn, hitbox is 16)
        const yOff = y + 6;

        // Standing/running frames
        const drawPx = (px, py, color) => {
            const ax = d ? x + 15 - px : x + px;
            ctx.fillStyle = color;
            ctx.fillRect(ax, yOff + py, 1, 1);
        };

        // Hair/hat (rows 0-4)
        // Row 0: hair top
        for (let i = 3; i <= 7; i++) drawPx(i, 0, p.hair);
        // Row 1: wider hair
        for (let i = 2; i <= 10; i++) drawPx(i, 1, p.hair);
        // Row 2: hair + face
        for (let i = 2; i <= 4; i++) drawPx(i, 2, p.hair);
        for (let i = 5; i <= 7; i++) drawPx(i, 2, p.skin);
        drawPx(8, 2, p.hair);
        // Extra hair length (shoulder-length blonde hair)
        if (dir === 1) {
            drawPx(11, 1, p.hair);
            drawPx(12, 2, p.hair);
            drawPx(12, 3, p.hair);
            drawPx(11, 4, p.hair);
        } else {
            drawPx(11, 1, p.hair);
            drawPx(12, 2, p.hair);
            drawPx(12, 3, p.hair);
            drawPx(11, 4, p.hair);
        }
        // Row 3: face
        for (let i = 2; i <= 3; i++) drawPx(i, 3, p.hair);
        drawPx(4, 3, p.skin);
        drawPx(5, 3, p.eyes);
        drawPx(6, 3, p.skin);
        drawPx(7, 3, p.eyes);
        drawPx(8, 3, p.skin);
        // Row 4: face/chin
        for (let i = 2; i <= 3; i++) drawPx(i, 4, p.hair);
        for (let i = 4; i <= 8; i++) drawPx(i, 4, p.skin);

        // Body (rows 5-9) - changes by frame
        if (frame === 0 || frame === 2) {
            // Standing / frame 0
            // Row 5: shirt
            drawPx(3, 5, p.outfit);
            for (let i = 4; i <= 8; i++) drawPx(i, 5, p.shirt);
            drawPx(9, 5, p.outfit);
            // Row 6: body
            drawPx(2, 6, p.outfit);
            for (let i = 3; i <= 9; i++) drawPx(i, 6, p.outfit);
            drawPx(10, 6, p.outfit);
            // Row 7: belt area
            drawPx(2, 7, p.skin);
            drawPx(3, 7, p.outfit);
            drawPx(4, 7, p.outfitDark);
            drawPx(5, 7, p.outfit);
            drawPx(6, 7, p.outfit);
            drawPx(7, 7, p.outfitDark);
            drawPx(8, 7, p.outfit);
            drawPx(9, 7, p.skin);
            // Row 8-9: legs
            for (let i = 3; i <= 5; i++) drawPx(i, 8, p.outfit);
            for (let i = 7; i <= 9; i++) drawPx(i, 8, p.outfit);
            for (let i = 2; i <= 5; i++) drawPx(i, 9, p.shoes);
            for (let i = 7; i <= 10; i++) drawPx(i, 9, p.shoes);
        } else if (frame === 1) {
            // Walking frame 1 - legs apart
            drawPx(3, 5, p.outfit);
            for (let i = 4; i <= 8; i++) drawPx(i, 5, p.shirt);
            drawPx(9, 5, p.outfit);
            for (let i = 2; i <= 10; i++) drawPx(i, 6, p.outfit);
            drawPx(2, 7, p.skin);
            for (let i = 3; i <= 9; i++) drawPx(i, 7, p.outfit);
            drawPx(10, 7, p.skin);
            // Legs spread
            for (let i = 2; i <= 4; i++) drawPx(i, 8, p.outfit);
            for (let i = 8; i <= 10; i++) drawPx(i, 8, p.outfit);
            for (let i = 1; i <= 3; i++) drawPx(i, 9, p.shoes);
            for (let i = 9; i <= 11; i++) drawPx(i, 9, p.shoes);
        } else if (frame === 3) {
            // Jump frame
            drawPx(2, 5, p.skin);
            for (let i = 3; i <= 9; i++) drawPx(i, 5, p.shirt);
            drawPx(10, 5, p.skin);
            for (let i = 3; i <= 9; i++) drawPx(i, 6, p.outfit);
            drawPx(2, 7, p.outfit);
            for (let i = 3; i <= 9; i++) drawPx(i, 7, p.outfit);
            drawPx(10, 7, p.outfit);
            for (let i = 3; i <= 5; i++) drawPx(i, 8, p.shoes);
            for (let i = 7; i <= 9; i++) drawPx(i, 8, p.shoes);
            for (let i = 2; i <= 5; i++) drawPx(i, 9, p.shoes);
            for (let i = 7; i <= 10; i++) drawPx(i, 9, p.shoes);
        } else if (frame === 4) {
            // Death frame
            drawPx(3, 5, p.skin);
            for (let i = 4; i <= 8; i++) drawPx(i, 5, p.outfit);
            drawPx(9, 5, p.skin);
            for (let i = 2; i <= 10; i++) drawPx(i, 6, p.outfit);
            for (let i = 3; i <= 9; i++) drawPx(i, 7, p.outfit);
            for (let i = 2; i <= 10; i++) drawPx(i, 8, p.outfit);
            for (let i = 3; i <= 5; i++) drawPx(i, 9, p.shoes);
            for (let i = 7; i <= 9; i++) drawPx(i, 9, p.shoes);
        } else if (frame === 5) {
            // Skid frame
            drawPx(3, 5, p.outfit);
            for (let i = 4; i <= 8; i++) drawPx(i, 5, p.shirt);
            drawPx(9, 5, p.outfit);
            for (let i = 2; i <= 10; i++) drawPx(i, 6, p.outfit);
            for (let i = 3; i <= 9; i++) drawPx(i, 7, p.outfit);
            for (let i = 4; i <= 8; i++) drawPx(i, 8, p.outfit);
            for (let i = 2; i <= 4; i++) drawPx(i, 9, p.shoes);
            for (let i = 8; i <= 10; i++) drawPx(i, 9, p.shoes);
        }
    },

    // Draw Super (big) Ashio/Aidio (16x32)
    drawPlayerBig(ctx, x, y, palette, frame, direction, invincible, invFrame, isFire) {
        const p = isFire ? { ...palette, outfit: '#FCFCFC', outfitDark: '#B8B8B8', shirt: '#D82800' } : palette;
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const d = direction === -1;

        const drawPx = (px, py, color) => {
            const ax = d ? fx + 15 - px : fx + px;
            ctx.fillStyle = color;
            ctx.fillRect(ax, fy + py, 1, 1);
        };

        if (invincible) {
            const flashColors = ['#FC0000', '#00FC00', '#0000FC', '#FCFC00'];
            const ci = Math.floor(invFrame / 2) % 4;
            const fp = { ...p, outfit: flashColors[ci], outfitDark: flashColors[(ci+1)%4], shirt: flashColors[(ci+2)%4] };
            this._drawBigSprite(ctx, fx, fy, fp, frame, d, drawPx);
            return;
        }
        this._drawBigSprite(ctx, fx, fy, p, frame, d, drawPx);
    },

    _drawBigSprite(ctx, x, y, p, frame, flip, drawPx) {
        // BUG FIX #1: Full 28-row Big Mario sprite (was only 16 rows)
        // Rows 0-3: Hat/hair top
        for (let i = 4; i <= 8; i++) drawPx(i, 0, p.hair);
        for (let i = 3; i <= 11; i++) drawPx(i, 1, p.hair);
        for (let i = 3; i <= 12; i++) drawPx(i, 2, p.hair);
        // Shoulder-length hair extension
        drawPx(13, 2, p.hair);
        drawPx(13, 3, p.hair);
        drawPx(14, 3, p.hair);
        drawPx(14, 4, p.hair);
        drawPx(13, 5, p.hair);
        drawPx(14, 5, p.hair);
        drawPx(13, 6, p.hair);
        drawPx(14, 6, p.hairDark || p.hair);
        drawPx(13, 7, p.hair);

        // Face (rows 3-7)
        for (let i = 3; i <= 5; i++) drawPx(i, 3, p.hair);
        drawPx(6, 3, p.skin);
        drawPx(7, 3, p.skin);
        drawPx(8, 3, p.skin);
        drawPx(9, 3, p.skin);
        drawPx(10, 3, p.hair);

        for (let i = 3; i <= 4; i++) drawPx(i, 4, p.hair);
        drawPx(5, 4, p.skin);
        drawPx(6, 4, p.eyes);
        drawPx(7, 4, p.skin);
        drawPx(8, 4, p.eyes);
        drawPx(9, 4, p.skin);
        drawPx(10, 4, p.skin);

        for (let i = 3; i <= 4; i++) drawPx(i, 5, p.hair);
        for (let i = 5; i <= 10; i++) drawPx(i, 5, p.skin);

        for (let i = 4; i <= 10; i++) drawPx(i, 6, p.skin);
        drawPx(3, 6, p.hair);
        drawPx(11, 6, p.skin);

        for (let i = 5; i <= 9; i++) drawPx(i, 7, p.skin);

        // Body rows 8-11: Upper body/arms
        // Shirt
        for (let i = 3; i <= 9; i++) drawPx(i, 8, p.shirt);
        drawPx(2, 8, p.outfit);
        drawPx(10, 8, p.outfit);

        for (let i = 2; i <= 10; i++) drawPx(i, 9, p.outfit);
        drawPx(5, 9, p.shirt);
        drawPx(6, 9, p.shirt);
        drawPx(7, 9, p.shirt);

        // Arms + torso
        drawPx(1, 10, p.skin);
        for (let i = 2; i <= 10; i++) drawPx(i, 10, p.outfit);
        drawPx(11, 10, p.skin);

        drawPx(1, 11, p.skin);
        for (let i = 2; i <= 10; i++) drawPx(i, 11, p.outfit);
        drawPx(11, 11, p.skin);

        // Rows 12-17: Torso / belt area
        for (let i = 3; i <= 9; i++) drawPx(i, 12, p.outfit);
        drawPx(2, 12, p.outfitDark);
        drawPx(10, 12, p.outfitDark);

        for (let i = 3; i <= 9; i++) drawPx(i, 13, p.outfit);

        for (let i = 2; i <= 10; i++) drawPx(i, 14, p.outfit);

        drawPx(2, 15, p.outfitDark);
        for (let i = 3; i <= 9; i++) drawPx(i, 15, p.outfit);
        drawPx(10, 15, p.outfitDark);

        for (let i = 3; i <= 9; i++) drawPx(i, 16, p.outfit);

        for (let i = 3; i <= 9; i++) drawPx(i, 17, p.outfit);

        // Rows 18-27: Legs - vary by frame
        const bodyFrame = frame % 4;
        if (bodyFrame === 0 || bodyFrame === 2) {
            // Standing legs
            // Upper legs (rows 18-21)
            for (let i = 3; i <= 5; i++) drawPx(i, 18, p.outfit);
            for (let i = 7; i <= 9; i++) drawPx(i, 18, p.outfit);
            for (let i = 3; i <= 5; i++) drawPx(i, 19, p.outfit);
            for (let i = 7; i <= 9; i++) drawPx(i, 19, p.outfit);
            for (let i = 3; i <= 5; i++) drawPx(i, 20, p.outfit);
            for (let i = 7; i <= 9; i++) drawPx(i, 20, p.outfit);
            for (let i = 3; i <= 5; i++) drawPx(i, 21, p.outfit);
            for (let i = 7; i <= 9; i++) drawPx(i, 21, p.outfit);
            // Lower legs (rows 22-25)
            for (let i = 3; i <= 5; i++) drawPx(i, 22, p.outfit);
            for (let i = 7; i <= 9; i++) drawPx(i, 22, p.outfit);
            for (let i = 3; i <= 5; i++) drawPx(i, 23, p.outfit);
            for (let i = 7; i <= 9; i++) drawPx(i, 23, p.outfit);
            // Feet (rows 24-27)
            for (let i = 2; i <= 5; i++) drawPx(i, 24, p.shoes);
            for (let i = 7; i <= 10; i++) drawPx(i, 24, p.shoes);
            for (let i = 2; i <= 6; i++) drawPx(i, 25, p.shoes);
            for (let i = 7; i <= 11; i++) drawPx(i, 25, p.shoes);
            for (let i = 1; i <= 6; i++) drawPx(i, 26, p.shoes);
            for (let i = 7; i <= 11; i++) drawPx(i, 26, p.shoes);
            for (let i = 1; i <= 6; i++) drawPx(i, 27, p.shoes);
            for (let i = 7; i <= 11; i++) drawPx(i, 27, p.shoes);
        } else if (bodyFrame === 1) {
            // Legs apart (walking)
            // Upper legs (rows 18-21)
            for (let i = 2; i <= 4; i++) drawPx(i, 18, p.outfit);
            for (let i = 8; i <= 10; i++) drawPx(i, 18, p.outfit);
            for (let i = 2; i <= 4; i++) drawPx(i, 19, p.outfit);
            for (let i = 8; i <= 10; i++) drawPx(i, 19, p.outfit);
            for (let i = 1; i <= 4; i++) drawPx(i, 20, p.outfit);
            for (let i = 8; i <= 11; i++) drawPx(i, 20, p.outfit);
            for (let i = 1; i <= 4; i++) drawPx(i, 21, p.outfit);
            for (let i = 9; i <= 11; i++) drawPx(i, 21, p.outfit);
            // Lower legs (rows 22-25)
            for (let i = 1; i <= 3; i++) drawPx(i, 22, p.outfit);
            for (let i = 9; i <= 12; i++) drawPx(i, 22, p.outfit);
            for (let i = 1; i <= 3; i++) drawPx(i, 23, p.outfit);
            for (let i = 10; i <= 12; i++) drawPx(i, 23, p.outfit);
            // Feet (rows 24-27)
            for (let i = 0; i <= 3; i++) drawPx(i, 24, p.shoes);
            for (let i = 9; i <= 12; i++) drawPx(i, 24, p.shoes);
            for (let i = 0; i <= 4; i++) drawPx(i, 25, p.shoes);
            for (let i = 9; i <= 13; i++) drawPx(i, 25, p.shoes);
            for (let i = 0; i <= 4; i++) drawPx(i, 26, p.shoes);
            for (let i = 10; i <= 13; i++) drawPx(i, 26, p.shoes);
            for (let i = 0; i <= 4; i++) drawPx(i, 27, p.shoes);
            for (let i = 10; i <= 13; i++) drawPx(i, 27, p.shoes);
        } else if (bodyFrame === 3) {
            // Jump pose - legs extended
            // Upper legs (rows 18-21)
            for (let i = 2; i <= 5; i++) drawPx(i, 18, p.outfit);
            for (let i = 7; i <= 10; i++) drawPx(i, 18, p.outfit);
            for (let i = 2; i <= 5; i++) drawPx(i, 19, p.outfit);
            for (let i = 7; i <= 10; i++) drawPx(i, 19, p.outfit);
            for (let i = 1; i <= 5; i++) drawPx(i, 20, p.outfit);
            for (let i = 7; i <= 11; i++) drawPx(i, 20, p.outfit);
            for (let i = 1; i <= 5; i++) drawPx(i, 21, p.outfit);
            for (let i = 7; i <= 11; i++) drawPx(i, 21, p.outfit);
            // Lower legs (rows 22-25)
            for (let i = 1; i <= 5; i++) drawPx(i, 22, p.shoes);
            for (let i = 7; i <= 11; i++) drawPx(i, 22, p.shoes);
            for (let i = 1; i <= 5; i++) drawPx(i, 23, p.shoes);
            for (let i = 7; i <= 11; i++) drawPx(i, 23, p.shoes);
            // Feet (rows 24-27)
            for (let i = 0; i <= 5; i++) drawPx(i, 24, p.shoes);
            for (let i = 7; i <= 12; i++) drawPx(i, 24, p.shoes);
            for (let i = 0; i <= 6; i++) drawPx(i, 25, p.shoes);
            for (let i = 7; i <= 12; i++) drawPx(i, 25, p.shoes);
            for (let i = 0; i <= 6; i++) drawPx(i, 26, p.shoes);
            for (let i = 7; i <= 12; i++) drawPx(i, 26, p.shoes);
            for (let i = 0; i <= 6; i++) drawPx(i, 27, p.shoes);
            for (let i = 7; i <= 12; i++) drawPx(i, 27, p.shoes);
        }
    },

    // ---- TILE DRAWING ----

    drawTile(ctx, tileType, x, y, frame) {
        const T = this.TILE_SIZE;
        const C = this.COLORS;
        frame = frame || 0;

        switch(tileType) {
            case 1: // GROUND
                ctx.fillStyle = C.GROUND_BROWN;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = C.GROUND_TAN;
                ctx.fillRect(x + 1, y + 1, T - 2, 2);
                ctx.fillRect(x + 1, y + 1, 2, T - 2);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + T - 3, y + 3, 2, T - 4);
                ctx.fillRect(x + 3, y + T - 3, T - 4, 2);
                break;

            case 2: // BRICK
                ctx.fillStyle = C.BRICK_RED;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = C.BRICK_DARK;
                // Brick pattern
                ctx.fillRect(x, y + 3, T, 1);
                ctx.fillRect(x, y + 7, T, 1);
                ctx.fillRect(x, y + 11, T, 1);
                ctx.fillRect(x + 7, y, 1, 4);
                ctx.fillRect(x + 3, y + 4, 1, 4);
                ctx.fillRect(x + 11, y + 4, 1, 4);
                ctx.fillRect(x + 7, y + 8, 1, 4);
                ctx.fillRect(x + 3, y + 12, 1, 4);
                ctx.fillRect(x + 11, y + 12, 1, 4);
                ctx.fillStyle = C.BRICK_LIGHT;
                ctx.fillRect(x, y, T, 1);
                ctx.fillRect(x, y + 4, T, 1);
                ctx.fillRect(x, y + 8, T, 1);
                ctx.fillRect(x, y + 12, T, 1);
                break;

            case 3: case 4: case 5: case 6: case 7: // ? BLOCK
                const qFrame = Math.floor(frame / 8) % 4;
                if (qFrame < 3) {
                    ctx.fillStyle = C.QUESTION_YELLOW;
                    ctx.fillRect(x, y, T, T);
                    ctx.fillStyle = C.QUESTION_DARK;
                    ctx.fillRect(x, y + T - 2, T, 2);
                    ctx.fillRect(x + T - 2, y, 2, T);
                    ctx.fillStyle = C.QUESTION_WHITE;
                    ctx.fillRect(x, y, T, 2);
                    ctx.fillRect(x, y, 2, T);
                    // ? symbol
                    ctx.fillStyle = C.QUESTION_DARK;
                    ctx.fillRect(x + 5, y + 3, 6, 2);
                    ctx.fillRect(x + 9, y + 5, 2, 3);
                    ctx.fillRect(x + 7, y + 7, 2, 2);
                    ctx.fillRect(x + 7, y + 10, 2, 2);
                } else {
                    ctx.fillStyle = C.QUESTION_DARK;
                    ctx.fillRect(x, y, T, T);
                    ctx.fillStyle = C.QUESTION_YELLOW;
                    ctx.fillRect(x + 2, y + 2, T - 4, T - 4);
                    ctx.fillStyle = C.QUESTION_DARK;
                    ctx.fillRect(x + 5, y + 3, 6, 2);
                    ctx.fillRect(x + 9, y + 5, 2, 3);
                    ctx.fillRect(x + 7, y + 7, 2, 2);
                    ctx.fillRect(x + 7, y + 10, 2, 2);
                }
                break;

            case 8: // USED BLOCK
                ctx.fillStyle = C.USED_BLOCK;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = C.USED_DARK;
                ctx.fillRect(x + T - 2, y, 2, T);
                ctx.fillRect(x, y + T - 2, T, 2);
                ctx.fillStyle = '#AAAAAA';
                ctx.fillRect(x, y, 2, T);
                ctx.fillRect(x, y, T, 2);
                break;

            case 9: // HARD BLOCK (stone)
                ctx.fillStyle = '#A0A0A0';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#C8C8C8';
                ctx.fillRect(x, y, T, 2);
                ctx.fillRect(x, y, 2, T);
                ctx.fillStyle = '#686868';
                ctx.fillRect(x + T - 2, y, 2, T);
                ctx.fillRect(x, y + T - 2, T, 2);
                ctx.fillStyle = '#888888';
                ctx.fillRect(x + 4, y + 4, T - 8, T - 8);
                break;

            case 10: // PIPE_TL
                ctx.fillStyle = C.PIPE_GREEN;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = C.PIPE_LIGHT;
                ctx.fillRect(x, y, 4, T);
                ctx.fillStyle = C.PIPE_DARK;
                ctx.fillRect(x + T - 4, y, 4, T);
                ctx.fillRect(x, y, T, 2);
                break;

            case 11: // PIPE_TR
                ctx.fillStyle = C.PIPE_GREEN;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = C.PIPE_LIGHT;
                ctx.fillRect(x, y, 4, T);
                ctx.fillStyle = C.PIPE_DARK;
                ctx.fillRect(x + T - 4, y, 4, T);
                ctx.fillRect(x, y, T, 2);
                break;

            case 12: // PIPE_BL (body)
                ctx.fillStyle = C.PIPE_GREEN;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = C.PIPE_LIGHT;
                ctx.fillRect(x + 2, y, 3, T);
                ctx.fillStyle = C.PIPE_DARK;
                ctx.fillRect(x + T - 3, y, 3, T);
                break;

            case 13: // PIPE_BR (body)
                ctx.fillStyle = C.PIPE_GREEN;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = C.PIPE_LIGHT;
                ctx.fillRect(x, y, 3, T);
                ctx.fillStyle = C.PIPE_DARK;
                ctx.fillRect(x + T - 5, y, 5, T);
                break;

            case 16: // FLAGPOLE
                ctx.fillStyle = C.FLAGPOLE_GREEN;
                ctx.fillRect(x + 7, y, 2, T);
                break;

            case 17: // BRIDGE
                ctx.fillStyle = '#C84C0C';
                ctx.fillRect(x, y, T, 4);
                ctx.fillStyle = '#A43000';
                ctx.fillRect(x, y + 4, T, 2);
                break;

            case 18: // CASTLE BLOCK
                ctx.fillStyle = C.CASTLE_GRAY;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = C.CASTLE_DARK;
                ctx.fillRect(x, y + 7, T, 1);
                ctx.fillRect(x + 7, y, 1, 8);
                ctx.fillRect(x + 3, y + 8, 1, 8);
                ctx.fillRect(x + 11, y + 8, 1, 8);
                ctx.fillStyle = C.CASTLE_LIGHT;
                ctx.fillRect(x, y, T, 1);
                ctx.fillRect(x, y + 8, T, 1);
                break;

            case 19: // CLOUD PLATFORM
                ctx.fillStyle = '#FCFCFC';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#D0E8FC';
                ctx.fillRect(x, y + T - 4, T, 4);
                break;

            case 20: // TREE TOP / MUSHROOM PLATFORM
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = '#58F858';
                ctx.fillRect(x, y, T, 3);
                break;

            case 21: // COIN (static, in level)
                const cFrame = Math.floor(frame / 8) % 4;
                ctx.fillStyle = C.COIN_GOLD;
                if (cFrame === 0) {
                    ctx.fillRect(x + 5, y + 2, 6, 12);
                } else if (cFrame === 1) {
                    ctx.fillRect(x + 6, y + 2, 4, 12);
                } else if (cFrame === 2) {
                    ctx.fillRect(x + 7, y + 2, 2, 12);
                } else {
                    ctx.fillRect(x + 6, y + 2, 4, 12);
                }
                ctx.fillStyle = C.COIN_LIGHT;
                if (cFrame === 0) ctx.fillRect(x + 6, y + 3, 2, 10);
                break;

            case 22: // STAIRCASE BLOCK
                ctx.fillStyle = C.GROUND_BROWN;
                ctx.fillRect(x, y, T, T);
                ctx.fillStyle = C.GROUND_TAN;
                ctx.fillRect(x, y, T, 2);
                ctx.fillRect(x, y, 2, T);
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + T - 2, y, 2, T);
                ctx.fillRect(x, y + T - 2, T, 2);
                break;

            case 23: // AXE (Bowser bridge end)
                const aFrame = Math.floor(frame / 4) % 2;
                ctx.fillStyle = '#FAC000';
                ctx.fillRect(x + 4, y + 2, 8, 2);
                ctx.fillRect(x + 6, y + 4, 4, 8);
                ctx.fillStyle = '#888';
                if (aFrame === 0) {
                    ctx.fillRect(x + 2, y + 4, 4, 6);
                } else {
                    ctx.fillRect(x + 10, y + 4, 4, 6);
                }
                break;

            case 24: // LAVA
                ctx.fillStyle = C.LAVA;
                ctx.fillRect(x, y, T, T);
                const lFrame = Math.floor(frame / 6) % 2;
                ctx.fillStyle = C.LAVA_BRIGHT;
                if (lFrame === 0) {
                    ctx.fillRect(x + 2, y, 4, 4);
                    ctx.fillRect(x + 10, y + 4, 4, 4);
                } else {
                    ctx.fillRect(x + 6, y, 4, 4);
                    ctx.fillRect(x + 2, y + 4, 4, 4);
                }
                break;

            case 25: // CORAL (underwater)
                ctx.fillStyle = '#FC7460';
                ctx.fillRect(x + 2, y, 4, T);
                ctx.fillRect(x + 8, y, 4, T);
                ctx.fillRect(x, y + 4, T, 4);
                break;

            case 26: // INVISIBLE BLOCK (drawn only when hit)
                // Normally invisible, drawn same as used block when activated
                break;

            case 27: // TREETOP STEM
                ctx.fillStyle = '#6B4800';
                ctx.fillRect(x + 5, y, 6, T);
                break;

            case 28: // FLAGPOLE_TOP
                ctx.fillStyle = C.FLAGPOLE_GREEN;
                ctx.fillRect(x + 7, y + 4, 2, T - 4);
                // Ball on top
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x + 5, y, 6, 6);
                ctx.fillRect(x + 4, y + 1, 8, 4);
                break;

            case 29: // FLAG
                ctx.fillStyle = '#00A800';
                ctx.fillRect(x, y, 8, 8);
                ctx.fillStyle = '#58F858';
                ctx.fillRect(x + 1, y + 1, 6, 6);
                break;

            case 30: // WATER TOP (wavy)
                ctx.fillStyle = '#2038EC';
                ctx.fillRect(x, y, T, T);
                const wFrame = Math.floor(frame / 10) % 2;
                ctx.fillStyle = '#3070EC';
                if (wFrame === 0) {
                    ctx.fillRect(x, y, 8, 4);
                } else {
                    ctx.fillRect(x + 8, y, 8, 4);
                }
                break;

            case 31: // WATER BODY
                ctx.fillStyle = '#2038EC';
                ctx.fillRect(x, y, T, T);
                break;

            default:
                break;
        }
    },

    // ---- BACKGROUND ----

    drawBackground(ctx, levelType, scrollX, frame) {
        const W = this.SCREEN_W;
        const H = this.SCREEN_H;

        switch(levelType) {
            case 'overworld':
                ctx.fillStyle = this.COLORS.SKY_BLUE;
                ctx.fillRect(0, 0, W, H);
                this.drawClouds(ctx, scrollX);
                this.drawHills(ctx, scrollX);
                this.drawBushes(ctx, scrollX);
                break;
            case 'underground':
                ctx.fillStyle = this.COLORS.UNDERGROUND_BG;
                ctx.fillRect(0, 0, W, H);
                break;
            case 'underwater':
                ctx.fillStyle = this.COLORS.UNDERWATER_BG;
                ctx.fillRect(0, 0, W, H);
                break;
            case 'castle':
                ctx.fillStyle = this.COLORS.CASTLE_BG;
                ctx.fillRect(0, 0, W, H);
                break;
            case 'night':
                ctx.fillStyle = '#000040';
                ctx.fillRect(0, 0, W, H);
                this.drawClouds(ctx, scrollX);
                break;
            default:
                ctx.fillStyle = this.COLORS.SKY_BLUE;
                ctx.fillRect(0, 0, W, H);
                break;
        }
    },

    drawClouds(ctx, scrollX) {
        ctx.fillStyle = '#FCFCFC';
        const cloudPositions = [
            { x: 50, y: 50, w: 48 },
            { x: 200, y: 40, w: 32 },
            { x: 400, y: 55, w: 64 },
            { x: 600, y: 42, w: 48 },
            { x: 850, y: 50, w: 32 },
            { x: 1100, y: 38, w: 48 },
            { x: 1350, y: 52, w: 64 },
        ];
        const parallax = scrollX * 0.3;
        for (const cloud of cloudPositions) {
            const cx = ((cloud.x - parallax) % 1600 + 1600) % 1600 - 200;
            if (cx > -100 && cx < 300) {
                this.drawCloud(ctx, cx, cloud.y, cloud.w);
            }
        }
    },

    drawCloud(ctx, x, y, w) {
        const h = w * 0.4;
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x + w * 0.2, y, w * 0.6, h);
        ctx.fillRect(x, y + h * 0.3, w, h * 0.5);
        ctx.fillRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.8);
    },

    drawHills(ctx, scrollX) {
        const hills = [
            { x: 0, w: 80, h: 30 },
            { x: 250, w: 48, h: 20 },
            { x: 500, w: 80, h: 30 },
            { x: 750, w: 48, h: 20 },
            { x: 1000, w: 80, h: 30 },
            { x: 1250, w: 48, h: 20 },
        ];
        const baseY = 208; // just above ground
        const parallax = scrollX * 0.5;
        for (const hill of hills) {
            const hx = ((hill.x - parallax) % 1500 + 1500) % 1500 - 100;
            if (hx > -100 && hx < 300) {
                ctx.fillStyle = '#00A800';
                ctx.beginPath();
                ctx.moveTo(hx, baseY);
                ctx.quadraticCurveTo(hx + hill.w / 2, baseY - hill.h, hx + hill.w, baseY);
                ctx.fill();
                ctx.fillStyle = '#58F858';
                ctx.beginPath();
                ctx.moveTo(hx + 4, baseY);
                ctx.quadraticCurveTo(hx + hill.w / 2, baseY - hill.h + 4, hx + hill.w - 4, baseY);
                ctx.fill();
            }
        }
    },

    drawBushes(ctx, scrollX) {
        const bushes = [
            { x: 100, w: 48 },
            { x: 350, w: 32 },
            { x: 550, w: 48 },
            { x: 800, w: 64 },
            { x: 1050, w: 32 },
            { x: 1300, w: 48 },
        ];
        const baseY = 208;
        const parallax = scrollX * 0.5;
        for (const bush of bushes) {
            const bx = ((bush.x - parallax) % 1500 + 1500) % 1500 - 100;
            if (bx > -100 && bx < 300) {
                ctx.fillStyle = '#00A800';
                ctx.fillRect(bx, baseY - 8, bush.w, 8);
                ctx.fillRect(bx + 4, baseY - 12, bush.w - 8, 4);
                ctx.fillStyle = '#58F858';
                ctx.fillRect(bx + 2, baseY - 10, bush.w - 4, 4);
            }
        }
    },

    // ---- HUD ----

    drawHUD(ctx, score, coins, world, stage, time, playerName, lives) {
        // HUD background (top 32 pixels)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.SCREEN_W, this.HUD_HEIGHT);

        ctx.fillStyle = '#FFF';
        ctx.font = '8px "Press Start 2P", monospace';

        // Player name + SCORE
        ctx.fillText(playerName || 'ASHIO', 8, 10);
        ctx.fillText(String(score).padStart(6, '0'), 8, 22);

        // Coins
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(80, 14, 6, 8);
        ctx.fillStyle = '#FFF';
        ctx.fillText('x' + String(coins).padStart(2, '0'), 88, 22);

        // World
        ctx.fillText('WORLD', 136, 10);
        ctx.fillText(world + '-' + stage, 148, 22);

        // Time
        ctx.fillText('TIME', 200, 10);
        ctx.fillText(String(time).padStart(3, ' '), 204, 22);
    },

    // ---- ENEMY DRAWING ----

    drawGoomba(ctx, x, y, frame, dead) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        if (dead) {
            // Squished
            ctx.fillStyle = '#C84C0C';
            ctx.fillRect(fx + 1, fy + 12, 14, 4);
            ctx.fillStyle = '#FCA044';
            ctx.fillRect(fx + 3, fy + 13, 10, 2);
            return;
        }
        // Body
        ctx.fillStyle = '#C84C0C';
        ctx.fillRect(fx + 2, fy, 12, 10);
        ctx.fillRect(fx, fy + 4, 16, 8);
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 3, fy + 3, 3, 3);
        ctx.fillRect(fx + 10, fy + 3, 3, 3);
        ctx.fillStyle = '#000';
        const eyeOff = Math.floor(frame / 8) % 2;
        ctx.fillRect(fx + 4 + eyeOff, fy + 4, 2, 2);
        ctx.fillRect(fx + 11 - eyeOff, fy + 4, 2, 2);
        // Feet
        const walkFrame = Math.floor(frame / 8) % 2;
        ctx.fillStyle = '#000';
        if (walkFrame === 0) {
            ctx.fillRect(fx, fy + 12, 6, 4);
            ctx.fillRect(fx + 10, fy + 12, 6, 4);
        } else {
            ctx.fillRect(fx + 1, fy + 12, 5, 4);
            ctx.fillRect(fx + 10, fy + 12, 5, 4);
        }
    },

    drawKoopa(ctx, x, y, frame, color, inShell) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const kColor = color === 'red' ? '#D82800' : '#00A800';
        const kLight = color === 'red' ? '#FC7460' : '#58F858';

        if (inShell) {
            // Shell
            ctx.fillStyle = kColor;
            ctx.fillRect(fx + 1, fy + 2, 14, 12);
            ctx.fillRect(fx + 3, fy, 10, 16);
            ctx.fillStyle = kLight;
            ctx.fillRect(fx + 5, fy + 4, 6, 8);
            return;
        }

        // Walking Koopa (24px tall)
        // Head
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(fx + 3, fy, 10, 8);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 5, fy + 2, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 6, fy + 3, 2, 2);
        // Shell
        ctx.fillStyle = kColor;
        ctx.fillRect(fx + 1, fy + 8, 14, 10);
        ctx.fillRect(fx + 3, fy + 6, 10, 14);
        ctx.fillStyle = kLight;
        ctx.fillRect(fx + 5, fy + 10, 6, 6);
        // Feet
        ctx.fillStyle = '#FCA044';
        const wf = Math.floor(frame / 8) % 2;
        if (wf === 0) {
            ctx.fillRect(fx + 2, fy + 20, 5, 4);
            ctx.fillRect(fx + 9, fy + 18, 5, 4);
        } else {
            ctx.fillRect(fx + 2, fy + 18, 5, 4);
            ctx.fillRect(fx + 9, fy + 20, 5, 4);
        }
    },

    drawPiranhaPlant(ctx, x, y, frame) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        // Head
        ctx.fillStyle = '#D82800';
        ctx.fillRect(fx, fy, 16, 10);
        ctx.fillStyle = '#FC7460';
        ctx.fillRect(fx + 2, fy + 2, 12, 3);
        // White spots
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 3, fy + 6, 2, 2);
        ctx.fillRect(fx + 7, fy + 6, 2, 2);
        ctx.fillRect(fx + 11, fy + 6, 2, 2);
        // Stem
        ctx.fillStyle = '#00A800';
        ctx.fillRect(fx + 4, fy + 10, 8, 16);
        ctx.fillStyle = '#58F858';
        ctx.fillRect(fx + 5, fy + 10, 3, 16);
    },

    drawBowser(ctx, x, y, frame) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        // Simplified Bowser (32x32)
        // Body
        ctx.fillStyle = '#00A800';
        ctx.fillRect(fx + 4, fy + 4, 24, 20);
        // Shell
        ctx.fillStyle = '#C84C0C';
        ctx.fillRect(fx + 6, fy + 2, 20, 16);
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(fx + 8, fy + 4, 16, 12);
        // Spikes
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(fx + 10 + i * 4, fy, 2, 4);
        }
        // Head
        ctx.fillStyle = '#00A800';
        ctx.fillRect(fx, fy + 6, 8, 12);
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(fx, fy + 8, 6, 8);
        // Eye
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 1, fy + 9, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 2, fy + 10, 2, 2);
        // Mouth
        ctx.fillStyle = '#D82800';
        ctx.fillRect(fx, fy + 14, 5, 2);
        // Legs
        ctx.fillStyle = '#00A800';
        const wf2 = Math.floor(frame / 10) % 2;
        ctx.fillRect(fx + 6, fy + 24, 6, 8);
        ctx.fillRect(fx + 20, fy + 24, 6, 8);
        if (wf2) {
            ctx.fillRect(fx + 4, fy + 28, 4, 4);
            ctx.fillRect(fx + 24, fy + 26, 4, 4);
        } else {
            ctx.fillRect(fx + 4, fy + 26, 4, 4);
            ctx.fillRect(fx + 24, fy + 28, 4, 4);
        }
        // Tail
        ctx.fillStyle = '#00A800';
        ctx.fillRect(fx + 26, fy + 16, 6, 4);
        ctx.fillRect(fx + 28, fy + 12, 4, 4);
    },

    drawFireball(ctx, x, y, frame) {
        const f = Math.floor(frame / 2) % 4;
        ctx.fillStyle = '#FC7460';
        ctx.fillRect(Math.floor(x) + 2, Math.floor(y) + 2, 4, 4);
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(Math.floor(x) + 1, Math.floor(y) + 1, 6, 6);
        ctx.fillStyle = '#D82800';
        if (f === 0) ctx.fillRect(Math.floor(x), Math.floor(y), 2, 2);
        else if (f === 1) ctx.fillRect(Math.floor(x) + 6, Math.floor(y), 2, 2);
        else if (f === 2) ctx.fillRect(Math.floor(x) + 6, Math.floor(y) + 6, 2, 2);
        else ctx.fillRect(Math.floor(x), Math.floor(y) + 6, 2, 2);
    },

    drawMushroom(ctx, x, y, isOneUp) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const topColor = isOneUp ? '#00A800' : '#D82800';
        // Cap
        ctx.fillStyle = topColor;
        ctx.fillRect(fx + 1, fy, 14, 8);
        ctx.fillRect(fx, fy + 2, 16, 6);
        // White spots
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 4, fy + 1, 3, 3);
        ctx.fillRect(fx + 9, fy + 1, 3, 3);
        ctx.fillRect(fx + 6, fy + 4, 4, 3);
        // Stem
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(fx + 4, fy + 8, 8, 8);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 5, fy + 8, 6, 7);
    },

    drawFlower(ctx, x, y, frame) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const f = Math.floor(frame / 4) % 4;
        const colors = ['#D82800', '#FAC000', '#00A800', '#FFF'];
        const c = colors[f];
        // Petals
        ctx.fillStyle = c;
        ctx.fillRect(fx + 4, fy, 8, 4);
        ctx.fillRect(fx, fy + 4, 4, 4);
        ctx.fillRect(fx + 12, fy + 4, 4, 4);
        // Center
        ctx.fillStyle = '#FAC000';
        ctx.fillRect(fx + 5, fy + 3, 6, 6);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 6, fy + 4, 4, 4);
        // Stem
        ctx.fillStyle = '#00A800';
        ctx.fillRect(fx + 6, fy + 10, 4, 6);
        ctx.fillRect(fx + 3, fy + 12, 4, 3);
        ctx.fillRect(fx + 9, fy + 13, 4, 3);
    },

    drawStar(ctx, x, y, frame) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const f = Math.floor(frame / 4) % 4;
        const colors = ['#FAC000', '#FCA044', '#FFF', '#FCA044'];
        ctx.fillStyle = colors[f];
        // Star shape simplified
        ctx.fillRect(fx + 6, fy, 4, 4);
        ctx.fillRect(fx + 2, fy + 4, 12, 4);
        ctx.fillRect(fx, fy + 6, 16, 4);
        ctx.fillRect(fx + 2, fy + 10, 4, 4);
        ctx.fillRect(fx + 10, fy + 10, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 5, fy + 5, 2, 2);
        ctx.fillRect(fx + 9, fy + 5, 2, 2);
    },

    // Draw Princess Ava
    drawPrincessAva(ctx, x, y) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const p = this.AVA_PALETTE;
        // Crown
        ctx.fillStyle = p.crown;
        ctx.fillRect(fx + 4, fy, 8, 3);
        ctx.fillRect(fx + 5, fy - 2, 2, 2);
        ctx.fillRect(fx + 9, fy - 2, 2, 2);
        // Hair (long, dark brown)
        ctx.fillStyle = p.hair;
        ctx.fillRect(fx + 2, fy + 3, 12, 6);
        ctx.fillRect(fx + 1, fy + 5, 14, 20);
        ctx.fillStyle = p.hairLight;
        ctx.fillRect(fx + 3, fy + 4, 4, 4);
        // Face (tan skin)
        ctx.fillStyle = p.skin;
        ctx.fillRect(fx + 4, fy + 6, 8, 6);
        ctx.fillStyle = p.skinLight;
        ctx.fillRect(fx + 5, fy + 7, 6, 4);
        // Eyes
        ctx.fillStyle = '#5C3317';
        ctx.fillRect(fx + 5, fy + 8, 2, 2);
        ctx.fillRect(fx + 9, fy + 8, 2, 2);
        // Smile
        ctx.fillStyle = '#FC7498';
        ctx.fillRect(fx + 6, fy + 11, 4, 1);
        // Dress
        ctx.fillStyle = p.dress;
        ctx.fillRect(fx + 3, fy + 14, 10, 10);
        ctx.fillRect(fx + 2, fy + 16, 12, 8);
        ctx.fillRect(fx + 1, fy + 20, 14, 6);
        ctx.fillStyle = p.dressLight;
        ctx.fillRect(fx + 4, fy + 15, 8, 2);
        ctx.fillStyle = p.dressWhite;
        ctx.fillRect(fx + 3, fy + 24, 10, 2);
        // Hair flowing down sides
        ctx.fillStyle = p.hair;
        ctx.fillRect(fx, fy + 9, 3, 16);
        ctx.fillRect(fx + 13, fy + 9, 3, 16);
    },

    // Draw Toad
    drawToad(ctx, x, y) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        // Mushroom head
        ctx.fillStyle = '#D82800';
        ctx.fillRect(fx + 1, fy, 14, 8);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 4, fy + 1, 3, 4);
        ctx.fillRect(fx + 9, fy + 1, 3, 4);
        // Face
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(fx + 3, fy + 8, 10, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 5, fy + 9, 2, 2);
        ctx.fillRect(fx + 9, fy + 9, 2, 2);
        // Body
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 3, fy + 14, 10, 8);
        ctx.fillStyle = '#0000FC';
        ctx.fillRect(fx + 4, fy + 16, 8, 4);
    },

    // Draw small castle (end of level)
    drawSmallCastle(ctx, x, y) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        ctx.fillStyle = this.COLORS.CASTLE_GRAY;
        // Main body
        ctx.fillRect(fx, fy + 16, 40, 32);
        // Crenellations
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(fx + i * 8, fy + 8, 6, 8);
        }
        // Tower
        ctx.fillRect(fx + 12, fy, 16, 16);
        ctx.fillRect(fx + 10, fy - 4, 20, 6);
        // Door
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 14, fy + 32, 12, 16);
        ctx.fillRect(fx + 16, fy + 28, 8, 4);
        // Window
        ctx.fillRect(fx + 16, fy + 4, 8, 6);
    },

    // Draw fire bar
    drawFireBar(ctx, cx, cy, angle, length, frame) {
        for (let i = 0; i < length; i++) {
            const bx = cx + Math.cos(angle) * i * 8;
            const by = cy + Math.sin(angle) * i * 8;
            const f = Math.floor(frame / 2 + i) % 4;
            const colors = ['#D82800', '#FC7460', '#FAC000', '#FC7460'];
            ctx.fillStyle = colors[f];
            ctx.fillRect(Math.floor(bx) - 3, Math.floor(by) - 3, 6, 6);
        }
    },

    // Draw Bullet Bill
    drawBulletBill(ctx, x, y, dir) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        ctx.fillStyle = '#000';
        ctx.fillRect(fx, fy, 16, 14);
        ctx.fillStyle = '#888';
        ctx.fillRect(fx + (dir === 1 ? 0 : 12), fy + 2, 4, 10);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + (dir === 1 ? 12 : 2), fy + 4, 3, 3);
    },

    // Draw Hammer (thrown by Hammer Bros)
    drawHammer(ctx, x, y, frame) {
        const f = Math.floor(frame / 4) % 4;
        ctx.fillStyle = '#8B5A2B';
        ctx.fillRect(Math.floor(x) + 3, Math.floor(y), 3, 10);
        ctx.fillStyle = '#888';
        const hx = f < 2 ? 0 : 6;
        ctx.fillRect(Math.floor(x) + hx, Math.floor(y), 8, 5);
    },

    // Draw Lakitu
    drawLakitu(ctx, x, y, frame) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        // Cloud
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx, fy + 12, 16, 8);
        ctx.fillRect(fx + 2, fy + 10, 12, 12);
        // Body
        ctx.fillStyle = '#00A800';
        ctx.fillRect(fx + 3, fy + 2, 10, 10);
        // Face
        ctx.fillStyle = '#FCA044';
        ctx.fillRect(fx + 4, fy + 4, 8, 6);
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 5, fy + 5, 2, 2);
        ctx.fillRect(fx + 9, fy + 5, 2, 2);
    },

    // Draw Spiny
    drawSpiny(ctx, x, y, frame) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        ctx.fillStyle = '#D82800';
        ctx.fillRect(fx + 2, fy + 4, 12, 10);
        ctx.fillRect(fx, fy + 6, 16, 8);
        // Spikes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 2, fy, 3, 4);
        ctx.fillRect(fx + 7, fy, 3, 4);
        ctx.fillRect(fx + 11, fy, 3, 4);
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 3, fy + 7, 3, 3);
        ctx.fillRect(fx + 10, fy + 7, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 4, fy + 8, 2, 2);
        ctx.fillRect(fx + 11, fy + 8, 2, 2);
    },

    // Draw Cheep-Cheep (fish)
    drawCheepCheep(ctx, x, y, frame, color) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        const c = color === 'red' ? '#D82800' : '#888';
        ctx.fillStyle = c;
        ctx.fillRect(fx + 2, fy + 2, 12, 10);
        ctx.fillRect(fx, fy + 4, 16, 6);
        // Fins
        const f = Math.floor(frame / 8) % 2;
        if (f === 0) {
            ctx.fillRect(fx + 13, fy, 3, 4);
            ctx.fillRect(fx + 13, fy + 10, 3, 4);
        } else {
            ctx.fillRect(fx + 13, fy + 2, 3, 4);
            ctx.fillRect(fx + 13, fy + 8, 3, 4);
        }
        // Eye
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 2, fy + 4, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 3, fy + 5, 2, 2);
    },

    // Draw Blooper (squid)
    drawBlooper(ctx, x, y, frame) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 2, fy, 12, 12);
        ctx.fillRect(fx + 4, fy - 2, 8, 2);
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 4, fy + 4, 3, 3);
        ctx.fillRect(fx + 9, fy + 4, 3, 3);
        // Tentacles
        const f = Math.floor(frame / 8) % 2;
        ctx.fillStyle = '#FFF';
        if (f === 0) {
            ctx.fillRect(fx, fy + 12, 4, 6);
            ctx.fillRect(fx + 6, fy + 12, 4, 8);
            ctx.fillRect(fx + 12, fy + 12, 4, 6);
        } else {
            ctx.fillRect(fx + 1, fy + 12, 4, 4);
            ctx.fillRect(fx + 6, fy + 12, 4, 6);
            ctx.fillRect(fx + 11, fy + 12, 4, 4);
        }
    },

    // Draw Buzzy Beetle
    drawBuzzyBeetle(ctx, x, y, frame, inShell) {
        const fx = Math.floor(x);
        const fy = Math.floor(y);
        if (inShell) {
            ctx.fillStyle = '#0000A8';
            ctx.fillRect(fx + 1, fy + 2, 14, 12);
            ctx.fillRect(fx + 3, fy, 10, 16);
            ctx.fillStyle = '#5C94FC';
            ctx.fillRect(fx + 5, fy + 4, 6, 8);
            return;
        }
        // Body
        ctx.fillStyle = '#0000A8';
        ctx.fillRect(fx + 1, fy, 14, 12);
        ctx.fillRect(fx, fy + 4, 16, 6);
        ctx.fillStyle = '#5C94FC';
        ctx.fillRect(fx + 4, fy + 2, 8, 6);
        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.fillRect(fx + 2, fy + 6, 3, 3);
        ctx.fillRect(fx + 11, fy + 6, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(fx + 3, fy + 7, 2, 2);
        ctx.fillRect(fx + 12, fy + 7, 2, 2);
        // Feet
        ctx.fillStyle = '#FCA044';
        const wf3 = Math.floor(frame / 8) % 2;
        ctx.fillRect(fx + 1, fy + 12, 5, 4);
        ctx.fillRect(fx + 10, fy + 12, 5, 4);
    },

    // Draw bullet bill launcher
    drawBillLauncher(ctx, x, y) {
        ctx.fillStyle = '#000';
        ctx.fillRect(Math.floor(x), Math.floor(y), 16, 16);
        ctx.fillStyle = '#585858';
        ctx.fillRect(Math.floor(x) + 2, Math.floor(y) + 2, 12, 12);
        ctx.fillStyle = '#888';
        ctx.fillRect(Math.floor(x) + 4, Math.floor(y) + 4, 8, 8);
    },

    // ---- PARTICLES ----

    drawBrickParticle(ctx, x, y) {
        ctx.fillStyle = this.COLORS.BRICK_RED;
        ctx.fillRect(Math.floor(x), Math.floor(y), 4, 4);
        ctx.fillStyle = this.COLORS.BRICK_LIGHT;
        ctx.fillRect(Math.floor(x), Math.floor(y), 2, 2);
    },

    drawCoinParticle(ctx, x, y, frame) {
        const f = Math.floor(frame / 2) % 4;
        ctx.fillStyle = this.COLORS.COIN_GOLD;
        const widths = [6, 4, 2, 4];
        const w = widths[f];
        ctx.fillRect(Math.floor(x) + (8 - w) / 2, Math.floor(y), w, 8);
        ctx.fillStyle = this.COLORS.COIN_LIGHT;
        if (f === 0) ctx.fillRect(Math.floor(x) + 2, Math.floor(y) + 1, 2, 6);
    },

    drawScorePopup(ctx, x, y, text) {
        ctx.fillStyle = '#FFF';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(text, Math.floor(x), Math.floor(y));
    },
};
