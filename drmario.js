// ============================================================
// NES Dr. Mario Engine - Authentic NES Dr. Mario (1990)
// 8 columns x 16 rows, pill capsules, animated viruses
// ============================================================

class DrMarioEngine {
    constructor() {
        this.COLS = 8;
        this.ROWS = 16;
        // Three colors
        this.COLORS = ['red', 'yellow', 'blue'];

        // NES-accurate pill colors
        this.COLOR_MAP = {
            'red':    '#F83800',
            'yellow': '#F8B800',
            'blue':   '#6888FC'
        };

        // Darker shades for pill shadow
        this.COLOR_DARK = {
            'red':    '#A81000',
            'yellow': '#A87800',
            'blue':   '#3850B8'
        };

        // Virus body colors
        this.VIRUS_COLORS = {
            'red':    '#D82800',
            'yellow': '#E8A000',
            'blue':   '#0058F8'
        };

        // Speed settings (frames per drop) - NES authentic
        this.SPEED_LOW = 70;
        this.SPEED_MED = 45;
        this.SPEED_HI = 15;
        this.SPEED_NAMES = ['LOW', 'MED', 'HI'];

        // DAS
        this.DAS_INITIAL = 16;
        this.DAS_REPEAT = 6;

        this.reset();
    }

    reset() {
        this.board = [];
        for (let r = 0; r < this.ROWS; r++) {
            this.board[r] = new Array(this.COLS).fill(null);
        }
        this.score = 0;
        this.level = 0;
        this.startLevel = 0;
        this.virusCount = 0;
        this.initialVirusCount = 0;
        this.gameOver = false;
        this.stageClear = false;
        this.paused = false;

        this.pillX = 0;
        this.pillY = 0;
        this.pillRotation = 0; // 0-3: NES has 4 rotation states (2 spatial x 2 color arrangements)
        this.pillColors = [null, null];
        this.nextPillColors = [null, null];
        this.hasPill = false;

        this.frameCount = 0;
        this.gravityCounter = 0;
        this.speed = this.SPEED_MED;
        this.speedSetting = 1;

        this.state = 'spawning';
        this.clearAnimFrames = 0;
        this.clearingCells = [];
        this.cascadeDelay = 0;
        this.entryDelay = 0;

        this.dasDirection = 0;
        this.dasCounter = 0;
        this.comboCount = 0;

        this.ARE_FRAMES = 15;
        this.CLEAR_ANIM_FRAMES = 18;
        this.softDropping = false;
        this.stageClearAnimFrames = 0;
        this.stageClearRow = 0;
        this.autoAdvanceDelay = 0;
    }

    init(startLevel, speedSetting) {
        this.reset();
        this.startLevel = Math.min(startLevel, 20);
        this.level = this.startLevel;
        this.speedSetting = speedSetting;

        switch (speedSetting) {
            case 0: this.baseSpeed = this.SPEED_LOW; break;
            case 1: this.baseSpeed = this.SPEED_MED; break;
            case 2: this.baseSpeed = this.SPEED_HI; break;
        }
        this.recalcSpeed();

        this.speed = this.baseSpeed; // ensure speed is set before virus placement
        this.placeViruses();
        this.nextPillColors = this.randomPillColors();
        this.spawnPill();
    }

    recalcSpeed() {
        this.speed = Math.max(5, this.baseSpeed - this.level * 2);
    }

    placeViruses() {
        const numViruses = Math.min((this.level + 1) * 4, 84);
        this.initialVirusCount = numViruses;
        this.virusCount = numViruses;

        // NES-authentic: viruses restricted to lower rows at low levels
        const minRow = Math.max(2, this.ROWS - 5 - Math.floor(this.level * 0.6));

        let placed = 0;
        let attempts = 0;
        const maxAttempts = numViruses * 50;

        while (placed < numViruses && attempts < maxAttempts) {
            attempts++;
            const row = minRow + Math.floor(Math.random() * (this.ROWS - minRow));
            const col = Math.floor(Math.random() * this.COLS);

            if (this.board[row][col]) continue;

            const color = this.COLORS[Math.floor(Math.random() * 3)];

            // Check horizontal - avoid 3 in a row
            let hCount = 0;
            for (let c = col - 1; c >= 0; c--) {
                if (this.board[row][c] && this.board[row][c].color === color) hCount++;
                else break;
            }
            for (let c = col + 1; c < this.COLS; c++) {
                if (this.board[row][c] && this.board[row][c].color === color) hCount++;
                else break;
            }

            let vCount = 0;
            for (let r = row - 1; r >= 0; r--) {
                if (this.board[r][col] && this.board[r][col].color === color) vCount++;
                else break;
            }
            for (let r = row + 1; r < this.ROWS; r++) {
                if (this.board[r][col] && this.board[r][col].color === color) vCount++;
                else break;
            }

            if (hCount >= 2 || vCount >= 2) continue;

            this.board[row][col] = { color, type: 'virus' };
            placed++;
        }

        this.virusCount = placed;
        this.initialVirusCount = placed;
    }

