# UI 合約：俄羅斯方塊遊戲 (Tetris Game)

**Branch**: `001-tetris-game` | **Date**: 2026-03-13  
**Phase**: Phase 1 輸出（`/speckit.plan` 指令）

---

## 1. 畫面佈局合約

```
┌─────────────────────────────────────────────┐
│              俄羅斯方塊                        │
├───────────────────┬─────────────────────────┤
│                   │  下一個方塊               │
│                   │  ┌──────────────┐        │
│   遊戲區域         │  │   Preview    │        │
│   Canvas          │  │   120×120    │        │
│   300×600         │  └──────────────┘        │
│                   │                          │
│                   │  分數：0                  │
│                   │  最高分：0                │
│                   │  等級：1                  │
│                   │  行數：0                  │
│                   │                          │
│                   │  [開始遊戲]               │
└───────────────────┴─────────────────────────┘
```

---

## 2. DOM 元素合約

所有元素 ID 與 class 名稱為實作合約，不得任意更改（否則需同步更新 JS 選擇器）。

| 元素 | 選擇器 | 說明 |
|------|--------|------|
| 主遊戲畫布 | `#game-canvas` | `<canvas>` 300×600，主遊戲區域 |
| 預覽畫布 | `#next-canvas` | `<canvas>` 120×120，下一個方塊預覽 |
| 分數顯示 | `#score` | 當前局分數（數字文字） |
| 最高分顯示 | `#high-score` | 歷史最高分（數字文字） |
| 等級顯示 | `#level` | 當前等級（數字文字） |
| 行數顯示 | `#lines` | 累計消除行數（數字文字） |
| 開始/重啟按鈕 | `#start-btn` | 開始遊戲或重新開始 |
| Game Over 覆蓋層 | `#game-over-overlay` | 遊戲結束半透明遮罩（`display: none` 預設隱藏） |
| Game Over 分數 | `#final-score` | Game Over 時顯示最終分數 |

---

## 3. Canvas 繪製規格合約

### 3.1 主遊戲區域（`#game-canvas`）

| 規格 | 值 |
|------|-----|
| 寬度 | 300px（10 欄 × 30px） |
| 高度 | 600px（20 列 × 30px） |
| 格子大小 | 30px × 30px |
| 背景色 | `#000000`（黑色） |
| 格線色 | `#1a1a1a`（深灰，選填） |

**繪製順序（每幀）**：
1. `clearRect(0, 0, 300, 600)`
2. 繪製背景（可選格線）
3. 繪製已固定的方塊（遍歷 `board.grid`）
4. 繪製 Ghost Piece（當前方塊的落底預測，半透明）
5. 繪製當前落下方塊
6. 若 Game Over：繪製半透明遮罩

### 3.2 格子繪製規格

```javascript
// 每個格子的繪製標準
function drawCell(ctx, x, y, color, alpha = 1.0) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(x * 30, y * 30, 30, 30);

  // 亮邊（上、左）
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x * 30, y * 30, 30, 2);        // 上邊
  ctx.fillRect(x * 30, y * 30, 2, 30);        // 左邊

  // 暗邊（下、右）
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x * 30, y * 30 + 28, 30, 2);   // 下邊
  ctx.fillRect(x * 30 + 28, y * 30, 2, 30);   // 右邊

  ctx.globalAlpha = 1.0;
}
```

### 3.3 Ghost Piece（落底預測）

- Ghost Piece 使用 `globalAlpha = 0.3` 繪製
- 顏色與當前方塊相同
- 位置：從當前方塊位置向下移動直到碰撞前的最低點

### 3.4 預覽區（`#next-canvas`）

| 規格 | 值 |
|------|-----|
| 寬度 | 120px |
| 高度 | 120px |
| 格子大小 | 30px × 30px |
| 背景色 | `#000000` |
| 方塊居中顯示 | 計算形狀邊界框後置中 |

---

## 4. 鍵盤輸入合約

| 按鍵 | 事件 | 操作 | 備註 |
|------|------|------|------|
| `ArrowLeft` | `keydown`（DAS）| 向左移動 | 持續按住支援 DAS（Delayed Auto Shift，MVP 可先跳過） |
| `ArrowRight` | `keydown`（DAS）| 向右移動 | 同上 |
| `ArrowDown` | `keydown`（持續）| Soft Drop | 持續按住，每幀觸發 |
| `ArrowUp` | `keydown`（單次）| 順時針旋轉 | 單次觸發 |
| `z` / `Z` | `keydown`（單次）| 順時針旋轉 | 與 ↑ 相同效果 |
| `Space` | `keydown`（單次）| Hard Drop | 單次觸發，防止重複 |
| `r` / `R` | `keydown`（單次）| 重新開始 | 僅 Game Over 狀態有效 |

**防止預設行為**：`Space`（捲動頁面）、`ArrowDown/Up/Left/Right`（捲動頁面）需呼叫 `e.preventDefault()`。

---

## 5. 觸控手勢合約

| 手勢 | 最小位移 | 最大時間 | 操作 |
|------|----------|----------|------|
| 左滑 | 30px（水平） | 300ms | 向左移動 |
| 右滑 | 30px（水平） | 300ms | 向右移動 |
| 下滑 | 30px（垂直向下） | 300ms | Soft Drop |
| 上滑 | 30px（垂直向上） | 300ms | Hard Drop |
| 單點 Tap | ≤10px 位移 | ≤500ms | 順時針旋轉 |

**方向辨別**：比較 `|deltaX|` vs `|deltaY|`，較大者決定方向（水平或垂直）。

---

## 6. localStorage 合約

| Key | 型別 | 說明 |
|-----|------|------|
| `tetrisHighScore` | `string`（整數） | 歷史最高分，以 `parseInt(..., 10)` 讀取 |

---

## 7. 分數更新合約

更新時機（確保即時性）：

| 事件 | 更新 DOM 元素 |
|------|--------------|
| 每次 Soft Drop（每格） | `#score` |
| Hard Drop 完成後 | `#score` |
| 消行後 | `#score`、`#lines`、`#level` |
| 分數超越最高分 | `#high-score`、`localStorage` |
| 遊戲重新開始 | 全部歸零（`#score`、`#lines`、`#level`） |
| 頁面載入 | `#high-score` 讀取 localStorage |

---

## 8. Game Over 覆蓋層合約

**觸發條件**：`GameState.status` 變更為 `'gameover'` 時

**顯示**：
```css
#game-over-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 300px; height: 600px;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
```

**內容**：
1. 文字「GAME OVER」
2. 最終分數（`#final-score`）
3. 提示「按 R 鍵或點擊按鈕重新開始」

---

## 9. 響應式佈局合約（行動裝置）

- 遊戲容器最大寬度：`360px`，置中顯示
- 行動裝置上隱藏鍵盤提示，顯示觸控手勢說明
- `<canvas>` 使用 `touch-action: none` 防止預設捲動行為
- 禁用雙擊縮放：`user-scalable=no`（於 `<meta viewport>` 設定）
