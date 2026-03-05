// ============================================================
// Super Ashio Bros. 2 - Level Data
// 7 worlds x 3 stages = 21 levels
// SMB2 (US) style: overworld, underground, desert, ice, sky, night
// ============================================================

const Mario2Levels = {
    T: {
        EMPTY: 0, GROUND: 1, BRICK: 2, GRASS: 3, SAND: 4, DOOR: 5,
        LADDER: 6, POW: 7, VASE: 8, VEGGIE: 9, ICE: 10, SPIKES: 11,
        WATERFALL: 12, VINE: 13, CHAIN: 14, MUSHROOM: 15, CLOUD: 16,
        CRYSTAL: 17, CHERRY: 18, LOCKED_DOOR: 19, KEY: 20
    },

    levelCache: {},

    getLevel(world, stage) {
        const key = `${world}-${stage}`;
        if (this.levelCache[key]) return this.levelCache[key];
        const builder = this[`build_${world}_${stage}`];
        if (builder) {
            const data = builder.call(this);
            this.levelCache[key] = data;
            return data;
        }
        const data = this.generateLevel(world, stage);
        this.levelCache[key] = data;
        return data;
    },

    createTiles(width, height) { return new Array(width * height).fill(0); },

    set(tiles, width, col, row, tile) {
        if (col >= 0 && col < width && row >= 0 && row < 15) {
            tiles[row * width + col] = tile;
        }
    },

    fillGround(tiles, width, startCol, endCol, groundRow) {
        groundRow = groundRow || 13;
        for (let c = startCol; c <= Math.min(endCol, width - 1); c++) {
            for (let r = groundRow; r < 15; r++) {
                this.set(tiles, width, c, r, this.T.GROUND);
            }
        }
    },

    addPlatform(tiles, width, col, row, len, tileType) {
        for (let c = col; c < col + len; c++) {
            this.set(tiles, width, c, row, tileType || this.T.BRICK);
        }
    },

    // ============================================================
    // WORLD 1 - Grasslands (hand-crafted)
    // ============================================================

    build_1_1() {
        const W = 200, H = 15;
        const tiles = this.createTiles(W, H);
        const T = this.T;

        this.fillGround(tiles, W, 0, 199);

        // Platforms and vegetation
        this.addPlatform(tiles, W, 15, 10, 5, T.GRASS);
        this.set(tiles, W, 17, 9, T.VEGGIE);
        this.addPlatform(tiles, W, 25, 8, 8, T.GRASS);
        this.set(tiles, W, 28, 7, T.VEGGIE);
        this.set(tiles, W, 30, 7, T.VEGGIE);

        this.addPlatform(tiles, W, 40, 10, 6, T.BRICK);
        this.set(tiles, W, 42, 9, T.CHERRY);

        this.addPlatform(tiles, W, 55, 7, 10, T.GRASS);
        this.set(tiles, W, 58, 6, T.VEGGIE);
        this.set(tiles, W, 62, 6, T.VEGGIE);
        this.set(tiles, W, 60, 6, T.CHERRY);

        this.addPlatform(tiles, W, 75, 10, 4, T.BRICK);
        this.addPlatform(tiles, W, 82, 8, 6, T.GRASS);
        this.set(tiles, W, 84, 7, T.VEGGIE);
        this.set(tiles, W, 86, 7, T.CHERRY);

        this.addPlatform(tiles, W, 100, 10, 8, T.BRICK);
        this.set(tiles, W, 103, 9, T.VEGGIE);
        this.set(tiles, W, 106, 9, T.VEGGIE);

        // POW block
        this.set(tiles, W, 110, 12, T.POW);

        this.addPlatform(tiles, W, 120, 8, 10, T.GRASS);
        this.set(tiles, W, 124, 7, T.CHERRY);
        this.set(tiles, W, 127, 7, T.VEGGIE);

        this.addPlatform(tiles, W, 140, 10, 6, T.BRICK);
        this.addPlatform(tiles, W, 150, 7, 8, T.GRASS);
        this.set(tiles, W, 153, 6, T.VEGGIE);

        // Boss area
        this.addPlatform(tiles, W, 170, 10, 25, T.BRICK);
        this.addPlatform(tiles, W, 172, 6, 4, T.BRICK);

        // Crystal ball
        this.set(tiles, W, 192, 9, T.CRYSTAL);

        return {
            width: W, height: H, type: 'overworld', timeLimit: 0,
            tiles, spawn: { x: 3, y: 12 },
            entities: [
                { type: 'shyguy', col: 20, row: 12 },
                { type: 'shyguy', col: 30, row: 6 },
                { type: 'shyguy', col: 45, row: 12 },
                { type: 'shyguy', col: 60, row: 5 },
                { type: 'shyguy', col: 75, row: 12 },
                { type: 'snifit', col: 90, row: 12 },
                { type: 'shyguy', col: 105, row: 8 },
                { type: 'shyguy', col: 125, row: 6 },
                { type: 'ninji', col: 140, row: 12 },
                { type: 'shyguy', col: 155, row: 5 },
                { type: 'birdo', col: 185, row: 6, hp: 3 },
            ],
            cherries: [42, 60, 86, 124],
            boss: 'birdo',
        };
    },

    build_1_2() {
        const W = 180, H = 15;
        const tiles = this.createTiles(W, H);
        const T = this.T;

        // Underground level
        this.fillGround(tiles, W, 0, 179);
        for (let c = 0; c < W; c++) this.set(tiles, W, c, 0, T.BRICK);

        this.addPlatform(tiles, W, 10, 10, 8, T.BRICK);
        this.set(tiles, W, 13, 9, T.VEGGIE);
        this.addPlatform(tiles, W, 25, 7, 10, T.BRICK);
        this.set(tiles, W, 28, 6, T.VEGGIE);
        this.set(tiles, W, 32, 6, T.CHERRY);
        this.addPlatform(tiles, W, 45, 10, 6, T.BRICK);
        this.set(tiles, W, 47, 9, T.VEGGIE);

        this.addPlatform(tiles, W, 60, 5, 12, T.BRICK);
        this.set(tiles, W, 65, 4, T.VEGGIE);
        this.set(tiles, W, 68, 4, T.CHERRY);

        this.addPlatform(tiles, W, 80, 10, 8, T.BRICK);
        this.set(tiles, W, 83, 9, T.POW);
        this.addPlatform(tiles, W, 95, 7, 10, T.BRICK);
        this.set(tiles, W, 98, 6, T.VEGGIE);

        this.set(tiles, W, 110, 8, T.VASE);
        this.addPlatform(tiles, W, 120, 10, 6, T.BRICK);
        this.addPlatform(tiles, W, 130, 7, 8, T.BRICK);
        this.set(tiles, W, 133, 6, T.VEGGIE);

        this.addPlatform(tiles, W, 150, 10, 25, T.BRICK);
        this.set(tiles, W, 172, 9, T.CRYSTAL);

        return {
            width: W, height: H, type: 'underground', timeLimit: 0,
            tiles, spawn: { x: 2, y: 12 },
            entities: [
                { type: 'shyguy', col: 15, row: 12 },
                { type: 'shyguyBlue', col: 30, row: 5 },
                { type: 'snifit', col: 50, row: 12 },
                { type: 'shyguy', col: 65, row: 3 },
                { type: 'ninji', col: 85, row: 12 },
                { type: 'shyguy', col: 100, row: 5 },
                { type: 'snifit', col: 120, row: 12 },
                { type: 'shyguy', col: 135, row: 5 },
                { type: 'birdo', col: 165, row: 6, hp: 3 },
            ],
            boss: 'birdo',
        };
    },

    build_1_3() {
        const W = 200, H = 15;
        const tiles = this.createTiles(W, H);
        const T = this.T;

        this.fillGround(tiles, W, 0, 199);
        this.addPlatform(tiles, W, 20, 8, 12, T.GRASS);
        this.set(tiles, W, 25, 7, T.VEGGIE);
        this.addPlatform(tiles, W, 40, 10, 8, T.BRICK);
        this.set(tiles, W, 43, 9, T.VEGGIE);
        this.addPlatform(tiles, W, 60, 6, 15, T.GRASS);
        this.set(tiles, W, 65, 5, T.VEGGIE);
        this.set(tiles, W, 70, 5, T.VEGGIE);
        this.addPlatform(tiles, W, 85, 10, 6, T.BRICK);
        this.addPlatform(tiles, W, 100, 8, 10, T.GRASS);
        this.set(tiles, W, 104, 7, T.VEGGIE);
        this.addPlatform(tiles, W, 120, 10, 8, T.BRICK);
        this.set(tiles, W, 123, 9, T.VEGGIE);
        this.addPlatform(tiles, W, 140, 6, 12, T.GRASS);
        this.set(tiles, W, 145, 5, T.VEGGIE);
        this.set(tiles, W, 148, 5, T.CHERRY);

        // Boss area with Mouser
        this.addPlatform(tiles, W, 165, 10, 30, T.BRICK);
        this.addPlatform(tiles, W, 170, 6, 8, T.BRICK);
        this.set(tiles, W, 192, 9, T.CRYSTAL);

        return {
            width: W, height: H, type: 'overworld', timeLimit: 0,
            tiles, spawn: { x: 3, y: 12 },
            entities: [
                { type: 'shyguy', col: 25, row: 6 },
                { type: 'shyguy', col: 45, row: 8 },
                { type: 'snifit', col: 65, row: 4 },
                { type: 'shyguy', col: 88, row: 12 },
                { type: 'ninji', col: 105, row: 6 },
                { type: 'snifit', col: 125, row: 12 },
                { type: 'shyguy', col: 145, row: 4 },
                { type: 'mouser', col: 183, row: 6, hp: 3 },
            ],
            boss: 'mouser',
        };
    },

    // ============================================================
    // WORLD 2 - Desert
    // ============================================================

    build_2_1() { return this.generateDesert(2, 1, 210); },
    build_2_2() { return this.generateUnderground(2, 2, 190); },
    build_2_3() { return this.generateDesert(2, 3, 220, 'birdo', { color: 'red', hp: 3 }); },

    // WORLD 3 - Night/Ice
    build_3_1() { return this.generateOverworld(3, 1, 210); },
    build_3_2() { return this.generateIce(3, 2, 200); },
    build_3_3() { return this.generateOverworld(3, 3, 230, 'mouser', { hp: 5 }); },

    // WORLD 4 - Ice World
    build_4_1() { return this.generateIce(4, 1, 220); },
    build_4_2() { return this.generateUnderground(4, 2, 200); },
    build_4_3() { return this.generateIce(4, 3, 230, 'birdo', { color: 'green', hp: 5 }); },

    // WORLD 5 - Sky World
    build_5_1() { return this.generateSky(5, 1, 200); },
    build_5_2() { return this.generateOverworld(5, 2, 220); },
    build_5_3() { return this.generateSky(5, 3, 230, 'birdo', { color: 'red', hp: 5 }); },

    // WORLD 6 - Desert Night
    build_6_1() { return this.generateDesert(6, 1, 240); },
    build_6_2() { return this.generateUnderground(6, 2, 220); },
    build_6_3() { return this.generateDesert(6, 3, 250, 'birdo', { color: 'green', hp: 6 }); },

    // WORLD 7 - Wart's Castle
    build_7_1() { return this.generateOverworld(7, 1, 250); },
    build_7_2() {
        const level = this.generateUnderground(7, 2, 240);
        // Extra enemies for final world
        level.entities.push(
            { type: 'ninji', col: 100, row: 12 },
            { type: 'ninji', col: 130, row: 12 },
            { type: 'snifit', col: 160, row: 12 },
            { type: 'snifit', col: 180, row: 12 }
        );
        return level;
    },
    build_7_3() {
        // Final boss - Wart
        const W = 200, H = 15;
        const tiles = this.createTiles(W, H);
        const T = this.T;

        this.fillGround(tiles, W, 0, 199);
        for (let c = 0; c < W; c++) this.set(tiles, W, c, 0, T.BRICK);

        // Long approach with enemies
        this.addPlatform(tiles, W, 15, 10, 6, T.BRICK);
        this.set(tiles, W, 17, 9, T.VEGGIE);
        this.addPlatform(tiles, W, 30, 7, 8, T.BRICK);
        this.set(tiles, W, 33, 6, T.VEGGIE);
        this.addPlatform(tiles, W, 50, 10, 6, T.BRICK);
        this.set(tiles, W, 52, 9, T.VEGGIE);
        this.addPlatform(tiles, W, 65, 7, 8, T.BRICK);
        this.set(tiles, W, 68, 6, T.VEGGIE);
        this.addPlatform(tiles, W, 85, 10, 6, T.BRICK);
        this.set(tiles, W, 87, 9, T.VEGGIE);
        this.addPlatform(tiles, W, 100, 7, 8, T.BRICK);
        this.set(tiles, W, 103, 6, T.VEGGIE);

        // Boss room
        this.addPlatform(tiles, W, 130, 10, 60, T.BRICK);
        this.addPlatform(tiles, W, 135, 6, 8, T.BRICK);
        this.addPlatform(tiles, W, 155, 6, 8, T.BRICK);

        // Vegetables for boss fight - crucial
        for (let i = 0; i < 8; i++) {
            this.set(tiles, W, 140 + i * 5, 9, T.VEGGIE);
        }

        return {
            width: W, height: H, type: 'underground', timeLimit: 0,
            tiles, spawn: { x: 2, y: 12 },
            entities: [
                { type: 'snifit', col: 20, row: 12 },
                { type: 'ninji', col: 35, row: 12 },
                { type: 'snifit', col: 55, row: 12 },
                { type: 'ninji', col: 70, row: 5 },
                { type: 'snifit', col: 90, row: 12 },
                { type: 'ninji', col: 105, row: 5 },
                { type: 'wart', col: 170, row: 4, hp: 6 },
            ],
            boss: 'wart',
            isFinal: true,
        };
    },

    // ============================================================
    // LEVEL GENERATORS
    // ============================================================

    generateOverworld(world, stage, width, bossType, bossOpts) {
        const tiles = this.createTiles(width, 15);
        const T = this.T;

        this.fillGround(tiles, width, 0, width - 1);

        const numPlatforms = 8 + world;
        for (let i = 0; i < numPlatforms; i++) {
            const pc = 15 + Math.floor(i * (width - 50) / numPlatforms);
            const pr = 6 + Math.floor(Math.random() * 5);
            const pl = 4 + Math.floor(Math.random() * 8);
            this.addPlatform(tiles, width, pc, pr, pl, Math.random() < 0.5 ? T.GRASS : T.BRICK);
            if (Math.random() < 0.4) this.set(tiles, width, pc + Math.floor(pl / 2), pr - 1, T.VEGGIE);
            if (Math.random() < 0.2) this.set(tiles, width, pc + Math.floor(pl / 3), pr - 1, T.CHERRY);
        }

        // Boss area
        this.addPlatform(tiles, width, width - 35, 10, 30, T.BRICK);
        this.set(tiles, width, width - 10, 9, T.CRYSTAL);

        const enemies = this.genEnemies(world, width, 'overworld');
        if (bossType) {
            enemies.push({ type: bossType, col: width - 20, row: 6, ...(bossOpts || { hp: 3 }) });
        } else {
            enemies.push({ type: 'birdo', col: width - 20, row: 6, hp: 3 + Math.floor(world / 2) });
        }

        return {
            width, height: 15, type: 'overworld', timeLimit: 0,
            tiles, spawn: { x: 3, y: 12 },
            entities: enemies,
            boss: bossType || 'birdo',
        };
    },

    generateDesert(world, stage, width, bossType, bossOpts) {
        const tiles = this.createTiles(width, 15);
        const T = this.T;

        this.fillGround(tiles, width, 0, width - 1);
        // Sand on top of ground
        for (let c = 0; c < width; c++) this.set(tiles, width, c, 12, T.SAND);

        const numPlatforms = 6 + world;
        for (let i = 0; i < numPlatforms; i++) {
            const pc = 15 + Math.floor(i * (width - 50) / numPlatforms);
            const pr = 6 + Math.floor(Math.random() * 5);
            const pl = 4 + Math.floor(Math.random() * 6);
            this.addPlatform(tiles, width, pc, pr, pl, T.SAND);
            if (Math.random() < 0.4) this.set(tiles, width, pc + 2, pr - 1, T.VEGGIE);
        }

        this.addPlatform(tiles, width, width - 35, 10, 30, T.SAND);
        this.set(tiles, width, width - 10, 9, T.CRYSTAL);

        const enemies = this.genEnemies(world, width, 'desert');
        if (bossType) {
            enemies.push({ type: bossType, col: width - 20, row: 6, ...(bossOpts || {}) });
        } else {
            enemies.push({ type: 'birdo', col: width - 20, row: 6, hp: 3 + Math.floor(world / 2) });
        }

        return {
            width, height: 15, type: 'desert', timeLimit: 0,
            tiles, spawn: { x: 3, y: 11 },
            entities: enemies,
            boss: bossType || 'birdo',
        };
    },

    generateUnderground(world, stage, width) {
        const tiles = this.createTiles(width, 15);
        const T = this.T;

        this.fillGround(tiles, width, 0, width - 1);
        for (let c = 0; c < width; c++) this.set(tiles, width, c, 0, T.BRICK);

        const numPlatforms = 8 + world;
        for (let i = 0; i < numPlatforms; i++) {
            const pc = 10 + Math.floor(i * (width - 40) / numPlatforms);
            const pr = 5 + Math.floor(Math.random() * 6);
            const pl = 3 + Math.floor(Math.random() * 6);
            this.addPlatform(tiles, width, pc, pr, pl, T.BRICK);
            if (Math.random() < 0.4) this.set(tiles, width, pc + 1, pr - 1, T.VEGGIE);
        }

        this.addPlatform(tiles, width, width - 30, 10, 25, T.BRICK);
        this.set(tiles, width, width - 10, 9, T.CRYSTAL);

        const enemies = this.genEnemies(world, width, 'underground');
        enemies.push({ type: 'birdo', col: width - 18, row: 6, hp: 3 + Math.floor(world / 2) });

        return {
            width, height: 15, type: 'underground', timeLimit: 0,
            tiles, spawn: { x: 2, y: 12 },
            entities: enemies,
            boss: 'birdo',
        };
    },

    generateIce(world, stage, width, bossType, bossOpts) {
        const tiles = this.createTiles(width, 15);
        const T = this.T;

        this.fillGround(tiles, width, 0, width - 1);
        for (let c = 0; c < width; c++) this.set(tiles, width, c, 12, T.ICE);

        const numPlatforms = 7 + world;
        for (let i = 0; i < numPlatforms; i++) {
            const pc = 12 + Math.floor(i * (width - 40) / numPlatforms);
            const pr = 6 + Math.floor(Math.random() * 5);
            const pl = 3 + Math.floor(Math.random() * 6);
            this.addPlatform(tiles, width, pc, pr, pl, T.ICE);
            if (Math.random() < 0.3) this.set(tiles, width, pc + 1, pr - 1, T.VEGGIE);
        }

        this.addPlatform(tiles, width, width - 30, 10, 25, T.ICE);
        this.set(tiles, width, width - 10, 9, T.CRYSTAL);

        const enemies = this.genEnemies(world, width, 'ice');
        if (bossType) {
            enemies.push({ type: bossType, col: width - 20, row: 6, ...(bossOpts || {}) });
        } else {
            enemies.push({ type: 'birdo', col: width - 20, row: 6, hp: 3 + Math.floor(world / 2) });
        }

        return {
            width, height: 15, type: 'ice', timeLimit: 0,
            tiles, spawn: { x: 3, y: 11 },
            entities: enemies,
            boss: bossType || 'birdo',
        };
    },

    generateSky(world, stage, width, bossType, bossOpts) {
        const tiles = this.createTiles(width, 15);
        const T = this.T;

        // Cloud platforms only - no continuous ground
        this.fillGround(tiles, width, 0, 12);

        for (let i = 0; i < 15 + world; i++) {
            const pc = 14 + Math.floor(i * (width - 40) / (15 + world));
            const pr = 4 + Math.floor(Math.random() * 7);
            const pl = 3 + Math.floor(Math.random() * 5);
            this.addPlatform(tiles, width, pc, pr, pl, T.CLOUD);
            if (Math.random() < 0.3) this.set(tiles, width, pc + 1, pr - 1, T.VEGGIE);
        }

        this.fillGround(tiles, width, width - 30, width - 1);
        this.addPlatform(tiles, width, width - 28, 10, 24, T.BRICK);
        this.set(tiles, width, width - 10, 9, T.CRYSTAL);

        const enemies = this.genEnemies(world, width, 'sky');
        if (bossType) {
            enemies.push({ type: bossType, col: width - 20, row: 6, ...(bossOpts || {}) });
        } else {
            enemies.push({ type: 'birdo', col: width - 20, row: 6, hp: 4 + Math.floor(world / 2) });
        }

        return {
            width, height: 15, type: 'overworld', timeLimit: 0,
            tiles, spawn: { x: 3, y: 10 },
            entities: enemies,
            boss: bossType || 'birdo',
        };
    },

    generateLevel(world, stage) {
        if (stage === 3) return this.generateOverworld(world, stage, 200 + world * 10, 'birdo', { hp: 3 + world });
        if (stage === 2) return this.generateUnderground(world, stage, 180 + world * 10);
        return this.generateOverworld(world, stage, 200 + world * 10);
    },

    genEnemies(world, width, type) {
        const enemies = [];
        const count = 6 + world * 2;
        for (let i = 0; i < count; i++) {
            const col = 15 + Math.floor(i * (width - 60) / count) + Math.floor(Math.random() * 8);
            const row = 12;
            let etype;
            const r = Math.random();
            if (type === 'desert') {
                etype = r < 0.3 ? 'pokey' : (r < 0.6 ? 'shyguy' : (r < 0.8 ? 'snifit' : 'panser'));
            } else if (type === 'ice') {
                etype = r < 0.4 ? 'shyguyBlue' : (r < 0.7 ? 'snifit' : 'ninji');
            } else if (type === 'sky') {
                etype = r < 0.3 ? 'shyguy' : (r < 0.6 ? 'ninji' : (r < 0.8 ? 'pidgit' : 'snifit'));
            } else if (type === 'underground') {
                etype = r < 0.4 ? 'shyguy' : (r < 0.7 ? 'snifit' : (r < 0.85 ? 'ninji' : 'spark'));
            } else {
                etype = r < 0.4 ? 'shyguy' : (r < 0.7 ? 'snifit' : 'ninji');
            }
            enemies.push({ type: etype, col, row });
        }
        return enemies;
    },
};
