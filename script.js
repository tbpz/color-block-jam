// Color Block Jam - 8x8 Grid with Enhanced Draggable Shapes
class ColorBlockJam {
    constructor() {
        this.gridSize = 8;
        this.gameBoard = document.getElementById('gameBoard');
        this.congratulationOverlay = document.getElementById('congratulationOverlay');
        this.grid = [];
        this.shapes = [];
        
        // Game configuration (will be randomized)
        this.numShapes = 5;
        this.numColors = 4;
        this.availableColors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
        
        // Drag state
        this.isDragging = false;
        this.draggedShape = null;
        this.dragOffset = { x: 0, y: 0 };
        this.originalPosition = { startRow: 0, startCol: 0 };
        this.hoveredShape = null;
        this.dragContainer = null;
        this.clickedBlockOffset = null;
        
        // Define all shape patterns and their rotations
        this.shapeDefinitions = this.defineAllShapes();
        
        this.init();
        this.setupButtons();
    }
    
    init() {
        this.randomizeGameConfiguration();
        this.createGrid();
        this.createRandomShapes();
        this.createRandomGates();
        this.setupDragAndDrop();
        console.log(`8x8 Grid created with ${this.numShapes} shapes, ${this.numColors} colors`);
    }
    
    randomizeGameConfiguration() {
        // Randomize number of shapes (3-7)
        this.numShapes = Math.floor(Math.random() * 5) + 3;
        
        // Randomize number of colors (3-6, but not more than available colors)
        this.numColors = Math.floor(Math.random() * 4) + 3;
        this.numColors = Math.min(this.numColors, this.availableColors.length);
        
        // Select random colors
        const shuffledColors = [...this.availableColors].sort(() => Math.random() - 0.5);
        this.gameColors = shuffledColors.slice(0, this.numColors);
        
        console.log(`Game config: ${this.numShapes} shapes, ${this.numColors} colors:`, this.gameColors);
    }
    
    setupButtons() {
        const resetBtn = document.getElementById('resetBtn');
        const replayBtn = document.getElementById('replayBtn');
        
        resetBtn.addEventListener('click', () => this.restartGame());
        replayBtn.addEventListener('click', () => this.restartGame());
    }
    
    restartGame() {
        // Hide congratulation overlay
        this.congratulationOverlay.classList.remove('show');
        
        // Reset all game state
        this.shapes = [];
        this.gates = [];
        this.isDragging = false;
        this.draggedShape = null;
        this.hoveredShape = null;
        
        // Clear the board
        this.gameBoard.innerHTML = '';
        
        // Start fresh
        this.init();
    }
    
    createGrid() {
        // Clear existing grid
        this.gameBoard.innerHTML = '';
        
        // Create 8x8 empty grid
        for (let row = 0; row < this.gridSize; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                this.gameBoard.appendChild(cell);
                this.grid[row][col] = {
                    element: cell,
                    isEmpty: true,
                    hasShape: false,
                    shapeColor: null,
                    shapeId: null
                };
            }
        }
        
