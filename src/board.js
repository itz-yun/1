// src/board.js
// Board data structure (10×20 grid) and operations

export const WIDTH = 10;
export const HEIGHT = 20;

/**
 * Create a new empty board grid (20 rows × 10 cols, all null).
 * @returns {(string|null)[][]}
 */
export function createEmptyGrid() {
  return Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null));
}

/**
 * Check if a cell is occupied or out of bounds.
 * @param {(string|null)[][]} grid
 * @param {number} row
 * @param {number} col
 * @returns {boolean}
 */
export function isOccupied(grid, row, col) {
  if (col < 0 || col >= WIDTH) return true;
  if (row >= HEIGHT) return true;
  if (row < 0) return false; // above the board is allowed (spawning)
  return grid[row][col] !== null;
}

/**
 * Check if a piece can be placed at its current position.
 * @param {(string|null)[][]} grid
 * @param {{ x: number, y: number, shape: number[][] }} piece
 * @returns {boolean}
 */
export function canPlace(grid, piece) {
  const { x, y, shape } = piece;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        if (isOccupied(grid, y + r, x + c)) return false;
      }
    }
  }
  return true;
}

/**
 * Lock a piece into the grid (mutates a copy of grid).
 * @param {(string|null)[][]} grid
 * @param {{ x: number, y: number, shape: number[][], color: string }} piece
 * @returns {(string|null)[][]} new grid with piece locked in
 */
export function lockPiece(grid, piece) {
  const newGrid = grid.map(row => [...row]);
  const { x, y, shape, color } = piece;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        const row = y + r;
        const col = x + c;
        if (row >= 0 && row < HEIGHT && col >= 0 && col < WIDTH) {
          newGrid[row][col] = color;
        }
      }
    }
  }
  return newGrid;
}

/**
 * Remove full rows from the grid, shift rows down, return new grid and lines cleared.
 * @param {(string|null)[][]} grid
 * @returns {{ grid: (string|null)[][], linesCleared: number }}
 */
export function clearLines(grid) {
  const surviving = grid.filter(row => row.some(cell => cell === null));
  const linesCleared = HEIGHT - surviving.length;
  const emptyRows = Array.from({ length: linesCleared }, () => Array(WIDTH).fill(null));
  return {
    grid: [...emptyRows, ...surviving],
    linesCleared
  };
}

/**
 * Check if a specific row is completely full.
 * @param {(string|null)[][]} grid
 * @param {number} row
 * @returns {boolean}
 */
export function isLineFull(grid, row) {
  return grid[row].every(cell => cell !== null);
}
