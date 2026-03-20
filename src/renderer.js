// src/renderer.js
// Canvas rendering: board, pieces, ghost, next-piece preview, and UI DOM elements

import { calculateDropDistance } from './game.js';
import { getShape, getColor } from './tetrominos.js';

const CELL_SIZE = 30;

/**
 * Draw a single cell on a canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x  column index
 * @param {number} y  row index
 * @param {string} color  CSS color
 * @param {number} alpha  0–1
 */
function drawCell(ctx, x, y, color, alpha = 1.0) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  // bright top/left edge
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, 2);
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, 2, CELL_SIZE);

  // dark bottom/right edge
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE + CELL_SIZE - 2, CELL_SIZE, 2);
  ctx.fillRect(x * CELL_SIZE + CELL_SIZE - 2, y * CELL_SIZE, 2, CELL_SIZE);

  ctx.globalAlpha = 1.0;
}

/**
 * Draw the board: background, optional grid lines, and locked cells.
 * @param {CanvasRenderingContext2D} ctx
 * @param {(string|null)[][]} grid
 */
export function drawBoard(ctx, grid) {
  const W = 300;
  const H = 600;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // faint grid lines
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.5;
  for (let r = 0; r <= 20; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL_SIZE);
    ctx.lineTo(W, r * CELL_SIZE);
    ctx.stroke();
  }
  for (let c = 0; c <= 10; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL_SIZE, 0);
    ctx.lineTo(c * CELL_SIZE, H);
    ctx.stroke();
  }

  // locked cells
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        drawCell(ctx, c, r, grid[r][c]);
      }
    }
  }
}

/**
 * Draw a piece (current or any piece).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, shape: number[][], color: string }} piece
 * @param {number} alpha
 */
export function drawPiece(ctx, piece, alpha = 1.0) {
  const { x, y, shape, color } = piece;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] && y + r >= 0) {
        drawCell(ctx, x + c, y + r, color, alpha);
      }
    }
  }
}

/**
 * Draw the ghost piece (drop preview) with alpha=0.3.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, shape: number[][], color: string }} piece
 * @param {(string|null)[][]} grid
 */
export function drawGhostPiece(ctx, piece, grid) {
  const distance = calculateDropDistance(piece, grid);
  const ghostPiece = { ...piece, y: piece.y + distance };
  drawPiece(ctx, ghostPiece, 0.3);
}

/**
 * Draw the next-piece preview on a 120×120 canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} pieceType
 */
export function drawNextPiece(ctx, pieceType) {
  ctx.clearRect(0, 0, 120, 120);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 120, 120);

  if (!pieceType) return;

  const shape = getShape(pieceType, 0);
  const color = getColor(pieceType);

  // compute bounding box
  let minR = shape.length, maxR = 0, minC = shape[0].length, maxC = 0;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }
  const cols = maxC - minC + 1;
  const rows = maxR - minR + 1;
  const offsetX = Math.floor((4 - cols) / 2) - minC;
  const offsetY = Math.floor((4 - rows) / 2) - minR;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        drawCell(ctx, c + offsetX, r + offsetY, color);
      }
    }
  }
}

/**
 * Show the game-over overlay with the final score.
 * @param {number} finalScore
 */
export function showGameOver(finalScore) {
  const overlay = document.getElementById('game-over-overlay');
  const finalScoreEl = document.getElementById('final-score');
  if (overlay) overlay.style.display = 'flex';
  if (finalScoreEl) finalScoreEl.textContent = finalScore;
}

/**
 * Hide the game-over overlay.
 */
export function hideGameOver() {
  const overlay = document.getElementById('game-over-overlay');
  if (overlay) overlay.style.display = 'none';
}

/**
 * Update sidebar UI elements (score, high score, level, lines).
 * @param {{ score: number, highScore: number, level: number, totalLinesCleared: number }} state
 */
export function updateUI(state) {
  const el = id => document.getElementById(id);
  const scoreEl = el('score');
  const highScoreEl = el('high-score');
  const levelEl = el('level');
  const linesEl = el('lines');
  if (scoreEl) scoreEl.textContent = state.score;
  if (highScoreEl) highScoreEl.textContent = state.highScore;
  if (levelEl) levelEl.textContent = state.level;
  if (linesEl) linesEl.textContent = state.totalLinesCleared;
}
