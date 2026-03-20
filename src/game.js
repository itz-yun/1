// src/game.js
// GameState management: scoring, levels, gravity, piece spawning, game over, restart

import { TETROMINOES, SevenBagRandomizer, getWallKickOffsets, getShape, getColor } from './tetrominos.js';
import { createEmptyGrid, canPlace, lockPiece, clearLines } from './board.js';

const HIGH_SCORE_KEY = 'tetrisHighScore';

// --- Pure calculation functions ---

/**
 * Calculate score delta for clearing lines at a given level.
 * @param {number} linesCleared
 * @param {number} level
 * @returns {number}
 */
export function calculateScore(linesCleared, level) {
  const BASE = [0, 100, 300, 500, 800];
  return (BASE[linesCleared] || 0) * level;
}

/**
 * Calculate level from total lines cleared.
 * @param {number} totalLinesCleared
 * @returns {number}
 */
export function calculateLevel(totalLinesCleared) {
  return Math.floor(totalLinesCleared / 10) + 1;
}

/**
 * Calculate gravity interval (ms) for a given level.
 * @param {number} level
 * @returns {number}
 */
export function calculateGravityInterval(level) {
  return Math.max(50, 800 / Math.pow(1.1, level - 1));
}

// --- localStorage helpers ---

function getHighScore() {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
  } catch (_) {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}

// --- Piece helpers ---

/**
 * Create a piece object from a type.
 * @param {string} type
 * @returns {{ type: string, rotation: number, x: number, y: number, shape: number[][], color: string }}
 */
export function spawnPiece(type) {
  const def = TETROMINOES[type];
  const shape = def.shapes[0];
  return {
    type,
    rotation: 0,
    x: def.spawnX,
    y: def.spawnY,
    shape,
    color: def.color
  };
}

/**
 * Calculate how far a piece can drop from its current position.
 * @param {{ x: number, y: number, shape: number[][] }} piece
 * @param {(string|null)[][]} grid
 * @returns {number}
 */
export function calculateDropDistance(piece, grid) {
  let distance = 0;
  const testPiece = { ...piece };
  while (true) {
    const next = { ...testPiece, y: testPiece.y + 1 };
    if (!canPlace(grid, next)) break;
    testPiece.y++;
    distance++;
  }
  return distance;
}

// --- GameState factory ---

/**
 * Create the initial game state.
 * @returns {object}
 */
export function createInitialState() {
  return {
    status: 'idle',
    grid: createEmptyGrid(),
    currentPiece: null,
    nextPieceType: null,
    score: 0,
    highScore: getHighScore(),
    level: 1,
    totalLinesCleared: 0,
    gravityTimer: 0,
    randomizer: null
  };
}

// --- Game actions ---

/**
 * Start or restart the game.
 * @param {object} state
 * @returns {object} new state
 */
export function startGame(state) {
  const randomizer = new SevenBagRandomizer();
  const firstType = randomizer.next();
  const nextType = randomizer.peek();
  const piece = spawnPiece(firstType);
  return {
    ...state,
    status: 'playing',
    grid: createEmptyGrid(),
    currentPiece: piece,
    nextPieceType: nextType,
    score: 0,
    level: 1,
    totalLinesCleared: 0,
    gravityTimer: 0,
    highScore: getHighScore(),
    randomizer
  };
}

/**
 * Try to move the current piece left or right.
 * @param {object} state
 * @param {number} dx - -1 for left, +1 for right
 * @returns {object} new state
 */
export function movePiece(state, dx) {
  if (state.status !== 'playing' || !state.currentPiece) return state;
  const newPiece = { ...state.currentPiece, x: state.currentPiece.x + dx };
  if (!canPlace(state.grid, newPiece)) return state;
  return { ...state, currentPiece: newPiece };
}

/**
 * Try to rotate the current piece clockwise (CW) or counter-clockwise (CCW).
 * Applies SRS Wall Kick offsets.
 * @param {object} state
 * @param {'CW'|'CCW'} direction
 * @returns {object} new state
 */
