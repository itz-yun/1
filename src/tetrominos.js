// src/tetrominos.js
// Tetromino definitions, SRS rotation matrices, Wall Kick data tables, and 7-Bag randomizer

export const TETROMINOES = {
  I: {
    color: '#00F0F0',
    shapes: [
      [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // 0
      [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]], // R
      [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]], // 2
      [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]  // L
    ],
    spawnX: 3,
    spawnY: -1
  },
  O: {
    color: '#F0F000',
    shapes: [
      [[1,1],[1,1]],
      [[1,1],[1,1]],
      [[1,1],[1,1]],
      [[1,1],[1,1]]
    ],
    spawnX: 4,
    spawnY: 0
  },
  T: {
    color: '#A000F0',
    shapes: [
      [[0,1,0],[1,1,1],[0,0,0]], // 0
      [[0,1,0],[0,1,1],[0,1,0]], // R
      [[0,0,0],[1,1,1],[0,1,0]], // 2
      [[0,1,0],[1,1,0],[0,1,0]]  // L
    ],
    spawnX: 3,
    spawnY: 0
  },
  S: {
    color: '#00F000',
    shapes: [
      [[0,1,1],[1,1,0],[0,0,0]], // 0
      [[0,1,0],[0,1,1],[0,0,1]], // R
      [[0,0,0],[0,1,1],[1,1,0]], // 2
      [[1,0,0],[1,1,0],[0,1,0]]  // L
    ],
    spawnX: 3,
    spawnY: 0
  },
  Z: {
    color: '#F00000',
    shapes: [
      [[1,1,0],[0,1,1],[0,0,0]], // 0
      [[0,0,1],[0,1,1],[0,1,0]], // R
      [[0,0,0],[1,1,0],[0,1,1]], // 2
      [[0,1,0],[1,1,0],[1,0,0]]  // L
    ],
    spawnX: 3,
    spawnY: 0
  },
  J: {
    color: '#0000F0',
    shapes: [
      [[1,0,0],[1,1,1],[0,0,0]], // 0
      [[0,1,1],[0,1,0],[0,1,0]], // R
      [[0,0,0],[1,1,1],[0,0,1]], // 2
      [[0,1,0],[0,1,0],[1,1,0]]  // L
    ],
    spawnX: 3,
    spawnY: 0
  },
  L: {
    color: '#F0A000',
    shapes: [
      [[0,0,1],[1,1,1],[0,0,0]], // 0
      [[0,1,0],[0,1,0],[0,1,1]], // R
      [[0,0,0],[1,1,1],[1,0,0]], // 2
      [[1,1,0],[0,1,0],[0,1,0]]  // L
    ],
    spawnX: 3,
    spawnY: 0
  }
};

// SRS Wall Kick offset tables
// Format: [dx, dy] (positive x = right, positive y = down)

export const WALL_KICK_JLSTZ = {
  '0→R': [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
  'R→2': [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
  '2→L': [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
  'L→0': [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]],
  'R→0': [[ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2]],
  '2→R': [[ 0, 0], [-1, 0], [-1, 1], [ 0,-2], [-1,-2]],
  'L→2': [[ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2]],
  '0→L': [[ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2]]
};

export const WALL_KICK_I = {
  '0→R': [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
  'R→2': [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]],
  '2→L': [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
  'L→0': [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
  'R→0': [[ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2]],
  '2→R': [[ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2, 1]],
  'L→2': [[ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2]],
  '0→L': [[ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1]]
};

const ROTATION_NAMES = ['0', 'R', '2', 'L'];

/**
 * Get the wall kick offsets for a given piece type and rotation transition.
 * @param {string} pieceType
 * @param {number} fromRotation
 * @param {number} toRotation
 * @returns {number[][]} array of [dx, dy] offsets
 */
export function getWallKickOffsets(pieceType, fromRotation, toRotation) {
  const key = `${ROTATION_NAMES[fromRotation]}→${ROTATION_NAMES[toRotation]}`;
  if (pieceType === 'I') {
    return WALL_KICK_I[key] || [[0, 0]];
  }
  if (pieceType === 'O') {
    return [[0, 0]];
  }
  return WALL_KICK_JLSTZ[key] || [[0, 0]];
}

/**
 * Get the shape matrix for a piece type at a given rotation.
 * @param {string} type
 * @param {number} rotation
 * @returns {number[][]}
 */
export function getShape(type, rotation) {
  return TETROMINOES[type].shapes[rotation];
}

/**
 * Get the color for a piece type.
 * @param {string} type
 * @returns {string}
 */
export function getColor(type) {
  return TETROMINOES[type].color;
}

/**
 * 7-Bag randomizer: guarantees each piece type appears once per 7 pieces.
 */
export class SevenBagRandomizer {
  constructor() {
    this.PIECES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    this.currentBag = this._shuffle([...this.PIECES]);
    this.nextBag = this._shuffle([...this.PIECES]);
    this.index = 0;
  }

  next() {
    if (this.index >= 7) {
      this.currentBag = this.nextBag;
      this.nextBag = this._shuffle([...this.PIECES]);
      this.index = 0;
    }
    return this.currentBag[this.index++];
  }

  peek() {
    return this.index < 7
      ? this.currentBag[this.index]
      : this.nextBag[0];
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
