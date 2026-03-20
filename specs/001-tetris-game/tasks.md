# Tasks: 俄羅斯方塊遊戲 (Tetris Game)

**Input**: Design documents from `/specs/001-tetris-game/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ui-contract.md ✓, quickstart.md ✓

**Tests**: Included — TDD is a constitution requirement (see plan.md §憲章檢查 原則 III); game logic (scoring, line-clearing, collision, Wall Kick) must have tests written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2])
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic file structure

- [ ] T001 Create repository file structure: `index.html`, `src/` directory, `tests/unit/` directory per plan.md project structure
- [ ] T002 Create `package.json` with Jest configuration (`--experimental-vm-modules`) and test script `"test": "node --experimental-vm-modules node_modules/.bin/jest"` at repository root
- [ ] T003 [P] Create empty ES-module stub files: `src/tetrominos.js`, `src/board.js`, `src/game.js`, `src/renderer.js`, `src/input.js`, `src/main.js`
- [ ] T004 [P] Create empty test stub files: `tests/unit/board.test.js`, `tests/unit/game.test.js`, `tests/unit/tetrominos.test.js`

**Checkpoint**: Repository structure is in place; `npm test` runs (with no tests yet)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data definitions and shared infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

- [ ] T005 Define all 7 Tetromino type constants, color map, and 4-rotation shape matrices (SRS standard) in `src/tetrominos.js`
- [ ] T006 [P] Define SRS Wall Kick offset tables for JLSTZ pieces and I piece (see research.md §1) in `src/tetrominos.js`
- [ ] T007 Implement `SevenBagRandomizer` class with `next()`, `peek()`, and Fisher-Yates `_shuffle()` methods in `src/tetrominos.js`
- [ ] T008 Define `Board` data structure (10×20 `grid` array, `WIDTH=10`, `HEIGHT=20` constants) and skeleton operation signatures in `src/board.js`
- [ ] T009 Define `GameState` object schema (status, board, currentPiece, nextPieceType, score, highScore, level, totalLinesCleared, gravityTimer) and `createInitialState()` factory in `src/game.js`
- [ ] T010 [P] Build HTML skeleton in `index.html`: `#game-canvas` (300×600), `#next-canvas` (120×120), `#score`, `#high-score`, `#level`, `#lines`, `#start-btn`, `#game-over-overlay`, `#final-score` per ui-contract.md §2
- [ ] T011 [P] Add base CSS layout (flexbox: canvas left + sidebar right) and dark theme styles in `index.html` `<style>` block per ui-contract.md §1

**Checkpoint**: Foundation ready — all data structures defined, HTML shell renders; user story phases can begin

---

## Phase 3: User Story 1 – 基本遊戲玩法 (Priority: P1) 🎯 MVP

**Goal**: 方塊從頂部生成、自動下落、玩家可左右移動/旋轉/加速下落；方塊固定後消除完整行並計分。

**Independent Test**: 開啟瀏覽器載入 `index.html`，確認方塊自動下落、方向鍵控制、旋轉（含 Wall Kick）、固定、消行功能全部正常，遊戲可連續進行。

### Tests for User Story 1 ⚠️ Write FIRST — must FAIL before implementation

- [ ] T012 [US1] Write `Board` collision detection tests: `isOccupied()` boundary/occupied/empty cases, `canPlace()` valid/invalid positions in `tests/unit/board.test.js`
- [ ] T013 [P] [US1] Write `Board` mutation tests: `lockPiece()` writes correct cells, `clearLines()` removes full rows and shifts rows down correctly in `tests/unit/board.test.js`
- [ ] T014 [P] [US1] Write Tetromino rotation tests: each of 7 pieces rotates through 4 states correctly; Wall Kick offsets applied in order; failed rotation leaves piece unchanged in `tests/unit/tetrominos.test.js`

### Implementation for User Story 1

