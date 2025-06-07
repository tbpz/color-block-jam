import 'dart:math';
import 'package:flutter/material.dart';

void main() {
  runApp(const ColorBlockJamApp());
}

class ColorBlockJamApp extends StatelessWidget {
  const ColorBlockJamApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Color Block Jam',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const ColorBlockJamGame(),
    );
  }
}

class ColorBlockJamGame extends StatefulWidget {
  const ColorBlockJamGame({super.key});

  @override
  State<ColorBlockJamGame> createState() => _ColorBlockJamGameState();
}

class _ColorBlockJamGameState extends State<ColorBlockJamGame> {
  static const int gridSize = 6;
  static const List<Color> blockColors = [
    Colors.red,
    Colors.blue,
    Colors.green,
    Colors.yellow,
    Colors.purple,
    Colors.orange,
  ];

  // Grid: 0 = empty, 1-6 = colored blocks, -1 to -6 = colored doors/exits
  late List<List<int>> grid;
  int moves = 0;
  bool gameWon = false;
  
  // Predefined level layout
  final List<List<int>> levelLayout = [
    [0, 0, 0, 0, 0, -1], // -1 = red door
    [0, 2, 0, 0, 0, 0],  // 2 = blue block
    [0, 0, 0, 1, 0, 0],  // 1 = red block
    [0, 0, 3, 0, 0, 0],  // 3 = green block
    [0, 0, 0, 0, 0, -2], // -2 = blue door
    [-3, 0, 0, 0, 0, 0], // -3 = green door
  ];

  @override
  void initState() {
    super.initState();
    _initializeGame();
  }

  void _initializeGame() {
    grid = List.generate(gridSize, (i) => List.from(levelLayout[i]));
    moves = 0;
    gameWon = false;
    _checkWinCondition();
  }

  void _checkWinCondition() {
    // Check if all blocks have reached their matching doors
    bool allMatched = true;
    
    for (int i = 0; i < gridSize; i++) {
      for (int j = 0; j < gridSize; j++) {
        if (grid[i][j] > 0) {
          // There's still a block that hasn't reached its door
          allMatched = false;
          break;
        }
      }
      if (!allMatched) break;
    }
    
    setState(() {
      gameWon = allMatched;
    });
  }

  void _moveBlock(int fromX, int fromY, int toX, int toY) {
    if (grid[fromX][fromY] <= 0) return; // Can't move empty cells or doors
    
    int blockValue = grid[fromX][fromY];
    int targetCell = grid[toX][toY];
    
    // Check if move is valid
    if (targetCell > 0) return; // Can't move to occupied cell
    
    if (targetCell < 0) {
      // Moving to a door
      if (-targetCell != blockValue) return; // Wrong color door
    }
    
    setState(() {
      grid[fromX][fromY] = 0; // Clear original position
      
      if (targetCell < 0 && -targetCell == blockValue) {
        // Block reached matching door - it gets absorbed
        // Door remains as is, block disappears
      } else {
        // Block moved to empty space
        grid[toX][toY] = blockValue;
      }
      
      moves++;
      _checkWinCondition();
    });
  }

  void _slideBlock(int fromX, int fromY, String direction) {
    if (grid[fromX][fromY] <= 0) return; // Can't slide empty cells or doors

    int dx = 0, dy = 0;
    switch (direction) {
      case 'up':
        dx = -1;
        break;
      case 'down':
        dx = 1;
        break;
      case 'left':
        dy = -1;
        break;
      case 'right':
        dy = 1;
        break;
    }

    int newX = fromX;
    int newY = fromY;
    int blockValue = grid[fromX][fromY];

    // Find how far the block can slide
    while (true) {
      int nextX = newX + dx;
      int nextY = newY + dy;

      if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
        break; // Hit boundary
      }

      int targetCell = grid[nextX][nextY];
      
      // Check if we can move to this cell
      if (targetCell > 0) {
        break; // Hit another block
      } else if (targetCell < 0) {
        // Hit a door - check if it matches our block color
        if (-targetCell == blockValue) {
          // Matching door! Block disappears (gets absorbed)
          newX = nextX;
          newY = nextY;
          break;
        } else {
          // Wrong colored door, can't pass through
          break;
        }
      }

      // Empty cell, continue sliding
      newX = nextX;
      newY = nextY;
    }

