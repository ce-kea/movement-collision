import Board from "../model/Board.js";
import PriorityQueue from "../model/PriorityQueue.js";

/**
 * Calculates Euclidian distance between two positions
 * distance = sqrt(Δx² + Δy²)
 * @param {{x: number, y: number}} a position a
 * @param {{x: number, y: number}} b position b
 * @returns {number} Euclidian distance in pixels between a and b
 */
export function euclideanDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Calculates Manhatten distance between two coords in a grid
 * distance = |Δx| + |Δy|
 * @param {{row: number, col: number}} a coord a
 * @param {{row: number, col: number}} b coord b
 * @returns {number} Manhattan distance between coords
 */
export function manhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Implements the A* pathfinding algorithm to find the optimal path between two points on a game board.
 * The algorithm navigates through a tile-based grid where each tile type has specific properties:
 * - Traversable tiles (grass, floor, path) have weight = 1
 * - Obstacles (walls, water, cliffs) have weight = Infinity
 * - Movement is restricted to orthogonal directions (no diagonals)
 *
 * The algorithm works by minimizing f(n) = g(n) + h(n) where:
 * - g(n): Actual cost from start to node n (sum of tile weights)
 * - h(n): Manhattan distance to goal (optimal heuristic for grid with only orthogonal movement)
 * - f(n): Total estimated path cost through node n
 *
 * Data Structures:
 * - PriorityQueue: MinHeap-based queue that maintains nodes ordered by fScore
 *   * Each node contains grid coordinates and priority (fScore)
 *   * Ensures we always process the most promising path first
 *   * Provides O(log n) insertion and extraction
 * - openSetCoords: Set of coordinates we've seen but not yet processed
 * - gScore/fScore: Maps using coordinate keys to track path costs
 * - cameFrom: Map to reconstruct the optimal path
 *
 * Process:
 * 1. Convert start/goal from pixel coordinates to grid coordinates
 * 2. Initialize start node:
 *    - gScore = 0
 *    - fScore = manhattan distance to goal
 *    - Add to priority queue with fScore as priority
 * 3. While priority queue not empty:
 *    - Dequeue node with lowest fScore
 *    - If goal reached, reconstruct and return path
 *    - For each neighbor:
 *      * Calculate new gScore through current node
 *      * If new path is better:
 *        - Update gScore and fScore
 *        - Enqueue with new fScore as priority
 *
 * @param {{x: number, y: number}} start Starting pixel position
 * @param {{x: number, y: number}} goal Goal pixel position
 * @param {Board} board Game board for coordinate conversion and tile access
 * @param {(a: {row: number, col: number}, b: {row: number, col: number}) => number} h
 *        Manhattan distance function (optimal heuristic for grid movement)
 * @returns {{row:number, col:number}[]} Optimal path in grid coordinates, or empty array if no path exists
 */
export function aStar(start, goal, board, h) {
  const startCoords = board.getCoordFromPos(start);
  const goalCoords = board.getCoordFromPos(goal);

  // For node n, gScore[n] is the currently known cost of the cheapes path from start to n
  const gScore = {};
  gScore[getCoordKey(startCoords)] = 0;

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how cheap a path could be from start to finish if it goes through n.
  const fScore = {};
  fScore[getCoordKey(startCoords)] = h(startCoords, goalCoords);

  const cameFrom = {};
  const openSetCoords = new Set();
  const openSet = new PriorityQueue();

  openSet.enqueue(startCoords, fScore[getCoordKey(startCoords)]);
  openSetCoords.add(getCoordKey(startCoords));

  while (openSet.size > 0) {
    let current = openSet.dequeue();
    const currentKey = getCoordKey(current);
    const currentGScore = gScore[currentKey] ?? Infinity;

    if (current.row === goalCoords.row && current.col === goalCoords.col) {
      return reconstructPath(cameFrom, current);
    }

    const neighbours = board.tiles.neighbours(current.row, current.col);
    for (const neighbour of neighbours) {
      const neighbourKey = getCoordKey(neighbour);
      const neighbourGScore = gScore[neighbourKey] ?? Infinity;

      const tile = board.getTileAtCoord(neighbour);
      if (!tile) continue; // skip if tile is out of bounds

      const tentativeGScore = currentGScore + tile.getPathfindingCost();
      if (tentativeGScore < neighbourGScore) {
        cameFrom[neighbourKey] = current;
        gScore[neighbourKey] = tentativeGScore;
        const newFScore = tentativeGScore + h(neighbour, goalCoords);
        fScore[neighbourKey] = newFScore;
        if (!openSetCoords.has(neighbourKey)) {
          openSet.enqueue(neighbour, newFScore);
          openSetCoords.add(neighbourKey);
        }
      }
    }
  }
  return [];
}

/**
 * Reconstructs the fastest path and returns it
 * @param {{[key:string]:{row:number, col: number}}} cameFrom map of grid coords containing the path from goal to start
 * @param {{row: number, col: number}} current goal cell coords
 * @returns {{row: number, col: number}[]} return
 */
function reconstructPath(cameFrom, current) {
  const totalPath = [current];
  while (current) {
    current = cameFrom[getCoordKey(current)];
    if (current) {
      totalPath.unshift(current);
    }
  }
  return totalPath;
}

/**
 * @param {{row:number, col: number}} coords coords to get grid coord key for
 * @returns {string} unique key for the grid cell of a given position as a string. Example: row: 5, col: 7, would give key "5,7"
 */
function getCoordKey(coords) {
  return `${coords.row},${coords.col}`;
}