- [ ] T015 [US1] Implement `Board.isOccupied(row, col)` (boundary + occupied check) and `Board.canPlace(piece)` in `src/board.js`
- [ ] T016 [US1] Implement `Board.lockPiece(piece)` (write piece cells to grid) and `Board.clearLines()` (remove full rows, shift rows down, return `linesCleared`) in `src/board.js`
- [ ] T017 [US1] Implement piece spawn: `spawnPiece(type)` sets initial `x` (centre of board), `y` (-1), `rotation=0`, `shape` from tetrominos table in `src/game.js`
- [ ] T018 [US1] Implement gravity timer and auto-fall logic: each frame advance `gravityTimer` by `deltaTime`; move piece down when timer exceeds `gravityInterval`; lock piece on collision in `src/game.js`
- [ ] T019 [US1] Implement move-left, move-right, and soft-drop actions with collision checks (`canPlace`) in `src/game.js`
- [ ] T020 [US1] Implement SRS rotation with Wall Kick: try each offset from research.md tables; apply first that passes `canPlace`; cancel rotation if all fail in `src/game.js`
- [ ] T021 [US1] Implement piece-locking sequence: call `lockPiece()`, call `clearLines()`, update `score` (100/300/500/800 × level for 1/2/3/4 lines), increment `totalLinesCleared`, compute new `level`, spawn next piece in `src/game.js`
- [ ] T022 [P] [US1] Implement keyboard input handler: `keydown` / `keyup` listeners mapping Arrow keys, `Z`/`X` to `InputState` flags; debounce left/right repeat with `DAS`/`ARR` timing in `src/input.js`
- [ ] T023 [US1] Implement `Renderer.drawBoard(ctx, board)` — clear canvas, draw background grid, iterate `board.grid` and call `drawCell()` for each occupied cell per ui-contract.md §3.1–3.2 in `src/renderer.js`
- [ ] T024 [US1] Implement `Renderer.drawPiece(ctx, piece, alpha)` using `drawCell()` spec (fill + bright top-left edge + dark bottom-right edge) in `src/renderer.js`
- [ ] T025 [US1] Implement `main.js` entry point: acquire canvas contexts, instantiate `SevenBagRandomizer`, create initial `GameState`, start `requestAnimationFrame` loop that reads `InputState`, updates game logic, and calls renderer each frame in `src/main.js`

**Checkpoint**: User Story 1 fully functional — a playable MVP Tetris game in the browser ✅

---

## Phase 4: User Story 2 – 遊戲結束與重新開始 (Priority: P2)

**Goal**: 方塊堆疊至頂端時顯示 Game Over 畫面（含最終分數）；玩家可按 R 鍵或按鈕重新開始遊戲。

**Independent Test**: 故意讓方塊堆至頂端，確認 Game Over 覆蓋層出現且顯示正確分數；按 R 鍵或重新開始按鈕後，遊戲完全重置可再次遊玩。

### Implementation for User Story 2

- [ ] T026 [US2] Implement Game Over detection: after `lockPiece()`, call `spawnPiece(nextType)`; if `!canPlace(newPiece)` set `state.status = 'gameover'` and save high score to `localStorage` in `src/game.js`
- [ ] T027 [P] [US2] Implement `Renderer.showGameOver(finalScore)` — set `#game-over-overlay` to visible, write `finalScore` to `#final-score` in `src/renderer.js`
- [ ] T028 [US2] Implement restart action: reset `board` to empty 10×20 grid, `score=0`, `level=1`, `totalLinesCleared=0`, `status='playing'`, `gravityTimer=0`; reinitialize `SevenBagRandomizer`; hide overlay; spawn first piece in `src/game.js`
- [ ] T029 [P] [US2] Add `R` key handler and `#start-btn` click handler that call the restart action when `status === 'gameover'` or `status === 'idle'` in `src/input.js`
- [ ] T030 [US2] Wire Game Over and restart flow in the game loop: when `status === 'gameover'` skip physics update; when restart fires transition `status` to `'playing'`; update button label text accordingly in `src/main.js`

**Checkpoint**: Game Over and restart cycle fully functional; User Stories 1 and 2 both work independently ✅

---

## Phase 5: User Story 3 – 計分與等級系統 (Priority: P3)

**Goal**: 消行時依行數和等級計分（1行 100×L、2行 300×L、3行 500×L、4行 800×L）；每累計消除 10 行升一等級；等級提升後方塊下落速度加快。

**Independent Test**: 消除 1/2/3/4 行後驗證分數符合 FR-006；消除第 10 行後驗證等級升為 2 且 `gravityInterval` 縮短。

### Tests for User Story 3 ⚠️ Write FIRST — must FAIL before implementation

- [ ] T031 [US3] Write scoring unit tests: 1/2/3/4 lines cleared × level 1 and level 3 returns correct score delta; `totalLinesCleared` and `level` update correctly at every 10-line boundary in `tests/unit/game.test.js`
- [ ] T032 [P] [US3] Write gravity speed unit tests: `gravityInterval` for levels 1–10 matches formula `Math.max(50, 800 / 1.1 ** (level-1))` ms; level 1 = 800 ms, level 10 ≤ ~309 ms in `tests/unit/game.test.js`

### Implementation for User Story 3