    randomPillColors() {
        return [
            this.COLORS[Math.floor(Math.random() * 3)],
            this.COLORS[Math.floor(Math.random() * 3)]
        ];
    }

    spawnPill() {
        this.pillColors = [...this.nextPillColors];
        this.nextPillColors = this.randomPillColors();
        this.pillX = 3;
        this.pillY = 0;
        this.pillRotation = 0;
        this.hasPill = true;
        this.gravityCounter = 0;
        this.comboCount = 0;
        this.state = 'falling';

        const cells = this.getPillCells();
        for (const [x, y] of cells) {
            if (y >= 0 && this.board[y][x]) {
                this.gameOver = true;
                nesAudio.playSFX('gameover');
                return false;
            }
        }
        return true;
    }

    getPillCells(px, py, rot) {
        px = px !== undefined ? px : this.pillX;
        py = py !== undefined ? py : this.pillY;
        rot = rot !== undefined ? rot : this.pillRotation;

        const isHoriz = rot === 0 || rot === 2;
        if (isHoriz) return [[px, py], [px + 1, py]];       // horizontal
        else return [[px, py - 1], [px, py]];               // vertical
    }

    isValidPillPos(px, py, rot) {
        const cells = this.getPillCells(px, py, rot);
        for (const [x, y] of cells) {
            if (x < 0 || x >= this.COLS || y >= this.ROWS) return false;
            if (y >= 0 && this.board[y][x]) return false;
        }
        return true;
    }

    moveLeft() {
        if (!this.hasPill || this.state !== 'falling' || this.gameOver || this.paused) return false;
        if (this.isValidPillPos(this.pillX - 1, this.pillY, this.pillRotation)) {
            this.pillX--;
            nesAudio.playSFX('move');
            return true;
        }
        return false;
    }

    moveRight() {
        if (!this.hasPill || this.state !== 'falling' || this.gameOver || this.paused) return false;
        if (this.isValidPillPos(this.pillX + 1, this.pillY, this.pillRotation)) {
            this.pillX++;
            nesAudio.playSFX('move');
            return true;
        }
        return false;
    }

    // NES Dr. Mario: 4 rotation states (H/V x 2 color arrangements)
    rotateClockwise() {
        if (!this.hasPill || this.state !== 'falling' || this.gameOver || this.paused) return false;
        const newRot = (this.pillRotation + 1) % 4;
        if (this.isValidPillPos(this.pillX, this.pillY, newRot)) {
            this.pillRotation = newRot;
            nesAudio.playSFX('rotate');
            return true;
        }
        return false;
    }

    softDrop() {
        if (!this.hasPill || this.state !== 'falling' || this.gameOver || this.paused) return false;
        if (this.isValidPillPos(this.pillX, this.pillY + 1, this.pillRotation)) {
            this.pillY++;
            this.gravityCounter = 0;
            return true;
        }
        return false;
    }

    // NES Dr. Mario has no hard drop

    lockPill() {
        if (!this.hasPill) return;
        const cells = this.getPillCells();
        const colors = this.getPillColorAssignment();
        const isHoriz = this.pillRotation === 0 || this.pillRotation === 2;

        for (let i = 0; i < cells.length; i++) {
            const [x, y] = cells[i];
            if (y >= 0 && y < this.ROWS && x >= 0 && x < this.COLS) {
                let dir;
                if (isHoriz) {
                    dir = (i === 0) ? 'right' : 'left';
                } else {
                    dir = (i === 0) ? 'down' : 'up';
                }
                // For horizontal: cell[0] connects right, cell[1] connects left
                // But getPillCells for rot=0 returns [left,right], so cell[0]'s partner is to right
                this.board[y][x] = { color: colors[i], type: 'pill', dir };
            }
        }

        this.hasPill = false;
        nesAudio.playSFX('pill_land');
        this.checkMatches();
    }