    if (newX != fromX || newY != fromY) {
      setState(() {
        grid[fromX][fromY] = 0; // Clear original position
        
        if (grid[newX][newY] < 0 && -grid[newX][newY] == blockValue) {
          // Block reached matching door - don't place block, it's absorbed
          // Door remains as is
        } else {
          // Block moved to empty space
          grid[newX][newY] = blockValue;
        }
        
        moves++;
        _checkWinCondition();
      });
    }
  }

  void _resetLevel() {
    setState(() {
      _initializeGame();
    });
  }

  Color _getCellColor(int value) {
    if (value == 0) {
      return Colors.grey.shade200;
    } else if (value > 0) {
      return blockColors[value - 1];
    } else {
      // Doors (negative values) - lighter shade of the matching color
      return blockColors[(-value) - 1].withOpacity(0.3);
    }
  }

  Widget _buildGridCell(int x, int y) {
    int cellValue = grid[x][y];
    Color cellColor = _getCellColor(cellValue);
    Widget? child;

    if (cellValue < 0) {
      // Door - show an icon
      child = Icon(
        Icons.home,
        color: blockColors[(-cellValue) - 1].withOpacity(0.8),
        size: 24,
      );
    }

    Widget cellWidget = Container(
      margin: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: cellColor,
        borderRadius: BorderRadius.circular(8),
        border: cellValue < 0 
            ? Border.all(color: blockColors[(-cellValue) - 1], width: 3) 
            : null,
        boxShadow: cellValue > 0
            ? [BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(2, 2))]
            : null,
      ),
      child: Center(child: child),
    );

    // If this cell contains a draggable block
    if (cellValue > 0) {
      return Draggable<Map<String, int>>(
        data: {'x': x, 'y': y, 'value': cellValue},
        feedback: Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: cellColor.withOpacity(0.8),
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(color: Colors.black26, blurRadius: 6, offset: Offset(3, 3))
            ],
          ),
        ),
        childWhenDragging: Container(
          margin: const EdgeInsets.all(2),
          decoration: BoxDecoration(
            color: cellColor.withOpacity(0.3),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey, style: BorderStyle.solid),
          ),
        ),
        child: cellWidget,
      );
    }
    
    // If this is an empty cell or door, make it a drop target
    return DragTarget<Map<String, int>>(
      onWillAccept: (data) {
        if (data == null) return false;
        int blockValue = data['value']!;
        
        // Can drop on empty cells
        if (cellValue == 0) return true;
        
        // Can drop on matching colored doors
        if (cellValue < 0 && -cellValue == blockValue) return true;
        
        return false;
      },
      onAccept: (data) {
        int fromX = data['x']!;
        int fromY = data['y']!;
        _moveBlock(fromX, fromY, x, y);
      },
      builder: (context, candidateData, rejectedData) {
        return Container(
          margin: const EdgeInsets.all(2),
          decoration: BoxDecoration(
            color: candidateData.isNotEmpty ? cellColor.withOpacity(0.7) : cellColor,
            borderRadius: BorderRadius.circular(8),
            border: cellValue < 0 
                ? Border.all(color: blockColors[(-cellValue) - 1], width: 3)
                : candidateData.isNotEmpty 
                    ? Border.all(color: Colors.blue, width: 2)
                    : null,
          ),
          child: Center(child: child),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text('Color Block Jam'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _resetLevel,
          ),
        ],
      ),
      body: Column(
        children: [
          // Header info
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Moves: $moves',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                if (gameWon)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Level Complete!',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
          ),

          // Game grid
          Expanded(
            child: Center(
              child: AspectRatio(
                aspectRatio: 1,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 8,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: GridView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: gridSize,
                      childAspectRatio: 1,
                    ),
                    itemCount: gridSize * gridSize,
                    itemBuilder: (context, index) {
                      int x = index ~/ gridSize;
                      int y = index % gridSize;
                      return _buildGridCell(x, y);
                    },
                  ),
                ),
              ),
            ),
          ),

          // Instructions and controls
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                const Text(
                  'Drag and drop colored blocks into their matching colored doors!',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Click and drag blocks to move them. Blocks can only go to empty spaces or matching doors.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
                const SizedBox(height: 16),
                
                // Color legend
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 16,
                  children: [
                    _buildColorLegend(Colors.red, 'Red'),
                    _buildColorLegend(Colors.blue, 'Blue'), 
                    _buildColorLegend(Colors.green, 'Green'),
                  ],
                ),
                
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _resetLevel,
                  child: const Text('Reset Level'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildColorLegend(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}