export function rotatePiece(state, direction) {
  if (state.status !== 'playing' || !state.currentPiece) return state;
  const piece = state.currentPiece;
  const fromRot = piece.rotation;
  const toRot = direction === 'CW'
    ? (fromRot + 1) % 4
    : (fromRot + 3) % 4;

  const newShape = getShape(piece.type, toRot);
  const offsets = getWallKickOffsets(piece.type, fromRot, toRot);

  for (const [dx, dy] of offsets) {
    const testPiece = {
      ...piece,
      rotation: toRot,
      shape: newShape,
      x: piece.x + dx,
      y: piece.y + dy
    };
    if (canPlace(state.grid, testPiece)) {
      return { ...state, currentPiece: testPiece };
    }
  }
  return state; // rotation failed
}

/**
 * Soft drop: move piece down one step, award 1 point per cell.
 * @param {object} state
 * @returns {object} new state
 */
export function softDrop(state) {
  if (state.status !== 'playing' || !state.currentPiece) return state;
  const newPiece = { ...state.currentPiece, y: state.currentPiece.y + 1 };
  if (!canPlace(state.grid, newPiece)) {
    return lockCurrentPiece(state);
  }
  return {
    ...state,
    currentPiece: newPiece,
    score: state.score + 1,
    gravityTimer: 0
  };
}

/**
 * Hard drop: instantly drop piece to lowest position, award 2 points per cell.
 * @param {object} state
 * @returns {object} new state
 */
export function hardDrop(state) {
  if (state.status !== 'playing' || !state.currentPiece) return state;
  const distance = calculateDropDistance(state.currentPiece, state.grid);
  const droppedPiece = {
    ...state.currentPiece,
    y: state.currentPiece.y + distance
  };
  const stateWithPiece = {
    ...state,
    currentPiece: droppedPiece,
    score: state.score + distance * 2
  };
  return lockCurrentPiece(stateWithPiece);
}

/**
 * Lock the current piece into the grid, clear lines, update score/level, spawn next piece.
 * @param {object} state
 * @returns {object} new state
 */
function lockCurrentPiece(state) {
  const { currentPiece, grid, randomizer } = state;
  const newGrid = lockPiece(grid, currentPiece);
  const { grid: clearedGrid, linesCleared } = clearLines(newGrid);

  const newTotalLines = state.totalLinesCleared + linesCleared;
  const newLevel = calculateLevel(newTotalLines);
  const scoreDelta = calculateScore(linesCleared, state.level);
  const newScore = state.score + scoreDelta;

  let newHighScore = state.highScore;
  if (newScore > newHighScore) {
    newHighScore = newScore;
    saveHighScore(newScore);
  }

  // Spawn next piece
  const nextType = randomizer.next();
  const afterNextType = randomizer.peek();
  const newPiece = spawnPiece(nextType);

  // Check game over
  if (!canPlace(clearedGrid, newPiece)) {
    saveHighScore(newScore);
    return {
      ...state,
      status: 'gameover',
      grid: clearedGrid,
      currentPiece: newPiece,
      nextPieceType: afterNextType,
      score: newScore,
      highScore: Math.max(newHighScore, newScore),
      level: newLevel,
      totalLinesCleared: newTotalLines,
      gravityTimer: 0
    };
  }

  return {
    ...state,
    status: 'playing',
    grid: clearedGrid,
    currentPiece: newPiece,
    nextPieceType: afterNextType,
    score: newScore,
    highScore: newHighScore,
    level: newLevel,
    totalLinesCleared: newTotalLines,
    gravityTimer: 0
  };
}

/**
 * Advance the gravity timer by deltaTime. If timer exceeds gravity interval, move piece down.
 * @param {object} state
 * @param {number} deltaTime ms
 * @returns {object} new state
 */
export function updateGravity(state, deltaTime) {
  if (state.status !== 'playing' || !state.currentPiece) return state;
  const newTimer = state.gravityTimer + deltaTime;
  const interval = calculateGravityInterval(state.level);
  if (newTimer >= interval) {
    const newPiece = { ...state.currentPiece, y: state.currentPiece.y + 1 };
    if (!canPlace(state.grid, newPiece)) {
      return lockCurrentPiece({ ...state, gravityTimer: 0 });
    }
    return { ...state, currentPiece: newPiece, gravityTimer: newTimer - interval };
  }
  return { ...state, gravityTimer: newTimer };
}
