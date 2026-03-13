# Tasks: 俄羅斯方塊遊戲 (Tetris Game)

**Input**: Design documents from `/specs/001-tetris-game/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ui-contract.md ✓, quickstart.md ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and static file structure

- [ ] T001 Create index.html with full HTML structure, CSS layout (game canvas 300×600, sidebar, preview canvas 120×120), and all DOM elements per ui-contract.md: `#game-canvas`, `#next-canvas`, `#score`, `#high-score`, `#level`, `#lines`, `#start-btn`, `#game-over-overlay`, `#final-score` in index.html
- [ ] T002 Create package.json with Jest 29 devDependency, `--experimental-vm-modules` test script, and ES module Jest config (`transform: {}`, `extensionsToTreatAsEsm: [".js"]`, `testEnvironment: "node"`) in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data definitions and Board logic that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Implement src/tetrominos.js with TETROMINOES constant (7 shapes: I/O/T/S/Z/J/L, SRS rotation matrices for all 4 states, colors per spec, spawnX/spawnY per Guideline), Wall Kick offset tables (WALL_KICK_JLSTZ and WALL_KICK_I for all 8 transitions), and SevenBagRandomizer class (next(), peek(), Fisher-Yates _shuffle()) in src/tetrominos.js
- [ ] T004 [P] Implement src/board.js with createBoard() returning empty 10×20 null-filled grid, isOccupied(board, row, col) (bounds + occupancy check), canPlace(board, piece) (collision detection), lockPiece(board, piece) (merge piece cells into grid), clearLines(board) returning `{ board, linesCleared }` in src/board.js

**Checkpoint**: Foundation ready — src/tetrominos.js and src/board.js exist and export all needed functions

---

## Phase 3: User Story 1 — 基本遊戲玩法 (Priority: P1) 🎯 MVP

**Goal**: Playable core loop — pieces spawn at top-centre, fall automatically, player moves/rotates/soft-drops with keyboard, completed rows clear and new piece spawns

**Independent Test**: Open index.html in a browser, confirm a piece falls automatically each second, arrow keys move/rotate it, rows fill and disappear, game is continuously playable

### Tests for User Story 1

> **Write these tests FIRST; ensure they FAIL before implementing the logic**

- [ ] T005 [P] [US1] Write unit tests for TETROMINOES rotation-state shapes and Wall Kick table completeness (all 8 transitions for JLSTZ and I exist) in tests/unit/tetrominos.test.js
- [ ] T006 [P] [US1] Write unit tests for canPlace (boundary rejection, occupied-cell rejection), lockPiece (cells persisted to grid), and clearLines (single/double row clear, partial row not cleared, rows above shift down) in tests/unit/board.test.js

### Implementation for User Story 1