- [ ] T033 [US3] Extract and harden `calculateScore(linesCleared, level)` pure function returning correct score delta per FR-006 table in `src/game.js`
- [ ] T034 [US3] Extract and harden `calculateLevel(totalLinesCleared)` pure function returning `Math.floor(totalLinesCleared / 10) + 1` in `src/game.js`
- [ ] T035 [US3] Extract and harden `calculateGravityInterval(level)` pure function returning `Math.max(50, 800 / Math.pow(1.1, level - 1))` ms per SC-005 in `src/game.js`
- [ ] T036 [P] [US3] Update sidebar UI elements after each score/level change: write to `#score`, `#level`, `#lines` DOM elements in `src/renderer.js`

**Checkpoint**: Scoring and level progression fully functional; verify with quickstart.md acceptance scenarios ✅

---

## Phase 6: User Story 4 – 下一個方塊預覽 (Priority: P4)

**Goal**: 介面側邊 `#next-canvas` 始終顯示下一個將出現的方塊；每次方塊固定後預覽更新為再下一個方塊。

**Independent Test**: 遊玩時觀察預覽區，確認每次方塊固定後預覽方塊與實際出現的下一個方塊一致（連續確認至少 5 次）。

### Implementation for User Story 4

- [ ] T037 [US4] Ensure `GameState.nextPieceType` is populated from `SevenBagRandomizer.peek()` on game start and updated to `peek()` after each `next()` call in `src/game.js`
- [ ] T038 [US4] Implement `Renderer.drawNextPiece(ctx, pieceType)` — clear 120×120 canvas, centre and draw the preview piece shape using `drawCell()` per ui-contract.md §3.4 in `src/renderer.js`
- [ ] T039 [US4] Call `Renderer.drawNextPiece()` each frame with `state.nextPieceType` in the main render pipeline in `src/main.js`

**Checkpoint**: Next-piece preview renders correctly and updates on each piece lock ✅

---

## Phase 7: User Story 5 – 硬降 Hard Drop (Priority: P5)

**Goal**: 玩家按下空白鍵，方塊立即落至最低可放置位置並固定；依落下距離每格增加 2 分；Ghost Piece 顯示落底預測位置。

**Independent Test**: 按下空白鍵後確認方塊瞬間落底（無動畫延遲）、計分含 2×distance 加成、Ghost Piece 落點與實際固定位置一致。

### Implementation for User Story 5

- [ ] T040 [US5] Implement `calculateDropDistance(piece, board)` — iterate downward from current `y` until `!canPlace`; return number of cells dropped in `src/game.js`
- [ ] T041 [US5] Implement hard drop action: call `calculateDropDistance()`, move piece to drop position, add `2 × distance` to `score`, immediately call piece-locking sequence in `src/game.js`
- [ ] T042 [P] [US5] Add `Space` key handler in keyboard listener that sets `InputState.hardDrop = true` (single-trigger, cleared each frame) in `src/input.js`
- [ ] T043 [US5] Implement `Renderer.drawGhostPiece(ctx, piece, board)` — compute drop position via `calculateDropDistance()`, draw piece shape at ghost position with `globalAlpha = 0.3` per ui-contract.md §3.3 in `src/renderer.js`
- [ ] T044 [US5] Add ghost piece render call before current piece render in the main render pipeline in `src/main.js`

**Checkpoint**: Hard Drop and Ghost Piece fully functional; all 5 user stories independently working ✅

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that apply across multiple user stories (localStorage, touch gestures, final CSS polish)

- [ ] T045 [P] Implement `localStorage` high score persistence: load `highScore` from `localStorage.getItem('highScore')` on game init; save on game over if `score > highScore`; update `#high-score` DOM element in `src/game.js`
- [ ] T046 [P] Update `#high-score` element whenever `highScore` changes (game init + new high score during play) in `src/renderer.js`
- [ ] T047 Implement touch gesture handler in `src/input.js`: `touchstart` record `startX`/`startY`; `touchend` compute delta — swipe left (→ moveLeft), swipe right (→ moveRight), swipe down (→ softDrop), swipe up (→ hardDrop), tap with small delta (→ rotateCW) per FR-015
- [ ] T048 [P] Add responsive CSS: `max-width` media query for mobile portrait, ensure canvas and sidebar stack vertically on narrow screens in `index.html` `<style>` block
- [ ] T049 [P] Run all unit tests (`npm test`) and confirm board.test.js, game.test.js, tetrominos.test.js all pass with no failures
- [ ] T050 Run quickstart.md validation: serve game with `python3 -m http.server 8080`, manually verify all acceptance scenarios for US1–US5 in Chrome, Firefox, and Edge
- [ ] T051 [P] Final git verification: run `git status --short --branch` and confirm all source files committed with no untracked files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user story phases**
- **US1 (Phase 3)**: Depends on Foundational — primary MVP blocker
- **US2 (Phase 4)**: Depends on Foundational + US1 (Game Over builds on piece-locking from US1)
- **US3 (Phase 5)**: Depends on Foundational — scoring logic is self-contained but integrates with US1's `clearLines()` call
- **US4 (Phase 6)**: Depends on Foundational + US1 (uses `SevenBagRandomizer.peek()` wired in US1)
- **US5 (Phase 7)**: Depends on Foundational + US1 (uses `canPlace()` and locking sequence from US1)
- **Polish (Phase 8)**: Depends on all user story phases complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ─ BLOCKS ALL ─→ Phase 3 (US1) → Phase 4 (US2)
                                    └→ Phase 5 (US3)
                                    └→ Phase 6 (US4)   [after US1]
                                    └→ Phase 7 (US5)   [after US1]
                                    └→ Phase 8 (Polish) [after all]
