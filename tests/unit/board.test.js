// tests/unit/board.test.js
import { createEmptyGrid, isOccupied, canPlace, lockPiece, clearLines, isLineFull, WIDTH, HEIGHT } from '../../src/board.js';

describe('Board: isOccupied', () => {
  let grid;
  beforeEach(() => {
    grid = createEmptyGrid();
  });

  test('returns false for empty cell within bounds', () => {
    expect(isOccupied(grid, 0, 0)).toBe(false);
    expect(isOccupied(grid, 19, 9)).toBe(false);
  });

  test('returns true for occupied cell', () => {
    grid[5][3] = '#00F0F0';
    expect(isOccupied(grid, 5, 3)).toBe(true);
  });

  test('returns true when col is out of left boundary', () => {
    expect(isOccupied(grid, 10, -1)).toBe(true);
  });

  test('returns true when col is out of right boundary', () => {
    expect(isOccupied(grid, 10, WIDTH)).toBe(true);
  });

  test('returns true when row is below board', () => {
    expect(isOccupied(grid, HEIGHT, 0)).toBe(true);
  });

  test('returns false when row is above board (spawn zone)', () => {
    expect(isOccupied(grid, -1, 5)).toBe(false);
  });
});

describe('Board: canPlace', () => {
  let grid;
  beforeEach(() => {
    grid = createEmptyGrid();
  });

  test('returns true for piece in empty area', () => {
    const piece = { x: 3, y: 0, shape: [[1,1],[1,1]] };
    expect(canPlace(grid, piece)).toBe(true);
  });

  test('returns false when piece goes outside right boundary', () => {
    const piece = { x: 9, y: 0, shape: [[1,1]] };
    expect(canPlace(grid, piece)).toBe(false);
  });

  test('returns false when piece goes outside left boundary', () => {
    const piece = { x: -1, y: 0, shape: [[1,1]] };
    expect(canPlace(grid, piece)).toBe(false);
  });

  test('returns false when piece goes below board', () => {
    const piece = { x: 0, y: HEIGHT - 1, shape: [[0],[1],[1]] };
    expect(canPlace(grid, piece)).toBe(false);
  });

  test('returns false when piece overlaps locked cell', () => {
    grid[5][5] = '#FF0000';
    const piece = { x: 5, y: 5, shape: [[1]] };
    expect(canPlace(grid, piece)).toBe(false);
  });

  test('returns true for piece partially above board (spawn)', () => {
    const piece = { x: 3, y: -1, shape: [[1,1,1,1],[0,0,0,0],[0,0,0,0],[0,0,0,0]] };
    expect(canPlace(grid, piece)).toBe(true);
  });
});

describe('Board: lockPiece', () => {
  test('writes piece cells to grid with correct color', () => {
    const grid = createEmptyGrid();
    const piece = { x: 3, y: 5, shape: [[1,1],[1,0]], color: '#00F0F0' };
    const newGrid = lockPiece(grid, piece);
    expect(newGrid[5][3]).toBe('#00F0F0');
    expect(newGrid[5][4]).toBe('#00F0F0');
    expect(newGrid[6][3]).toBe('#00F0F0');
    expect(newGrid[6][4]).toBeNull();
  });

  test('does not mutate original grid', () => {
    const grid = createEmptyGrid();
    const piece = { x: 0, y: 0, shape: [[1]], color: '#FF0000' };
    lockPiece(grid, piece);
    expect(grid[0][0]).toBeNull();
  });

  test('ignores cells above board (y < 0)', () => {
    const grid = createEmptyGrid();
    const piece = { x: 0, y: -1, shape: [[1,1,1,1],[0,0,0,0]], color: '#00F0F0' };
    const newGrid = lockPiece(grid, piece);
    // top row of shape is at y=-1, should be ignored
    for (let c = 0; c < 4; c++) {
      expect(newGrid[0][c]).toBeNull();
    }
  });
});

describe('Board: clearLines', () => {
  test('removes full rows and shifts rows down', () => {
    const grid = createEmptyGrid();
    // fill row 19 completely
    for (let c = 0; c < WIDTH; c++) grid[19][c] = '#FF0000';
    // put something in row 18
    grid[18][0] = '#00FF00';

    const { grid: newGrid, linesCleared } = clearLines(grid);
    expect(linesCleared).toBe(1);
    // row 19 should now be the shifted-down row 18
    expect(newGrid[19][0]).toBe('#00FF00');
    // all others in row 19 should be null
    for (let c = 1; c < WIDTH; c++) {
      expect(newGrid[19][c]).toBeNull();
    }
    // row 18 (old row 17) should be null
    expect(newGrid[18][0]).toBeNull();
  });

  test('removes multiple full rows', () => {
    const grid = createEmptyGrid();
    for (let c = 0; c < WIDTH; c++) {
      grid[18][c] = '#FF0000';
      grid[19][c] = '#FF0000';
    }
    const { grid: newGrid, linesCleared } = clearLines(grid);
    expect(linesCleared).toBe(2);
    expect(newGrid[18].every(c => c === null)).toBe(true);
    expect(newGrid[19].every(c => c === null)).toBe(true);
  });

  test('returns linesCleared=0 when no full rows', () => {
    const grid = createEmptyGrid();
    grid[19][0] = '#FF0000';
    const { linesCleared } = clearLines(grid);
    expect(linesCleared).toBe(0);
  });

  test('result grid has correct dimensions', () => {
    const grid = createEmptyGrid();
    for (let c = 0; c < WIDTH; c++) grid[19][c] = '#FF0000';
    const { grid: newGrid } = clearLines(grid);
    expect(newGrid.length).toBe(HEIGHT);
    expect(newGrid[0].length).toBe(WIDTH);
  });
});
