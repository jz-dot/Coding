// ============================================================
// NES Tetris Engine - Authentic NES Tetris (1989) mechanics
// Follows exact NES frame timing, scoring, DAS, and piece RNG
// ============================================================

class TetrisEngine {
    constructor() {
        // NES Tetris: 10 columns x 20 visible rows (+ 2 hidden rows on top)
        this.COLS = 10;
        this.ROWS = 20;
        this.HIDDEN_ROWS = 2;
        this.TOTAL_ROWS = this.ROWS + this.HIDDEN_ROWS;
        this.CELL_SIZE = 20;

        // NES Tetris pieces with exact rotation states
        // NES uses a right-hand rotation system
        this.PIECES = {
            'I': {
                rotations: [
                    [[0,0],[1,0],[2,0],[3,0]],
                    [[1,-1],[1,0],[1,1],[1,2]],
                    [[0,0],[1,0],[2,0],[3,0]],
                    [[1,-1],[1,0],[1,1],[1,2]],
                ],
                color: '#00F0F0' // Cyan
            },
            'O': {
                rotations: [
                    [[0,0],[1,0],[0,1],[1,1]],
                    [[0,0],[1,0],[0,1],[1,1]],
                    [[0,0],[1,0],[0,1],[1,1]],
                    [[0,0],[1,0],[0,1],[1,1]],
                ],
                color: '#F0F000' // Yellow
            },
            'T': {
                rotations: [
                    [[0,0],[1,0],[2,0],[1,1]],
                    [[1,-1],[1,0],[1,1],[0,0]],
                    [[0,1],[1,1],[2,1],[1,0]],
                    [[1,-1],[1,0],[1,1],[2,0]],
                ],
                color: '#A000F0' // Purple
            },
            'S': {
                rotations: [
                    [[1,0],[2,0],[0,1],[1,1]],
                    [[0,0],[0,1],[1,1],[1,2]],
                    [[1,0],[2,0],[0,1],[1,1]],
                    [[0,0],[0,1],[1,1],[1,2]],
                ],
                color: '#00F000' // Green
            },
            'Z': {
                rotations: [
                    [[0,0],[1,0],[1,1],[2,1]],
                    [[1,0],[0,1],[1,1],[0,2]],
                    [[0,0],[1,0],[1,1],[2,1]],
                    [[1,0],[0,1],[1,1],[0,2]],
                ],
                color: '#F00000' // Red
            },
            'J': {
                rotations: [
                    [[0,0],[1,0],[2,0],[2,1]],
                    [[1,-1],[1,0],[1,1],[0,1]],
                    [[0,0],[0,1],[1,1],[2,1]],
                    [[1,-1],[1,0],[1,1],[2,-1]],
                ],
                color: '#0000F0' // Blue
            },
            'L': {
                rotations: [
                    [[0,0],[1,0],[2,0],[0,1]],
                    [[0,-1],[1,-1],[1,0],[1,1]],
                    [[2,0],[0,1],[1,1],[2,1]],
                    [[1,-1],[1,0],[1,1],[2,1]],
                ],
                color: '#F0A000' // Orange
            }
        };

        this.PIECE_NAMES = ['I','O','T','S','Z','J','L'];

        // NES Tetris level -> frames per gridcell (gravity speed)
        // Exact NES values from disassembly
        this.LEVEL_SPEEDS = [
            48, 43, 38, 33, 28, 23, 18, 13, 8, 6, // 0-9
            5, 5, 5, 4, 4, 4, 3, 3, 3,             // 10-18
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2,           // 19-28
            1                                         // 29+ (kill screen)
        ];

        // NES Tetris DAS (Delayed Auto Shift) settings
        // Initial delay: 16 frames, repeat: 6 frames
        this.DAS_INITIAL = 16;
        this.DAS_REPEAT = 6;

        // NES scoring table
        // Points per lines cleared at each level
        this.SCORE_TABLE = {
            1: 40,
            2: 100,
            3: 300,
            4: 1200
        };

        // NES color schemes per level (cycles every 10 levels)
        this.LEVEL_COLORS = [
            { bg: '#0C0C0C', c1: '#0058F8', c2: '#00B800', c3: '#FCFCFC' },  // 0
            { bg: '#0C0C0C', c1: '#0058F8', c2: '#00A800', c3: '#FCFCFC' },  // 1
            { bg: '#0C0C0C', c1: '#B800B8', c2: '#00B800', c3: '#FCFCFC' },  // 2
            { bg: '#0C0C0C', c1: '#0058F8', c2: '#00A800', c3: '#FCFCFC' },  // 3
            { bg: '#0C0C0C', c1: '#B800B8', c2: '#58F858', c3: '#FCFCFC' },  // 4
            { bg: '#0C0C0C', c1: '#58F858', c2: '#0058F8', c3: '#FCFCFC' },  // 5
            { bg: '#0C0C0C', c1: '#F83800', c2: '#888888', c3: '#FCFCFC' },  // 6
            { bg: '#0C0C0C', c1: '#A80020', c2: '#0058F8', c3: '#FCFCFC' },  // 7
            { bg: '#0C0C0C', c1: '#0058F8', c2: '#A80020', c3: '#FCFCFC' },  // 8
            { bg: '#0C0C0C', c1: '#F83800', c2: '#00B800', c3: '#FCFCFC' },  // 9
        ];

        this.reset();
    }

