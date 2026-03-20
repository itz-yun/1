// tests/unit/tetrominos.test.js
import { TETROMINOES, getShape, getColor, getWallKickOffsets, SevenBagRandomizer } from '../../src/tetrominos.js';
import { canPlace, createEmptyGrid } from '../../src/board.js';

const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
const ROTATION_NAMES = ['0', 'R', '2', 'L'];

describe('Tetromino shape matrices', () => {
  test.each(PIECE_TYPES)('%s piece has 4 rotation states', (type) => {
    expect(TETROMINOES[type].shapes).toHaveLength(4);
  });

  test.each(PIECE_TYPES)('%s piece shape matrices are valid 2D arrays', (type) => {
    for (let rot = 0; rot < 4; rot++) {
      const shape = getShape(type, rot);
      expect(Array.isArray(shape)).toBe(true);
      expect(shape.every(row => Array.isArray(row))).toBe(true);
    }
  });

  test.each(PIECE_TYPES)('%s piece has at least one filled cell in each rotation', (type) => {
    for (let rot = 0; rot < 4; rot++) {
      const shape = getShape(type, rot);
      const hasCell = shape.some(row => row.some(c => c === 1));
      expect(hasCell).toBe(true);
    }
  });

  test('O piece has identical shape in all rotations', () => {
    const shapes = TETROMINOES['O'].shapes;
    for (let rot = 1; rot < 4; rot++) {
      expect(shapes[rot]).toEqual(shapes[0]);
    }
  });
});

describe('getColor', () => {
  test.each(PIECE_TYPES)('%s piece has a non-empty color string', (type) => {
    const color = getColor(type);
    expect(typeof color).toBe('string');
    expect(color.length).toBeGreaterThan(0);
  });

  test('each piece type has a unique color', () => {
    const colors = PIECE_TYPES.map(getColor);
    const unique = new Set(colors);
    expect(unique.size).toBe(PIECE_TYPES.length);
  });
});

describe('Wall Kick offsets', () => {
  test('JLSTZ: each rotation transition returns 5 offsets', () => {
    const jlstzTypes = ['J', 'L', 'S', 'T', 'Z'];
    const transitions = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [1, 0], [2, 1], [3, 2], [0, 3]
    ];
    for (const type of jlstzTypes) {
      for (const [from, to] of transitions) {
        const offsets = getWallKickOffsets(type, from, to);
        expect(offsets).toHaveLength(5);
      }
    }
  });

  test('I piece: each rotation transition returns 5 offsets', () => {
    const transitions = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [1, 0], [2, 1], [3, 2], [0, 3]
    ];
    for (const [from, to] of transitions) {
      const offsets = getWallKickOffsets('I', from, to);
      expect(offsets).toHaveLength(5);
    }
  });

  test('O piece: always returns [[0,0]] (no wall kick needed)', () => {
    const offsets = getWallKickOffsets('O', 0, 1);
    expect(offsets).toEqual([[0, 0]]);
  });

  test('each offset is a [dx, dy] pair', () => {
    const offsets = getWallKickOffsets('T', 0, 1);
    for (const offset of offsets) {
      expect(offset).toHaveLength(2);
      expect(typeof offset[0]).toBe('number');
      expect(typeof offset[1]).toBe('number');
    }
  });
});

describe('SevenBagRandomizer', () => {
  test('next() returns only valid piece types', () => {
    const rand = new SevenBagRandomizer();
    for (let i = 0; i < 50; i++) {
      const type = rand.next();
      expect(PIECE_TYPES).toContain(type);
    }
  });

  test('every 7 pieces contains all 7 types exactly once', () => {
    const rand = new SevenBagRandomizer();
    const bag = [];
    for (let i = 0; i < 7; i++) bag.push(rand.next());
    const counts = {};
    for (const type of bag) counts[type] = (counts[type] || 0) + 1;
    for (const type of PIECE_TYPES) {
      expect(counts[type]).toBe(1);
    }
  });

  test('peek() returns the same type as the next next() call', () => {
    const rand = new SevenBagRandomizer();
    for (let i = 0; i < 20; i++) {
      const peeked = rand.peek();
      const actual = rand.next();
      expect(peeked).toBe(actual);
    }
  });

  test('peek() does not advance the index', () => {
    const rand = new SevenBagRandomizer();
    const p1 = rand.peek();
    const p2 = rand.peek();
    expect(p1).toBe(p2);
    // and next() should equal what was peeked
    expect(rand.next()).toBe(p1);
  });

  test('handles bag refill correctly across bag boundary', () => {
    const rand = new SevenBagRandomizer();
    // exhaust current bag
    const firstBag = [];
    for (let i = 0; i < 7; i++) firstBag.push(rand.next());
    // now pull second bag
    const secondBag = [];
    for (let i = 0; i < 7; i++) secondBag.push(rand.next());
    // second bag should also contain all 7 types
    const counts = {};
    for (const t of secondBag) counts[t] = (counts[t] || 0) + 1;
    for (const t of PIECE_TYPES) expect(counts[t]).toBe(1);
  });
});

describe('Rotation with canPlace (wall kick integration)', () => {
  test('T piece can be placed in each of 4 rotations in the center of an empty board', () => {
    const grid = createEmptyGrid();
    for (let rot = 0; rot < 4; rot++) {
      const shape = getShape('T', rot);
      const piece = { x: 3, y: 5, shape };
      expect(canPlace(grid, piece)).toBe(true);
    }
  });

  test('I piece can be placed in each of 4 rotations in the center of an empty board', () => {
    const grid = createEmptyGrid();
    for (let rot = 0; rot < 4; rot++) {
      const shape = getShape('I', rot);
      const piece = { x: 3, y: 5, shape };
      expect(canPlace(grid, piece)).toBe(true);
    }
  });
});
