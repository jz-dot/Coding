// ============================================================
// NES Dr. Mario Engine - Authentic NES Dr. Mario (1990) mechanics
// 8 columns x 16 rows, virus elimination, pill mechanics
// ============================================================

class DrMarioEngine {
    constructor() {
        // Dr. Mario: 8 columns x 16 rows
        this.COLS = 8;
        this.ROWS = 16;
        this.CELL_SIZE = 20; // will be adjusted to fit canvas
        this.BOARD_WIDTH = this.COLS * this.CELL_SIZE;
        this.BOARD_HEIGHT = this.ROWS * this.CELL_SIZE;

        // Three colors in Dr. Mario
        this.COLORS = ['red', 'yellow', 'blue'];

        // NES Dr. Mario color values
        this.COLOR_MAP = {
            'red': '#F83800',
            'yellow': '#FCF357',
            'blue': '#0058F8'
        };

        // Virus sprites represented by color
        this.VIRUS_COLORS = {
            'red': '#D80000',
            'yellow': '#D8C800',
            'blue': '#0040D8'
        };

        // Speed settings (frames per drop) - NES authentic
        this.SPEED_LOW = 70;    // LOW speed
        this.SPEED_MED = 45;    // MED speed
        this.SPEED_HI = 15;     // HI speed

        // Speed increases every 10 levels for each base speed
        this.SPEED_NAMES = ['LOW', 'MED', 'HI'];

        // DAS settings (same as Tetris)
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

        // Current pill
        this.pillX = 0;
        this.pillY = 0;
        this.pillRotation = 0; // 0=horizontal, 1=vertical, 2=h-flipped, 3=v-flipped
        this.pillColors = [null, null]; // [left/top, right/bottom]
        this.nextPillColors = [null, null];
        this.hasPill = false;

        this.frameCount = 0;
        this.gravityCounter = 0;
        this.speed = this.SPEED_MED;
        this.speedSetting = 1; // 0=LOW, 1=MED, 2=HI

        // State machine
        this.state = 'spawning'; // spawning, falling, clearing, cascading, gameover, clear
        this.clearAnimFrames = 0;
        this.clearingCells = [];
        this.cascadeDelay = 0;
        this.entryDelay = 0;

        // DAS
        this.dasDirection = 0;
        this.dasCounter = 0;

        // Scoring combo
        this.comboCount = 0;

        // ARE
        this.ARE_FRAMES = 15;
        this.CLEAR_ANIM_FRAMES = 18;
    }

    init(startLevel, speedSetting) {
        this.reset();
        this.startLevel = Math.min(startLevel, 20);
        this.level = this.startLevel;
        this.speedSetting = speedSetting;

        // Set base speed
        switch(speedSetting) {
            case 0: this.speed = this.SPEED_LOW; break;
            case 1: this.speed = this.SPEED_MED; break;
            case 2: this.speed = this.SPEED_HI; break;
        }

        // Place viruses
        this.placeViruses();

        // Generate first next pill
        this.nextPillColors = this.randomPillColors();
        this.spawnPill();
    }

