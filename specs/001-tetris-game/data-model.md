# 資料模型：俄羅斯方塊遊戲 (Tetris Game)

**Branch**: `001-tetris-game` | **Date**: 2026-03-13  
**Phase**: Phase 1 輸出（`/speckit.plan` 指令）

---

## 實體總覽

```
Tetromino ──┐
            ├──> Board ──> GameState
SevenBag  ──┘
```

---

## 1. Tetromino（方塊）

**說明**：7 種標準形狀之一的當前落下方塊。

| 欄位 | 型別 | 說明 |
|------|------|------|
| `type` | `'I'｜'O'｜'T'｜'S'｜'Z'｜'J'｜'L'` | 方塊類型 |
| `rotation` | `0｜1｜2｜3` | 旋轉狀態（0=初始、1=右旋、2=180°、3=左旋） |
| `x` | `number` | 在遊戲區域中的欄索引（左上角 0） |
| `y` | `number` | 在遊戲區域中的列索引（上方外=-1 可接受） |
| `shape` | `number[][]` | 當前旋轉狀態的矩陣（由 `type` + `rotation` 查表得出） |
| `color` | `string` | CSS 顏色字串（由 `type` 決定，不可變） |

**驗證規則**：
- `x` 範圍：放置時各格的 `x + col` 必須在 `[0, 9]` 內
- `y` 範圍：`y >= -1`（允許頂端外生成）；固定後所有格 `y >= 0`
- `rotation` 循環：`(rotation + 1) % 4`（順時針），`(rotation + 3) % 4`（逆時針）

**狀態轉換**：

```
生成（Spawn）
    ↓
下落中（Falling） ←── 玩家輸入（移動/旋轉/加速）
    ↓ 碰撞或到達底部
固定（Locked）→ 觸發消行檢查 → 生成下一個 Tetromino
```

---

## 2. Board（遊戲區域）

**說明**：10 欄 × 20 列的方格矩陣，記錄每格狀態。

| 欄位 | 型別 | 說明 |
|------|------|------|
| `grid` | `(string｜null)[][]` | `grid[row][col]`；`null` = 空白；字串 = Tetromino 顏色 |
| `width` | `10`（固定常數） | 欄數 |
| `height` | `20`（固定常數） | 列數 |

**驗證規則**：
- `grid` 索引：`row ∈ [0, 19]`，`col ∈ [0, 9]`
- 固定方塊時，所有格必須落在合法範圍內（超出頂端 `y < 0` 視為 Game Over）

**操作（純函式，回傳新狀態）**：

| 操作 | 說明 | 回傳 |
|------|------|------|
| `isOccupied(row, col)` | 格子是否被佔用或超出邊界 | `boolean` |
| `canPlace(piece)` | 方塊是否可放置在當前位置 | `boolean` |
| `lockPiece(piece)` | 將方塊固定至 grid | `Board`（新） |
| `clearLines()` | 消除填滿的列，上方列下移 | `{ board: Board, linesCleared: number }` |
| `isLineFull(row)` | 指定列是否完全填滿 | `boolean` |

---

## 3. GameState（遊戲狀態）

**說明**：整體遊戲的可序列化狀態快照。

| 欄位 | 型別 | 初始值 | 說明 |
|------|------|--------|------|
| `status` | `'idle'｜'playing'｜'gameover'` | `'idle'` | 遊戲狀態機 |
| `board` | `Board` | 空白 10×20 | 遊戲區域 |
| `currentPiece` | `Tetromino｜null` | `null` | 當前落下方塊 |
| `nextPieceType` | `PieceType｜null` | `null` | 預覽方塊類型 |
| `score` | `number` | `0` | 當前局分數 |
| `highScore` | `number` | 來自 localStorage | 歷史最高分 |
| `level` | `number` | `1` | 當前等級（最小 1） |
| `totalLinesCleared` | `number` | `0` | 累計消除行數 |
| `gravityTimer` | `number` | `0` | 重力計時器（毫秒，不序列化） |

**計算屬性**（從其他欄位推導，不儲存）：

| 屬性 | 公式 |
|------|------|
| `gravityInterval` | `Math.max(50, 800 / 1.1 ** (level - 1))` ms |
| `isNewHighScore` | `score > highScore` |

**狀態轉換**：

```
idle ──[開始遊戲]──> playing
playing ──[Game Over 條件]──> gameover
gameover ──[重新開始]──> playing（重置所有欄位，保留 highScore）
```

**等級計算**：`level = Math.floor(totalLinesCleared / 10) + 1`

---

## 4. SevenBagRandomizer（7-Bag 隨機器）

**說明**：管理方塊生成順序，確保每 7 個方塊各出現一次。

| 欄位 | 型別 | 說明 |
|------|------|------|
| `currentBag` | `PieceType[]` | 當前袋子（7 個方塊，已洗牌） |
| `nextBag` | `PieceType[]` | 下一個袋子（預先準備，供預覽） |
| `index` | `number` | 當前袋子的消耗位置 |

**操作**：

| 操作 | 說明 | 回傳 |
|------|------|------|
| `next()` | 取出下一個方塊類型 | `PieceType` |
| `peek()` | 預覽下一個方塊類型（不消耗） | `PieceType` |

---

## 5. InputState（輸入狀態）

**說明**：鍵盤與觸控的即時狀態，每幀清除後重新填入。

| 欄位 | 型別 | 說明 |
|------|------|------|
| `moveLeft` | `boolean` | 向左移動 |
| `moveRight` | `boolean` | 向右移動 |
| `softDrop` | `boolean` | Soft Drop（↓ 持續按住） |
| `hardDrop` | `boolean` | Hard Drop（Space 單次觸發） |
| `rotateCW` | `boolean` | 順時針旋轉（↑ 或 X，單次觸發） |
| `rotateCCW` | `boolean` | 逆時針旋轉（Z，單次觸發） |
| `restart` | `boolean` | 重新開始（R，Game Over 時有效） |

---

## 6. 類型定義（TypeScript 風格，供 JSDoc 使用）

```typescript
type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type RotationState = 0 | 1 | 2 | 3;
type Cell = string | null; // null = 空白，string = 顏色
type Grid = Cell[][];      // grid[row][col]，20×10

interface Tetromino {
  type: PieceType;
  rotation: RotationState;
  x: number;
  y: number;
}

interface GameState {
  status: 'idle' | 'playing' | 'gameover';
  board: Grid;
  currentPiece: Tetromino | null;
  nextPieceType: PieceType | null;
  score: number;
  highScore: number;
  level: number;
  totalLinesCleared: number;
}
```

---

## 7. 資料流向圖

```
SevenBagRandomizer
    │ next() / peek()
    ↓
Tetromino（生成）
    │ 玩家輸入（InputState）
    ↓
碰撞偵測（board.canPlace）
    ├── 可移動 → 更新 Tetromino.x / y / rotation
    └── 無法移動 → board.lockPiece()
                      │
                      ↓
                 board.clearLines()
                      │
                      ├── linesCleared > 0 → 更新 score、level、totalLinesCleared
                      └── 生成下一個 Tetromino
                              │
                              └── 生成位置被佔 → GameState.status = 'gameover'
```
