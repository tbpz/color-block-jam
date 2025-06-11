// Color Block Jam - Game Logic
class ColorBlockJam {
    constructor() {
        this.board = [];
        this.shapes = [];
        this.gates = [];
        this.currentDragShape = null;
        this.dragOffset = { x: 0, y: 0 };
        this.cellSize = 35;
        this.boardSize = 8;
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink'];
        this.shapePatterns = {
            unit: [[[1]]],
            long2: [[[1, 1]], [[1], [1]]],
            long3: [[[1, 1, 1]], [[1], [1], [1]]],
            square: [[[1, 1], [1, 1]]],
            lShape: [
                [[1, 0], [1, 0], [1, 1]],
                [[1, 1, 1], [1, 0, 0]],
                [[1, 1], [0, 1], [0, 1]],
                [[0, 0, 1], [1, 1, 1]]
            ],
            tShape: [
                [[1, 1, 1], [0, 1, 0]],
                [[0, 1], [1, 1], [0, 1]],
                [[0, 1, 0], [1, 1, 1]],
                [[1, 0], [1, 1], [1, 0]]
            ]
        };
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.generateLevel();
        this.setupEventListeners();
    }
    
    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                gameBoard.appendChild(cell);
                this.board[row][col] = { element: cell, occupied: false, shapeId: null };
            }
        }
    }
    
    generateLevel() {
        this.clearShapes();
        this.clearGates();
        
        const numShapes = 3 + Math.floor(Math.random() * 5); // 3-7 shapes
        const numColors = Math.min(3 + Math.floor(Math.random() * 4), numShapes); // 3-6 colors, max = numShapes
        const selectedColors = this.colors.slice(0, numColors);
        
        const shapeCounts = {};
        selectedColors.forEach(color => shapeCounts[color] = 0);
        
        // Generate shapes with color distribution
        for (let i = 0; i < numShapes; i++) {
            const availableColors = selectedColors.filter(color => 
                shapeCounts[color] < Math.ceil(numShapes / numColors) + 1
            );
            const color = availableColors.length > 0 ? 
                availableColors[Math.floor(Math.random() * availableColors.length)] : 
                selectedColors[Math.floor(Math.random() * selectedColors.length)];
            
            shapeCounts[color]++;
            this.createRandomShape(color);
        }
        
        // Generate gates strategically
        this.generateGates(selectedColors);
    }
    
    createRandomShape(color) {
        const patterns = Object.values(this.shapePatterns).flat();
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 50) {
            const startRow = Math.floor(Math.random() * (this.boardSize - pattern.length + 1));
            const startCol = Math.floor(Math.random() * (this.boardSize - pattern[0].length + 1));
            
            if (this.canPlaceShape(pattern, startRow, startCol)) {
                this.placeShape(pattern, startRow, startCol, color);
                placed = true;
            }
            attempts++;
        }
    }
    
    canPlaceShape(pattern, startRow, startCol) {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const boardRow = startRow + row;
                    const boardCol = startCol + col;
                    
                    if (boardRow >= this.boardSize || boardCol >= this.boardSize || 
                        this.board[boardRow][boardCol].occupied) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placeShape(pattern, startRow, startCol, color) {
        const shapeId = 'shape-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const gameBoard = document.getElementById('gameBoard');
        
        // Create shape container
        const shapeContainer = document.createElement('div');
        shapeContainer.className = 'shape-container';
        shapeContainer.dataset.shapeId = shapeId;
        shapeContainer.dataset.color = color;
        shapeContainer.style.position = 'absolute';
        
        // Calculate container bounds
        let minRow = pattern.length, minCol = pattern[0].length;
        let maxRow = -1, maxCol = -1;
        
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    minRow = Math.min(minRow, row);
                    minCol = Math.min(minCol, col);
                    maxRow = Math.max(maxRow, row);
                    maxCol = Math.max(maxCol, col);
                }
            }
        }
        
        const containerWidth = (maxCol - minCol + 1) * (this.cellSize + 2);
        const containerHeight = (maxRow - minRow + 1) * (this.cellSize + 2);
        const containerLeft = startCol * (this.cellSize + 2) + 8;
        const containerTop = startRow * (this.cellSize + 2) + 8;
        
        shapeContainer.style.left = containerLeft + 'px';
        shapeContainer.style.top = containerTop + 'px';
        shapeContainer.style.width = containerWidth + 'px';
        shapeContainer.style.height = containerHeight + 'px';
        
        // Create invisible overlay for better click detection
        const overlay = document.createElement('div');
        overlay.className = 'shape-overlay';
        shapeContainer.appendChild(overlay);
        
        // Create blocks
        const blocks = [];
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const block = document.createElement('div');
                    block.className = `shape-block color-${color}`;
                    block.dataset.shapeId = shapeId;
                    block.dataset.localRow = row;
                    block.dataset.localCol = col;
                    
                    const blockLeft = (col - minCol) * (this.cellSize + 2);
                    const blockTop = (row - minRow) * (this.cellSize + 2);
                    block.style.left = blockLeft + 'px';
                    block.style.top = blockTop + 'px';
                    
                    shapeContainer.appendChild(block);
                    blocks.push(block);
                    
                    // Mark board cell as occupied
                    const boardRow = startRow + row;
                    const boardCol = startCol + col;
                    this.board[boardRow][boardCol].occupied = true;
                    this.board[boardRow][boardCol].shapeId = shapeId;
                }
            }
        }
        
        gameBoard.appendChild(shapeContainer);
        
        this.shapes.push({
            id: shapeId,
            color: color,
            pattern: pattern,
            container: shapeContainer,
            blocks: blocks,
            row: startRow,
            col: startCol,
            minRow: minRow,
            minCol: minCol,
            maxRow: maxRow,
            maxCol: maxCol
        });
    }
    
    generateGates(colors) {
        const sides = ['top', 'bottom', 'left', 'right'];
        const usedPositions = new Set();
        
        colors.forEach(color => {
            const colorShapes = this.shapes.filter(shape => shape.color === color);
            const maxEdgeLength = Math.max(...colorShapes.map(shape => this.getShapeEdgeSpan(shape.pattern)));
            
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 20) {
                const side = sides[Math.floor(Math.random() * sides.length)];
                let position, length;
                
                if (side === 'top' || side === 'bottom') {
                    length = Math.min(maxEdgeLength, 3 + Math.floor(Math.random() * 3));
                    position = Math.floor(Math.random() * (this.boardSize - length + 1));
                } else {
                    length = Math.min(maxEdgeLength, 3 + Math.floor(Math.random() * 3));
                    position = Math.floor(Math.random() * (this.boardSize - length + 1));
                }
                
                const positionKey = `${side}-${position}-${length}`;
                
                if (!usedPositions.has(positionKey)) {
                    this.createGate(side, position, length, color);
                    usedPositions.add(positionKey);
                    placed = true;
                }
                attempts++;
            }
        });
    }
    
    getShapeEdgeSpan(pattern) {
        let maxSpan = 1;
        
        // Check top edge
        let topBlocks = 0;
        for (let col = 0; col < pattern[0].length; col++) {
            if (pattern[0][col] === 1) topBlocks++;
        }
        maxSpan = Math.max(maxSpan, topBlocks);
        
        // Check bottom edge
        let bottomBlocks = 0;
        const lastRow = pattern.length - 1;
        for (let col = 0; col < pattern[lastRow].length; col++) {
            if (pattern[lastRow][col] === 1) bottomBlocks++;
        }
        maxSpan = Math.max(maxSpan, bottomBlocks);
        
        // Check left edge
        let leftBlocks = 0;
        for (let row = 0; row < pattern.length; row++) {
            if (pattern[row][0] === 1) leftBlocks++;
        }
        maxSpan = Math.max(maxSpan, leftBlocks);
        
        // Check right edge
        let rightBlocks = 0;
        const lastCol = pattern[0].length - 1;
        for (let row = 0; row < pattern.length; row++) {
            if (pattern[row][lastCol] === 1) rightBlocks++;
        }
        maxSpan = Math.max(maxSpan, rightBlocks);
        
        return maxSpan;
    }
    
    createGate(side, position, length, color) {
        const gameBoard = document.getElementById('gameBoard');
        const gate = document.createElement('div');
        gate.className = `gate ${side} gate-${color}`;
        gate.dataset.color = color;
        gate.dataset.length = length;
        gate.textContent = length;
        
        const cellSizeWithGap = this.cellSize + 2;
        
        if (side === 'top' || side === 'bottom') {
            gate.style.left = (position * cellSizeWithGap + 8) + 'px';
            gate.style.width = (length * cellSizeWithGap - 2) + 'px';
        } else {
            gate.style.top = (position * cellSizeWithGap + 8) + 'px';
            gate.style.height = (length * cellSizeWithGap - 2) + 'px';
        }
        
        gameBoard.appendChild(gate);
        this.gates.push({ element: gate, side, position, length, color });
    }
    
    calculateActualEdgeLength(shape, movementDirection) {
        const pattern = shape.pattern;
        
        switch (movementDirection) {
            case 'up':
                let topBlocks = 0;
                for (let col = 0; col < pattern[0].length; col++) {
                    if (pattern[0][col] === 1) topBlocks++;
                }
                return topBlocks;
            
            case 'down':
                let bottomBlocks = 0;
                const lastRow = pattern.length - 1;
                for (let col = 0; col < pattern[lastRow].length; col++) {
                    if (pattern[lastRow][col] === 1) bottomBlocks++;
                }
                return bottomBlocks;
            
            case 'left':
                let leftBlocks = 0;
                for (let row = 0; row < pattern.length; row++) {
                    if (pattern[row][0] === 1) leftBlocks++;
                }
                return leftBlocks;
            
            case 'right':
                let rightBlocks = 0;
                const lastCol = pattern[0].length - 1;
                for (let row = 0; row < pattern.length; row++) {
                    if (pattern[row][lastCol] === 1) rightBlocks++;
                }
                return rightBlocks;
            
            default:
                return 1;
        }
    }
    
    setupEventListeners() {
        const gameBoard = document.getElementById('gameBoard');
        const resetBtn = document.getElementById('resetBtn');
        const replayBtn = document.getElementById('replayBtn');
        
        // Mouse events
        gameBoard.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        document.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        document.addEventListener('mouseup', (e) => this.handlePointerUp(e));
        
        // Touch events
        gameBoard.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e.touches[0]);
        });
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e.touches[0]);
        });
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handlePointerUp(e.changedTouches[0]);
        });
        
        resetBtn.addEventListener('click', () => this.generateLevel());
        replayBtn.addEventListener('click', () => {
            document.getElementById('congratulationOverlay').classList.remove('show');
            this.generateLevel();
        });
    }
    
    handlePointerDown(e) {
        const target = e.target;
        let shapeContainer = null;
        
        // Check if clicked on shape block, overlay, or container
        if (target.classList.contains('shape-block')) {
            shapeContainer = target.parentElement;
        } else if (target.classList.contains('shape-overlay')) {
            shapeContainer = target.parentElement;
        } else if (target.classList.contains('shape-container')) {
            shapeContainer = target;
        }
        
        if (shapeContainer) {
            const shapeId = shapeContainer.dataset.shapeId;
            const shape = this.shapes.find(s => s.id === shapeId);
            
            if (shape && this.verifyShapeIntegrity(shape)) {
                this.startDragging(shape, e.clientX, e.clientY);
            }
        }
    }
    
    verifyShapeIntegrity(shape) {
        // Verify all blocks belong to this shape
        for (const block of shape.blocks) {
            if (!block.parentElement || block.dataset.shapeId !== shape.id) {
                console.warn('Shape integrity compromised, regenerating level');
                this.generateLevel();
                return false;
            }
        }
        return true;
    }
    
    verifyBlockBelongsToShape(block, expectedShapeId) {
        return block && 
               block.parentElement && 
               block.dataset && 
               block.dataset.shapeId === expectedShapeId;
    }
    
    startDragging(shape, clientX, clientY) {
        this.currentDragShape = shape;
        const containerRect = shape.container.getBoundingClientRect();
        
        this.dragOffset = {
            x: clientX - containerRect.left,
            y: clientY - containerRect.top
        };
        
        shape.container.classList.add('dragging');
        this.clearShapeFromBoard(shape);
    }
    
    handlePointerMove(e) {
        if (!this.currentDragShape) return;
        
        const gameBoard = document.getElementById('gameBoard');
        const boardRect = gameBoard.getBoundingClientRect();
        
        const newLeft = e.clientX - boardRect.left - this.dragOffset.x;
        const newTop = e.clientY - boardRect.top - this.dragOffset.y;
        
        this.currentDragShape.container.style.left = newLeft + 'px';
        this.currentDragShape.container.style.top = newTop + 'px';
    }
    
    handlePointerUp(e) {
        if (!this.currentDragShape) return;
        
        const shape = this.currentDragShape;
        const gameBoard = document.getElementById('gameBoard');
        const boardRect = gameBoard.getBoundingClientRect();
        
        const containerRect = shape.container.getBoundingClientRect();
        const relativeLeft = containerRect.left - boardRect.left - 8;
        const relativeTop = containerRect.top - boardRect.top - 8;
        
        const cellSizeWithGap = this.cellSize + 2;
        const newCol = Math.round(relativeLeft / cellSizeWithGap);
        const newRow = Math.round(relativeTop / cellSizeWithGap);
        
        // Check for gate collision first
        const gateCollision = this.checkGateCollision(shape, newRow, newCol);
        
        if (gateCollision.collided) {
            // Shape passes through gate - remove it
            this.removeShape(shape);
            this.checkWinCondition();
        } else if (this.canPlaceShapeAt(shape, newRow, newCol)) {
            // Valid placement on board
            this.placeShapeAt(shape, newRow, newCol);
        } else {
            // Invalid placement - return to original position
            this.returnShapeToOriginalPosition(shape);
        }
        
        shape.container.classList.remove('dragging');
        this.currentDragShape = null;
    }
    
    checkGateCollision(shape, newRow, newCol) {
        const gameBoard = document.getElementById('gameBoard');
        const boardRect = gameBoard.getBoundingClientRect();
        
        // Collect all colliding gates
        const collidingGates = [];
        
        this.gates.forEach(gate => {
            const gateRect = gate.element.getBoundingClientRect();
            const shapeRect = shape.container.getBoundingClientRect();
            
            // Check for overlap
            if (!(gateRect.right < shapeRect.left || 
                  gateRect.left > shapeRect.right || 
                  gateRect.bottom < shapeRect.top || 
                  gateRect.top > shapeRect.bottom)) {
                collidingGates.push(gate);
            }
        });
        
        if (collidingGates.length === 0) {
            return { collided: false };
        }
        
        // Determine movement direction
        const deltaRow = newRow - shape.row;
        const deltaCol = newCol - shape.col;
        let movementDirection;
        
        if (Math.abs(deltaRow) > Math.abs(deltaCol)) {
            movementDirection = deltaRow > 0 ? 'down' : 'up';
        } else {
            movementDirection = deltaCol > 0 ? 'right' : 'left';
        }
        
        // Prioritize gates based on movement direction
        const prioritizedGates = collidingGates.map(gate => {
            let priority = 1; // Default priority
            
            // Higher priority for gates matching movement direction
            if ((movementDirection === 'up' && gate.side === 'top') ||
                (movementDirection === 'down' && gate.side === 'bottom') ||
                (movementDirection === 'left' && gate.side === 'left') ||
                (movementDirection === 'right' && gate.side === 'right')) {
                priority = 3; // Primary direction
            } else if ((movementDirection === 'up' && gate.side === 'bottom') ||
                       (movementDirection === 'down' && gate.side === 'top') ||
                       (movementDirection === 'left' && gate.side === 'right') ||
                       (movementDirection === 'right' && gate.side === 'left')) {
                priority = 2; // Secondary direction
            }
            
            return { gate, priority };
        });
        
        // Sort by priority (highest first)
        prioritizedGates.sort((a, b) => b.priority - a.priority);
        
        // Check the highest priority gate
        const { gate } = prioritizedGates[0];
        
        // Check color match
        if (gate.color !== shape.color) {
            return { collided: false };
        }
        
        // Check size compatibility using actual edge length
        const actualEdgeLength = this.calculateActualEdgeLength(shape, movementDirection);
        
        if (actualEdgeLength <= gate.length) {
            return { collided: true, gate: gate };
        }
        
        return { collided: false };
    }
    
    canPlaceShapeAt(shape, newRow, newCol) {
        const pattern = shape.pattern;
        
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const boardRow = newRow + row - shape.minRow;
                    const boardCol = newCol + col - shape.minCol;
                    
                    if (boardRow < 0 || boardRow >= this.boardSize ||
                        boardCol < 0 || boardCol >= this.boardSize ||
                        this.board[boardRow][boardCol].occupied) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placeShapeAt(shape, newRow, newCol) {
        const pattern = shape.pattern;
        const cellSizeWithGap = this.cellSize + 2;
        
        // Update shape position
        shape.row = newRow;
        shape.col = newCol;
        
        // Update container position
        shape.container.style.left = (newCol * cellSizeWithGap + 8) + 'px';
        shape.container.style.top = (newRow * cellSizeWithGap + 8) + 'px';
        
        // Mark board cells as occupied
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const boardRow = newRow + row - shape.minRow;
                    const boardCol = newCol + col - shape.minCol;
                    this.board[boardRow][boardCol].occupied = true;
                    this.board[boardRow][boardCol].shapeId = shape.id;
                }
            }
        }
    }
    
    returnShapeToOriginalPosition(shape) {
        const cellSizeWithGap = this.cellSize + 2;
        shape.container.style.left = (shape.col * cellSizeWithGap + 8) + 'px';
        shape.container.style.top = (shape.row * cellSizeWithGap + 8) + 'px';
        
        // Re-mark original cells as occupied
        const pattern = shape.pattern;
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const boardRow = shape.row + row - shape.minRow;
                    const boardCol = shape.col + col - shape.minCol;
                    this.board[boardRow][boardCol].occupied = true;
                    this.board[boardRow][boardCol].shapeId = shape.id;
                }
            }
        }
    }
    
    clearShapeFromBoard(shape) {
        const pattern = shape.pattern;
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const boardRow = shape.row + row - shape.minRow;
                    const boardCol = shape.col + col - shape.minCol;
                    if (boardRow >= 0 && boardRow < this.boardSize && 
                        boardCol >= 0 && boardCol < this.boardSize) {
                        this.board[boardRow][boardCol].occupied = false;
                        this.board[boardRow][boardCol].shapeId = null;
                    }
                }
            }
        }
    }
    
    removeShape(shape) {
        // Remove from DOM
        shape.container.remove();
        
        // Remove from shapes array
        const index = this.shapes.findIndex(s => s.id === shape.id);
        if (index !== -1) {
            this.shapes.splice(index, 1);
        }
    }
    
    clearShapes() {
        // Clear from DOM
        const containers = document.querySelectorAll('.shape-container');
        containers.forEach(container => container.remove());
        
        // Clear from board
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col].occupied = false;
                this.board[row][col].shapeId = null;
            }
        }
        
        // Clear shapes array
        this.shapes = [];
    }
    
    clearGates() {
        const gates = document.querySelectorAll('.gate');
        gates.forEach(gate => gate.remove());
        this.gates = [];
    }
    
    checkWinCondition() {
        if (this.shapes.length === 0) {
            setTimeout(() => {
                document.getElementById('congratulationOverlay').classList.add('show');
            }, 500);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ColorBlockJam();
}); 