    // NES Dr. Mario virus placement
    // Number of viruses = (level + 1) * 4, max 84
    // Viruses placed in bottom rows, never above row 3
    placeViruses() {
        const numViruses = Math.min((this.level + 1) * 4, 84);
        this.initialVirusCount = numViruses;
        this.virusCount = numViruses;

        // Viruses can only appear in rows 4-15 (0-indexed)
        // At higher levels they can appear higher
        const minRow = Math.max(4, 16 - Math.floor(this.level / 2) - 8);

        let placed = 0;
        let attempts = 0;
        const maxAttempts = numViruses * 50;

        while (placed < numViruses && attempts < maxAttempts) {
            attempts++;
            const row = minRow + Math.floor(Math.random() * (this.ROWS - minRow));
            const col = Math.floor(Math.random() * this.COLS);

            if (this.board[row][col]) continue;

            // Pick color - avoid 3 in a row
            const color = this.COLORS[Math.floor(Math.random() * 3)];

            // Check horizontal
            let hCount = 0;
            for (let c = col - 1; c >= 0; c--) {
                if (this.board[row][c] && this.board[row][c].color === color) hCount++;
                else break;
            }
            for (let c = col + 1; c < this.COLS; c++) {
                if (this.board[row][c] && this.board[row][c].color === color) hCount++;
                else break;
            }

            // Check vertical
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
        this.pillX = 3; // Spawn at column 3-4
        this.pillY = 0;
        this.pillRotation = 0; // horizontal
        this.hasPill = true;
        this.gravityCounter = 0;
        this.comboCount = 0;
        this.state = 'falling';

        // Check if spawn blocked
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

    // Get the two cells occupied by the current pill
    getPillCells(px, py, rot) {
        px = px !== undefined ? px : this.pillX;
        py = py !== undefined ? py : this.pillY;
        rot = rot !== undefined ? rot : this.pillRotation;

        switch(rot) {
            case 0: return [[px, py], [px + 1, py]];      // horizontal: [left, right]
            case 1: return [[px, py - 1], [px, py]];       // vertical: [top, bottom]
            case 2: return [[px + 1, py], [px, py]];       // h-flipped: [right, left]
            case 3: return [[px, py], [px, py - 1]];       // v-flipped: [bottom, top]
        }
        return [[px, py], [px + 1, py]];
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

    rotateClockwise() {
        if (!this.hasPill || this.state !== 'falling' || this.gameOver || this.paused) return false;
        const newRot = (this.pillRotation + 1) % 4;
        if (this.isValidPillPos(this.pillX, this.pillY, newRot)) {
            this.pillRotation = newRot;
            nesAudio.playSFX('rotate');
            return true;
        }
        // Wall kick - try shifting
        if (this.isValidPillPos(this.pillX - 1, this.pillY, newRot)) {
            this.pillX--;
            this.pillRotation = newRot;
            nesAudio.playSFX('rotate');
            return true;
        }
        if (this.isValidPillPos(this.pillX + 1, this.pillY, newRot)) {
            this.pillX++;
            this.pillRotation = newRot;
            nesAudio.playSFX('rotate');
            return true;
        }
        return false;
    }

    rotateCounterClockwise() {
        if (!this.hasPill || this.state !== 'falling' || this.gameOver || this.paused) return false;
        const newRot = (this.pillRotation + 3) % 4;
        if (this.isValidPillPos(this.pillX, this.pillY, newRot)) {
            this.pillRotation = newRot;
            nesAudio.playSFX('rotate');
            return true;
        }
        if (this.isValidPillPos(this.pillX - 1, this.pillY, newRot)) {
            this.pillX--;
            this.pillRotation = newRot;
            nesAudio.playSFX('rotate');
            return true;
        }
        if (this.isValidPillPos(this.pillX + 1, this.pillY, newRot)) {
            this.pillX++;
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

    hardDrop() {
        if (!this.hasPill || this.state !== 'falling' || this.gameOver || this.paused) return false;
        while (this.isValidPillPos(this.pillX, this.pillY + 1, this.pillRotation)) {
            this.pillY++;
        }
        this.lockPill();
        nesAudio.playSFX('drop');
        return true;
    }

    lockPill() {
        if (!this.hasPill) return;
        const cells = this.getPillCells();
        const colors = this.getPillColorAssignment();

        for (let i = 0; i < cells.length; i++) {
            const [x, y] = cells[i];
            if (y >= 0 && y < this.ROWS && x >= 0 && x < this.COLS) {
                this.board[y][x] = { color: colors[i], type: 'pill', partner: i === 0 ? 1 : 0 };
            }
        }

        this.hasPill = false;
        nesAudio.playSFX('pill_land');
        this.checkMatches();
    }

    getPillColorAssignment() {
        // Map pill colors to cell positions based on rotation
        switch(this.pillRotation) {
            case 0: return [this.pillColors[0], this.pillColors[1]]; // L, R
            case 1: return [this.pillColors[0], this.pillColors[1]]; // T, B
            case 2: return [this.pillColors[1], this.pillColors[0]]; // R, L (flipped)
            case 3: return [this.pillColors[1], this.pillColors[0]]; // B, T (flipped)
        }
        return this.pillColors;
    }

    checkMatches() {
        this.clearingCells = [];

        // Check horizontal matches (4+ in a row)
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

        // Check vertical matches (4+ in a column)
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

        // Remove duplicates
        const unique = new Set(this.clearingCells.map(([x,y]) => `${x},${y}`));
        this.clearingCells = [...unique].map(s => {
            const [x, y] = s.split(',').map(Number);
            return [x, y];
        });

        if (this.clearingCells.length > 0) {
            this.state = 'clearing';
            this.clearAnimFrames = this.CLEAR_ANIM_FRAMES;
            this.comboCount++;

            // Count viruses being cleared
            let virusesCleared = 0;
            for (const [x, y] of this.clearingCells) {
                if (this.board[y][x] && this.board[y][x].type === 'virus') {
                    virusesCleared++;
                }
            }

            if (virusesCleared > 0) {
                nesAudio.playSFX('virus_clear');
                // NES Dr. Mario scoring: 100 * 2^(combo-1) per virus
                const points = virusesCleared * 100 * Math.pow(2, this.comboCount - 1);
                this.score += points;
            }
        } else {
            // No matches - spawn next pill or cascade
            this.comboCount = 0;
            this.entryDelay = this.ARE_FRAMES;
            this.state = 'spawning';
        }
    }

    clearMatches() {
        let virusesCleared = 0;
        for (const [x, y] of this.clearingCells) {
            if (this.board[y][x]) {
                if (this.board[y][x].type === 'virus') {
                    virusesCleared++;
                    this.virusCount--;
                }
                this.board[y][x] = null;
            }
        }

        this.clearingCells = [];

        // Check for stage clear
        if (this.virusCount <= 0) {
            this.stageClear = true;
            this.state = 'clear';
            nesAudio.playSFX('stage_clear');
            return;
        }

        // Apply gravity to floating pill halves
        this.state = 'cascading';
        this.cascadeDelay = 8;
    }

    // Apply gravity to floating pill segments
    applyCascadeGravity() {
        let moved = false;

        // Scan from bottom to top
        for (let r = this.ROWS - 2; r >= 0; r--) {
            for (let c = 0; c < this.COLS; c++) {
                const cell = this.board[r][c];
                if (cell && cell.type === 'pill') {
                    // Check if this half can fall
                    if (r + 1 < this.ROWS && !this.board[r + 1][c]) {
                        this.board[r + 1][c] = cell;
                        this.board[r][c] = null;
                        moved = true;
                    }
                }
            }
        }

        return moved;
    }

    update() {
        if (this.gameOver || this.paused || this.stageClear) return;

        this.frameCount++;

        switch(this.state) {
            case 'spawning':
                this.entryDelay--;
                if (this.entryDelay <= 0) {
                    this.spawnPill();
                }
                break;

            case 'falling':
                if (!this.hasPill) break;
                this.gravityCounter++;
                if (this.gravityCounter >= this.speed) {
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
                        // Check for new matches after cascade
                        this.checkMatches();
                        if (this.clearingCells.length === 0 && this.state !== 'clearing') {
                            this.entryDelay = this.ARE_FRAMES;
                            this.state = 'spawning';
                        }
                    }
                }
                break;
        }
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

    render(ctx, nextCtx) {
        const cs = this.CELL_SIZE;

        // Adjust cell size to fit the canvas area
        // Dr. Mario is 8x16, so we scale up
        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;
        const drawCS = Math.min(cw / this.COLS, ch / this.ROWS);
        const offsetX = (cw - this.COLS * drawCS) / 2;
        const offsetY = (ch - this.ROWS * drawCS) / 2;

        // Clear
        ctx.fillStyle = '#0C0C0C';
        ctx.fillRect(0, 0, cw, ch);

        // Draw bottle outline
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX - 2, offsetY - 2, this.COLS * drawCS + 4, this.ROWS * drawCS + 4);

        // Bottle neck (opening at top center)
        const neckWidth = 2 * drawCS;
        const neckX = offsetX + (this.COLS * drawCS - neckWidth) / 2;
        ctx.fillStyle = '#0C0C0C';
        ctx.fillRect(neckX, offsetY - 12, neckWidth, 12);
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(neckX, offsetY);
        ctx.lineTo(neckX, offsetY - 12);
        ctx.lineTo(neckX + neckWidth, offsetY - 12);
        ctx.lineTo(neckX + neckWidth, offsetY);
        ctx.stroke();

        // Draw grid
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 0.5;
        for (let r = 0; r <= this.ROWS; r++) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + r * drawCS);
            ctx.lineTo(offsetX + this.COLS * drawCS, offsetY + r * drawCS);
            ctx.stroke();
        }
        for (let c = 0; c <= this.COLS; c++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + c * drawCS, offsetY);
            ctx.lineTo(offsetX + c * drawCS, offsetY + this.ROWS * drawCS);
            ctx.stroke();
        }

        // Draw board cells
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const cell = this.board[r][c];
                if (!cell) continue;

                const px = offsetX + c * drawCS;
                const py = offsetY + r * drawCS;

                if (cell.type === 'virus') {
                    this.drawVirus(ctx, px, py, drawCS, cell.color);
                } else {
                    this.drawPillCell(ctx, px, py, drawCS, cell.color);
                }
            }
        }