- [ ] T007 [US1] Implement src/game.js with createGameState() initialising all GameState fields (status, board, currentPiece, nextPieceType, score, highScore, level, totalLinesCleared, gravityTimer), spawnPiece(state) (SevenBagRandomizer.next(), place at spawnX/spawnY), tryMove(state, dx, dy) (canPlace guard), tryRotateCW(state) (SRS + Wall Kick offsets), applySoftDrop(state), lockAndSpawn(state) (lockPiece → clearLines → update state) in src/game.js
- [ ] T008 [P] [US1] Implement src/renderer.js with drawCell(ctx, col, row, color, alpha) (30px cell with highlight/shadow borders per ui-contract.md §3.2), drawBoard(ctx, board), drawCurrentPiece(ctx, piece), clearCanvas(ctx, canvas), and updateScoreUI(state) (update #score, #level, #lines DOM text) in src/renderer.js
- [ ] T009 [P] [US1] Implement src/input.js with keyboard event listeners (keydown/keyup) mapping ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Z/z to InputState booleans (moveLeft, moveRight, softDrop, rotateCW), preventDefault on arrow/space keys, and getInput()/clearInput() API in src/input.js
- [ ] T010 [US1] Implement src/main.js as game entry point: initialise canvases from DOM, create GameState, start requestAnimationFrame loop — each frame: read InputState, update gravity (deltaTime accumulation), apply player inputs, call lockAndSpawn when piece lands, render board + current piece, update score UI in src/main.js

**Checkpoint**: At this point, User Story 1 should be fully functional — open index.html, play a game, pieces fall and rows clear

---

## Phase 4: User Story 2 — 遊戲結束與重新開始 (Priority: P2)

**Goal**: Game over triggers when spawn position is occupied; Game Over overlay shows with final score; player can restart with R key or button

**Independent Test**: Let pieces stack to the top; confirm Game Over overlay appears with correct score; press R (or click Start button) to reset board, score, level and continue playing

### Implementation for User Story 2

- [ ] T011 [US2] Add Game Over detection in src/game.js: after spawnPiece, if !canPlace(state.board, newPiece) set status to `'gameover'`; implement restartGame(state) resetting board/score/level/totalLinesCleared/status to initial values while retaining highScore in src/game.js
- [ ] T012 [US2] Add Game Over overlay logic in src/renderer.js: showGameOver(finalScore) sets #final-score text and removes `display:none` from #game-over-overlay; hideGameOver() restores `display:none` in src/renderer.js
- [ ] T013 [US2] Add R/r key and #start-btn click handler in src/input.js (restart flag); wire restart action in src/main.js game loop — when status is `'gameover'` and restart input detected, call restartGame() and hideGameOver() in src/input.js and src/main.js

**Checkpoint**: User Stories 1 AND 2 both work — complete game loop with game over and restart

---

## Phase 5: User Story 3 — 計分與等級系統 (Priority: P3)

**Goal**: Line-clear scoring (100/300/500/800 × level), Soft Drop bonus (+1/cell), level progression every 10 lines, gravity speed-up per level, localStorage high score

**Independent Test**: Clear rows and verify scores match formula; clear 10 rows total and confirm level increments with faster drop speed; refresh page and confirm high score persists

### Tests for User Story 3

> **Write these tests FIRST; ensure they FAIL before implementing scoring logic**

- [ ] T014 [US3] Write unit tests for calculateLineScore(linesCleared, level) (1×L=100, 2×L=300, 3×L=500, 4×L=800), levelFromLines(totalLines) (0→1, 9→1, 10→2, 19→2, 20→3), and gravityInterval(level) (level 1→800ms, level 10≈343ms, level 29+→50ms floor) in tests/unit/game.test.js

### Implementation for User Story 3

- [ ] T015 [US3] Implement calculateLineScore(linesCleared, level) in src/game.js using scoring table `{1:100, 2:300, 3:500, 4:800}[linesCleared] * level` (linesCleared is always 1–4 from clearLines) and integrate into lockAndSpawn() in src/game.js
- [ ] T016 [US3] Implement levelFromLines(totalLines) (`Math.floor(total/10)+1`) and gravityInterval(level) (`Math.max(50, 800 / Math.pow(1.1, level-1))`) in src/game.js; update game loop in src/main.js to use gravityInterval(state.level) per frame in src/game.js and src/main.js
- [ ] T017 [US3] Implement localStorage high score in src/game.js: getHighScore() (`parseInt(localStorage.getItem('tetrisHighScore')||'0',10)`), saveHighScore(score); call saveHighScore after score update in lockAndSpawn(); add updateHighScoreUI(state) in src/renderer.js to update #high-score DOM element and load from localStorage on init in src/game.js and src/renderer.js

**Checkpoint**: User Story 3 complete — scoring, levels, speed, and persistent high score all work correctly

---

## Phase 6: User Story 4 — 下一個方塊預覽 (Priority: P4)

**Goal**: Sidebar preview area (#next-canvas 120×120) always shows the next Tetromino, updating each time a piece locks

**Independent Test**: Observe the preview panel during play; confirm the displayed shape matches the piece that spawns next after each lock

### Implementation for User Story 4

- [ ] T018 [US4] Update spawnPiece() in src/game.js to maintain nextPieceType from SevenBagRandomizer.peek() and update it after each spawn so GameState.nextPieceType always reflects the upcoming piece in src/game.js
- [ ] T019 [US4] Implement drawNextPiece(ctx, nextPieceType) in src/renderer.js: clear #next-canvas, compute bounding box of piece shape, centre it in 120×120 canvas (30px cells), draw with standard drawCell() styling; call from main render loop in src/renderer.js and src/main.js

**Checkpoint**: User Story 4 complete — next piece preview updates correctly after every lock

---

## Phase 7: User Story 5 — 硬降 Hard Drop (Priority: P5)

**Goal**: Space bar instantly drops piece to the lowest valid position, locks it, scores +2 per cell dropped, and Ghost Piece shadow shows where it will land

**Independent Test**: Press Space; confirm piece teleports to lowest valid row, score increases by 2× drop distance, and the ghost piece preview accurately predicted the landing spot

### Implementation for User Story 5

- [ ] T020 [US5] Implement calculateGhostY(board, piece) in src/game.js: starting from piece.y, increment y until !canPlace, return last valid y in src/game.js
- [ ] T021 [P] [US5] Implement drawGhostPiece(ctx, board, piece) in src/renderer.js: compute ghost position via calculateGhostY, draw cells with globalAlpha=0.3 in piece's color using drawCell(); call from render loop before drawing current piece in src/renderer.js and src/main.js
- [ ] T022 [US5] Add Space key to src/input.js (hardDrop boolean, single-trigger); implement hardDrop(state) in src/game.js: compute ghost Y, score += 2*(ghostY - piece.y), teleport piece.y to ghostY, call lockAndSpawn() in src/input.js and src/game.js

**Checkpoint**: User Story 5 complete — Hard Drop with ghost piece preview, instant lock, and distance scoring

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Mobile touch support, DAS, and final validation across all user stories

- [ ] T023 Implement touch gesture handling in src/input.js: touchstart records startX/startY/startTime; touchend computes deltaX/deltaY; if |delta| < 10px && time < 500ms → tap (rotateCW); else if |deltaX|>|deltaY| && |deltaX|≥30px && time≤300ms → swipe left/right; else if |deltaY|≥30px && time≤300ms → swipe down (softDrop) or up (hardDrop) in src/input.js
- [ ] T024 [P] Add `touch-action: none` to `#game-canvas` CSS and `user-scalable=no` to `<meta name="viewport">` in index.html to prevent scroll hijack on mobile in index.html
- [ ] T025 [P] Add DAS (Delayed Auto Shift) for left/right movement in src/input.js: initial 170ms delay then 50ms repeat interval for held ArrowLeft/ArrowRight keys in src/input.js
- [ ] T026 Run quickstart.md validation: install npm dependencies (`npm install`), run `npm test` (all unit tests pass), open index.html via local HTTP server, manually verify FR-001 through FR-015 in Chrome, Firefox, and Edge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Stories (Phases 3–7)**: All depend on Foundational completion; stories proceed in P1→P5 priority order (or in parallel if staffed)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational — no dependency on other stories
- **US2 (P2)**: Depends on US1 (adds to game.js/renderer.js/input.js started in US1)
- **US3 (P3)**: Depends on US1 line-clear hook in lockAndSpawn()
- **US4 (P4)**: Depends on US1 SevenBagRandomizer + renderer.js scaffolding
- **US5 (P5)**: Depends on US1 movement/collision system

### Within Each User Story

- Tests (T005, T006, T014) MUST be written and verified to FAIL before implementation
- Data/logic modules before rendering (board.js before renderer.js)
- Core game logic before main.js wiring
- Story complete before advancing to next priority

### Parallel Opportunities

- T003 (src/tetrominos.js) and T004 (src/board.js): parallel — different files
- T005 (tests/unit/tetrominos.test.js) and T006 (tests/unit/board.test.js): parallel — different files
- T008 (src/renderer.js) and T009 (src/input.js): parallel — different files
- T014 (tests/unit/game.test.js) must FAIL before starting T015–T017 implementations (no parallelism)
- T021 (drawGhostPiece) and T022 (Space key + hardDrop): parallel — different concerns

---

## Parallel Example: User Story 1

```bash
# After Phase 2 completes, launch US1 tests in parallel:
Task T005: "Write tests/unit/tetrominos.test.js"
Task T006: "Write tests/unit/board.test.js"

# After tests are failing, implement core files in parallel where possible:
Task T008: "Implement src/renderer.js"
Task T009: "Implement src/input.js"
# (T007 src/game.js should be done first; T010 src/main.js last)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (index.html + package.json)
2. Complete Phase 2: Foundational (tetrominos.js + board.js)
3. Complete Phase 3: User Story 1 (game.js + renderer.js + input.js + main.js)
4. **STOP and VALIDATE**: Open in browser — game should be fully playable
5. Optional: deploy to GitHub Pages at this point

### Incremental Delivery

1. Setup + Foundational → skeleton ready
2. Add US1 → playable MVP (pieces fall, keyboard control, line clearing)
3. Add US2 → complete game loop (game over + restart)
4. Add US3 → satisfying progression (score + levels + high score)
5. Add US4 → better UX (next piece preview)
6. Add US5 → advanced play (hard drop + ghost piece)
7. Polish → mobile support + DAS + final validation

### Parallel Team Strategy

With multiple developers:
1. Team completes Phase 1 + Phase 2 together (~1 hour)
2. Developer A: Phase 3 US1 (game.js, main.js)
3. Developer B: Phase 3 US1 (renderer.js, input.js)
4. Once US1 is merged: split US2 + US3 + US4 + US5

---

## Notes

- [P] tasks operate on different files with no dependencies — safe to run concurrently
- [Story] label maps each task to its user story for traceability
- All `src/*.js` files use ES module `export`/`import` syntax — `index.html` must use `<script type="module">`
- For local testing, use `python3 -m http.server 8080` or `npx serve .` (ES modules fail with `file://` protocol)
- `tetrisHighScore` is the only localStorage key used
- Ghost Piece must be drawn **before** the current piece in the render order (so current piece renders on top)
- DAS (T025) is a Polish task — MVP can use single-step movement per keydown event