    reset() {
        this.board = [];
        for (let r = 0; r < this.TOTAL_ROWS; r++) {
            this.board[r] = new Array(this.COLS).fill(null);
        }
        this.score = 0;
        this.level = 0;
        this.startLevel = 0;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.currentPiece = null;
        this.nextPiece = null;
        this.pieceX = 0;
        this.pieceY = 0;
        this.rotation = 0;
        this.frameCount = 0;
        this.gravityCounter = 0;
        this.lockDelay = 0;
        this.areDelay = 0; // appearance delay
        this.lineClearing = false;
        this.lineClearFrames = 0;
        this.clearingLines = [];
        this.softDropping = false;
        this.entryDelay = 0;

        // DAS state
        this.dasDirection = 0;
        this.dasCounter = 0;

        // Piece statistics (NES Tetris tracks these)
        this.pieceStats = {};
        this.PIECE_NAMES.forEach(p => this.pieceStats[p] = 0);

        // NES-style RNG state
        this.lastPiece = null;

        // Height setting (garbage rows)
        this.startHeight = 0;

        // ARE (entry delay) - NES uses 10-18 frames depending on row
        this.ARE_FRAMES = 10;

        // Line clear animation: 20 frames on NES
        this.LINE_CLEAR_FRAMES = 20;
    }

    init(startLevel, startHeight) {
        this.reset();
        this.startLevel = startLevel;
        this.level = startLevel;
        this.startHeight = startHeight;

        // Add garbage rows if height > 0
        if (startHeight > 0) {
            this.addGarbageRows(startHeight);
        }

        this.nextPiece = this.randomPiece();
        this.spawnPiece();
    }

    addGarbageRows(height) {
        for (let r = 0; r < height; r++) {
            const row = this.TOTAL_ROWS - 1 - r;
            const hole = Math.floor(Math.random() * this.COLS);
            for (let c = 0; c < this.COLS; c++) {
                if (c !== hole) {
                    const colors = ['#888', '#aaa', '#666'];
                    this.board[row][c] = colors[Math.floor(Math.random() * colors.length)];
                }
            }
        }
    }

    // NES-style piece randomizer (reroll once if same as last piece)
    randomPiece() {
        let piece = this.PIECE_NAMES[Math.floor(Math.random() * this.PIECE_NAMES.length)];
        if (piece === this.lastPiece) {
            piece = this.PIECE_NAMES[Math.floor(Math.random() * this.PIECE_NAMES.length)];
        }
        this.lastPiece = piece;
        return piece;
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        this.rotation = 0;
        this.pieceX = 3; // NES spawns at column 3 (0-indexed)
        this.pieceY = 0; // top of hidden area
        this.gravityCounter = 0;
        this.softDropping = false;

        this.pieceStats[this.currentPiece]++;

        // Check if spawn position is valid
        if (!this.isValidPosition(this.pieceX, this.pieceY, this.rotation)) {
            this.gameOver = true;
            nesAudio.playSFX('gameover');
            return false;
        }
        return true;
    }