        // Draw clearing animation
        if (this.state === 'clearing') {
            const flash = Math.floor(this.clearAnimFrames / 3) % 2 === 0;
            for (const [x, y] of this.clearingCells) {
                const px = offsetX + x * drawCS;
                const py = offsetY + y * drawCS;
                ctx.fillStyle = flash ? '#FCFCFC' : '#0C0C0C';
                ctx.fillRect(px + 1, py + 1, drawCS - 2, drawCS - 2);
            }
        }

        // Draw current pill
        if (this.hasPill && this.state === 'falling') {
            const cells = this.getPillCells();
            const colors = this.getPillColorAssignment();
            for (let i = 0; i < cells.length; i++) {
                const [x, y] = cells[i];
                if (y >= 0) {
                    const px = offsetX + x * drawCS;
                    const py = offsetY + y * drawCS;
                    this.drawPillCell(ctx, px, py, drawCS, colors[i]);
                }
            }
        }

        // Draw next pill preview
        if (nextCtx) {
            nextCtx.fillStyle = '#000';
            nextCtx.fillRect(0, 0, 80, 80);
            if (this.nextPillColors) {
                const previewCS = 20;
                const ox = (80 - 2 * previewCS) / 2;
                const oy = (80 - previewCS) / 2;
                this.drawPillCell(nextCtx, ox, oy, previewCS, this.nextPillColors[0]);
                this.drawPillCell(nextCtx, ox + previewCS, oy, previewCS, this.nextPillColors[1]);
            }
        }
    }

    drawPillCell(ctx, px, py, cs, color) {
        const colorVal = this.COLOR_MAP[color] || color;
        ctx.fillStyle = colorVal;
        ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(px + 1, py + 1, cs - 2, 2);
        ctx.fillRect(px + 1, py + 1, 2, cs - 2);

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(px + 1, py + cs - 3, cs - 2, 2);
        ctx.fillRect(px + cs - 3, py + 1, 2, cs - 2);

        // Pill shine
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(px + 3, py + 3, 4, 3);
    }

    drawVirus(ctx, px, py, cs, color) {
        const colorVal = this.VIRUS_COLORS[color] || color;

        // Virus body (circle-ish)
        const cx = px + cs / 2;
        const cy = py + cs / 2;
        const r = cs / 2 - 2;

        ctx.fillStyle = colorVal;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Animated face based on frame
        const frame = Math.floor(this.frameCount / 30) % 2;

        // Eyes
        ctx.fillStyle = '#FCFCFC';
        const eyeOff = r * 0.3;
        const eyeR = r * 0.2;
        ctx.beginPath();
        ctx.arc(cx - eyeOff, cy - eyeR, eyeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + eyeOff, cy - eyeR, eyeR, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#000';
        const pupR = eyeR * 0.6;
        const pupOff = frame === 0 ? 0 : pupR * 0.5;
        ctx.beginPath();
        ctx.arc(cx - eyeOff + pupOff, cy - eyeR, pupR, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + eyeOff + pupOff, cy - eyeR, pupR, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        if (frame === 0) {
            // Smile
            ctx.beginPath();
            ctx.arc(cx, cy + eyeR * 0.5, r * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
        } else {
            // Open mouth
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(cx, cy + r * 0.2, r * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