    getPillColorAssignment() {
        // 4 rotation states cycle through color arrangements:
        // rot 0 (H): [A, B]  rot 1 (V): [B, A]  rot 2 (H): [B, A]  rot 3 (V): [A, B]
        if (this.pillRotation === 1 || this.pillRotation === 2) {
            return [this.pillColors[1], this.pillColors[0]];
        }
        return [this.pillColors[0], this.pillColors[1]];
    }

    checkMatches() {
        this.clearingCells = [];

        // Horizontal
        for (let r = 0; r < this.ROWS; r++) {
            let runColor = null;
            let runStart = 0;
            let runLen = 0;
            for (let c = 0; c <= this.COLS; c++) {
                const cell = c < this.COLS ? this.board[r][c] : null;
                const color = cell ? cell.color : null;
                if (color && color === runColor) {
                    runLen++;
                } else {
                    if (runLen >= 4) {
                        for (let i = runStart; i < runStart + runLen; i++) {
                            this.clearingCells.push([i, r]);
                        }
                    }
                    runColor = color;
                    runStart = c;
                    runLen = 1;
                }
            }
        }

        // Vertical
        for (let c = 0; c < this.COLS; c++) {
            let runColor = null;
            let runStart = 0;
            let runLen = 0;
            for (let r = 0; r <= this.ROWS; r++) {
                const cell = r < this.ROWS ? this.board[r][c] : null;
                const color = cell ? cell.color : null;
                if (color && color === runColor) {
                    runLen++;
                } else {
                    if (runLen >= 4) {
                        for (let i = runStart; i < runStart + runLen; i++) {
                            this.clearingCells.push([c, i]);
                        }
                    }
                    runColor = color;
                    runStart = r;
                    runLen = 1;
                }
            }
        }

        // Deduplicate
        const unique = new Set(this.clearingCells.map(([x, y]) => `${x},${y}`));
        this.clearingCells = [...unique].map(s => {
            const [x, y] = s.split(',').map(Number);
            return [x, y];
        });

        if (this.clearingCells.length > 0) {
            this.state = 'clearing';
            this.clearAnimFrames = this.CLEAR_ANIM_FRAMES;
            this.comboCount++;

            let virusesCleared = 0;
            for (const [x, y] of this.clearingCells) {
                if (this.board[y][x] && this.board[y][x].type === 'virus') {
                    virusesCleared++;
                }
            }

            if (virusesCleared > 0) {
                nesAudio.playSFX('virus_clear');
                const points = virusesCleared * 100 * Math.pow(2, this.comboCount - 1);
                this.score += points;
            }
        } else {
            this.comboCount = 0;
            this.entryDelay = this.ARE_FRAMES;
            this.state = 'spawning';
        }
    }

    clearMatches() {
        // Before clearing, disconnect pill partners
        for (const [x, y] of this.clearingCells) {
            const cell = this.board[y][x];
            if (cell && cell.type === 'pill' && cell.dir !== 'single') {
                // Find partner and make it single
                let px, py;
                if (cell.dir === 'left')  { px = x - 1; py = y; }
                if (cell.dir === 'right') { px = x + 1; py = y; }
                if (cell.dir === 'up')    { px = x; py = y - 1; }
                if (cell.dir === 'down')  { px = x; py = y + 1; }
                if (px !== undefined && py >= 0 && py < this.ROWS && px >= 0 && px < this.COLS) {
                    const partner = this.board[py][px];
                    if (partner && partner.type === 'pill') {
                        partner.dir = 'single';
                    }
                }
            }
        }

        for (const [x, y] of this.clearingCells) {
            if (this.board[y][x]) {
                if (this.board[y][x].type === 'virus') {
                    this.virusCount--;
                }
                this.board[y][x] = null;
            }
        }

        this.clearingCells = [];

        if (this.virusCount <= 0) {
            this.state = 'stageClearAnim';
            this.stageClearRow = this.ROWS - 1;
            this.stageClearAnimFrames = 2;
            nesAudio.playSFX('stage_clear');
            return;
        }

        this.state = 'cascading';
        this.cascadeDelay = 8;
    }