    getBlocks(px, py, rot) {
        const piece = this.PIECES[this.currentPiece];
        if (!piece) return [];
        const blocks = piece.rotations[rot % piece.rotations.length];
        return blocks.map(([dx, dy]) => [px + dx, py + dy]);
    }

    isValidPosition(px, py, rot) {
        const blocks = this.getBlocks(px, py, rot);
        for (const [x, y] of blocks) {
            if (x < 0 || x >= this.COLS || y >= this.TOTAL_ROWS) return false;
            if (y >= 0 && this.board[y][x]) return false;
        }
        return true;
    }

    // NES gravity speed for current level
    getGravity() {
        const idx = Math.min(this.level, this.LEVEL_SPEEDS.length - 1);
        return this.LEVEL_SPEEDS[idx];
    }

    moveLeft() {
        if (this.lineClearing || !this.currentPiece || this.gameOver || this.paused) return false;
        if (this.isValidPosition(this.pieceX - 1, this.pieceY, this.rotation)) {
            this.pieceX--;
            nesAudio.playSFX('move');
            return true;
        }
        return false;
    }

    moveRight() {
        if (this.lineClearing || !this.currentPiece || this.gameOver || this.paused) return false;
        if (this.isValidPosition(this.pieceX + 1, this.pieceY, this.rotation)) {
            this.pieceX++;
            nesAudio.playSFX('move');
            return true;
        }
        return false;
    }

    // NES Tetris only rotates clockwise
    rotateClockwise() {
        if (this.lineClearing || !this.currentPiece || this.gameOver || this.paused) return false;
        const newRot = (this.rotation + 1) % 4;
        if (this.isValidPosition(this.pieceX, this.pieceY, newRot)) {
            this.rotation = newRot;
            nesAudio.playSFX('rotate');
            return true;
        }
        return false;
    }

    rotateCounterClockwise() {
        if (this.lineClearing || !this.currentPiece || this.gameOver || this.paused) return false;
        const newRot = (this.rotation + 3) % 4;
        if (this.isValidPosition(this.pieceX, this.pieceY, newRot)) {
            this.rotation = newRot;
            nesAudio.playSFX('rotate');
            return true;
        }
        return false;
    }

    softDrop() {
        if (this.lineClearing || !this.currentPiece || this.gameOver || this.paused) return false;
        if (this.isValidPosition(this.pieceX, this.pieceY + 1, this.rotation)) {
            this.pieceY++;
            // NES awards 1 point per soft drop row
            this.score += 1;
            nesAudio.playSFX('move');
            return true;
        }
        return false;
    }

    hardDrop() {
        if (this.lineClearing || !this.currentPiece || this.gameOver || this.paused) return false;
        let rows = 0;
        while (this.isValidPosition(this.pieceX, this.pieceY + 1, this.rotation)) {
            this.pieceY++;
            rows++;
        }
        // Hard drop scoring (2 points per row - this is a modern addition,
        // NES didn't have hard drop, but we include it as a QoL feature)
        this.score += rows * 2;
        this.lockPiece();
        nesAudio.playSFX('drop');
        return true;
    }

    lockPiece() {
        if (!this.currentPiece) return;
        const blocks = this.getBlocks(this.pieceX, this.pieceY, this.rotation);
        const color = this.PIECES[this.currentPiece].color;

        for (const [x, y] of blocks) {
            if (y >= 0 && y < this.TOTAL_ROWS && x >= 0 && x < this.COLS) {
                this.board[y][x] = color;
            }
        }

        nesAudio.playSFX('lock');
        this.currentPiece = null;
        this.checkLines();
    }

    checkLines() {
        this.clearingLines = [];
        for (let r = this.HIDDEN_ROWS; r < this.TOTAL_ROWS; r++) {
            if (this.board[r].every(cell => cell !== null)) {
                this.clearingLines.push(r);
            }
        }

        if (this.clearingLines.length > 0) {
            this.lineClearing = true;
            this.lineClearFrames = this.LINE_CLEAR_FRAMES;

            if (this.clearingLines.length === 4) {
                nesAudio.playSFX('tetris');
            } else {
                nesAudio.playSFX('lineclear');
            }
        } else {
            this.entryDelay = this.ARE_FRAMES;
        }
    }

