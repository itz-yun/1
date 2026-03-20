// src/input.js
// Keyboard and touch input handling

/**
 * InputState: per-frame snapshot of player inputs.
 * Single-trigger fields (hardDrop, rotateCW, rotateCCW, restart) are cleared each frame.
 */
export function createInputState() {
  return {
    moveLeft: false,
    moveRight: false,
    softDrop: false,
    hardDrop: false,
    rotateCW: false,
    rotateCCW: false,
    restart: false
  };
}

/**
 * Set up keyboard and touch listeners.
 * Returns a getter function that returns the current InputState (and clears single-trigger fields).
 * @param {HTMLElement} touchTarget  Element to attach touch events to (e.g. game canvas)
 * @returns {{ getAndClear: function(): object, destroy: function(): void }}
 */
export function setupInput(touchTarget) {
  let state = createInputState();

  // DAS/ARR for left/right
  const DAS = 170; // ms delay before auto-repeat
  const ARR = 50;  // ms auto-repeat interval
  let leftHeld = false, rightHeld = false;
  let leftDasTimer = 0, rightDasTimer = 0;
  let leftArrTimer = 0, rightArrTimer = 0;
  let lastTime = performance.now();

  const keys = new Set();

  function onKeyDown(e) {
    const prevented = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];
    if (prevented.includes(e.code)) e.preventDefault();

    if (keys.has(e.code)) return; // ignore held keys for single-trigger
    keys.add(e.code);

    switch (e.code) {
      case 'ArrowLeft':
        state.moveLeft = true;
        leftHeld = true;
        leftDasTimer = 0;
        leftArrTimer = 0;
        break;
      case 'ArrowRight':
        state.moveRight = true;
        rightHeld = true;
        rightDasTimer = 0;
        rightArrTimer = 0;
        break;
      case 'ArrowDown':
        state.softDrop = true;
        break;
      case 'ArrowUp':
      case 'KeyZ':
        state.rotateCW = true;
        break;
      case 'KeyX':
        state.rotateCCW = true;
        break;
      case 'Space':
        state.hardDrop = true;
        break;
      case 'KeyR':
        state.restart = true;
        break;
    }
  }

  function onKeyUp(e) {
    keys.delete(e.code);
    switch (e.code) {
      case 'ArrowLeft':
        leftHeld = false;
        leftDasTimer = 0;
        leftArrTimer = 0;
        break;
      case 'ArrowRight':
        rightHeld = false;
        rightDasTimer = 0;
        rightArrTimer = 0;
        break;
      case 'ArrowDown':
        state.softDrop = false;
        break;
    }
  }

  // Touch state
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  function onTouchStart(e) {
    e.preventDefault();
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartTime = performance.now();
  }

  function onTouchEnd(e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const dt = performance.now() - touchStartTime;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= 10 && dt <= 500) {
      // Tap: rotate CW
      state.rotateCW = true;
      return;
    }

    if (dt > 300) return; // too slow for a swipe

    if (dist < 30) return; // too small

    if (Math.abs(dx) > Math.abs(dy)) {
      // horizontal swipe
      if (dx < 0) state.moveLeft = true;
      else state.moveRight = true;
    } else {
      // vertical swipe
      if (dy < 0) state.hardDrop = true;
      else state.softDrop = true;
    }
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  if (touchTarget) {
    touchTarget.addEventListener('touchstart', onTouchStart, { passive: false });
    touchTarget.addEventListener('touchend', onTouchEnd, { passive: false });
  }

  /**
   * Update DAS/ARR timers. Call once per frame before consuming input.
   * @param {number} now  performance.now()
   */
  function updateDAS(now) {
    const delta = now - lastTime;
    lastTime = now;

    if (leftHeld) {
      leftDasTimer += delta;
      if (leftDasTimer >= DAS) {
        leftArrTimer += delta;
        if (leftArrTimer >= ARR) {
          state.moveLeft = true;
          leftArrTimer -= ARR;
        }
      }
    }
    if (rightHeld) {
      rightDasTimer += delta;
      if (rightDasTimer >= DAS) {
        rightArrTimer += delta;
        if (rightArrTimer >= ARR) {
          state.moveRight = true;
          rightArrTimer -= ARR;
        }
      }
    }
  }

  /**
   * Get the current input state (clears single-trigger fields) and apply DAS.
   * @returns {object}
   */
  function getAndClear(now) {
    updateDAS(now);
    const snap = { ...state };
    // clear single-trigger fields
    state.hardDrop = false;
    state.rotateCW = false;
    state.rotateCCW = false;
    state.restart = false;
    state.moveLeft = false;
    state.moveRight = false;
    return snap;
  }

  function destroy() {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    if (touchTarget) {
      touchTarget.removeEventListener('touchstart', onTouchStart);
      touchTarget.removeEventListener('touchend', onTouchEnd);
    }
  }

  return { getAndClear, destroy };
}