    applyCascadeGravity() {
        let moved = false;

        for (let r = this.ROWS - 2; r >= 0; r--) {
            for (let c = 0; c < this.COLS; c++) {
                const cell = this.board[r][c];
                if (cell && cell.type === 'pill') {
                    if (r + 1 < this.ROWS && !this.board[r + 1][c]) {
                        // Only drop single halves or vertical pairs (check partner)
                        if (cell.dir === 'single') {
                            this.board[r + 1][c] = cell;
                            this.board[r][c] = null;
                            moved = true;
                        } else if (cell.dir === 'left' || cell.dir === 'right') {
                            // Horizontal pair - check if partner can also fall
                            const pc = cell.dir === 'right' ? c + 1 : c - 1;
                            if (pc >= 0 && pc < this.COLS) {
                                const partner = this.board[r][pc];
                                if (partner && r + 1 < this.ROWS && !this.board[r + 1][pc]) {
                                    this.board[r + 1][c] = cell;
                                    this.board[r + 1][pc] = partner;
                                    this.board[r][c] = null;
                                    this.board[r][pc] = null;
                                    moved = true;
                                }
                            }
                        }
                        // Vertical pairs: the bottom half handles the drop
                        else if (cell.dir === 'down') {
                            // This is the top half, bottom is below - skip, bottom handles it
                        } else if (cell.dir === 'up') {
                            // This is the bottom half - check if below is empty
                            // Top half is at r-1
                            if (r - 1 >= 0 && this.board[r - 1][c] && this.board[r - 1][c].dir === 'down') {
                                this.board[r + 1][c] = cell;
                                this.board[r][c] = this.board[r - 1][c];
                                this.board[r - 1][c] = null;
                                moved = true;
                            }
                        }
                    }
                }
            }
        }

        return moved;
    }

    update() {
        if (this.gameOver || this.paused) return;
        if (this.stageClear) {
            // Auto-advance to next level after delay
            this.autoAdvanceDelay--;
            if (this.autoAdvanceDelay <= 0) {
                this.init(this.level + 1, this.speedSetting);
            }
            return;
        }

        this.frameCount++;

        switch (this.state) {
            case 'spawning':
                this.entryDelay--;
                if (this.entryDelay <= 0) {
                    this.spawnPill();
                }
                break;

            case 'falling':
                if (!this.hasPill) break;
                this.gravityCounter++;
                const dropSpeed = this.softDropping ? Math.min(2, this.speed) : this.speed;
                if (this.gravityCounter >= dropSpeed) {
                    this.gravityCounter = 0;
                    if (this.isValidPillPos(this.pillX, this.pillY + 1, this.pillRotation)) {
                        this.pillY++;
                    } else {
                        this.lockPill();
                    }
                }
                break;

            case 'clearing':
                this.clearAnimFrames--;
                if (this.clearAnimFrames <= 0) {
                    this.clearMatches();
                }
                break;

            case 'cascading':
                this.cascadeDelay--;
                if (this.cascadeDelay <= 0) {
                    const moved = this.applyCascadeGravity();
                    if (moved) {
                        this.cascadeDelay = 4;
                    } else {
                        this.checkMatches();
                        if (this.clearingCells.length === 0 && this.state !== 'clearing') {
                            this.entryDelay = this.ARE_FRAMES;
                            this.state = 'spawning';
                        }
                    }
                }
                break;

            case 'stageClearAnim':
                this.stageClearAnimFrames--;
                if (this.stageClearAnimFrames <= 0) {
                    // Clear one row at a time from bottom up
                    for (let c = 0; c < this.COLS; c++) {
                        this.board[this.stageClearRow][c] = null;
                    }
                    this.stageClearRow--;
                    if (this.stageClearRow < 0) {
                        this.stageClear = true;
                        this.state = 'clear';
                        this.autoAdvanceDelay = 120; // ~2 seconds
                    } else {
                        this.stageClearAnimFrames = 2;
                    }
                }
                break;
        }
    }

    startGame(startLevel, speedSetting) {
        this.init(startLevel, speedSetting);
    }

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