    clearLines() {
        const numLines = this.clearingLines.length;

        // Remove cleared lines
        for (const row of this.clearingLines.sort((a,b) => b - a)) {
            this.board.splice(row, 1);
            this.board.unshift(new Array(this.COLS).fill(null));
        }

        // NES scoring: points = base * (level + 1)
        this.score += this.SCORE_TABLE[numLines] * (this.level + 1);
        this.lines += numLines;

        // Level advancement
        // NES: First level transition happens at (startLevel * 10 + 10) or max(100, startLevel*10 - 50)
        const transitionLines = Math.min(
            this.startLevel * 10 + 10,
            Math.max(100, this.startLevel * 10 - 50)
        );

        if (this.lines >= transitionLines) {
            const newLevel = this.startLevel + Math.floor((this.lines - transitionLines) / 10) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                nesAudio.playSFX('levelup');
            }
        }

        this.clearingLines = [];
        this.lineClearing = false;
        this.entryDelay = this.ARE_FRAMES;
    }

    // Main game update (called per frame, ~60fps)
    update() {
        if (this.gameOver || this.paused) return;

        this.frameCount++;

        // Line clear animation
        if (this.lineClearing) {
            this.lineClearFrames--;
            if (this.lineClearFrames <= 0) {
                this.clearLines();
            }
            return;
        }

        // ARE (entry delay between pieces)
        if (this.entryDelay > 0) {
            this.entryDelay--;
            if (this.entryDelay <= 0) {
                this.spawnPiece();
            }
            return;
        }

        if (!this.currentPiece) return;

        // Gravity
        this.gravityCounter++;
        const gravity = this.getGravity();
        const speed = this.softDropping ? Math.min(2, gravity) : gravity;

        if (this.gravityCounter >= speed) {
            this.gravityCounter = 0;
            if (this.isValidPosition(this.pieceX, this.pieceY + 1, this.rotation)) {
                this.pieceY++;
                if (this.softDropping) {
                    this.score += 1;
                }
            } else {
                this.lockPiece();
            }
        }
    }

    // DAS handling
    handleDAS(direction) {
        if (direction !== this.dasDirection) {
            this.dasDirection = direction;
            this.dasCounter = 0;
            if (direction === -1) this.moveLeft();
            else if (direction === 1) this.moveRight();
        } else {
            this.dasCounter++;
            if (this.dasCounter >= this.DAS_INITIAL) {
                if ((this.dasCounter - this.DAS_INITIAL) % this.DAS_REPEAT === 0) {
                    if (direction === -1) this.moveLeft();
                    else if (direction === 1) this.moveRight();
                }
            }
        }
    }

    resetDAS() {
        this.dasDirection = 0;
        this.dasCounter = 0;
    }

    // Get the level-based color for a piece
    getLevelColor(pieceColor) {
        return pieceColor;
    }

    // Render the board and current piece
    render(ctx, nextCtx) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;

        // Calculate cell size to fit board + border walls inside the canvas
        const bwRatio = 0.3; // wall thickness as fraction of cell size
        const cs = Math.min(cw / (this.COLS + bwRatio * 2), ch / (this.ROWS + bwRatio));
        const boardW = this.COLS * cs;
        const boardH = this.ROWS * cs;
        const bw = cs * bwRatio; // border wall pixel thickness
        const ox = (cw - boardW) / 2;
        const oy = (ch - boardH - bw) / 2;

        // Background
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, cw, ch);

        // Playfield interior
        ctx.fillStyle = '#0C0C0C';
        ctx.fillRect(ox, oy, boardW, boardH);

        // Draw border walls (left, right, bottom) - NES style gray frame
        ctx.fillStyle = '#B8B8B8';
        // Left wall
        ctx.fillRect(ox - bw, oy, bw, boardH + bw);
        // Right wall
        ctx.fillRect(ox + boardW, oy, bw, boardH + bw);
        // Bottom floor
        ctx.fillRect(ox - bw, oy + boardH, boardW + bw * 2, bw);

        // Inner edge highlight
        ctx.fillStyle = '#DCDCDC';
        ctx.fillRect(ox - bw, oy, bw * 0.4, boardH + bw);
        ctx.fillRect(ox - bw, oy + boardH, boardW + bw * 2, bw * 0.4);

        // Inner edge shadow
        ctx.fillStyle = '#787878';
        ctx.fillRect(ox + boardW + bw * 0.6, oy, bw * 0.4, boardH + bw);
        ctx.fillRect(ox - bw, oy + boardH + bw * 0.6, boardW + bw * 2, bw * 0.4);

        // Draw grid lines (subtle)
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 0.5;
        for (let r = 0; r <= this.ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(ox, oy + r * cs);
            ctx.lineTo(ox + boardW, oy + r * cs);
            ctx.stroke();
        }
        for (let c = 0; c <= this.COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(ox + c * cs, oy);
            ctx.lineTo(ox + c * cs, oy + boardH);
            ctx.stroke();
        }

        // Draw placed blocks
        for (let r = this.HIDDEN_ROWS; r < this.TOTAL_ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (this.board[r][c]) {
                    this.drawBlock(ctx, c, r - this.HIDDEN_ROWS, this.board[r][c], ox, oy, cs);
                }
            }
        }

        // NES line clear animation: columns clear from center outward
        if (this.lineClearing) {
            const progress = 1 - (this.lineClearFrames / this.LINE_CLEAR_FRAMES);
            const colsCleared = Math.floor(progress * (this.COLS / 2));
            for (const row of this.clearingLines) {
                const drawY = row - this.HIDDEN_ROWS;
                for (let i = 0; i < colsCleared; i++) {
                    const leftCol = (this.COLS / 2) - 1 - i;
                    const rightCol = (this.COLS / 2) + i;
                    ctx.fillStyle = '#0C0C0C';
                    ctx.fillRect(ox + leftCol * cs, oy + drawY * cs, cs, cs);
                    ctx.fillRect(ox + rightCol * cs, oy + drawY * cs, cs, cs);
                }
            }
        }

        // Draw current piece
        if (this.currentPiece && !this.lineClearing) {
            const color = this.PIECES[this.currentPiece].color;
            const blocks = this.getBlocks(this.pieceX, this.pieceY, this.rotation);

            for (const [x, y] of blocks) {
                if (y >= this.HIDDEN_ROWS) {
                    this.drawBlock(ctx, x, y - this.HIDDEN_ROWS, color, ox, oy, cs);
                }
            }
        }

        // Draw next piece preview
        if (nextCtx && this.nextPiece) {
            const nw = nextCtx.canvas.width;
            const nh = nextCtx.canvas.height;
            nextCtx.fillStyle = '#000';
            nextCtx.fillRect(0, 0, nw, nh);
            const piece = this.PIECES[this.nextPiece];
            const blocks = piece.rotations[0];
            const pcs = Math.min(nw / 5, nh / 3);
            const minX = Math.min(...blocks.map(b => b[0]));
            const maxX = Math.max(...blocks.map(b => b[0]));
            const minY = Math.min(...blocks.map(b => b[1]));
            const maxY = Math.max(...blocks.map(b => b[1]));
            const pw = (maxX - minX + 1) * pcs;
            const ph = (maxY - minY + 1) * pcs;
            const nox = (nw - pw) / 2 - minX * pcs;
            const noy = (nh - ph) / 2 - minY * pcs;
            for (const [dx, dy] of blocks) {
                this.drawBlock(nextCtx, dx, dy, piece.color, nox, noy, pcs);
            }
        }
    }

    drawBlock(ctx, x, y, color, ox = 0, oy = 0, cs = this.CELL_SIZE) {
        const px = x * cs + ox;
        const py = y * cs + oy;

        // NES-style block with highlight/shadow
        ctx.fillStyle = color;
        ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);

        // Highlight (top-left)
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(px + 1, py + 1, cs - 2, 2);
        ctx.fillRect(px + 1, py + 1, 2, cs - 2);

        // Shadow (bottom-right)
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(px + 1, py + cs - 3, cs - 2, 2);
        ctx.fillRect(px + cs - 3, py + 1, 2, cs - 2);
    }
}
