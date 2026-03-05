// ============================================================
// Super Ashio Bros. 3 - Level Data
// 8 Worlds with world map nodes and level layouts
// ============================================================

const Mario3Levels = {
    // Tile constants
    EMPTY: 0,
    GROUND: 1,
    BRICK: 2,
    QBLOCK: 3,
    USED: 4,
    WOOD: 5,
    NOTE: 6,
    PIPE_TL: 7,
    PIPE_TR: 8,
    PIPE_BL: 9,
    PIPE_BR: 10,
    COIN: 11,
    ICE: 12,
    CLOUD: 13,
    LAVA: 14,
    CASTLE: 15,
    SLOPE_L: 16,
    SLOPE_R: 17,
    STAIR: 18,
    BRIDGE: 19,
    FLAG: 20,

    // World map definitions
    // Each world has: name, theme, nodes[], paths[]
    // Node types: 'start', 'level', 'fortress', 'airship', 'mushroom_house', 'hammer_bro', 'lock'
    worlds: [],

    init() {
        this.worlds = [
            this.buildWorld1(),
            this.buildWorld2(),
            this.buildWorld3(),
            this.buildWorld4(),
            this.buildWorld5(),
            this.buildWorld6(),
            this.buildWorld7(),
            this.buildWorld8()
        ];
    },

    // ========== WORLD 1: GRASS LAND ==========
    buildWorld1() {
        return {
            name: 'GRASS LAND',
            theme: 'grass',
            koopaling: 'Larry',
            nodes: [
                { type: 'start', x: 24, y: 180, id: 'start' },
                { type: 'level', x: 56, y: 180, id: '1-1', levelIdx: 0 },
                { type: 'level', x: 88, y: 180, id: '1-2', levelIdx: 1 },
                { type: 'level', x: 120, y: 148, id: '1-3', levelIdx: 2 },
                { type: 'level', x: 152, y: 148, id: '1-4', levelIdx: 3 },
                { type: 'fortress', x: 184, y: 148, id: '1-F', levelIdx: 4 },
                { type: 'level', x: 184, y: 180, id: '1-5', levelIdx: 5 },
                { type: 'level', x: 216, y: 180, id: '1-6', levelIdx: 6 },
                { type: 'airship', x: 240, y: 148, id: '1-A', levelIdx: 7 }
            ],
            paths: [
                ['start', '1-1'], ['1-1', '1-2'], ['1-2', '1-3'], ['1-3', '1-4'],
                ['1-4', '1-F'], ['1-F', '1-5'], ['1-5', '1-6'], ['1-6', '1-A']
            ],
            levels: [
                this.build_1_1(), this.build_1_2(), this.build_1_3(), this.build_1_4(),
                this.buildFortress(1), this.build_1_5(), this.build_1_6(), this.buildAirship(1)
            ]
        };
    },

    build_1_1() {
        // Classic grass overworld - tutorial level
        const W = 210, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);
        // Ground
        T.fillGround(tiles, 0, W, H);
        // Gap
        T.clearGround(tiles, 68, 70, H);
        T.clearGround(tiles, 150, 152, H);

        // ? blocks and bricks
        T.setTile(tiles, 16, 9, T.QBLOCK); // coin
        T.setTile(tiles, 20, 9, T.BRICK);
        T.setTile(tiles, 21, 9, T.QBLOCK); // mushroom/leaf
        T.setTile(tiles, 22, 9, T.BRICK);
        T.setTile(tiles, 23, 9, T.QBLOCK); // coin
        T.setTile(tiles, 24, 9, T.BRICK);

        // High ? block
        T.setTile(tiles, 28, 5, T.QBLOCK); // 1-up

        // Pipe
        T.setPipe(tiles, 38, 11, 2);
        T.setPipe(tiles, 55, 10, 3);
        T.setPipe(tiles, 90, 11, 2);

        // Coin trail
        for (let i = 44; i < 52; i++) T.setTile(tiles, i, 8, T.COIN);

        // Platform section
        T.fillRow(tiles, 60, 65, 9, T.BRICK);
        T.setTile(tiles, 62, 9, T.QBLOCK); // star

        // Note blocks
        T.setTile(tiles, 75, 11, T.NOTE);
        T.setTile(tiles, 77, 11, T.NOTE);
        T.setTile(tiles, 79, 11, T.NOTE);
        T.setTile(tiles, 77, 7, T.NOTE);

        // More blocks
        T.fillRow(tiles, 100, 108, 9, T.BRICK);
        T.setTile(tiles, 103, 9, T.QBLOCK);
        T.setTile(tiles, 105, 9, T.QBLOCK);
        T.setTile(tiles, 103, 5, T.QBLOCK);

        // Steps to goal
        for (let i = 0; i < 8; i++) {
            T.fillCol(tiles, 160 + i, 13 - i, 13, T.STAIR);
        }

        // Goal area
        T.setTile(tiles, 195, 4, T.FLAG);

        return {
            width: W, height: H, tiles,
            type: 'overworld', theme: 'grass', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities: [
                { type: 'goomba3', x: 22, y: 12 },
                { type: 'goomba3', x: 40, y: 12 },
                { type: 'goomba3', x: 41, y: 12 },
                { type: 'koopa3', x: 50, y: 12 },
                { type: 'goomba3', x: 72, y: 12 },
                { type: 'goomba3', x: 73, y: 12 },
                { type: 'koopa3', x: 85, y: 12, opts: { flying: true } },
                { type: 'goomba3', x: 95, y: 12 },
                { type: 'goomba3', x: 110, y: 12 },
                { type: 'goomba3', x: 112, y: 12 },
                { type: 'koopa3', x: 130, y: 12 },
                { type: 'piranha3', x: 38, y: 10 },
                { type: 'piranha3', x: 90, y: 10 }
            ],
            goalX: 195,
            blockContents: {
                '16,9': 'coin', '21,9': 'mushroom', '23,9': 'coin', '24,9': 'coin',
                '28,5': '1up', '62,9': 'star', '103,9': 'coin', '105,9': 'mushroom',
                '103,5': 'coin'
            }
        };
    },

    build_1_2() {
        const W = 200, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);
        T.fillGround(tiles, 0, W, H);
        T.clearGround(tiles, 85, 88, H);
        T.clearGround(tiles, 140, 143, H);

        // Hill with slope
        for (let i = 0; i < 5; i++) T.fillCol(tiles, 20 + i, 12 - i, 13, T.GROUND);
        for (let i = 0; i < 5; i++) T.fillCol(tiles, 29 - i, 12 - i, 13, T.GROUND);

        // Underground bonus area pipe
        T.setPipe(tiles, 45, 10, 3);

        // Block formations
        T.fillRow(tiles, 55, 62, 9, T.BRICK);
        T.setTile(tiles, 57, 9, T.QBLOCK);
        T.setTile(tiles, 60, 9, T.QBLOCK);
        T.setTile(tiles, 58, 5, T.QBLOCK); // leaf

        // Floating platforms
        T.fillRow(tiles, 88, 92, 10, T.WOOD);
        T.fillRow(tiles, 95, 99, 8, T.WOOD);
        T.fillRow(tiles, 102, 106, 10, T.WOOD);

        // Coin heaven area
        for (let i = 110; i < 125; i++) T.setTile(tiles, i, 7, T.COIN);

        // Steps to goal
        for (let i = 0; i < 6; i++) T.fillCol(tiles, 170 + i, 13 - i, 13, T.STAIR);

        T.setTile(tiles, 188, 4, T.FLAG);

        return {
            width: W, height: H, tiles,
            type: 'overworld', theme: 'grass', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities: [
                { type: 'goomba3', x: 15, y: 12 },
                { type: 'koopa3', x: 35, y: 12 },
                { type: 'goomba3', x: 50, y: 12 },
                { type: 'goomba3', x: 51, y: 12 },
                { type: 'koopa3', x: 65, y: 12, opts: { flying: true } },
                { type: 'piranha3', x: 45, y: 9 },
                { type: 'goomba3', x: 95, y: 6 },
                { type: 'koopa3', x: 115, y: 12 },
                { type: 'goomba3', x: 130, y: 12 },
                { type: 'goomba3', x: 145, y: 12 },
                { type: 'goomba3', x: 155, y: 12 }
            ],
            goalX: 188,
            blockContents: {
                '57,9': 'coin', '60,9': 'mushroom', '58,5': 'leaf'
            }
        };
    },

    build_1_3() {
        // Athletic/sky level
        const W = 200, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);
        // No full ground - sky level with platforms
        T.fillGround(tiles, 0, 8, H);

        // Cloud/wood platforms scattered
        T.fillRow(tiles, 12, 18, 10, T.WOOD);
        T.fillRow(tiles, 22, 28, 8, T.WOOD);
        T.fillRow(tiles, 32, 36, 11, T.WOOD);
        T.fillRow(tiles, 40, 46, 7, T.WOOD);
        T.setTile(tiles, 43, 7, T.QBLOCK); // mushroom

        T.fillRow(tiles, 50, 54, 10, T.WOOD);
        T.fillRow(tiles, 58, 64, 9, T.WOOD);
        T.fillRow(tiles, 68, 72, 11, T.WOOD);
        T.fillRow(tiles, 76, 82, 7, T.WOOD);

        // Note block bounce section
        T.setTile(tiles, 86, 11, T.NOTE);
        T.setTile(tiles, 90, 9, T.NOTE);
        T.setTile(tiles, 94, 7, T.NOTE);

        T.fillRow(tiles, 98, 106, 10, T.WOOD);
        T.fillRow(tiles, 110, 118, 8, T.WOOD);
        T.setTile(tiles, 114, 4, T.QBLOCK); // leaf

        T.fillRow(tiles, 125, 135, 10, T.WOOD);
        T.fillRow(tiles, 140, 150, 9, T.WOOD);

        // Goal platform
        T.fillGround(tiles, 160, 200, H);
        for (let i = 0; i < 6; i++) T.fillCol(tiles, 170 + i, 13 - i, 13, T.STAIR);
        T.setTile(tiles, 188, 4, T.FLAG);

        return {
            width: W, height: H, tiles,
            type: 'athletic', theme: 'grass', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities: [
                { type: 'koopa3', x: 14, y: 8, opts: { flying: true } },
                { type: 'koopa3', x: 24, y: 6, opts: { flying: true } },
                { type: 'goomba3', x: 34, y: 9 },
                { type: 'koopa3', x: 52, y: 8 },
                { type: 'koopa3', x: 60, y: 7 },
                { type: 'goomba3', x: 70, y: 9 },
                { type: 'koopa3', x: 100, y: 8, opts: { flying: true } },
                { type: 'goomba3', x: 112, y: 6 },
                { type: 'koopa3', x: 128, y: 8 },
                { type: 'goomba3', x: 142, y: 7 }
            ],
            goalX: 188,
            blockContents: { '43,7': 'mushroom', '114,4': 'leaf' }
        };
    },

    build_1_4() {
        const W = 200, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);
        T.fillGround(tiles, 0, W, H);
        T.clearGround(tiles, 55, 58, H);
        T.clearGround(tiles, 120, 124, H);

        // Overworld with more enemies
        T.setPipe(tiles, 30, 10, 3);
        T.setPipe(tiles, 65, 10, 3);
        T.setPipe(tiles, 100, 11, 2);

        T.fillRow(tiles, 40, 50, 9, T.BRICK);
        T.setTile(tiles, 44, 9, T.QBLOCK);
        T.setTile(tiles, 47, 9, T.QBLOCK);
        T.setTile(tiles, 44, 5, T.QBLOCK); // star

        T.fillRow(tiles, 75, 82, 9, T.BRICK);
        T.fillRow(tiles, 85, 92, 5, T.BRICK);

        // Staircase
        for (let i = 0; i < 8; i++) T.fillCol(tiles, 170 + i, 13 - i, 13, T.STAIR);
        T.setTile(tiles, 190, 4, T.FLAG);

        return {
            width: W, height: H, tiles,
            type: 'overworld', theme: 'grass', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities: [
                { type: 'goomba3', x: 20, y: 12 },
                { type: 'goomba3', x: 21, y: 12 },
                { type: 'koopa3', x: 35, y: 12 },
                { type: 'piranha3', x: 30, y: 9 },
                { type: 'piranha3', x: 65, y: 9 },
                { type: 'hammerBro3', x: 80, y: 7 },
                { type: 'goomba3', x: 95, y: 12 },
                { type: 'goomba3', x: 96, y: 12 },
                { type: 'koopa3', x: 110, y: 12 },
                { type: 'goomba3', x: 130, y: 12 },
                { type: 'goomba3', x: 140, y: 12 },
                { type: 'koopa3', x: 155, y: 12 }
            ],
            goalX: 190,
            blockContents: { '44,9': 'mushroom', '47,9': 'coin', '44,5': 'star' }
        };
    },

    build_1_5() {
        const W = 180, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);
        T.fillGround(tiles, 0, W, H);
        T.clearGround(tiles, 70, 73, H);

        T.fillRow(tiles, 20, 28, 9, T.BRICK);
        T.setTile(tiles, 24, 9, T.QBLOCK); // leaf
        T.setPipe(tiles, 40, 10, 3);
        T.setPipe(tiles, 60, 11, 2);

        T.fillRow(tiles, 80, 88, 9, T.BRICK);
        T.setTile(tiles, 84, 5, T.QBLOCK); // 1up

        T.fillRow(tiles, 100, 108, 9, T.BRICK);
        T.setTile(tiles, 104, 9, T.QBLOCK);

        for (let i = 0; i < 6; i++) T.fillCol(tiles, 150 + i, 13 - i, 13, T.STAIR);
        T.setTile(tiles, 170, 4, T.FLAG);

        return {
            width: W, height: H, tiles,
            type: 'overworld', theme: 'grass', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities: [
                { type: 'goomba3', x: 15, y: 12 },
                { type: 'koopa3', x: 30, y: 12 },
                { type: 'piranha3', x: 40, y: 9 },
                { type: 'goomba3', x: 50, y: 12 },
                { type: 'koopa3', x: 75, y: 12, opts: { flying: true } },
                { type: 'goomba3', x: 90, y: 12 },
                { type: 'goomba3', x: 91, y: 12 },
                { type: 'koopa3', x: 110, y: 12 },
                { type: 'goomba3', x: 130, y: 12 }
            ],
            goalX: 170,
            blockContents: { '24,9': 'leaf', '84,5': '1up', '104,9': 'mushroom' }
        };
    },

    build_1_6() {
        const W = 190, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);
        T.fillGround(tiles, 0, W, H);
        T.clearGround(tiles, 60, 63, H);
        T.clearGround(tiles, 100, 104, H);

        T.fillRow(tiles, 15, 22, 9, T.BRICK);
        T.setTile(tiles, 18, 9, T.QBLOCK);
        T.fillRow(tiles, 30, 38, 9, T.BRICK);
        T.setTile(tiles, 34, 5, T.QBLOCK); // leaf

        T.setPipe(tiles, 50, 10, 3);
        T.setPipe(tiles, 70, 10, 3);
        T.setPipe(tiles, 110, 11, 2);

        T.fillRow(tiles, 120, 130, 9, T.BRICK);
        T.setTile(tiles, 125, 9, T.QBLOCK);

        for (let i = 0; i < 8; i++) T.fillCol(tiles, 160 + i, 13 - i, 13, T.STAIR);
        T.setTile(tiles, 180, 4, T.FLAG);

        return {
            width: W, height: H, tiles,
            type: 'overworld', theme: 'grass', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities: [
                { type: 'goomba3', x: 12, y: 12 },
                { type: 'koopa3', x: 25, y: 12 },
                { type: 'piranha3', x: 50, y: 9 },
                { type: 'piranha3', x: 70, y: 9 },
                { type: 'hammerBro3', x: 85, y: 10 },
                { type: 'goomba3', x: 95, y: 12 },
                { type: 'koopa3', x: 115, y: 12 },
                { type: 'goomba3', x: 135, y: 12 },
                { type: 'goomba3', x: 136, y: 12 },
                { type: 'goomba3', x: 145, y: 12 }
            ],
            goalX: 180,
            blockContents: { '18,9': 'mushroom', '34,5': 'leaf', '125,9': 'coin' }
        };
    },

    // ========== WORLD 2: DESERT LAND ==========
    buildWorld2() {
        return {
            name: 'DESERT LAND',
            theme: 'desert',
            koopaling: 'Morton',
            nodes: [
                { type: 'start', x: 24, y: 180, id: 'start' },
                { type: 'level', x: 56, y: 180, id: '2-1', levelIdx: 0 },
                { type: 'level', x: 88, y: 180, id: '2-2', levelIdx: 1 },
                { type: 'fortress', x: 120, y: 148, id: '2-F', levelIdx: 2 },
                { type: 'level', x: 152, y: 180, id: '2-3', levelIdx: 3 },
                { type: 'level', x: 184, y: 180, id: '2-4', levelIdx: 4 },
                { type: 'airship', x: 216, y: 148, id: '2-A', levelIdx: 5 }
            ],
            paths: [
                ['start', '2-1'], ['2-1', '2-2'], ['2-2', '2-F'],
                ['2-F', '2-3'], ['2-3', '2-4'], ['2-4', '2-A']
            ],
            levels: [
                this.generateOverworld(2, 1, 'desert'),
                this.generateOverworld(2, 2, 'desert'),
                this.buildFortress(2),
                this.generateOverworld(2, 3, 'desert'),
                this.generateOverworld(2, 4, 'desert'),
                this.buildAirship(2)
            ]
        };
    },

    // ========== WORLD 3: WATER LAND ==========
    buildWorld3() {
        return {
            name: 'WATER LAND',
            theme: 'water',
            koopaling: 'Wendy',
            nodes: [
                { type: 'start', x: 24, y: 180, id: 'start' },
                { type: 'level', x: 48, y: 180, id: '3-1', levelIdx: 0 },
                { type: 'level', x: 72, y: 180, id: '3-2', levelIdx: 1 },
                { type: 'level', x: 96, y: 148, id: '3-3', levelIdx: 2 },
                { type: 'fortress', x: 120, y: 148, id: '3-F1', levelIdx: 3 },
                { type: 'level', x: 144, y: 180, id: '3-4', levelIdx: 4 },
                { type: 'level', x: 168, y: 180, id: '3-5', levelIdx: 5 },
                { type: 'fortress', x: 192, y: 148, id: '3-F2', levelIdx: 6 },
                { type: 'level', x: 216, y: 180, id: '3-6', levelIdx: 7 },
                { type: 'airship', x: 240, y: 148, id: '3-A', levelIdx: 8 }
            ],
            paths: [
                ['start', '3-1'], ['3-1', '3-2'], ['3-2', '3-3'], ['3-3', '3-F1'],
                ['3-F1', '3-4'], ['3-4', '3-5'], ['3-5', '3-F2'], ['3-F2', '3-6'],
                ['3-6', '3-A']
            ],
            levels: [
                this.generateOverworld(3, 1, 'water'),
                this.generateWater(3, 2),
                this.generateOverworld(3, 3, 'water'),
                this.buildFortress(3),
                this.generateOverworld(3, 4, 'water'),
                this.generateWater(3, 5),
                this.buildFortress(3, true),
                this.generateOverworld(3, 6, 'water'),
                this.buildAirship(3)
            ]
        };
    },

    // ========== WORLD 4: GIANT LAND ==========
    buildWorld4() {
        return {
            name: 'GIANT LAND',
            theme: 'giant',
            koopaling: 'Iggy',
            nodes: [
                { type: 'start', x: 24, y: 180, id: 'start' },
                { type: 'level', x: 56, y: 180, id: '4-1', levelIdx: 0 },
                { type: 'level', x: 88, y: 180, id: '4-2', levelIdx: 1 },
                { type: 'level', x: 120, y: 148, id: '4-3', levelIdx: 2 },
                { type: 'fortress', x: 150, y: 148, id: '4-F', levelIdx: 3 },
                { type: 'level', x: 180, y: 180, id: '4-4', levelIdx: 4 },
                { type: 'level', x: 210, y: 180, id: '4-5', levelIdx: 5 },
                { type: 'airship', x: 240, y: 148, id: '4-A', levelIdx: 6 }
            ],
            paths: [
                ['start', '4-1'], ['4-1', '4-2'], ['4-2', '4-3'], ['4-3', '4-F'],
                ['4-F', '4-4'], ['4-4', '4-5'], ['4-5', '4-A']
            ],
            levels: [
                this.generateOverworld(4, 1, 'giant'),
                this.generateOverworld(4, 2, 'giant'),
                this.generateOverworld(4, 3, 'giant'),
                this.buildFortress(4),
                this.generateOverworld(4, 4, 'giant'),
                this.generateOverworld(4, 5, 'giant'),
                this.buildAirship(4)
            ]
        };
    },

    // ========== WORLD 5: SKY LAND ==========
    buildWorld5() {
        return {
            name: 'SKY LAND',
            theme: 'sky',
            koopaling: 'Roy',
            nodes: [
                { type: 'start', x: 24, y: 180, id: 'start' },
                { type: 'level', x: 48, y: 180, id: '5-1', levelIdx: 0 },
                { type: 'level', x: 72, y: 180, id: '5-2', levelIdx: 1 },
                { type: 'level', x: 96, y: 148, id: '5-3', levelIdx: 2 },
                { type: 'fortress', x: 120, y: 148, id: '5-F1', levelIdx: 3 },
                { type: 'level', x: 144, y: 148, id: '5-4', levelIdx: 4 },
                { type: 'level', x: 168, y: 148, id: '5-5', levelIdx: 5 },
                { type: 'level', x: 192, y: 180, id: '5-6', levelIdx: 6 },
                { type: 'fortress', x: 216, y: 148, id: '5-F2', levelIdx: 7 },
                { type: 'level', x: 232, y: 180, id: '5-7', levelIdx: 8 },
                { type: 'airship', x: 248, y: 148, id: '5-A', levelIdx: 9 }
            ],
            paths: [
                ['start', '5-1'], ['5-1', '5-2'], ['5-2', '5-3'], ['5-3', '5-F1'],
                ['5-F1', '5-4'], ['5-4', '5-5'], ['5-5', '5-6'], ['5-6', '5-F2'],
                ['5-F2', '5-7'], ['5-7', '5-A']
            ],
            levels: [
                this.generateOverworld(5, 1, 'sky'),
                this.generateOverworld(5, 2, 'sky'),
                this.generateAthletic(5, 3),
                this.buildFortress(5),
                this.generateAthletic(5, 4),
                this.generateOverworld(5, 5, 'sky'),
                this.generateOverworld(5, 6, 'sky'),
                this.buildFortress(5, true),
                this.generateOverworld(5, 7, 'sky'),
                this.buildAirship(5)
            ]
        };
    },

    // ========== WORLD 6: ICE LAND ==========
    buildWorld6() {
        return {
            name: 'ICE LAND',
            theme: 'ice',
            koopaling: 'Lemmy',
            nodes: [
                { type: 'start', x: 24, y: 180, id: 'start' },
                { type: 'level', x: 48, y: 180, id: '6-1', levelIdx: 0 },
                { type: 'level', x: 72, y: 180, id: '6-2', levelIdx: 1 },
                { type: 'level', x: 96, y: 180, id: '6-3', levelIdx: 2 },
                { type: 'fortress', x: 120, y: 148, id: '6-F1', levelIdx: 3 },
                { type: 'level', x: 150, y: 180, id: '6-4', levelIdx: 4 },
                { type: 'level', x: 178, y: 180, id: '6-5', levelIdx: 5 },
                { type: 'fortress', x: 200, y: 148, id: '6-F2', levelIdx: 6 },
                { type: 'level', x: 222, y: 180, id: '6-6', levelIdx: 7 },
                { type: 'airship', x: 248, y: 148, id: '6-A', levelIdx: 8 }
            ],
            paths: [
                ['start', '6-1'], ['6-1', '6-2'], ['6-2', '6-3'], ['6-3', '6-F1'],
                ['6-F1', '6-4'], ['6-4', '6-5'], ['6-5', '6-F2'], ['6-F2', '6-6'],
                ['6-6', '6-A']
            ],
            levels: [
                this.generateIce(6, 1),
                this.generateIce(6, 2),
                this.generateIce(6, 3),
                this.buildFortress(6),
                this.generateIce(6, 4),
                this.generateIce(6, 5),
                this.buildFortress(6, true),
                this.generateIce(6, 6),
                this.buildAirship(6)
            ]
        };
    },

    // ========== WORLD 7: PIPE LAND ==========
    buildWorld7() {
        return {
            name: 'PIPE LAND',
            theme: 'pipe',
            koopaling: 'Ludwig',
            nodes: [
                { type: 'start', x: 24, y: 180, id: 'start' },
                { type: 'level', x: 48, y: 180, id: '7-1', levelIdx: 0 },
                { type: 'level', x: 72, y: 180, id: '7-2', levelIdx: 1 },
                { type: 'level', x: 96, y: 148, id: '7-3', levelIdx: 2 },
                { type: 'fortress', x: 120, y: 148, id: '7-F1', levelIdx: 3 },
                { type: 'level', x: 144, y: 180, id: '7-4', levelIdx: 4 },
                { type: 'level', x: 168, y: 180, id: '7-5', levelIdx: 5 },
                { type: 'fortress', x: 192, y: 148, id: '7-F2', levelIdx: 6 },
                { type: 'level', x: 216, y: 180, id: '7-6', levelIdx: 7 },
                { type: 'airship', x: 240, y: 148, id: '7-A', levelIdx: 8 }
            ],
            paths: [
                ['start', '7-1'], ['7-1', '7-2'], ['7-2', '7-3'], ['7-3', '7-F1'],
                ['7-F1', '7-4'], ['7-4', '7-5'], ['7-5', '7-F2'], ['7-F2', '7-6'],
                ['7-6', '7-A']
            ],
            levels: [
                this.generatePipe(7, 1),
                this.generatePipe(7, 2),
                this.generatePipe(7, 3),
                this.buildFortress(7),
                this.generatePipe(7, 4),
                this.generatePipe(7, 5),
                this.buildFortress(7, true),
                this.generatePipe(7, 6),
                this.buildAirship(7)
            ]
        };
    },

    // ========== WORLD 8: DARK LAND ==========
    buildWorld8() {
        return {
            name: 'DARK LAND',
            theme: 'dark',
            koopaling: 'Bowser',
            nodes: [
                { type: 'start', x: 24, y: 180, id: 'start' },
                { type: 'level', x: 48, y: 180, id: '8-1', levelIdx: 0 },
                { type: 'level', x: 72, y: 180, id: '8-2', levelIdx: 1 },
                { type: 'fortress', x: 96, y: 148, id: '8-F1', levelIdx: 2 },
                { type: 'level', x: 120, y: 180, id: '8-3', levelIdx: 3 },
                { type: 'fortress', x: 150, y: 148, id: '8-F2', levelIdx: 4 },
                { type: 'level', x: 178, y: 180, id: '8-4', levelIdx: 5 },
                { type: 'airship', x: 200, y: 148, id: '8-AB', levelIdx: 6 },
                { type: 'level', x: 224, y: 180, id: '8-BC', levelIdx: 7 }
            ],
            paths: [
                ['start', '8-1'], ['8-1', '8-2'], ['8-2', '8-F1'], ['8-F1', '8-3'],
                ['8-3', '8-F2'], ['8-F2', '8-4'], ['8-4', '8-AB'], ['8-AB', '8-BC']
            ],
            levels: [
                this.generateDark(8, 1),
                this.generateDark(8, 2),
                this.buildFortress(8),
                this.generateDark(8, 3),
                this.buildFortress(8, true),
                this.generateDark(8, 4),
                this.buildAirship(8),
                this.buildBowserCastle()
            ]
        };
    },

    // ========== FORTRESS GENERATOR ==========
    buildFortress(world, isSecond) {
        const W = 160, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);

        // Castle floor and ceiling
        for (let x = 0; x < W; x++) {
            T.setTile(tiles, x, 0, T.CASTLE);
            T.setTile(tiles, x, 1, T.CASTLE);
            T.setTile(tiles, x, 13, T.CASTLE);
            T.setTile(tiles, x, 14, T.CASTLE);
        }

        // Platforms inside fortress
        T.fillRow(tiles, 15, 25, 10, T.CASTLE);
        T.fillRow(tiles, 30, 40, 7, T.CASTLE);
        T.fillRow(tiles, 45, 55, 10, T.CASTLE);
        T.fillRow(tiles, 60, 75, 5, T.CASTLE);
        T.fillRow(tiles, 80, 95, 9, T.CASTLE);
        T.fillRow(tiles, 100, 110, 7, T.CASTLE);
        T.fillRow(tiles, 115, 125, 10, T.CASTLE);

        // Lava pits
        for (let x = 25; x < 30; x++) { T.setTile(tiles, x, 13, T.LAVA); T.setTile(tiles, x, 14, T.LAVA); }
        for (let x = 55; x < 60; x++) { T.setTile(tiles, x, 13, T.LAVA); T.setTile(tiles, x, 14, T.LAVA); }
        for (let x = 95; x < 100; x++) { T.setTile(tiles, x, 13, T.LAVA); T.setTile(tiles, x, 14, T.LAVA); }

        // Boss room
        T.fillRow(tiles, 130, 155, 10, T.CASTLE);

        const entities = [
            { type: 'dryBones', x: 20, y: 8 },
            { type: 'thwomp', x: 35, y: 3 },
            { type: 'dryBones', x: 50, y: 8 },
            { type: 'thwomp', x: 65, y: 3 },
            { type: 'dryBones', x: 85, y: 7 },
            { type: 'bobomb', x: 105, y: 5 },
            { type: 'dryBones', x: 120, y: 8 }
        ];

        // Boom-Boom boss at end
        entities.push({ type: 'boomBoom', x: 142, y: 8, opts: { hp: isSecond ? 5 : 3 } });

        return {
            width: W, height: H, tiles,
            type: 'fortress', theme: 'fortress', timer: 300,
            playerStart: { x: 2, y: 11 },
            entities,
            isFortress: true,
            bossX: 130,
            blockContents: {}
        };
    },

    // ========== AIRSHIP GENERATOR ==========
    buildAirship(world) {
        const W = 180, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);

        // No ground - airship level
        // Ship hull sections
        T.fillRow(tiles, 5, 30, 11, T.WOOD);
        T.fillRow(tiles, 5, 30, 12, T.WOOD);
        T.fillRow(tiles, 8, 12, 9, T.WOOD); // cabin
        T.fillRow(tiles, 8, 12, 10, T.WOOD);

        T.fillRow(tiles, 40, 70, 11, T.WOOD);
        T.fillRow(tiles, 40, 70, 12, T.WOOD);

        T.fillRow(tiles, 80, 110, 10, T.WOOD);
        T.fillRow(tiles, 80, 110, 11, T.WOOD);
        T.fillRow(tiles, 80, 110, 12, T.WOOD);

        T.fillRow(tiles, 120, 175, 11, T.WOOD);
        T.fillRow(tiles, 120, 175, 12, T.WOOD);
        // Boss room walls
        T.fillCol(tiles, 145, 5, 11, T.WOOD);
        T.fillCol(tiles, 175, 5, 11, T.WOOD);

        const koopalings = ['Larry', 'Morton', 'Wendy', 'Iggy', 'Roy', 'Lemmy', 'Ludwig', 'Bowser'];
        const koopaling = koopalings[world - 1];

        const entities = [
            { type: 'bulletBill3', x: 15, y: 9 },
            { type: 'bulletBill3', x: 25, y: 9 },
            { type: 'bobomb', x: 45, y: 9 },
            { type: 'bulletBill3', x: 55, y: 9 },
            { type: 'bobomb', x: 65, y: 9 },
            { type: 'bulletBill3', x: 85, y: 8 },
            { type: 'bulletBill3', x: 95, y: 8 },
            { type: 'bobomb', x: 105, y: 8 },
            { type: 'bulletBill3', x: 130, y: 9 }
        ];

        if (world < 8) {
            entities.push({ type: 'koopaling', x: 158, y: 9, opts: { name: koopaling, world } });
        } else {
            entities.push({ type: 'bowser3', x: 158, y: 5, opts: { hp: 10 } });
        }

        return {
            width: W, height: H, tiles,
            type: 'airship', theme: 'airship', timer: 300,
            playerStart: { x: 2, y: 9 },
            entities,
            isAirship: true,
            bossX: 145,
            blockContents: {}
        };
    },

    // ========== BOWSER'S CASTLE (8-BC) ==========
    buildBowserCastle() {
        const W = 250, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);

        // Castle floor and ceiling
        for (let x = 0; x < W; x++) {
            T.setTile(tiles, x, 0, T.CASTLE);
            T.setTile(tiles, x, 1, T.CASTLE);
            T.setTile(tiles, x, 13, T.CASTLE);
            T.setTile(tiles, x, 14, T.CASTLE);
        }

        // Obstacle course
        T.fillRow(tiles, 20, 30, 10, T.CASTLE);
        T.fillRow(tiles, 35, 45, 7, T.CASTLE);
        T.fillRow(tiles, 50, 60, 10, T.CASTLE);

        // Lava sections
        for (let x = 30; x < 35; x++) { T.setTile(tiles, x, 13, T.LAVA); T.setTile(tiles, x, 14, T.LAVA); }
        for (let x = 60; x < 70; x++) { T.setTile(tiles, x, 13, T.LAVA); T.setTile(tiles, x, 14, T.LAVA); }
        for (let x = 100; x < 110; x++) { T.setTile(tiles, x, 13, T.LAVA); T.setTile(tiles, x, 14, T.LAVA); }
        for (let x = 150; x < 160; x++) { T.setTile(tiles, x, 13, T.LAVA); T.setTile(tiles, x, 14, T.LAVA); }

        T.fillRow(tiles, 70, 80, 9, T.CASTLE);
        T.fillRow(tiles, 85, 100, 6, T.CASTLE);
        T.fillRow(tiles, 110, 125, 10, T.CASTLE);
        T.fillRow(tiles, 130, 150, 8, T.CASTLE);
        T.fillRow(tiles, 160, 175, 10, T.CASTLE);

        // Final boss room
        T.fillRow(tiles, 190, 245, 10, T.CASTLE);
        T.fillCol(tiles, 190, 3, 10, T.CASTLE);
        T.fillCol(tiles, 245, 3, 10, T.CASTLE);

        return {
            width: W, height: H, tiles,
            type: 'castle', theme: 'dark', timer: 400,
            playerStart: { x: 2, y: 11 },
            entities: [
                { type: 'dryBones', x: 15, y: 11 },
                { type: 'thwomp', x: 25, y: 3 },
                { type: 'dryBones', x: 40, y: 5 },
                { type: 'thwomp', x: 55, y: 3 },
                { type: 'bobomb', x: 75, y: 7 },
                { type: 'dryBones', x: 90, y: 4 },
                { type: 'thwomp', x: 95, y: 3 },
                { type: 'bobomb', x: 115, y: 8 },
                { type: 'dryBones', x: 120, y: 8 },
                { type: 'hammerBro3', x: 135, y: 6 },
                { type: 'dryBones', x: 145, y: 6 },
                { type: 'thwomp', x: 165, y: 3 },
                { type: 'dryBones', x: 170, y: 8 },
                { type: 'hammerBro3', x: 175, y: 8 },
                // Bowser in boss room
                { type: 'bowser3', x: 215, y: 4, opts: { hp: 10 } }
            ],
            isCastle: true,
            isFinalBoss: true,
            bossX: 190,
            blockContents: {}
        };
    },

    // ========== LEVEL GENERATORS ==========

    generateOverworld(world, stage, theme) {
        const W = 180 + (world * 10), H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);
        T.fillGround(tiles, 0, W, H);

        const seed = world * 100 + stage;
        const rng = T.seededRandom(seed);

        // Gaps
        const numGaps = 1 + Math.floor(rng() * 2);
        for (let g = 0; g < numGaps; g++) {
            const gx = 50 + Math.floor(rng() * (W - 120));
            T.clearGround(tiles, gx, gx + 2 + Math.floor(rng() * 2), H);
        }

        // Pipes
        const numPipes = 2 + Math.floor(rng() * 2);
        for (let p = 0; p < numPipes; p++) {
            const px = 25 + Math.floor(rng() * (W - 80));
            const ph = 2 + Math.floor(rng() * 2);
            T.setPipe(tiles, px, 13 - ph, ph);
        }

        // Block formations
        const numBlocks = 3 + Math.floor(rng() * 3);
        const blockContents = {};
        for (let b = 0; b < numBlocks; b++) {
            const bx = 15 + Math.floor(rng() * (W - 50));
            const by = 5 + Math.floor(rng() * 5);
            const bw = 3 + Math.floor(rng() * 4);
            T.fillRow(tiles, bx, bx + bw, by, T.BRICK);
            if (rng() > 0.5) {
                const qx = bx + Math.floor(rng() * bw);
                T.setTile(tiles, qx, by, T.QBLOCK);
                const items = ['coin', 'mushroom', 'leaf', 'star'];
                blockContents[`${qx},${by}`] = items[Math.floor(rng() * items.length)];
            }
        }

        // Staircase to goal
        for (let i = 0; i < 6; i++) T.fillCol(tiles, W - 30 + i, 13 - i, 13, T.STAIR);
        T.setTile(tiles, W - 10, 4, T.FLAG);

        // Enemies
        const entities = T.genEnemies(world, W, rng, theme === 'giant');

        return {
            width: W, height: H, tiles,
            type: 'overworld', theme: theme || 'grass', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities,
            goalX: W - 10,
            blockContents
        };
    },

    generateWater(world, stage) {
        const W = 180, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);

        // Water level - ground at bottom, water fills most of screen
        T.fillGround(tiles, 0, W, H);

        const seed = world * 100 + stage + 500;
        const rng = T.seededRandom(seed);

        // Underwater terrain
        for (let i = 0; i < 8; i++) {
            const px = 20 + Math.floor(rng() * (W - 50));
            const ph = 2 + Math.floor(rng() * 4);
            for (let y = 13 - ph; y <= 13; y++) T.setTile(tiles, px, y, T.GROUND);
        }

        // Coins scattered
        for (let i = 0; i < 15; i++) {
            const cx = 10 + Math.floor(rng() * (W - 30));
            const cy = 4 + Math.floor(rng() * 8);
            T.setTile(tiles, cx, cy, T.COIN);
        }

        T.setTile(tiles, W - 10, 4, T.FLAG);

        return {
            width: W, height: H, tiles,
            type: 'underwater', theme: 'water', timer: 300,
            playerStart: { x: 2, y: 10 },
            entities: [
                { type: 'koopa3', x: 30, y: 8 },
                { type: 'koopa3', x: 60, y: 6 },
                { type: 'koopa3', x: 90, y: 9 },
                { type: 'koopa3', x: 120, y: 7 },
                { type: 'koopa3', x: 150, y: 8 }
            ],
            goalX: W - 10,
            isUnderwater: true,
            blockContents: {}
        };
    },

    generateAthletic(world, stage) {
        const W = 200, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);

        const seed = world * 100 + stage + 300;
        const rng = T.seededRandom(seed);

        // Start platform
        T.fillGround(tiles, 0, 8, H);

        // Floating platforms
        let px = 12;
        while (px < W - 40) {
            const pw = 3 + Math.floor(rng() * 5);
            const py = 7 + Math.floor(rng() * 5);
            T.fillRow(tiles, px, px + pw, py, T.WOOD);
            if (rng() > 0.7) {
                T.setTile(tiles, px + Math.floor(pw / 2), py - 4, T.QBLOCK);
            }
            px += pw + 2 + Math.floor(rng() * 4);
        }

        // Goal platform
        T.fillGround(tiles, W - 30, W, H);
        for (let i = 0; i < 6; i++) T.fillCol(tiles, W - 25 + i, 13 - i, 13, T.STAIR);
        T.setTile(tiles, W - 10, 4, T.FLAG);

        const entities = [];
        for (let i = 0; i < 8; i++) {
            const ex = 15 + Math.floor(rng() * (W - 50));
            const ey = 5 + Math.floor(rng() * 6);
            if (rng() > 0.5) {
                entities.push({ type: 'koopa3', x: ex, y: ey, opts: { flying: true } });
            } else {
                entities.push({ type: 'goomba3', x: ex, y: ey });
            }
        }

        return {
            width: W, height: H, tiles,
            type: 'athletic', theme: 'sky', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities,
            goalX: W - 10,
            blockContents: {}
        };
    },

    generateIce(world, stage) {
        const W = 190, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);

        // Ice ground
        for (let x = 0; x < W; x++) {
            T.setTile(tiles, x, 13, T.ICE);
            T.setTile(tiles, x, 14, T.ICE);
        }

        const seed = world * 100 + stage + 200;
        const rng = T.seededRandom(seed);

        // Gaps
        for (let g = 0; g < 2; g++) {
            const gx = 40 + Math.floor(rng() * (W - 100));
            T.setTile(tiles, gx, 13, T.EMPTY); T.setTile(tiles, gx, 14, T.EMPTY);
            T.setTile(tiles, gx + 1, 13, T.EMPTY); T.setTile(tiles, gx + 1, 14, T.EMPTY);
        }

        // Ice platforms
        for (let i = 0; i < 5; i++) {
            const bx = 15 + Math.floor(rng() * (W - 50));
            const by = 7 + Math.floor(rng() * 4);
            T.fillRow(tiles, bx, bx + 4, by, T.ICE);
        }

        // Blocks
        const blockContents = {};
        for (let i = 0; i < 3; i++) {
            const qx = 20 + Math.floor(rng() * (W - 50));
            T.setTile(tiles, qx, 9, T.QBLOCK);
            blockContents[`${qx},9`] = rng() > 0.5 ? 'mushroom' : 'coin';
        }

        for (let i = 0; i < 6; i++) T.fillCol(tiles, W - 30 + i, 12 - i, 12, T.STAIR);
        T.setTile(tiles, W - 10, 4, T.FLAG);

        return {
            width: W, height: H, tiles,
            type: 'overworld', theme: 'ice', timer: 300, isIce: true,
            playerStart: { x: 2, y: 11 },
            entities: T.genEnemies(world, W, rng, false),
            goalX: W - 10,
            blockContents
        };
    },

    generatePipe(world, stage) {
        const W = 190, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);
        T.fillGround(tiles, 0, W, H);

        const seed = world * 100 + stage + 400;
        const rng = T.seededRandom(seed);

        // Lots of pipes
        let px = 15;
        while (px < W - 40) {
            const ph = 2 + Math.floor(rng() * 4);
            T.setPipe(tiles, px, 13 - ph, ph);
            px += 8 + Math.floor(rng() * 10);
        }

        // Blocks between pipes
        for (let i = 0; i < 4; i++) {
            const bx = 20 + Math.floor(rng() * (W - 60));
            T.fillRow(tiles, bx, bx + 3, 9, T.BRICK);
            T.setTile(tiles, bx + 1, 9, T.QBLOCK);
        }

        T.clearGround(tiles, 80, 83, H);

        for (let i = 0; i < 6; i++) T.fillCol(tiles, W - 30 + i, 13 - i, 13, T.STAIR);
        T.setTile(tiles, W - 10, 4, T.FLAG);

        const entities = [];
        // Piranhas in pipes
        let epx = 15;
        while (epx < W - 40) {
            if (rng() > 0.3) entities.push({ type: 'piranha3', x: epx, y: 9 });
            epx += 8 + Math.floor(rng() * 10);
        }
        // Ground enemies
        for (let i = 0; i < 5; i++) {
            entities.push({ type: rng() > 0.5 ? 'koopa3' : 'goomba3', x: 25 + Math.floor(rng() * (W - 60)), y: 12 });
        }

        return {
            width: W, height: H, tiles,
            type: 'overworld', theme: 'pipe', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities,
            goalX: W - 10,
            blockContents: {}
        };
    },

    generateDark(world, stage) {
        const W = 200, H = 15;
        const T = this;
        const tiles = T.createEmpty(W, H);
        T.fillGround(tiles, 0, W, H);

        const seed = world * 100 + stage + 600;
        const rng = T.seededRandom(seed);

        // More gaps and hazards
        for (let g = 0; g < 3; g++) {
            const gx = 30 + Math.floor(rng() * (W - 80));
            T.clearGround(tiles, gx, gx + 3, H);
        }

        // Block formations
        const blockContents = {};
        for (let i = 0; i < 4; i++) {
            const bx = 15 + Math.floor(rng() * (W - 50));
            const by = 7 + Math.floor(rng() * 3);
            T.fillRow(tiles, bx, bx + 5, by, T.BRICK);
            if (rng() > 0.4) {
                const qx = bx + 2;
                T.setTile(tiles, qx, by, T.QBLOCK);
                blockContents[`${qx},${by}`] = rng() > 0.6 ? 'leaf' : 'mushroom';
            }
        }

        for (let i = 0; i < 8; i++) T.fillCol(tiles, W - 30 + i, 13 - i, 13, T.STAIR);
        T.setTile(tiles, W - 10, 4, T.FLAG);

        // Harder enemies
        const entities = [];
        for (let i = 0; i < 8; i++) {
            const ex = 20 + Math.floor(rng() * (W - 50));
            const types = ['goomba3', 'koopa3', 'hammerBro3', 'bobomb'];
            entities.push({ type: types[Math.floor(rng() * types.length)], x: ex, y: 12 });
        }
        // Bullet bills
        for (let i = 0; i < 3; i++) {
            entities.push({ type: 'bulletBill3', x: 40 + Math.floor(rng() * (W - 80)), y: 10 });
        }

        return {
            width: W, height: H, tiles,
            type: 'overworld', theme: 'dark', timer: 300,
            playerStart: { x: 2, y: 12 },
            entities,
            goalX: W - 10,
            blockContents
        };
    },

    // ========== ENEMY GENERATOR ==========
    genEnemies(world, width, rng, isGiant) {
        const entities = [];
        const count = 5 + world + Math.floor(rng() * 4);
        for (let i = 0; i < count; i++) {
            const ex = 15 + Math.floor(rng() * (width - 50));
            const r = rng();
            let type;
            if (r < 0.35) type = 'goomba3';
            else if (r < 0.6) type = 'koopa3';
            else if (r < 0.75) type = 'piranha3';
            else if (r < 0.85) type = 'hammerBro3';
            else if (r < 0.92) type = 'bobomb';
            else type = 'bulletBill3';

            const opts = {};
            if (type === 'koopa3' && rng() > 0.7) opts.flying = true;

            entities.push({ type, x: ex, y: type === 'piranha3' ? 9 : 12, opts });
        }
        return entities;
    },

    // ========== UTILITY FUNCTIONS ==========
    createEmpty(w, h) {
        const tiles = [];
        for (let x = 0; x < w; x++) {
            tiles[x] = [];
            for (let y = 0; y < h; y++) tiles[x][y] = 0;
        }
        return tiles;
    },

    setTile(tiles, x, y, type) {
        if (x >= 0 && x < tiles.length && y >= 0 && y < tiles[0].length) {
            tiles[x][y] = type;
        }
    },

    fillGround(tiles, x1, x2, h) {
        for (let x = x1; x < x2 && x < tiles.length; x++) {
            if (x >= 0) {
                tiles[x][h - 2] = 1; // GROUND
                tiles[x][h - 1] = 1;
            }
        }
    },

    clearGround(tiles, x1, x2, h) {
        for (let x = x1; x < x2 && x < tiles.length; x++) {
            if (x >= 0) {
                tiles[x][h - 2] = 0;
                tiles[x][h - 1] = 0;
            }
        }
    },

    fillRow(tiles, x1, x2, y, type) {
        for (let x = x1; x < x2 && x < tiles.length; x++) {
            if (x >= 0 && y >= 0 && y < tiles[0].length) tiles[x][y] = type;
        }
    },

    fillCol(tiles, x, y1, y2, type) {
        if (x >= 0 && x < tiles.length) {
            for (let y = y1; y <= y2 && y < tiles[0].length; y++) {
                if (y >= 0) tiles[x][y] = type;
            }
        }
    },

    setPipe(tiles, x, topY, height) {
        if (x >= 0 && x + 1 < tiles.length) {
            tiles[x][topY] = 7;     // PIPE_TL
            tiles[x + 1][topY] = 8; // PIPE_TR
            for (let y = topY + 1; y < topY + height; y++) {
                if (y < tiles[0].length) {
                    tiles[x][y] = 9;      // PIPE_BL
                    tiles[x + 1][y] = 10;  // PIPE_BR
                }
            }
        }
    },

    seededRandom(seed) {
        let s = seed;
        return function() {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            return (s >> 16) / 32768;
        };
    }
};

// Auto-init
Mario3Levels.init();