        console.log(`Created empty ${this.gridSize}x${this.gridSize} grid`);
    }
    
    defineAllShapes() {
        return {
            unit: {
                name: 'Unit',
                patterns: [
                    [[1]] // 1x1
                ]
            },
            long2: {
                name: 'Long 1x2',
                patterns: [
                    [[1, 1]], // Horizontal
                    [[1], [1]] // Vertical
                ]
            },
            long3: {
                name: 'Long 1x3',
                patterns: [
                    [[1, 1, 1]], // Horizontal
                    [[1], [1], [1]] // Vertical
                ]
            },
            square: {
                name: 'Square',
                patterns: [
                    [[1, 1], [1, 1]] // 2x2
                ]
            },
            shortL: {
                name: 'Short L',
                patterns: [
                    [[1, 1], [1, 0]], // L shape
                    [[1, 0], [1, 1]], // Rotated 90°
                    [[0, 1], [1, 1]], // Rotated 180°
                    [[1, 1], [0, 1]]  // Rotated 270°
                ]
            },
            longL: {
                name: 'Long L',
                patterns: [
                    [[1, 0, 0], [1, 1, 1]], // L shape
                    [[1, 1], [1, 0], [1, 0]], // Rotated 90°
                    [[1, 1, 1], [0, 0, 1]], // Rotated 180°
                    [[0, 1], [0, 1], [1, 1]], // Rotated 270°
                    [[0, 0, 1], [1, 1, 1]], // Mirror L
                    [[1, 0], [1, 0], [1, 1]], // Mirror rotated 90°
                    [[1, 1, 1], [1, 0, 0]], // Mirror rotated 180°
                    [[1, 1], [0, 1], [0, 1]]  // Mirror rotated 270°
                ]
            },
            tShape: {
                name: 'T Shape',
                patterns: [
                    [[0, 1, 0], [1, 1, 1]], // T shape
                    [[1, 0], [1, 1], [1, 0]], // Rotated 90°
                    [[1, 1, 1], [0, 1, 0]], // Rotated 180°
                    [[0, 1], [1, 1], [0, 1]]  // Rotated 270°
                ]
            }
        };
    }
    
    createRandomShapes() {
        const shapeTypes = Object.keys(this.shapeDefinitions);
        
        // Randomly select shape types (can have duplicates)
        const selectedShapes = this.getRandomShapeTypes(shapeTypes, this.numShapes);
        
        for (let i = 0; i < this.numShapes; i++) {
            const shapeType = selectedShapes[i];
            const color = this.gameColors[i % this.gameColors.length]; // Cycle through colors
            const success = this.placeRandomShape(shapeType, color);
            
            if (success) {
                console.log(`Placed ${color} ${this.shapeDefinitions[shapeType].name}`);
            } else {
                console.log(`Failed to place ${color} ${this.shapeDefinitions[shapeType].name}`);
            }
        }
    }
    
    getRandomShapeTypes(shapeTypes, count) {
        const selected = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * shapeTypes.length);
            selected.push(shapeTypes[randomIndex]);
        }
        return selected;
    }
    
    placeRandomShape(shapeType, color) {
        const shapeDef = this.shapeDefinitions[shapeType];
        const patterns = shapeDef.patterns;
        
        // Try up to 50 random positions and orientations
        for (let attempt = 0; attempt < 50; attempt++) {
            // Random pattern (orientation)
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            
            // Random position
            const maxRow = this.gridSize - pattern.length;
            const maxCol = this.gridSize - pattern[0].length;
            
            if (maxRow < 0 || maxCol < 0) continue; // Pattern too big
            
            const startRow = Math.floor(Math.random() * (maxRow + 1));
            const startCol = Math.floor(Math.random() * (maxCol + 1));
            
            // Check if placement is valid (no overlap)
            if (this.canPlaceShape(pattern, startRow, startCol)) {
                this.placeShape(pattern, startRow, startCol, color, shapeType);
                return true;
            }
        }
        
        return false; // Failed to place shape
    }
    
    canPlaceShape(pattern, startRow, startCol, excludeShapeId = null) {
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const gridRow = startRow + row;
                    const gridCol = startCol + col;
                    
                    // Check bounds - but allow movement outside for gate collision
                    if (gridRow < -1 || gridCol < -1 || gridRow > this.gridSize || gridCol > this.gridSize) {
                        return false;
                    }
                    
                    // If within grid bounds, check for occupation
                    if (gridRow >= 0 && gridCol >= 0 && gridRow < this.gridSize && gridCol < this.gridSize) {
                        const cell = this.grid[gridRow][gridCol];
                        if (!cell.isEmpty && cell.shapeId !== excludeShapeId) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    
    placeShape(pattern, startRow, startCol, color, shapeType) {
        const shapeId = this.shapes.length;
        
        // Store shape info first
        const shape = {
            id: shapeId,
            type: shapeType,
            color: color,
            pattern: pattern,
            startRow: startRow,
            startCol: startCol,
            removed: false,
            active: true,
            overlay: null,
            element: null
        };
        this.shapes.push(shape);
        
        // Create unified shape element (connected blocks)
        this.createUnifiedShapeElement(shape);
        
        // Mark grid cells as occupied
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    const gridRow = startRow + row;
                    const gridCol = startCol + col;
                    
                    const cell = this.grid[gridRow][gridCol];
                    cell.isEmpty = false;
                    cell.hasShape = true;
                    cell.shapeColor = color;
                    cell.shapeId = shapeId;
                }
            }
        }
        
        // Create invisible overlay for easier dragging
        this.createShapeOverlay(shape);
    }

    // Create a unified shape element with connected blocks
    createUnifiedShapeElement(shape) {
        const shapeContainer = document.createElement('div');
        shapeContainer.className = `unified-shape shape-${shape.color}`;
        shapeContainer.dataset.shapeId = shape.id;
        
        // Position the container
        this.updateUnifiedShapePosition(shapeContainer, shape);
        
        // Create individual blocks within the container
        for (let row = 0; row < shape.pattern.length; row++) {
            for (let col = 0; col < shape.pattern[row].length; col++) {
                if (shape.pattern[row][col] === 1) {
                    const block = document.createElement('div');
                    block.className = 'shape-block-unified';
                    block.dataset.row = row;
                    block.dataset.col = col;
                    
                    // Position block within the container
                    const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
                    block.style.position = 'absolute';
                    block.style.left = `${col * cellSize}px`;
                    block.style.top = `${row * cellSize}px`;
                    block.style.width = `${cellSize}px`;
                    block.style.height = `${cellSize}px`;
                    
                    shapeContainer.appendChild(block);
                }
            }
        }
        
        // Add to game board
        this.gameBoard.appendChild(shapeContainer);
        
        // Store reference
        shape.element = shapeContainer;
        
        console.log(`Created unified ${shape.color} ${shape.type} shape`);
    }

    // Update unified shape position
    updateUnifiedShapePosition(shapeContainer, shape) {
        const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
        const gapSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-size'));
        const boardPadding = 10;
        
        const startX = boardPadding + shape.startCol * (cellSize + gapSize);
        const startY = boardPadding + shape.startRow * (cellSize + gapSize);
        
        shapeContainer.style.position = 'absolute';
        shapeContainer.style.left = `${startX}px`;
        shapeContainer.style.top = `${startY}px`;
        shapeContainer.style.zIndex = '10';
        shapeContainer.style.cursor = 'grab';
    }
    
    placeShapeBlock(row, col, color, shapeId) {
        const cell = this.grid[row][col];
        
        // Create shape block element
        const shapeBlock = document.createElement('div');
        shapeBlock.className = `shape-block shape-${color}`;
        shapeBlock.dataset.shapeId = shapeId;
        
        // Add the block to the cell
        cell.element.appendChild(shapeBlock);
        
        // Update cell state
        cell.isEmpty = false;
        cell.hasShape = true;
        cell.shapeColor = color;
        cell.shapeId = shapeId;
        
        console.log(`Placed ${color} shape block at (${row}, ${col}) for shape ${shapeId}`);
    }
    
    // Create an invisible overlay for easier shape dragging
    createShapeOverlay(shape) {
        const overlay = document.createElement('div');
        overlay.className = 'shape-overlay';
        overlay.dataset.shapeId = shape.id;
        
        // Position the overlay to cover the shape's bounding box
        this.updateShapeOverlay(overlay, shape);
        
        // Add to the game board
        this.gameBoard.appendChild(overlay);
        
        // Store reference to overlay in shape
        shape.overlay = overlay;
        
        return overlay;
    }

    // Update shape overlay position and size
    updateShapeOverlay(overlay, shape) {
        const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
        const gapSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-size'));
        const boardPadding = 10; // padding around the grid
        
        // Calculate overlay position and size
        const startX = boardPadding + shape.startCol * (cellSize + gapSize);
        const startY = boardPadding + shape.startRow * (cellSize + gapSize);
        const width = shape.pattern[0].length * cellSize + (shape.pattern[0].length - 1) * gapSize;
        const height = shape.pattern.length * cellSize + (shape.pattern.length - 1) * gapSize;
        
        overlay.style.position = 'absolute';
        overlay.style.left = `${startX}px`;
        overlay.style.top = `${startY}px`;
        overlay.style.width = `${width}px`;
        overlay.style.height = `${height}px`;
        overlay.style.cursor = 'grab';
        overlay.style.zIndex = '5'; // Behind shape blocks but above grid
        overlay.style.pointerEvents = 'auto';
        
        // Make overlay transparent for clicking only
        overlay.style.backgroundColor = 'transparent';
        overlay.style.border = 'none';
        overlay.style.borderRadius = '0';
        overlay.style.boxShadow = 'none';
    }

    // Get RGB values for shape colors
    getShapeColorRGB(color) {
        const colorMap = {
            'red': '239, 68, 68',
            'green': '16, 185, 129', 
            'blue': '59, 130, 246',
            'yellow': '245, 158, 11',
            'purple': '139, 92, 246',
            'orange': '249, 115, 22',
            'pink': '236, 72, 153',
            'cyan': '6, 182, 212'
        };
        return colorMap[color] || '107, 114, 128'; // fallback gray
    }
    
    setupDragAndDrop() {
        // Add event listeners to the game board
        this.gameBoard.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.gameBoard.addEventListener('mouseover', (e) => this.handleMouseOver(e));
        this.gameBoard.addEventListener('mouseout', (e) => this.handleMouseOut(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    handleMouseOver(e) {
        if (this.isDragging) return;
        
        const target = e.target;
        if (target.classList.contains('shape-block')) {
            const shapeId = parseInt(target.dataset.shapeId);
            
            if (this.hoveredShape !== shapeId) {
                this.clearHoverEffect();
                this.hoveredShape = shapeId;
                this.addHoverEffect(shapeId);
            }
        }
    }
    
    handleMouseOut(e) {
        if (this.isDragging) return;
        
        const target = e.target;
        if (target.classList.contains('shape-block')) {
            // Check if we're still over the same shape
            const relatedTarget = e.relatedTarget;
            if (!relatedTarget || !relatedTarget.classList.contains('shape-block') || 
                parseInt(relatedTarget.dataset.shapeId) !== this.hoveredShape) {
                this.clearHoverEffect();
                this.hoveredShape = null;
            }
        }
    }
    
    addHoverEffect(shapeId) {
        const shape = this.shapes.find(s => s.id === shapeId && !s.removed);
        if (!shape) return;
        
        // Only add hover effect to blocks that actually belong to this shape
        for (let row = 0; row < shape.pattern.length; row++) {
            for (let col = 0; col < shape.pattern[row].length; col++) {
                if (shape.pattern[row][col] === 1) {
                    const gridRow = shape.startRow + row;
                    const gridCol = shape.startCol + col;
                    
                    if (gridRow >= 0 && gridRow < this.gridSize && gridCol >= 0 && gridCol < this.gridSize) {
                        const cell = this.grid[gridRow][gridCol];
                        
                        // Double check that this cell actually belongs to the right shape
                        if (cell.shapeId === shapeId) {
                            const shapeBlock = cell.element.querySelector('.shape-block');
                            if (shapeBlock && parseInt(shapeBlock.dataset.shapeId) === shapeId) {
                                shapeBlock.classList.add('shape-hover');
                            }
                        }
                    }
                }
            }
        }
    }
    
    clearHoverEffect() {
        const hoveredBlocks = document.querySelectorAll('.shape-block.shape-hover');
        hoveredBlocks.forEach(block => block.classList.remove('shape-hover'));
    }
    
    handleMouseDown(e) {
        const target = e.target;
        
        // Check if we clicked on a unified shape or its child elements
        if (target.classList.contains('unified-shape') || target.classList.contains('shape-block-unified')) {
            e.preventDefault();
            
            // Get shape ID from the target or its parent
            let shapeElement = target.classList.contains('unified-shape') ? target : target.closest('.unified-shape');
            if (shapeElement) {
                const shapeId = parseInt(shapeElement.dataset.shapeId);
                const shape = this.shapes.find(s => s.id === shapeId && !s.removed);
                
                if (shape) {
                    this.startDragging(shape, e, shapeElement);
                }
            }
        }
        // Check if we clicked on a shape overlay (invisible drag area)
        else if (target.classList.contains('shape-overlay')) {
            e.preventDefault();
            
            const shapeId = parseInt(target.dataset.shapeId);
            const shape = this.shapes.find(s => s.id === shapeId && !s.removed);
            
            if (shape) {
                this.startDragging(shape, e, null);
            }
        }
        // Check if we clicked on an empty grid cell that might be within a shape's bounding area
        else if (target.classList.contains('grid-cell')) {
            e.preventDefault();
            
            const row = parseInt(target.dataset.row);
            const col = parseInt(target.dataset.col);
            
            // Find any shape that contains this cell within its bounding area
            const shape = this.findShapeContainingCell(row, col);
            if (shape) {
                this.startDragging(shape, e, null);
            }
        }
    }

    // Find a shape that contains the given cell within its bounding area
    findShapeContainingCell(clickRow, clickCol) {
        for (const shape of this.shapes) {
            if (shape.removed) continue;
            
            // Check if the click is within the shape's bounding area
            const shapeEndRow = shape.startRow + shape.pattern.length - 1;
            const shapeEndCol = shape.startCol + shape.pattern[0].length - 1;
            
            if (clickRow >= shape.startRow && clickRow <= shapeEndRow &&
                clickCol >= shape.startCol && clickCol <= shapeEndCol) {
                return shape;
            }
        }
        
        return null;
    }
    
    verifyBlockBelongsToShape(block, shape) {
        // Check if block and its parent element exist
        if (!block || !block.parentElement || !block.parentElement.dataset) {
            return false;
        }
        
        const blockRow = parseInt(block.parentElement.dataset.row);
        const blockCol = parseInt(block.parentElement.dataset.col);
        
        // Check if this block position matches the shape pattern
        const relativeRow = blockRow - shape.startRow;
        const relativeCol = blockCol - shape.startCol;
        
        if (relativeRow >= 0 && relativeRow < shape.pattern.length &&
            relativeCol >= 0 && relativeCol < shape.pattern[0].length) {
            return shape.pattern[relativeRow][relativeCol] === 1;
        }
        
        return false;
    }
    
    startDragging(shape, e, clickedBlock) {
        this.isDragging = true;
        this.draggedShape = shape;
        this.originalPosition = { startRow: shape.startRow, startCol: shape.startCol };
        
        // Clear any hover effects
        this.clearHoverEffect();
        this.hoveredShape = null;
        
        // Initialize last valid position
        this.lastValidPreviewPosition = { 
            startRow: shape.startRow, 
            startCol: shape.startCol 
        };
        
        // Remove the shape from the grid (it will be invisible during drag)
        this.removeShapeFromGrid(shape);
        
        // Calculate all reachable positions for this shape
        this.reachablePositions = this.calculateReachablePositions(shape);
        
        console.log(`Started dragging ${shape.color} ${shape.type} shape - preview mode with pathfinding`);
        console.log(`Found ${this.reachablePositions.size} reachable positions`);
    }
    
    calculateReachablePositions(shape) {
        const reachable = new Set();
        const visited = new Set();
        const queue = [{ row: shape.startRow, col: shape.startCol }];
        
        // Add starting position
        reachable.add(`${shape.startRow},${shape.startCol}`);
        visited.add(`${shape.startRow},${shape.startCol}`);
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Try moving in all 4 directions
            const directions = [
                { row: -1, col: 0 },  // Up
                { row: 1, col: 0 },   // Down
                { row: 0, col: -1 },  // Left
                { row: 0, col: 1 }    // Right
            ];
            
            for (const dir of directions) {
                const newRow = current.row + dir.row;
                const newCol = current.col + dir.col;
                const posKey = `${newRow},${newCol}`;
                
                // Skip if already visited
                if (visited.has(posKey)) continue;
                
                // Check if this position is valid and within bounds
                if (this.canPlaceShape(shape.pattern, newRow, newCol, shape.id)) {
                    reachable.add(posKey);
                    visited.add(posKey);
                    queue.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return reachable;
    }
    
    isPositionReachable(row, col) {
        const posKey = `${row},${col}`;
        return this.reachablePositions && this.reachablePositions.has(posKey);
    }
    
    removeShapeFromGrid(shape) {
        // Remove the unified shape element
        if (shape.element) {
            shape.element.remove();
        }
        
        // Clear grid data
        for (let row = 0; row < shape.pattern.length; row++) {
            for (let col = 0; col < shape.pattern[row].length; col++) {
                if (shape.pattern[row][col] === 1) {
                    const gridRow = shape.startRow + row;
                    const gridCol = shape.startCol + col;
                    
                    if (gridRow >= 0 && gridRow < this.gridSize && gridCol >= 0 && gridCol < this.gridSize) {
                        const cell = this.grid[gridRow][gridCol];
                        
                        // Only clear if it actually belongs to this shape
                        if (cell.shapeId === shape.id) {
                            cell.isEmpty = true;
                            cell.hasShape = false;
                            cell.shapeColor = null;
                            cell.shapeId = null;
                        }
                    }
                }
            }
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.draggedShape) return;
        
        e.preventDefault();
        this.updateShapePreview(e);
    }
    
    updateShapePreview(e) {
        // Clear any existing preview
        this.clearShapePreview();
        
        const boardRect = this.gameBoard.getBoundingClientRect();
        const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
        const gapSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-size'));
        
        // Calculate mouse position relative to board
        const mouseX = e.clientX - boardRect.left;
        const mouseY = e.clientY - boardRect.top;
        
        // Calculate which grid cell the mouse is over
        const targetCol = Math.round((mouseX - cellSize / 2) / (cellSize + gapSize));
        const targetRow = Math.round((mouseY - cellSize / 2) / (cellSize + gapSize));
        
        // Calculate shape's intended position based on its pattern (center the shape around the cursor)
        const shapeWidth = this.draggedShape.pattern[0].length;
        const shapeHeight = this.draggedShape.pattern.length;
        const intendedStartCol = Math.max(0, Math.min(this.gridSize - shapeWidth, targetCol - Math.floor(shapeWidth / 2)));
        const intendedStartRow = Math.max(0, Math.min(this.gridSize - shapeHeight, targetRow - Math.floor(shapeHeight / 2)));
        
        // Check if intended position is reachable through valid paths
        const isReachable = this.isPositionReachable(intendedStartRow, intendedStartCol);
        
        let previewStartRow, previewStartCol;
        
        if (isReachable) {
            // If the intended position is reachable, try to slide toward it naturally
            const slidePosition = this.slideTowardPosition(
                intendedStartRow, 
                intendedStartCol,
                this.lastValidPreviewPosition.startRow,
                this.lastValidPreviewPosition.startCol
            );
            previewStartRow = slidePosition.startRow;
            previewStartCol = slidePosition.startCol;
            this.lastValidPreviewPosition = { startRow: previewStartRow, startCol: previewStartCol };
        } else {
            // If intended position is not reachable, slide as far as possible in that direction
            const slidePosition = this.slideTowardPosition(
                intendedStartRow, 
                intendedStartCol,
                this.lastValidPreviewPosition.startRow,
                this.lastValidPreviewPosition.startCol
            );
            previewStartRow = slidePosition.startRow;
            previewStartCol = slidePosition.startCol;
        }
        
        // Show preview at the determined position (always valid and naturally reached)
        this.showShapePreview(previewStartRow, previewStartCol, true);
    }
    
    slideTowardPosition(targetRow, targetCol, currentRow, currentCol) {
        // Calculate the direction to move
        const deltaRow = targetRow - currentRow;
        const deltaCol = targetCol - currentCol;
        
        // If we're already at the target, return current position
        if (deltaRow === 0 && deltaCol === 0) {
            return { startRow: currentRow, startCol: currentCol };
        }
        
        // Determine step direction (prioritize the larger delta for more natural movement)
        let stepRow = 0;
        let stepCol = 0;
        
        if (Math.abs(deltaRow) >= Math.abs(deltaCol)) {
            // Move vertically first if vertical distance is greater or equal
            stepRow = deltaRow === 0 ? 0 : (deltaRow > 0 ? 1 : -1);
        } else {
            // Move horizontally first if horizontal distance is greater
            stepCol = deltaCol === 0 ? 0 : (deltaCol > 0 ? 1 : -1);
        }
        
        // If primary direction is blocked, try secondary direction
        let testRow = currentRow + stepRow;
        let testCol = currentCol + stepCol;
        
        // First try the primary direction
        if (this.isPositionReachable(testRow, testCol)) {
            return { startRow: testRow, startCol: testCol };
        }
        
        // If primary direction is blocked, try the secondary direction
        if (stepRow !== 0) {
            // Primary was vertical, try horizontal
            stepRow = 0;
            stepCol = deltaCol === 0 ? 0 : (deltaCol > 0 ? 1 : -1);
        } else {
            // Primary was horizontal, try vertical
            stepCol = 0;
            stepRow = deltaRow === 0 ? 0 : (deltaRow > 0 ? 1 : -1);
        }
        
        testRow = currentRow + stepRow;
        testCol = currentCol + stepCol;
        
        if (this.isPositionReachable(testRow, testCol)) {
            return { startRow: testRow, startCol: testCol };
        }
        
        // If both directions are blocked, stay in current position
        return { startRow: currentRow, startCol: currentCol };
    }
    
    findClosestReachablePosition(intendedRow, intendedCol) {
        // This method is now simplified since we handle sliding in slideTowardPosition
        return this.lastValidPreviewPosition;
    }
    
    showShapePreview(startRow, startCol, isValidPlacement) {
        for (let row = 0; row < this.draggedShape.pattern.length; row++) {
            for (let col = 0; col < this.draggedShape.pattern[row].length; col++) {
                if (this.draggedShape.pattern[row][col] === 1) {
                    const gridRow = startRow + row;
                    const gridCol = startCol + col;
                    
                    // Make sure we're within bounds
                    if (gridRow >= 0 && gridRow < this.gridSize && gridCol >= 0 && gridCol < this.gridSize) {
                        const cell = this.grid[gridRow][gridCol];
                        
                        // Create preview block
                        const previewBlock = document.createElement('div');
                        if (isValidPlacement) {
                            previewBlock.className = `shape-preview valid shape-${this.draggedShape.color}`;
                        } else {
                            previewBlock.className = 'shape-preview invalid';
                            previewBlock.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                        }
                        
                        cell.element.appendChild(previewBlock);
                    }
                }
            }
        }
    }
    
    clearShapePreview() {
        const previewBlocks = document.querySelectorAll('.shape-preview');
        previewBlocks.forEach(block => block.remove());
    }
    
    handleMouseUp(e) {
        if (!this.isDragging || !this.draggedShape) return;
        
        e.preventDefault();
        
        // Clear preview
        this.clearShapePreview();
        
        // Use the last valid preview position for final placement
        const finalRow = this.lastValidPreviewPosition.startRow;
        const finalCol = this.lastValidPreviewPosition.startCol;
        
        // Double-check that the position is still valid (should always be true)
        const canPlace = this.canPlaceShape(
            this.draggedShape.pattern, 
            finalRow, 
            finalCol, 
            this.draggedShape.id
        );
        
        if (canPlace) {
            // Commit the move
            this.commitShapeMove(finalRow, finalCol);
            console.log(`Moved ${this.draggedShape.color} shape to (${finalRow}, ${finalCol})`);
        } else {
            // This should rarely happen, but revert to original position if it does
            this.revertShapePosition();
            console.log(`Unexpected: Cannot place ${this.draggedShape.color} shape at preview position - reverted`);
        }
        
        // Clean up (only if shape wasn't already removed)
        if (this.draggedShape) {
            this.cleanupDrag();
        }
    }
    
    commitShapeMove(newStartRow, newStartCol) {
        // Check for gate collision before committing
        const gateCollision = this.checkGateCollision(this.draggedShape, newStartRow, newStartCol);
        
        if (gateCollision.collides && gateCollision.canPassThrough) {
            // Shape passes through gate - remove it from the game
            this.removeShapeFromGame(this.draggedShape);
            // Clean up drag state immediately
            this.cleanupDragAfterRemoval();
            return; // Don't place the shape, it's gone!
        }
        
        // Update shape position
        this.draggedShape.startRow = newStartRow;
        this.draggedShape.startCol = newStartCol;
        
        // Recreate the unified shape element at new position
        this.createUnifiedShapeElement(this.draggedShape);
        
        // Update grid cells
        for (let row = 0; row < this.draggedShape.pattern.length; row++) {
            for (let col = 0; col < this.draggedShape.pattern[row].length; col++) {
                if (this.draggedShape.pattern[row][col] === 1) {
                    const gridRow = newStartRow + row;
                    const gridCol = newStartCol + col;
                    
                    // Only update cells that are within grid bounds
                    if (gridRow >= 0 && gridCol >= 0 && gridRow < this.gridSize && gridCol < this.gridSize) {
                        const cell = this.grid[gridRow][gridCol];
                        cell.isEmpty = false;
                        cell.hasShape = true;
                        cell.shapeColor = this.draggedShape.color;
                        cell.shapeId = this.draggedShape.id;
                    }
                }
            }
        }
        
        // Update the shape overlay position
        if (this.draggedShape.overlay) {
            this.updateShapeOverlay(this.draggedShape.overlay, this.draggedShape);
        }
    }
    
    revertShapePosition() {
        // Restore original shape position
        this.draggedShape.startRow = this.originalPosition.startRow;
        this.draggedShape.startCol = this.originalPosition.startCol;
        
        // Place shape blocks back in original positions (create fresh blocks)
        for (let row = 0; row < this.draggedShape.pattern.length; row++) {
            for (let col = 0; col < this.draggedShape.pattern[row].length; col++) {
                if (this.draggedShape.pattern[row][col] === 1) {
                    const gridRow = this.originalPosition.startRow + row;
                    const gridCol = this.originalPosition.startCol + col;
                    
                    // Create new block at the original position
                    this.placeShapeBlock(gridRow, gridCol, this.draggedShape.color, this.draggedShape.id);
                }
            }
        }
    }
    
    cleanupDrag() {
        // Clear any remaining preview
        this.clearShapePreview();
        
        // Remove drag container if it exists
        if (this.dragContainer && this.dragContainer.parentNode) {
            this.dragContainer.parentNode.removeChild(this.dragContainer);
        }
        
        // Clear reachable positions
        this.reachablePositions = null;
        
        // Reset drag state
        this.isDragging = false;
        this.draggedShape = null;
        this.dragContainer = null;
        this.clickedBlockOffset = null;
        this.originalPosition = { startRow: 0, startCol: 0 };
        this.lastValidPreviewPosition = null;
    }
    
    cleanupDragAfterRemoval() {
        // Clear any remaining preview
        this.clearShapePreview();
        
        // Remove drag container if it exists
        if (this.dragContainer && this.dragContainer.parentNode) {
            this.dragContainer.parentNode.removeChild(this.dragContainer);
        }
        
        // Clear reachable positions
        this.reachablePositions = null;
        
        // Reset all drag-related state immediately
        this.isDragging = false;
        this.draggedShape = null;
        this.dragContainer = null;
        this.clickedBlockOffset = null;
        this.originalPosition = { startRow: 0, startCol: 0 };
        this.lastValidPreviewPosition = null;
        this.hoveredShape = null;
        
        console.log('Drag state cleaned up after shape removal');
    }
    
    createRandomGates() {
        this.gates = [];
        
        // Track occupied border positions
        this.borderOccupied = {
            top: new Set(),
            bottom: new Set(),
            left: new Set(),
            right: new Set()
        };
        
        // Analyze shapes by color to determine gate requirements
        const colorAnalysis = this.analyzeShapesByColor();
        
        // Create gates based on analysis
        this.createStrategicGates(colorAnalysis);
    }
    
    analyzeShapesByColor() {
        const colorData = {};
        
        // Analyze each active shape
        for (const shape of this.shapes) {
            if (shape.removed) continue;
            
            const color = shape.color;
            if (!colorData[color]) {
                colorData[color] = {
                    count: 0,
                    shapes: [],
                    maxWidth: 0,
                    maxHeight: 0
                };
            }
            
            colorData[color].count++;
            colorData[color].shapes.push(shape);
            
            // Calculate bounding box for this shape
            const boundingBox = this.calculateShapeBoundingBox(shape.pattern);
            colorData[color].maxWidth = Math.max(colorData[color].maxWidth, boundingBox.width);
            colorData[color].maxHeight = Math.max(colorData[color].maxHeight, boundingBox.height);
        }
        
        console.log('Shape analysis by color:', colorData);
        return colorData;
    }
    
    createStrategicGates(colorAnalysis) {
        const borders = ['top', 'bottom', 'left', 'right'];
        const usedBorders = new Set();
        
        // Create gates for each color present in the game
        for (const [color, data] of Object.entries(colorAnalysis)) {
            // Determine required gate sizes for this color
            const requiredHorizontalSize = data.maxWidth;  // For top/bottom gates
            const requiredVerticalSize = data.maxHeight;   // For left/right gates
            
            // Try to create at least one gate that can fit the largest shape of this color
            let gateCreated = false;
            
            // Try each border until we successfully place a gate
            for (const border of borders) {
                // Skip if this border type is already used (avoid redundancy)
                if (usedBorders.has(border)) continue;
                
                let gateLength;
                if (border === 'top' || border === 'bottom') {
                    gateLength = requiredHorizontalSize;
                } else {
                    gateLength = requiredVerticalSize;
                }
                
                // Try to place the gate
                const success = this.placeStrategicGate(color, border, gateLength);
                if (success) {
                    usedBorders.add(border);
                    gateCreated = true;
                    console.log(`Created ${color} gate on ${border} border with length ${gateLength}`);
                    break;
                }
            }
            
            // If we couldn't place on preferred borders, try any available border
            if (!gateCreated) {
                for (const border of borders) {
                    let gateLength;
                    if (border === 'top' || border === 'bottom') {
                        gateLength = requiredHorizontalSize;
                    } else {
                        gateLength = requiredVerticalSize;
                    }
                    
                    const success = this.placeStrategicGate(color, border, gateLength);
                    if (success) {
                        gateCreated = true;
                        console.log(`Created ${color} gate on ${border} border with length ${gateLength} (fallback)`);
                        break;
                    }
                }
            }
            
            if (!gateCreated) {
                console.warn(`Failed to create gate for ${color} shapes!`);
            }
        }
    }
    
    placeStrategicGate(color, border, requiredLength) {
        const maxAttempts = 20;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Try to place gate with the exact required length first
            const maxPosition = this.gridSize - requiredLength;
            if (maxPosition < 0) continue; // Gate too big for this border
            
            const position = Math.floor(Math.random() * (maxPosition + 1));
            
            // Check if this position is available
            if (this.canPlaceGate(border, position, requiredLength)) {
                this.createGate(border, position, requiredLength, color);
                return true;
            }
        }
        
        return false;
    }
    
    canPlaceGate(border, position, length) {
        const occupied = this.borderOccupied[border];
        
        // Check if any position in the range is already occupied
        for (let i = position; i < position + length; i++) {
            if (occupied.has(i)) {
                return false;
            }
        }
        
        return true;
    }
    
    createGate(border, position, length, color) {
        const cellSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-size'));
        const gapSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap-size'));
        const boardPadding = 10; // Game board has 10px padding
        
        // Create gate element
        const gate = document.createElement('div');
        gate.className = `gate gate-${color}`;
        
        // Calculate gate dimensions and position based on border
        if (border === 'top') {
            gate.classList.add('horizontal', 'top');
            const gateWidth = length * cellSize + (length - 1) * gapSize;
            gate.style.width = `${gateWidth}px`;
            gate.style.left = `${boardPadding + position * (cellSize + gapSize)}px`;
            
        } else if (border === 'bottom') {
            gate.classList.add('horizontal', 'bottom');
            const gateWidth = length * cellSize + (length - 1) * gapSize;
            gate.style.width = `${gateWidth}px`;
            gate.style.left = `${boardPadding + position * (cellSize + gapSize)}px`;
            
        } else if (border === 'left') {
            gate.classList.add('vertical', 'left');
            const gateHeight = length * cellSize + (length - 1) * gapSize;
            gate.style.height = `${gateHeight}px`;
            gate.style.top = `${boardPadding + position * (cellSize + gapSize)}px`;
            
        } else if (border === 'right') {
            gate.classList.add('vertical', 'right');
            const gateHeight = length * cellSize + (length - 1) * gapSize;
            gate.style.height = `${gateHeight}px`;
            gate.style.top = `${boardPadding + position * (cellSize + gapSize)}px`;
        }
        
        // Add gate to the game board
        this.gameBoard.appendChild(gate);
        
        // Mark positions as occupied
        const occupied = this.borderOccupied[border];
        for (let i = position; i < position + length; i++) {
            occupied.add(i);
        }
        
        // Store gate info
        this.gates.push({
            border: border,
            position: position,
            length: length,
            color: color,
            element: gate
        });
        
        console.log(`Created ${color} gate on ${border} border at position ${position} with length ${length}`);
    }
    
    // Calculate the bounding box dimensions of a shape pattern
    calculateShapeBoundingBox(pattern) {
        if (!pattern || pattern.length === 0) return { width: 0, height: 0 };
        
        let minRow = pattern.length, maxRow = -1;
        let minCol = pattern[0].length, maxCol = -1;
        
        // Find the actual bounds of the shape
        for (let row = 0; row < pattern.length; row++) {
            for (let col = 0; col < pattern[row].length; col++) {
                if (pattern[row][col] === 1) {
                    minRow = Math.min(minRow, row);
                    maxRow = Math.max(maxRow, row);
                    minCol = Math.min(minCol, col);
                    maxCol = Math.max(maxCol, col);
                }
            }
        }
        
        const width = maxCol - minCol + 1;
        const height = maxRow - minRow + 1;
        
        return { width, height };
    }
    
    // Check if shape collides with any gate and can pass through
    checkGateCollision(shape, newStartRow, newStartCol) {
        const boundingBox = this.calculateShapeBoundingBox(shape.pattern);
        
        // Calculate movement direction to prioritize gate checking
        const deltaRow = newStartRow - shape.startRow;
        const deltaCol = newStartCol - shape.startCol;
        
        console.log(`Movement: deltaRow=${deltaRow}, deltaCol=${deltaCol}`);
        console.log('Available gates:', this.gates.map(g => `${g.color} gate on ${g.border}`));
        
        // Prioritize gates based on movement direction
        const prioritizedGates = this.prioritizeGatesByMovementDirection(deltaRow, deltaCol);
        
        console.log('Prioritized gate order:', prioritizedGates.map(g => `${g.color} gate on ${g.border}`));
        
        // First, find ALL colliding gates
        const collidingGates = [];
        for (const gate of this.gates) {
            const collision = this.detectShapeGateCollision(shape, newStartRow, newStartCol, gate, boundingBox);
            if (collision.collides) {
                collidingGates.push({ gate, collision });
                console.log(`Collision detected with ${gate.color} gate on ${gate.border}:`, collision);
            } else {
                console.log(`No collision with ${gate.color} gate on ${gate.border}`);
            }
        }
        
        // If no collisions, return
        if (collidingGates.length === 0) {
            console.log('No gate collisions detected');
            return { collides: false, canPassThrough: false, gate: null };
        }
        
        // Prioritize colliding gates by movement direction
        collidingGates.sort((a, b) => {
            const priorityA = this.getGatePriorityForMovement(a.gate, deltaRow, deltaCol);
            const priorityB = this.getGatePriorityForMovement(b.gate, deltaRow, deltaCol);
            return priorityB - priorityA; // Higher priority first
        });
        
        console.log('Colliding gates in priority order:', collidingGates.map(cg => `${cg.gate.color} gate on ${cg.gate.border}`));
        
        // Check the highest priority colliding gate
        const highestPriorityCollision = collidingGates[0];
        const canPassThrough = this.canShapePassThroughGate(
            highestPriorityCollision.collision, 
            highestPriorityCollision.gate, 
            boundingBox
        );
        
        if (canPassThrough) {
            console.log(`${shape.color} shape (${boundingBox.width}x${boundingBox.height}) passes through ${highestPriorityCollision.gate.color} gate (length ${highestPriorityCollision.gate.length}) - highest priority collision`);
            return { collides: true, canPassThrough: true, gate: highestPriorityCollision.gate };
        } else {
            console.log(`${shape.color} shape (${boundingBox.width}x${boundingBox.height}) blocked by ${highestPriorityCollision.gate.color} gate (length ${highestPriorityCollision.gate.length}) - highest priority collision`);
            return { collides: true, canPassThrough: false, gate: highestPriorityCollision.gate };
        }
        
        return { collides: false, canPassThrough: false, gate: null };
    }

    // Prioritize gates based on movement direction
    prioritizeGatesByMovementDirection(deltaRow, deltaCol) {
        const prioritizedGates = [...this.gates];
        
        // Sort gates by priority based on movement direction
        prioritizedGates.sort((gateA, gateB) => {
            const priorityA = this.getGatePriorityForMovement(gateA, deltaRow, deltaCol);
            const priorityB = this.getGatePriorityForMovement(gateB, deltaRow, deltaCol);
            
            // Higher priority number = checked first (descending order)
            return priorityB - priorityA;
        });
        
        return prioritizedGates;
    }

    // Get gate priority based on movement direction
    getGatePriorityForMovement(gate, deltaRow, deltaCol) {
        // Determine primary movement direction
        const absRow = Math.abs(deltaRow);
        const absCol = Math.abs(deltaCol);
        
        // If no movement, all gates have equal priority
        if (absRow === 0 && absCol === 0) return 1;
        
        let priority = 1; // Default priority
        
        // Primary direction gets highest priority (3)
        // Secondary direction gets medium priority (2) 
        // Other directions get low priority (1)
        
        if (absRow > absCol) {
            // Vertical movement is primary
            if (deltaRow < 0 && gate.border === 'top') priority = 3;      // Moving up
            if (deltaRow > 0 && gate.border === 'bottom') priority = 3;   // Moving down
            if (deltaCol < 0 && gate.border === 'left') priority = 2;     // Secondary: left
            if (deltaCol > 0 && gate.border === 'right') priority = 2;    // Secondary: right
        } else if (absCol > absRow) {
            // Horizontal movement is primary
            if (deltaCol < 0 && gate.border === 'left') priority = 3;     // Moving left
            if (deltaCol > 0 && gate.border === 'right') priority = 3;    // Moving right
            if (deltaRow < 0 && gate.border === 'top') priority = 2;      // Secondary: up
            if (deltaRow > 0 && gate.border === 'bottom') priority = 2;   // Secondary: down
        } else {
            // Equal movement in both directions - prioritize both primary directions
            if (deltaRow < 0 && gate.border === 'top') priority = 3;      // Moving up
            if (deltaRow > 0 && gate.border === 'bottom') priority = 3;   // Moving down
            if (deltaCol < 0 && gate.border === 'left') priority = 3;     // Moving left
            if (deltaCol > 0 && gate.border === 'right') priority = 3;    // Moving right
        }
        
        console.log(`Gate ${gate.color} on ${gate.border}: priority ${priority} (deltaRow=${deltaRow}, deltaCol=${deltaCol}, absRow=${absRow}, absCol=${absCol})`);
        
        return priority;
    }
    
    // Detect if shape collides with a specific gate
    detectShapeGateCollision(shape, startRow, startCol, gate, boundingBox) {
        const shapeEndRow = startRow + boundingBox.height - 1;
        const shapeEndCol = startCol + boundingBox.width - 1;
        const gateEndPos = gate.position + gate.length - 1;
        
        // Check collision based on gate border
        switch (gate.border) {
            case 'top':
                // Shape touches top border if it's moving to row 0 or above
                if (startRow <= 0) {
                    // Check horizontal overlap with gate
                    if (shapeEndCol >= gate.position && startCol <= gateEndPos) {
                        // Calculate actual edge length for top border
                        const actualEdgeLength = this.calculateActualEdgeLength(shape.pattern, 'top');
                        // Calculate the actual start and end positions of the edge
                        const edgeSpan = this.getShapeEdgeSpan(shape.pattern, startRow, startCol, 'top');
                        return { 
                            collides: true, 
                            edge: 'top',
                            edgeLength: actualEdgeLength,
                            shapeStart: edgeSpan.start,
                            shapeEnd: edgeSpan.end,
                            gateStart: gate.position,
                            gateEnd: gateEndPos
                        };
                    }
                }
                break;
                
            case 'bottom':
                // Shape touches bottom border if it's moving beyond grid
                if (shapeEndRow >= this.gridSize - 1) {
                    // Check horizontal overlap with gate
                    if (shapeEndCol >= gate.position && startCol <= gateEndPos) {
                        // Calculate actual edge length for bottom border
                        const actualEdgeLength = this.calculateActualEdgeLength(shape.pattern, 'bottom');
                        const edgeSpan = this.getShapeEdgeSpan(shape.pattern, startRow, startCol, 'bottom');
                        return { 
                            collides: true, 
                            edge: 'bottom',
                            edgeLength: actualEdgeLength,
                            shapeStart: edgeSpan.start,
                            shapeEnd: edgeSpan.end,
                            gateStart: gate.position,
                            gateEnd: gateEndPos
                        };
                    }
                }
                break;
                
            case 'left':
                // Shape touches left border if it's moving to col 0 or beyond
                if (startCol <= 0) {
                    // Check vertical overlap with gate
                    if (shapeEndRow >= gate.position && startRow <= gateEndPos) {
                        // Calculate actual edge length for left border
                        const actualEdgeLength = this.calculateActualEdgeLength(shape.pattern, 'left');
                        const edgeSpan = this.getShapeEdgeSpan(shape.pattern, startRow, startCol, 'left');
                        return { 
                            collides: true, 
                            edge: 'left',
                            edgeLength: actualEdgeLength,
                            shapeStart: edgeSpan.start,
                            shapeEnd: edgeSpan.end,
                            gateStart: gate.position,
                            gateEnd: gateEndPos
                        };
                    }
                }
                break;
                
            case 'right':
                // Shape touches right border if it's moving beyond grid
                if (shapeEndCol >= this.gridSize - 1) {
                    // Check vertical overlap with gate
                    if (shapeEndRow >= gate.position && startRow <= gateEndPos) {
                        // Calculate actual edge length for right border
                        const actualEdgeLength = this.calculateActualEdgeLength(shape.pattern, 'right');
                        const edgeSpan = this.getShapeEdgeSpan(shape.pattern, startRow, startCol, 'right');
                        return { 
                            collides: true, 
                            edge: 'right',
                            edgeLength: actualEdgeLength,
                            shapeStart: edgeSpan.start,
                            shapeEnd: edgeSpan.end,
                            gateStart: gate.position,
                            gateEnd: gateEndPos
                        };
                    }
                }
                break;
        }
        
        return { collides: false };
    }

    // Calculate the actual edge length for a specific border
    calculateActualEdgeLength(pattern, border) {
        let edgeLength = 0;
        
        switch (border) {
            case 'top':
                // Count blocks in the top row that have pattern value 1
                for (let col = 0; col < pattern[0].length; col++) {
                    if (pattern[0][col] === 1) {
                        edgeLength++;
                    }
                }
                break;
                
            case 'bottom':
                // Count blocks in the bottom row that have pattern value 1
                const bottomRow = pattern.length - 1;
                for (let col = 0; col < pattern[bottomRow].length; col++) {
                    if (pattern[bottomRow][col] === 1) {
                        edgeLength++;
                    }
                }
                break;
                
            case 'left':
                // Count blocks in the leftmost column that have pattern value 1
                for (let row = 0; row < pattern.length; row++) {
                    if (pattern[row][0] === 1) {
                        edgeLength++;
                    }
                }
                break;
                
            case 'right':
                // Count blocks in the rightmost column that have pattern value 1
                const rightCol = pattern[0].length - 1;
                for (let row = 0; row < pattern.length; row++) {
                    if (pattern[row][rightCol] === 1) {
                        edgeLength++;
                    }
                }
                break;
        }
        
        return edgeLength;
    }

    // Get the actual start and end positions of the shape edge that touches the border
    getShapeEdgeSpan(pattern, startRow, startCol, border) {
        let edgeStart = Infinity;
        let edgeEnd = -Infinity;
        
        switch (border) {
            case 'top':
                // Find leftmost and rightmost blocks in top row
                for (let col = 0; col < pattern[0].length; col++) {
                    if (pattern[0][col] === 1) {
                        const gridCol = startCol + col;
                        edgeStart = Math.min(edgeStart, gridCol);
                        edgeEnd = Math.max(edgeEnd, gridCol);
                    }
                }
                break;
                
            case 'bottom':
                // Find leftmost and rightmost blocks in bottom row
                const bottomRow = pattern.length - 1;
                for (let col = 0; col < pattern[bottomRow].length; col++) {
                    if (pattern[bottomRow][col] === 1) {
                        const gridCol = startCol + col;
                        edgeStart = Math.min(edgeStart, gridCol);
                        edgeEnd = Math.max(edgeEnd, gridCol);
                    }
                }
                break;
                
            case 'left':
                // Find topmost and bottommost blocks in left column
                for (let row = 0; row < pattern.length; row++) {
                    if (pattern[row][0] === 1) {
                        const gridRow = startRow + row;
                        edgeStart = Math.min(edgeStart, gridRow);
                        edgeEnd = Math.max(edgeEnd, gridRow);
                    }
                }
                break;
                
            case 'right':
                // Find topmost and bottommost blocks in right column
                const rightCol = pattern[0].length - 1;
                for (let row = 0; row < pattern.length; row++) {
                    if (pattern[row][rightCol] === 1) {
                        const gridRow = startRow + row;
                        edgeStart = Math.min(edgeStart, gridRow);
                        edgeEnd = Math.max(edgeEnd, gridRow);
                    }
                }
                break;
        }
        
        // Handle case where no blocks found (shouldn't happen)
        if (edgeStart === Infinity) {
            edgeStart = 0;
            edgeEnd = 0;
        }
        
        return { start: edgeStart, end: edgeEnd };
    }

    // Check if shape can pass through gate based on edge length and color matching
    canShapePassThroughGate(collision, gate, boundingBox) {
        // The shape can pass through if:
        // 1. The entire shape edge is covered by the gate
        // 2. The edge touching the gate has length <= gate length  
        // 3. The shape color matches the gate color
        
        // Check if entire shape edge is covered by gate
        const entireEdgeCovered = collision.shapeStart >= collision.gateStart && 
                                 collision.shapeEnd <= collision.gateEnd;
        
        const sizeMatches = collision.edgeLength <= gate.length;
        const colorMatches = this.draggedShape.color === gate.color;
        
        if (!entireEdgeCovered) {
            console.log(`Shape edge (${collision.shapeStart}-${collision.shapeEnd}) not entirely covered by gate (${collision.gateStart}-${collision.gateEnd})`);
        }
        if (!sizeMatches) {
            console.log(`Shape edge length ${collision.edgeLength} > gate length ${gate.length}`);
        }
        if (!colorMatches) {
            console.log(`Shape color ${this.draggedShape.color} != gate color ${gate.color}`);
        }
        
        return entireEdgeCovered && sizeMatches && colorMatches;
    }
    
    // Remove shape from the game (when it passes through a gate)
    removeShapeFromGame(shape) {
        // Remove all blocks of this shape from the grid
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = this.grid[row][col];
                if (cell.shapeId === shape.id) {
                    // Remove the visual block
                    const block = cell.element.querySelector('.shape-block');
                    if (block) {
                        block.remove();
                    }
                    
                    // Reset cell state
                    cell.isEmpty = true;
                    cell.hasShape = false;
                    cell.shapeColor = null;
                    cell.shapeId = null;
                }
            }
        }
        
        // Remove the shape overlay
        if (shape.overlay) {
            shape.overlay.remove();
            shape.overlay = null;
        }
        
        // Mark shape as removed instead of deleting from array to preserve IDs
        shape.removed = true;
        shape.active = false;
        
        console.log(`${shape.color} shape removed from game after passing through gate`);
        
        // Check for win condition
        this.checkWinCondition();
    }
    
    checkWinCondition() {
        const activeShapes = this.shapes.filter(s => !s.removed);
        if (activeShapes.length === 0) {
            console.log('🎉 PUZZLE COMPLETED! All shapes have passed through their gates!');
            setTimeout(() => {
                this.showCongratulationOverlay();
            }, 500);
        } else {
            console.log(`${activeShapes.length} shapes remaining`);
        }
    }
    
    showCongratulationOverlay() {
        this.congratulationOverlay.classList.add('show');
    }
}

// Initialize grid when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new ColorBlockJam();
});
