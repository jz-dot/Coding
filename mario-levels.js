// ============================================================
// Super Ashio Bros. - Level Data
// All 32 levels (8 worlds x 4 stages)
// Tile grid: 13 rows tall, variable width columns
// Uses sparse encoding: only non-empty tiles stored
// ============================================================

const MarioLevels = {
    // Tile constants
    T: {
        EMPTY: 0, GROUND: 1, BRICK: 2, QUESTION: 3, Q_MUSH: 4, Q_STAR: 5,
        Q_1UP: 6, Q_MULTI: 7, USED: 8, HARD: 9, PIPE_TL: 10, PIPE_TR: 11,
        PIPE_BL: 12, PIPE_BR: 13, INVISIBLE: 14, FLAGPOLE: 16, BRIDGE: 17,
        CASTLE: 18, CLOUD: 19, TREETOP: 20, COIN: 21, STAIR: 22, AXE: 23,
        LAVA: 24, CORAL: 25, INVIS_BLOCK: 26, STEM: 27, FLAG_TOP: 28,
        FLAG: 29, WATER_TOP: 30, WATER: 31
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

        // Generate a level from templates if no hand-crafted version
        const data = this.generateLevel(world, stage);
        this.levelCache[key] = data;
        return data;
    },

    // Helper: Create empty tile array
    createTiles(width, height) {
        return new Array(width * height).fill(0);
    },

    // Helper: Set tile in array
    set(tiles, width, col, row, tile) {
        if (col >= 0 && col < width && row >= 0 && row < 13) {
            tiles[row * width + col] = tile;
        }
    },

    // Helper: Fill ground from startCol to endCol
    fillGround(tiles, width, startCol, endCol, groundRow) {
        groundRow = groundRow || 12;
        for (let c = startCol; c <= Math.min(endCol, width - 1); c++) {
            for (let r = groundRow; r < 13; r++) {
                this.set(tiles, width, c, r, this.T.GROUND);
            }
        }
    },

    // Helper: Add pipe
    addPipe(tiles, width, col, height) {
        const topRow = 12 - height;
        this.set(tiles, width, col, topRow, this.T.PIPE_TL);
        this.set(tiles, width, col + 1, topRow, this.T.PIPE_TR);
        for (let r = topRow + 1; r < 12; r++) {
            this.set(tiles, width, col, r, this.T.PIPE_BL);
            this.set(tiles, width, col + 1, r, this.T.PIPE_BR);
        }
    },

    // Helper: Add staircase (ascending right)
    addStairRight(tiles, width, startCol, height) {
        for (let h = 1; h <= height; h++) {
            for (let r = 12 - h; r < 12; r++) {
                this.set(tiles, width, startCol + h - 1, r, this.T.STAIR);
            }
        }
    },

    // Helper: Add staircase (ascending left)
    addStairLeft(tiles, width, startCol, height) {
        for (let h = 1; h <= height; h++) {
            for (let r = 12 - h; r < 12; r++) {
                this.set(tiles, width, startCol + height - h, r, this.T.STAIR);
            }
        }
    },

    // Helper: Add row of bricks at given row
    addBrickRow(tiles, width, startCol, endCol, row) {
        for (let c = startCol; c <= endCol; c++) {
            this.set(tiles, width, c, row, this.T.BRICK);
        }
    },

    // Helper: Add flagpole structure
    addFlagpole(tiles, width, col) {
        this.set(tiles, width, col, 1, this.T.FLAG_TOP);
        for (let r = 2; r < 12; r++) {
            this.set(tiles, width, col, r, this.T.FLAGPOLE);
        }
    },

    // Helper: Add small castle (decorative end)
    addEndCastle(tiles, width, col) {
        // Just ground marker - castle drawn by renderer
    },

    // ============================================================
    // WORLD 1
    // ============================================================

    build_1_1() {
        const W = 224;
        const tiles = this.createTiles(W, 13);
        const T = this.T;

        // Ground
        this.fillGround(tiles, W, 0, 68);
        this.fillGround(tiles, W, 71, 86);
        this.fillGround(tiles, W, 89, 152);
        this.fillGround(tiles, W, 155, 223);

        // ? blocks and bricks
        this.set(tiles, W, 16, 8, T.QUESTION);
        this.set(tiles, W, 20, 8, T.BRICK);
        this.set(tiles, W, 21, 8, T.Q_MUSH);
        this.set(tiles, W, 22, 8, T.BRICK);
        this.set(tiles, W, 23, 8, T.QUESTION);
        this.set(tiles, W, 22, 4, T.QUESTION);

        this.set(tiles, W, 64, 8, T.BRICK);
        this.set(tiles, W, 64, 4, T.BRICK);
        this.set(tiles, W, 65, 4, T.BRICK);
        this.set(tiles, W, 66, 4, T.BRICK);
        this.set(tiles, W, 67, 4, T.BRICK);
        this.set(tiles, W, 68, 4, T.BRICK);

        // Row of bricks at row 8
        this.set(tiles, W, 77, 8, T.Q_MUSH);
        this.set(tiles, W, 78, 4, T.BRICK);
        this.set(tiles, W, 79, 4, T.BRICK);
        this.set(tiles, W, 80, 4, T.Q_MUSH);

        this.set(tiles, W, 91, 8, T.BRICK);
        this.set(tiles, W, 94, 8, T.Q_STAR);
        this.set(tiles, W, 94, 4, T.BRICK);

        this.set(tiles, W, 100, 8, T.BRICK);
        this.set(tiles, W, 101, 8, T.QUESTION);
        this.set(tiles, W, 106, 8, T.QUESTION);
        this.set(tiles, W, 109, 8, T.QUESTION);
        this.set(tiles, W, 109, 4, T.QUESTION);

        this.set(tiles, W, 118, 8, T.BRICK);
        this.set(tiles, W, 119, 8, T.BRICK);
        this.set(tiles, W, 121, 4, T.BRICK);
        this.set(tiles, W, 122, 4, T.BRICK);
        this.set(tiles, W, 123, 4, T.BRICK);
        this.set(tiles, W, 128, 4, T.BRICK);
        this.set(tiles, W, 129, 4, T.Q_MUSH);
        this.set(tiles, W, 130, 4, T.BRICK);

        this.set(tiles, W, 129, 8, T.BRICK);
        this.set(tiles, W, 130, 8, T.BRICK);

        this.set(tiles, W, 168, 8, T.BRICK);
        this.set(tiles, W, 169, 8, T.BRICK);
        this.set(tiles, W, 170, 8, T.Q_MUSH);
        this.set(tiles, W, 171, 8, T.BRICK);

        // Pipes
        this.addPipe(tiles, W, 28, 2);
        this.addPipe(tiles, W, 38, 3);
        this.addPipe(tiles, W, 46, 4);
        this.addPipe(tiles, W, 57, 4);
        this.addPipe(tiles, W, 163, 2);
        this.addPipe(tiles, W, 179, 2);

        // Stairs (end of level)
        this.addStairRight(tiles, W, 134, 4);
        this.addStairRight(tiles, W, 140, 4);
        this.addStairLeft(tiles, W, 144, 4);
        this.addStairRight(tiles, W, 148, 4);
        this.addStairLeft(tiles, W, 152, 4);

        // Final stairs to flagpole
        this.addStairRight(tiles, W, 181, 8);

        // Flagpole
        this.addFlagpole(tiles, W, 198);

        return {
            width: W, height: 13, type: 'overworld', timeLimit: 400,
            tiles: tiles,
            spawn: { x: 3, y: 11 },
            flagpole: { col: 198 },
            entities: [
                { type: 'goomba', col: 22, row: 10 },
                { type: 'goomba', col: 40, row: 10 },
                { type: 'goomba', col: 51, row: 10 },
                { type: 'goomba', col: 52, row: 10 },
                { type: 'goomba', col: 80, row: 6 },
                { type: 'goomba', col: 82, row: 6 },
                { type: 'koopa', col: 107, row: 10 },
                { type: 'goomba', col: 114, row: 10 },
                { type: 'goomba', col: 115, row: 10 },
                { type: 'goomba', col: 124, row: 10 },
                { type: 'goomba', col: 125, row: 10 },
                { type: 'goomba', col: 128, row: 10 },
                { type: 'goomba', col: 129, row: 10 },
                { type: 'goomba', col: 174, row: 10 },
                { type: 'goomba', col: 175, row: 10 },
            ],
            pipes: [
                { enterCol: 57, enterRow: 8, direction: 'down', exitWorld: 1, exitStage: 1, exitCol: 163, exitRow: 10 },
            ],
        };
    },

    build_1_2() {
        const W = 200;
        const tiles = this.createTiles(W, 13);
        const T = this.T;

        // Underground level
        // Ceiling
        for (let c = 0; c < W; c++) {
            this.set(tiles, W, c, 0, T.BRICK);
        }
        this.fillGround(tiles, W, 0, W - 1);

        // Platforms and bricks
        this.addBrickRow(tiles, W, 4, 8, 8);
        this.set(tiles, W, 10, 8, T.Q_MUSH);
        this.addBrickRow(tiles, W, 12, 18, 4);

        this.set(tiles, W, 24, 8, T.BRICK);
        this.set(tiles, W, 25, 8, T.Q_MUSH);
        this.set(tiles, W, 26, 8, T.BRICK);

        this.addBrickRow(tiles, W, 30, 38, 4);
        this.addBrickRow(tiles, W, 42, 50, 8);

        this.set(tiles, W, 55, 8, T.QUESTION);
        this.set(tiles, W, 58, 8, T.QUESTION);
        this.set(tiles, W, 62, 4, T.Q_MUSH);

        this.addBrickRow(tiles, W, 70, 75, 8);
        this.addBrickRow(tiles, W, 80, 88, 4);

        this.set(tiles, W, 93, 8, T.Q_STAR);

        // Warp zone area (at end)
        this.addPipe(tiles, W, 160, 2);
        this.addPipe(tiles, W, 168, 2);
        this.addPipe(tiles, W, 176, 2);

        // Exit pipe
        this.addPipe(tiles, W, 190, 2);

        return {
            width: W, height: 13, type: 'underground', timeLimit: 400,
            tiles: tiles,
            spawn: { x: 3, y: 10 },
            flagpole: null,
            entities: [
                { type: 'goomba', col: 15, row: 10 },
                { type: 'goomba', col: 16, row: 10 },
                { type: 'goomba', col: 32, row: 10 },
                { type: 'koopa', col: 45, row: 10 },
                { type: 'goomba', col: 60, row: 10 },
                { type: 'goomba', col: 61, row: 10 },
                { type: 'goomba', col: 83, row: 10 },
                { type: 'goomba', col: 84, row: 10 },
            ],
            pipes: [
                { enterCol: 160, enterRow: 10, direction: 'down', exitWorld: 2, exitStage: 1 },
                { enterCol: 168, enterRow: 10, direction: 'down', exitWorld: 3, exitStage: 1 },
                { enterCol: 176, enterRow: 10, direction: 'down', exitWorld: 4, exitStage: 1 },
                { enterCol: 190, enterRow: 10, direction: 'down', exitWorld: 1, exitStage: 3 },
            ],
            warpZone: { col: 155, destinations: [2, 3, 4] },
        };
    },

    build_1_3() {
        const W = 180;
        const tiles = this.createTiles(W, 13);
        const T = this.T;

        // Athletic/tree-top level
        this.fillGround(tiles, W, 0, 15);

        // Platforms
        for (let c = 18; c <= 22; c++) this.set(tiles, W, c, 8, T.TREETOP);
        for (let c = 26; c <= 32; c++) this.set(tiles, W, c, 6, T.TREETOP);
        for (let c = 36; c <= 40; c++) this.set(tiles, W, c, 8, T.TREETOP);
        for (let c = 44; c <= 52; c++) this.set(tiles, W, c, 5, T.TREETOP);
        for (let c = 56; c <= 60; c++) this.set(tiles, W, c, 8, T.TREETOP);
        for (let c = 64; c <= 70; c++) this.set(tiles, W, c, 6, T.TREETOP);
        for (let c = 74; c <= 78; c++) this.set(tiles, W, c, 4, T.TREETOP);
        for (let c = 82; c <= 90; c++) this.set(tiles, W, c, 7, T.TREETOP);
        for (let c = 94; c <= 98; c++) this.set(tiles, W, c, 5, T.TREETOP);
        for (let c = 102; c <= 110; c++) this.set(tiles, W, c, 8, T.TREETOP);

        this.fillGround(tiles, W, 114, 179);
        this.addStairRight(tiles, W, 128, 8);
        this.addFlagpole(tiles, W, 150);

        return {
            width: W, height: 13, type: 'overworld', timeLimit: 300,
            tiles: tiles,
            spawn: { x: 3, y: 10 },
            flagpole: { col: 150 },
            entities: [
                { type: 'koopaRed', col: 20, row: 6 },
                { type: 'koopaRed', col: 30, row: 4 },
                { type: 'goomba', col: 48, row: 3 },
                { type: 'koopaRed', col: 58, row: 6 },
                { type: 'koopaRed', col: 67, row: 4 },
                { type: 'goomba', col: 85, row: 5 },
                { type: 'goomba', col: 86, row: 5 },
                { type: 'koopa', col: 106, row: 6 },
            ],
            pipes: [],
        };
    },

    build_1_4() {
        const W = 160;
        const tiles = this.createTiles(W, 13);
        const T = this.T;

        // Castle level
        this.fillGround(tiles, W, 0, 159);

        // Castle blocks for ceiling and walls
        for (let c = 0; c < W; c++) {
            this.set(tiles, W, c, 0, T.CASTLE);
            this.set(tiles, W, c, 1, T.CASTLE);
        }

        // Platforms
        this.addBrickRow(tiles, W, 10, 20, 8);
        this.addBrickRow(tiles, W, 25, 35, 6);
        this.addBrickRow(tiles, W, 40, 50, 8);

        // Lava pits
        for (let c = 52; c <= 56; c++) {
            this.set(tiles, W, c, 12, T.LAVA);
            tiles[11 * W + c] = 0; // Remove ground
        }
        for (let c = 65; c <= 70; c++) {
            this.set(tiles, W, c, 12, T.LAVA);
            tiles[11 * W + c] = 0;
        }
        for (let c = 80; c <= 84; c++) {
            this.set(tiles, W, c, 12, T.LAVA);
            tiles[11 * W + c] = 0;
        }

        this.addBrickRow(tiles, W, 58, 63, 8);
        this.addBrickRow(tiles, W, 72, 78, 6);
        this.addBrickRow(tiles, W, 86, 95, 8);

        // Bridge to Bowser
        for (let c = 120; c <= 135; c++) {
            this.set(tiles, W, c, 9, T.BRIDGE);
        }
        // Lava under bridge
        for (let c = 115; c <= 140; c++) {
            this.set(tiles, W, c, 12, T.LAVA);
            tiles[11 * W + c] = 0;
            tiles[10 * W + c] = 0;
        }

        // Axe
        this.set(tiles, W, 137, 8, T.AXE);

        return {
            width: W, height: 13, type: 'castle', timeLimit: 300,
            tiles: tiles,
            spawn: { x: 2, y: 10 },
            flagpole: null,
            entities: [
                { type: 'fireBar', col: 30, row: 6, length: 6, speed: 0.03, clockwise: true },
                { type: 'fireBar', col: 45, row: 8, length: 5, speed: 0.04, clockwise: false },
                { type: 'fireBar', col: 73, row: 6, length: 6, speed: 0.03, clockwise: true },
                { type: 'fireBar', col: 90, row: 8, length: 5, speed: 0.035 },
                { type: 'bowser', col: 128, row: 6, hp: 5 },
            ],
            pipes: [],
            axe: { col: 137, row: 8 },
            bridge: { startCol: 120, endCol: 135, row: 9 },
            isCastle: true,
        };
    },

    // ============================================================
    // WORLD 2
    // ============================================================

    build_2_1() {
        return this.generateOverworld(2, 1, 210, [
            { type: 'koopa', col: 20, row: 10 },
            { type: 'goomba', col: 35, row: 10 },
            { type: 'goomba', col: 36, row: 10 },
            { type: 'koopa', col: 55, row: 10 },
            { type: 'goomba', col: 70, row: 10 },
            { type: 'goomba', col: 71, row: 10 },
            { type: 'koopa', col: 90, row: 10 },
            { type: 'goomba', col: 105, row: 10 },
            { type: 'koopa', col: 120, row: 10 },
            { type: 'goomba', col: 140, row: 10 },
            { type: 'goomba', col: 141, row: 10 },
            { type: 'koopa', col: 160, row: 10 },
        ]);
    },

    build_2_2() {
        return this.generateUnderwater(2, 2, 180);
    },

    build_2_3() {
        return this.generateAthletic(2, 3, 180);
    },

    build_2_4() {
        return this.generateCastle(2, 4, 160);
    },

    // WORLD 3
    build_3_1() {
        return this.generateOverworld(3, 1, 220, [
            { type: 'goomba', col: 18, row: 10 },
            { type: 'goomba', col: 19, row: 10 },
            { type: 'hammerBro', col: 45, row: 8 },
            { type: 'koopa', col: 60, row: 10 },
            { type: 'goomba', col: 80, row: 10 },
            { type: 'goomba', col: 81, row: 10 },
            { type: 'koopa', col: 100, row: 10 },
            { type: 'hammerBro', col: 120, row: 8 },
            { type: 'goomba', col: 140, row: 10 },
            { type: 'goomba', col: 141, row: 10 },
        ]);
    },
    build_3_2() { return this.generateOverworld(3, 2, 200, this.genEnemies('overworld', 3)); },
    build_3_3() { return this.generateAthletic(3, 3, 190); },
    build_3_4() { return this.generateCastle(3, 4, 170); },

    // WORLD 4
    build_4_1() { return this.generateOverworld(4, 1, 220, this.genEnemies('overworld', 4)); },
    build_4_2() {
        const level = this.generateUnderground(4, 2, 220);
        // 4-2 has warp zone to worlds 6, 7, 8
        level.warpZone = { col: 180, destinations: [6, 7, 8] };
        const T = this.T;
        this.addPipe(level.tiles, level.width, 180, 2);
        this.addPipe(level.tiles, level.width, 188, 2);
        this.addPipe(level.tiles, level.width, 196, 2);
        level.pipes.push(
            { enterCol: 180, enterRow: 10, direction: 'down', exitWorld: 6, exitStage: 1 },
            { enterCol: 188, enterRow: 10, direction: 'down', exitWorld: 7, exitStage: 1 },
            { enterCol: 196, enterRow: 10, direction: 'down', exitWorld: 8, exitStage: 1 }
        );
        return level;
    },
    build_4_3() { return this.generateAthletic(4, 3, 180); },
    build_4_4() { return this.generateCastle(4, 4, 180); },

    // WORLD 5
    build_5_1() { return this.generateOverworld(5, 1, 230, this.genEnemies('overworld', 5)); },
    build_5_2() { return this.generateOverworld(5, 2, 210, this.genEnemies('overworld', 5)); },
    build_5_3() { return this.generateAthletic(5, 3, 200); },
    build_5_4() { return this.generateCastle(5, 4, 180); },

    // WORLD 6
    build_6_1() { return this.generateOverworld(6, 1, 240, this.genEnemies('night', 6), 'night'); },
    build_6_2() { return this.generateOverworld(6, 2, 220, this.genEnemies('overworld', 6)); },
    build_6_3() { return this.generateAthletic(6, 3, 200); },
    build_6_4() { return this.generateCastle(6, 4, 190); },

    // WORLD 7
    build_7_1() { return this.generateOverworld(7, 1, 240, this.genEnemies('overworld', 7)); },
    build_7_2() { return this.generateUnderwater(7, 2, 200); },
    build_7_3() { return this.generateAthletic(7, 3, 210); },
    build_7_4() { return this.generateCastle(7, 4, 200); },

    // WORLD 8
    build_8_1() { return this.generateOverworld(8, 1, 260, this.genEnemies('overworld', 8)); },
    build_8_2() { return this.generateOverworld(8, 2, 250, this.genEnemies('overworld', 8)); },
    build_8_3() { return this.generateOverworld(8, 3, 240, this.genEnemies('overworld', 8)); },
    build_8_4() {
        // Final castle with maze mechanic
        const level = this.generateCastle(8, 4, 240);
        // Replace the default Bowser with a stronger final boss
        level.entities = level.entities.filter(e => e.type !== 'bowser');
        level.entities.push({ type: 'bowser', col: 200, row: 6, hp: 10 });
        level.isFinal = true;
        return level;
    },

    // ============================================================
    // LEVEL GENERATORS
    // ============================================================

    generateOverworld(world, stage, width, enemies, type) {
        const tiles = this.createTiles(width, 13);
        const T = this.T;
        type = type || 'overworld';

        // Ground with gaps
        let c = 0;
        while (c < width) {
            const segLen = 15 + Math.floor(Math.random() * 30);
            this.fillGround(tiles, width, c, Math.min(c + segLen, width - 1));
            c += segLen;
            // Occasional gap
            if (c < width - 30 && Math.random() < 0.2) {
                c += 2 + Math.floor(Math.random() * 2);
            }
        }
        // Ensure ground at start and end
        this.fillGround(tiles, width, 0, 15);
        this.fillGround(tiles, width, width - 30, width - 1);

        // Add ? blocks and bricks
        const blockSets = 6 + Math.floor(world * 1.5);
        for (let i = 0; i < blockSets; i++) {
            const bc = 15 + Math.floor(Math.random() * (width - 40));
            const br = 4 + Math.floor(Math.random() * 5);
            const bLen = 1 + Math.floor(Math.random() * 4);
            for (let j = 0; j < bLen; j++) {
                const tileType = Math.random() < 0.3 ?
                    (Math.random() < 0.5 ? T.Q_MUSH : T.QUESTION) : T.BRICK;
                this.set(tiles, width, bc + j, br, tileType);
            }
        }

        // Add pipes
        const numPipes = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numPipes; i++) {
            const pc = 25 + Math.floor(i * (width - 50) / numPipes) + Math.floor(Math.random() * 10);
            const ph = 2 + Math.floor(Math.random() * 3);
            this.addPipe(tiles, width, pc, ph);
        }

        // Add stairs near end
        this.addStairRight(tiles, width, width - 35, Math.min(8, 4 + world));

        // Flagpole
        this.addFlagpole(tiles, width, width - 15);

        return {
            width, height: 13, type, timeLimit: 400,
            tiles,
            spawn: { x: 3, y: 11 },
            flagpole: { col: width - 15 },
            entities: enemies || this.genEnemies(type, world),
            pipes: [],
        };
    },

    generateUnderground(world, stage, width) {
        const tiles = this.createTiles(width, 13);
        const T = this.T;

        // Ceiling
        for (let c = 0; c < width; c++) {
            this.set(tiles, width, c, 0, T.BRICK);
        }
        this.fillGround(tiles, width, 0, width - 1);

        // Platforms and blocks
        for (let i = 0; i < 8; i++) {
            const pc = 10 + Math.floor(i * (width - 40) / 8);
            const pr = 4 + Math.floor(Math.random() * 5);
            const pl = 3 + Math.floor(Math.random() * 6);
            this.addBrickRow(tiles, width, pc, pc + pl, pr);
            if (Math.random() < 0.3) {
                this.set(tiles, width, pc + Math.floor(pl / 2), pr, T.Q_MUSH);
            }
        }

        // Coins scattered
        for (let i = 0; i < 15; i++) {
            const cc = 5 + Math.floor(Math.random() * (width - 20));
            const cr = 3 + Math.floor(Math.random() * 8);
            this.set(tiles, width, cc, cr, T.COIN);
        }

        // Exit pipe
        this.addPipe(tiles, width, width - 10, 2);

        return {
            width, height: 13, type: 'underground', timeLimit: 400,
            tiles,
            spawn: { x: 2, y: 10 },
            flagpole: null,
            entities: this.genEnemies('underground', world),
            pipes: [
                { enterCol: width - 10, enterRow: 10, direction: 'down', exitWorld: world, exitStage: Math.min(stage + 1, 4) }
            ],
        };
    },

    generateUnderwater(world, stage, width) {
        const tiles = this.createTiles(width, 13);
        const T = this.T;

        this.fillGround(tiles, width, 0, width - 1);

        // Water fills most of screen
        for (let c = 0; c < width; c++) {
            this.set(tiles, width, c, 1, T.WATER);
            for (let r = 2; r < 12; r++) {
                this.set(tiles, width, c, r, T.WATER);
            }
        }

        // Coral obstacles
        for (let i = 0; i < 10; i++) {
            const cc = 10 + Math.floor(i * (width - 30) / 10);
            const ch = 2 + Math.floor(Math.random() * 4);
            for (let r = 12 - ch; r < 12; r++) {
                this.set(tiles, width, cc, r, T.CORAL);
            }
        }

        // Exit pipe
        this.addPipe(tiles, width, width - 10, 2);

        return {
            width, height: 13, type: 'underwater', timeLimit: 300,
            tiles,
            spawn: { x: 2, y: 8 },
            flagpole: null,
            entities: [
                ...Array.from({length: 5 + world}, (_, i) => ({
                    type: 'cheepCheep', col: 15 + i * 20, row: 4 + Math.floor(Math.random() * 5),
                    color: Math.random() < 0.5 ? 'red' : 'gray', swim: 'horizontal'
                })),
                ...Array.from({length: 3 + Math.floor(world / 2)}, (_, i) => ({
                    type: 'blooper', col: 25 + i * 30, row: 4
                })),
            ],
            pipes: [
                { enterCol: width - 10, enterRow: 10, direction: 'down', exitWorld: world, exitStage: 3 }
            ],
        };
    },

    generateAthletic(world, stage, width) {
        const tiles = this.createTiles(width, 13);
        const T = this.T;

        this.fillGround(tiles, width, 0, 12);

        // Floating platforms
        for (let i = 0; i < 12 + world; i++) {
            const pc = 14 + Math.floor(i * (width - 50) / (12 + world));
            const pr = 4 + Math.floor(Math.random() * 5);
            const pl = 3 + Math.floor(Math.random() * 5);
            for (let j = 0; j < pl; j++) {
                this.set(tiles, width, pc + j, pr, T.TREETOP);
            }
        }

        this.fillGround(tiles, width, width - 30, width - 1);
        this.addStairRight(tiles, width, width - 28, 6 + Math.min(world, 4));
        this.addFlagpole(tiles, width, width - 10);

        return {
            width, height: 13, type: 'overworld', timeLimit: 300,
            tiles,
            spawn: { x: 3, y: 10 },
            flagpole: { col: width - 10 },
            entities: this.genEnemies('athletic', world),
            pipes: [],
        };
    },

    generateCastle(world, stage, width) {
        const tiles = this.createTiles(width, 13);
        const T = this.T;

        this.fillGround(tiles, width, 0, width - 1);

        // Ceiling
        for (let c = 0; c < width; c++) {
            this.set(tiles, width, c, 0, T.CASTLE);
            this.set(tiles, width, c, 1, T.CASTLE);
        }

        // Platforms
        for (let i = 0; i < 6; i++) {
            const pc = 10 + Math.floor(i * (width - 60) / 6);
            const pr = 5 + Math.floor(Math.random() * 4);
            this.addBrickRow(tiles, width, pc, pc + 6 + Math.floor(Math.random() * 5), pr);
        }

        // Lava pits
        const numLava = 3 + Math.floor(world / 2);
        for (let i = 0; i < numLava; i++) {
            const lc = 20 + Math.floor(i * (width - 80) / numLava) + Math.floor(Math.random() * 5);
            const ll = 3 + Math.floor(Math.random() * 3);
            for (let j = 0; j < ll; j++) {
                if (lc + j < width) {
                    this.set(tiles, width, lc + j, 12, T.LAVA);
                    tiles[11 * width + lc + j] = 0;
                }
            }
        }

        // Bridge at end
        const bridgeStart = width - 35;
        const bridgeEnd = width - 15;
        for (let c = bridgeStart; c <= bridgeEnd; c++) {
            this.set(tiles, width, c, 9, T.BRIDGE);
        }
        for (let c = bridgeStart - 5; c <= bridgeEnd + 5; c++) {
            if (c >= 0 && c < width) {
                this.set(tiles, width, c, 12, T.LAVA);
                tiles[11 * width + c] = 0;
                tiles[10 * width + c] = 0;
            }
        }

        // Axe
        this.set(tiles, width, bridgeEnd + 2, 8, T.AXE);

        // Fire bars
        const fireBarEntities = [];
        const numFireBars = 2 + Math.floor(world / 2);
        for (let i = 0; i < numFireBars; i++) {
            const fc = 15 + Math.floor(i * (width - 60) / numFireBars);
            fireBarEntities.push({
                type: 'fireBar', col: fc, row: 6 + Math.floor(Math.random() * 3),
                length: 4 + Math.floor(Math.random() * 3),
                speed: 0.025 + Math.random() * 0.02,
                clockwise: Math.random() < 0.5
            });
        }

        return {
            width, height: 13, type: 'castle', timeLimit: 300,
            tiles,
            spawn: { x: 2, y: 10 },
            flagpole: null,
            entities: [
                ...fireBarEntities,
                { type: 'bowser', col: width - 25, row: 6, hp: 5 + world },
            ],
            pipes: [],
            axe: { col: bridgeEnd + 2, row: 8 },
            bridge: { startCol: bridgeStart, endCol: bridgeEnd, row: 9 },
            isCastle: true,
        };
    },

    generateLevel(world, stage) {
        if (stage === 4) return this.generateCastle(world, stage, 160 + world * 10);
        if (stage === 3) return this.generateAthletic(world, stage, 170 + world * 10);
        return this.generateOverworld(world, stage, 200 + world * 10, this.genEnemies('overworld', world));
    },

    // ---- ENEMY GENERATORS ----

    genEnemies(type, world) {
        const enemies = [];
        const count = 6 + world * 2;
        const spread = 12;

        for (let i = 0; i < count; i++) {
            const col = 15 + Math.floor(i * spread) + Math.floor(Math.random() * 8);
            const row = type === 'athletic' ? (3 + Math.floor(Math.random() * 4)) : 10;

            let etype;
            const r = Math.random();

            if (type === 'underwater') {
                etype = r < 0.6 ? 'cheepCheep' : 'blooper';
            } else if (type === 'underground') {
                etype = r < 0.5 ? 'goomba' : (r < 0.8 ? 'koopa' : 'buzzy');
            } else if (type === 'athletic') {
                etype = r < 0.5 ? 'koopaRed' : 'goomba';
            } else {
                // Overworld - more variety at higher worlds
                if (world >= 6 && r < 0.1) etype = 'hammerBro';
                else if (world >= 5 && r < 0.15) etype = 'lakitu';
                else if (world >= 3 && r < 0.2) etype = 'buzzy';
                else if (r < 0.5) etype = 'goomba';
                else if (r < 0.75) etype = 'koopa';
                else etype = 'koopaRed';
            }

            enemies.push({ type: etype, col, row });
        }

        return enemies;
    },
};