```

- **US1 (P1)**: Starts after Phase 2 — no dependency on other stories
- **US2 (P2)**: Starts after Phase 2; integrates naturally with US1 locking sequence
- **US3 (P3)**: Starts after Phase 2; scoring already partially implemented in US1 — hardens into tested pure functions
- **US4 (P4)**: Starts after Phase 2; requires `nextPieceType` wired in US1
- **US5 (P5)**: Starts after Phase 2; requires `canPlace()` from US1

### Within Each User Story

1. Tests MUST be written and confirmed FAILING before implementation begins
2. Data model / pure functions before stateful logic
3. Game logic (`src/game.js`) before renderer integration
4. Input handler (`src/input.js`) before main loop wiring
5. Main loop (`src/main.js`) wiring last

---

## Parallel Opportunities

### Phase 2 Parallel Opportunities

```bash
# Can run simultaneously:
Task T005+T006+T007: All in src/tetrominos.js (sequential within file, parallel with T008–T011)
Task T008: src/board.js
Task T009: src/game.js
Task T010+T011: index.html
```

### Phase 3 (US1) Parallel Opportunities

```bash
# Tests (write together before any implementation):
Task T012: board collision tests in tests/unit/board.test.js
Task T013: board mutation tests in tests/unit/board.test.js
Task T014: rotation/wall-kick tests in tests/unit/tetrominos.test.js

# After tests are failing, implementation:
Task T015+T016: src/board.js (sequential within file)
Task T022: src/input.js (parallel with game.js work)
Task T023+T024: src/renderer.js (parallel with game.js logic)
Task T017→T021: src/game.js (sequential)
Task T025: src/main.js (last, wires all together)
```

### Phase 5 (US3) Parallel Opportunities

```bash
Task T031+T032: both test files can be written simultaneously
Task T033+T034+T035: pure functions in src/game.js — sequential within file but fast
Task T036: src/renderer.js — parallel with game.js work
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational — **cannot skip**
3. Complete Phase 3: User Story 1 (write tests first, then implement)
4. **STOP and VALIDATE**: Open `http://localhost:8080` and confirm a playable Tetris game
5. Run `npm test` — all board and tetrominos tests must pass

### Incremental Delivery

1. **Setup + Foundational** → Repository scaffolded, HTML shell renders ✅
2. **+ User Story 1** → Playable MVP Tetris (drop, move, rotate, line-clear) ✅
3. **+ User Story 2** → Complete game loop with Game Over and restart ✅
4. **+ User Story 3** → Scoring, levels, and accelerating speed ✅
5. **+ User Story 4** → Next-piece preview panel ✅
6. **+ User Story 5** → Hard Drop and Ghost Piece ✅
7. **+ Polish** → localStorage high score, touch gestures, mobile layout ✅

### Parallel Team Strategy

With multiple developers after Foundational phase:

- **Dev A**: User Story 1 (`src/board.js`, `src/game.js` core loop)
- **Dev B**: User Story 2 + 3 (`src/game.js` Game Over + scoring)
- **Dev C**: User Story 4 + 5 (`src/renderer.js` preview + ghost; `src/input.js` Space key)

---

## Notes

- [P] tasks operate on different files or independent code blocks — safe to parallelize
- [US#] label maps each task to its user story for traceability
- TDD is mandatory for game logic: write tests first, confirm failures, then implement
- Use `python3 -m http.server 8080` (not `file://`) to avoid ES module CORS issues
- Commit after each task or logical group; run `git status --short --branch` to verify
- Stop at each **Checkpoint** to validate the story independently before proceeding
- Ghost Piece (`T043`) depends on `calculateDropDistance()` from `T040` — implement in order
- `localStorage` (`T045`) can be implemented anytime after `GameState` is defined in Phase 2
