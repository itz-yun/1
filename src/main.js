// src/main.js
// Entry point: initializes game, sets up requestAnimationFrame loop

import { createInitialState, startGame, movePiece, rotatePiece, softDrop, hardDrop, updateGravity } from './game.js';
import { drawBoard, drawPiece, drawGhostPiece, drawNextPiece, updateUI, showGameOver, hideGameOver } from './renderer.js';
import { setupInput } from './input.js';

const gameCanvas = document.getElementById('game-canvas');
const nextCanvas = document.getElementById('next-canvas');
const startBtn = document.getElementById('start-btn');
const ctx = gameCanvas.getContext('2d');
const nextCtx = nextCanvas.getContext('2d');

ctx.imageSmoothingEnabled = false;
nextCtx.imageSmoothingEnabled = false;

let state = createInitialState();
const input = setupInput(gameCanvas);

let lastTimestamp = null;
let animFrameId = null;

function render() {
  drawBoard(ctx, state.grid);
  if (state.currentPiece) {
    drawGhostPiece(ctx, state.currentPiece, state.grid);
    drawPiece(ctx, state.currentPiece);
  }
  drawNextPiece(nextCtx, state.nextPieceType);
  updateUI(state);
}

function gameLoop(timestamp) {
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  const inp = input.getAndClear(timestamp);

  if (state.status === 'playing') {
    // Input
    if (inp.moveLeft) state = movePiece(state, -1);
    if (inp.moveRight) state = movePiece(state, 1);
    if (inp.rotateCW) state = rotatePiece(state, 'CW');
    if (inp.rotateCCW) state = rotatePiece(state, 'CCW');
    if (inp.hardDrop) {
      state = hardDrop(state);
    } else if (inp.softDrop) {
      state = softDrop(state);
    } else {
      state = updateGravity(state, deltaTime);
    }

    if (state.status === 'gameover') {
      showGameOver(state.score);
      startBtn.textContent = '重新開始';
    }
  } else if (state.status === 'gameover') {
    if (inp.restart) {
      doRestart();
    }
  } else if (state.status === 'idle') {
    if (inp.restart) {
      doStart();
    }
  }

  render();
  animFrameId = requestAnimationFrame(gameLoop);
}

function doStart() {
  hideGameOver();
  state = startGame(state);
  startBtn.textContent = '遊戲中...';
  lastTimestamp = null;
}

function doRestart() {
  hideGameOver();
  state = startGame(state);
  startBtn.textContent = '遊戲中...';
  lastTimestamp = null;
}

startBtn.addEventListener('click', () => {
  if (state.status === 'idle' || state.status === 'gameover') {
    doRestart();
  }
});

// Initial render of empty board
render();

// Start the animation loop
animFrameId = requestAnimationFrame(gameLoop);