    // ---- RENDERING ----

    render(ctx, nextCtx) {
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;
        const cs = Math.min(cw / (this.COLS + 2), ch / (this.ROWS + 3));
        const boardW = this.COLS * cs;
        const boardH = this.ROWS * cs;
        const ox = (cw - boardW) / 2;
        const oy = (ch - boardH) / 2 + cs;

        // Background - NES Dr. Mario dark blue/black
        ctx.fillStyle = '#000020';
        ctx.fillRect(0, 0, cw, ch);

        // Draw bottle
        this.drawBottle(ctx, ox, oy, boardW, boardH, cs);

        // Bottle interior - black
        ctx.fillStyle = '#000';
        ctx.fillRect(ox, oy, boardW, boardH);

        // Draw board cells
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const cell = this.board[r][c];
                if (!cell) continue;

                const px = ox + c * cs;
                const py = oy + r * cs;

                if (cell.type === 'virus') {
                    this.drawVirus(ctx, px, py, cs, cell.color);
                } else {
                    this.drawPillHalf(ctx, px, py, cs, cell.color, cell.dir || 'single');
                }
            }
        }

        // Clearing animation - flash
        if (this.state === 'clearing') {
            const flash = Math.floor(this.clearAnimFrames / 3) % 2 === 0;
            for (const [x, y] of this.clearingCells) {
                const px = ox + x * cs;
                const py = oy + y * cs;
                if (flash) {
                    ctx.fillStyle = '#FCFCFC';
                    ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);
                } else {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(px, py, cs, cs);
                }
            }
        }

        // Draw falling pill
        if (this.hasPill && this.state === 'falling') {
            const cells = this.getPillCells();
            const colors = this.getPillColorAssignment();
            const isHoriz = this.pillRotation === 0 || this.pillRotation === 2;

            for (let i = 0; i < cells.length; i++) {
                const [x, y] = cells[i];
                if (y >= 0) {
                    const px = ox + x * cs;
                    const py = oy + y * cs;
                    let dir;
                    if (isHoriz) {
                        dir = (i === 0) ? 'right' : 'left';
                    } else {
                        dir = (i === 0) ? 'down' : 'up';
                    }
                    this.drawPillHalf(ctx, px, py, cs, colors[i], dir);
                }
            }
        }

        // Draw Dr. Mario (small, throwing pill at top)
        this.drawDrMario(ctx, ox + boardW + cs * 0.3, oy - cs * 1.5, cs);

        // Draw next pill preview
        if (nextCtx) {
            const nw = nextCtx.canvas.width;
            const nh = nextCtx.canvas.height;
            nextCtx.fillStyle = '#000';
            nextCtx.fillRect(0, 0, nw, nh);
            if (this.nextPillColors) {
                const pcs = Math.min(nw / 4, nh / 2);
                const npx = (nw - 2 * pcs) / 2;
                const npy = (nh - pcs) / 2;
                this.drawPillHalf(nextCtx, npx, npy, pcs, this.nextPillColors[0], 'right');
                this.drawPillHalf(nextCtx, npx + pcs, npy, pcs, this.nextPillColors[1], 'left');
            }
        }
    }

    drawBottle(ctx, ox, oy, bw, bh, cs) {
        const wallW = cs * 0.4;
        const neckW = cs * 2;
        const neckH = cs * 1.5;
        const neckX = ox + (bw - neckW) / 2;

        // Bottle walls - NES used a brownish/gray color
        ctx.fillStyle = '#B8B8B8';

        // Left wall
        ctx.fillRect(ox - wallW, oy, wallW, bh);
        // Right wall
        ctx.fillRect(ox + bw, oy, wallW, bh);
        // Bottom
        ctx.fillRect(ox - wallW, oy + bh, bw + wallW * 2, wallW);

        // Neck left
        ctx.fillRect(neckX - wallW, oy - neckH, wallW, neckH);
        // Neck right
        ctx.fillRect(neckX + neckW, oy - neckH, wallW, neckH);
        // Neck top left
        ctx.fillRect(ox - wallW, oy, neckX - ox + wallW, wallW * 0.5);
        // Neck top right
        ctx.fillRect(neckX + neckW, oy, (ox + bw) - (neckX + neckW) + wallW, wallW * 0.5);

        // Lip at top of neck
        ctx.fillRect(neckX - wallW * 1.5, oy - neckH - wallW, neckW + wallW * 3, wallW);

        // Inner shadow on walls
        ctx.fillStyle = '#888';
        ctx.fillRect(ox - wallW * 0.3, oy, wallW * 0.3, bh);
        ctx.fillRect(ox + bw, oy, wallW * 0.3, bh);
    }

    drawPillHalf(ctx, px, py, cs, color, dir) {
        const colorVal = this.COLOR_MAP[color] || '#fff';
        const darkVal = this.COLOR_DARK[color] || '#888';
        const m = cs * 0.1; // margin
        const r = (cs - m * 2) / 2; // radius for rounded end

        ctx.fillStyle = colorVal;

        if (dir === 'single') {
            // Single disconnected half - circle/dot
            ctx.beginPath();
            ctx.arc(px + cs / 2, py + cs / 2, r, 0, Math.PI * 2);
            ctx.fill();
            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.beginPath();
            ctx.arc(px + cs * 0.4, py + cs * 0.35, r * 0.35, 0, Math.PI * 2);
            ctx.fill();
            return;
        }

        // Capsule halves
        const x1 = px + m;
        const y1 = py + m;
        const w = cs - m * 2;
        const h = cs - m * 2;

        ctx.save();
        ctx.beginPath();

        if (dir === 'right') {
            // Left half of horizontal pill - rounded left, flat right
            ctx.moveTo(x1 + r, y1);
            ctx.lineTo(x1 + w, y1);
            ctx.lineTo(x1 + w, y1 + h);
            ctx.lineTo(x1 + r, y1 + h);
            ctx.arc(x1 + r, y1 + r, r, Math.PI * 0.5, Math.PI * 1.5);
        } else if (dir === 'left') {
            // Right half of horizontal pill - flat left, rounded right
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + w - r, y1);
            ctx.arc(x1 + w - r, y1 + r, r, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.lineTo(x1, y1 + h);
        } else if (dir === 'down') {
            // Top half of vertical pill - rounded top, flat bottom
            ctx.moveTo(x1, y1 + r);
            ctx.arc(x1 + r, y1 + r, r, Math.PI, 0);
            ctx.lineTo(x1 + w, y1 + h);
            ctx.lineTo(x1, y1 + h);
        } else if (dir === 'up') {
            // Bottom half of vertical pill - flat top, rounded bottom
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 + w, y1);
            ctx.lineTo(x1 + w, y1 + h - r);
            ctx.arc(x1 + r, y1 + h - r, r, 0, Math.PI);
        }

        ctx.closePath();
        ctx.fill();

        // Dark edge for 3D effect
        ctx.strokeStyle = darkVal;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Highlight shine
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        if (dir === 'right' || dir === 'left') {
            ctx.fillRect(x1 + (dir === 'left' ? 2 : r * 0.5), y1 + 2, w * 0.3, h * 0.25);
        } else {
            ctx.fillRect(x1 + 2, y1 + (dir === 'up' ? 2 : r * 0.5), w * 0.3, h * 0.25);
        }

        ctx.restore();
    }

    drawVirus(ctx, px, py, cs, color) {
        const colorVal = this.VIRUS_COLORS[color] || '#fff';
        const cx = px + cs / 2;
        const cy = py + cs / 2;
        const s = cs * 0.42; // half-size of virus body
        const frame = Math.floor(this.frameCount / 20) % 2;

        // Virus body - blocky/pixel-art style
        ctx.fillStyle = colorVal;
        // Main body rectangle
        ctx.fillRect(cx - s, cy - s * 0.7, s * 2, s * 1.4);
        ctx.fillRect(cx - s * 0.7, cy - s, s * 1.4, s * 2);

        // Bumps/tendrils (pixel art style)
        const bumpS = s * 0.3;
        // Top bumps
        ctx.fillRect(cx - s * 0.5, cy - s - bumpS, bumpS, bumpS);
        ctx.fillRect(cx + s * 0.2, cy - s - bumpS, bumpS, bumpS);
        // Bottom bumps
        ctx.fillRect(cx - s * 0.5, cy + s, bumpS, bumpS);
        ctx.fillRect(cx + s * 0.2, cy + s, bumpS, bumpS);
        // Side bumps
        ctx.fillRect(cx - s - bumpS, cy - s * 0.2, bumpS, bumpS);
        ctx.fillRect(cx + s, cy - s * 0.2, bumpS, bumpS);

        // Eyes - white
        ctx.fillStyle = '#FCFCFC';
        const eyeW = s * 0.4;
        const eyeH = s * 0.45;
        const eyeY = cy - s * 0.35;
        ctx.fillRect(cx - s * 0.55, eyeY, eyeW, eyeH);
        ctx.fillRect(cx + s * 0.15, eyeY, eyeW, eyeH);

        // Pupils - black, animated
        ctx.fillStyle = '#000';
        const pupW = s * 0.2;
        const pupOff = frame === 0 ? 0 : s * 0.15;
        ctx.fillRect(cx - s * 0.45 + pupOff, eyeY + eyeH * 0.3, pupW, pupW);
        ctx.fillRect(cx + s * 0.25 + pupOff, eyeY + eyeH * 0.3, pupW, pupW);

        // Mouth - different per color for personality
        ctx.fillStyle = '#000';
        const mouthY = cy + s * 0.15;
        if (color === 'red') {
            // Fever: wide grin
            if (frame === 0) {
                ctx.fillRect(cx - s * 0.4, mouthY, s * 0.8, s * 0.15);
                ctx.fillRect(cx - s * 0.3, mouthY + s * 0.15, s * 0.6, s * 0.1);
            } else {
                ctx.fillRect(cx - s * 0.3, mouthY, s * 0.6, s * 0.25);
            }
        } else if (color === 'blue') {
            // Chill: frown
            if (frame === 0) {
                ctx.fillRect(cx - s * 0.3, mouthY + s * 0.15, s * 0.6, s * 0.1);
                ctx.fillRect(cx - s * 0.2, mouthY + s * 0.05, s * 0.4, s * 0.1);
            } else {
                ctx.fillRect(cx - s * 0.15, mouthY, s * 0.3, s * 0.2);
            }
        } else {
            // Weird (yellow): wavy/zigzag
            if (frame === 0) {
                ctx.fillRect(cx - s * 0.35, mouthY, s * 0.2, s * 0.12);
                ctx.fillRect(cx - s * 0.1, mouthY + s * 0.1, s * 0.2, s * 0.12);
                ctx.fillRect(cx + s * 0.15, mouthY, s * 0.2, s * 0.12);
            } else {
                ctx.fillRect(cx - s * 0.3, mouthY + s * 0.05, s * 0.6, s * 0.12);
            }
        }
    }

    drawDrMario(ctx, x, y, cs) {
        // Simple pixel-art Dr. Mario figure
        const s = cs * 0.3;

        // Head (white circle for head mirror)
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x, y, s * 3, s * 2);

        // Hair
        ctx.fillStyle = '#481800';
        ctx.fillRect(x, y, s * 3, s * 0.8);

        // Face
        ctx.fillStyle = '#F8B070';
        ctx.fillRect(x + s * 0.3, y + s * 0.8, s * 2.4, s * 1.5);

        // Head mirror
        ctx.fillStyle = '#FCFCFC';
        ctx.beginPath();
        ctx.arc(x + s * 1.5, y + s * 0.3, s * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Body (white coat)
        ctx.fillStyle = '#FCFCFC';
        ctx.fillRect(x - s * 0.2, y + s * 2.3, s * 3.4, s * 3);

        // Coat shadow
        ctx.fillStyle = '#D8D8D8';
        ctx.fillRect(x + s * 1.4, y + s * 2.3, s * 1.8, s * 3);

        // Stethoscope
        ctx.fillStyle = '#888';
        ctx.fillRect(x + s * 0.8, y + s * 2.8, s * 0.3, s * 1.5);

        // Arm throwing pill (animated)
        const throwFrame = Math.floor(this.frameCount / 15) % 2;
        ctx.fillStyle = '#FCFCFC';
        if (throwFrame === 0) {
            ctx.fillRect(x - s * 1.5, y + s * 2.5, s * 1.5, s * 0.8);
        } else {
            ctx.fillRect(x - s * 1.8, y + s * 2, s * 1.8, s * 0.8);
        }
    }
}
