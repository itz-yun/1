# 快速開始指南：俄羅斯方塊遊戲 (Tetris Game)

**Branch**: `001-tetris-game` | **Date**: 2026-03-13  
**Phase**: Phase 1 輸出（`/speckit.plan` 指令）

---

## 前置需求

| 工具 | 版本 | 說明 |
|------|------|------|
| 瀏覽器 | Chrome 90+ / Firefox 88+ / Edge 90+ | 遊玩遊戲 |
| Node.js | 18+ | 執行單元測試（可選） |
| npm | 9+ | 安裝測試依賴（可選） |
| Git | 任意版本 | 版本控制 |

> **無需安裝任何伺服器**。直接用瀏覽器開啟 `index.html` 即可遊玩。

---

## 快速啟動（遊玩）

### 方法 1：直接開啟（最簡單）

```bash
# Clone 專案
git clone <repo-url>
cd 1

# 直接用瀏覽器開啟
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

### 方法 2：本地 HTTP 伺服器（推薦，避免 ES 模組 CORS 問題）

```bash
# 使用 Python 內建伺服器
python3 -m http.server 8080
# 開啟 http://localhost:8080

# 或使用 Node.js serve
npx serve .
# 開啟顯示的 URL
```

---

## 專案結構

```
1/                           ← 儲存庫根目錄
├── index.html               ← 遊戲主頁面（開啟即可玩）
├── src/
│   ├── tetrominos.js        ← 7 種方塊定義 + SRS 旋轉矩陣 + Wall Kick 資料表
│   ├── board.js             ← 遊戲區域邏輯（碰撞、消行）
│   ├── game.js              ← 遊戲狀態管理（分數、等級、Game Over）
│   ├── renderer.js          ← Canvas 繪製
│   ├── input.js             ← 鍵盤 + 觸控輸入處理
│   └── main.js              ← 遊戲進入點（requestAnimationFrame 迴圈）
├── tests/
│   └── unit/
│       ├── board.test.js    ← 消行、碰撞邏輯測試
│       ├── game.test.js     ← 計分、等級、速度計算測試
│       └── tetrominos.test.js ← Wall Kick、旋轉邏輯測試
├── specs/
│   └── 001-tetris-game/     ← 規格文件目錄
└── package.json             ← Jest 測試配置（可選）
```

---

## 遊戲操作

### 鍵盤操作

| 按鍵 | 操作 |
|------|------|
| `←` | 向左移動方塊 |
| `→` | 向右移動方塊 |
| `↓` | Soft Drop（加速下落，每格 +1 分） |
| `↑` 或 `Z` | 順時針旋轉方塊 |
| `Space` | Hard Drop（立即落底，每格 +2 分） |
| `R` | 重新開始（Game Over 時）|

### 行動裝置觸控

| 手勢 | 操作 |
|------|------|
| 左滑 | 向左移動方塊 |
| 右滑 | 向右移動方塊 |
| 下滑 | Soft Drop |
| 上滑 | Hard Drop |
| 單點 | 旋轉方塊 |

---

## 計分規則

| 事件 | 分數 |
|------|------|
| 消除 1 行 | 100 × 等級 |
| 消除 2 行 | 300 × 等級 |
| 消除 3 行 | 500 × 等級 |
| 消除 4 行（Tetris！） | 800 × 等級 |
| Soft Drop（每格） | 1 分 |
| Hard Drop（每格） | 2 分 |

**等級提升**：每累積消除 10 行升一等級，等級越高方塊落下越快。

---

## 執行單元測試

```bash
# 安裝測試依賴
npm install

# 執行所有單元測試
npm test

# 監看模式（開發時用）
npm run test:watch
```

**package.json 測試設定**：

```json
{
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/.bin/jest",
    "test:watch": "node --experimental-vm-modules node_modules/.bin/jest --watch"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  },
  "jest": {
    "transform": {},
    "extensionsToTreatAsEsm": [".js"],
    "testEnvironment": "node"
  }
}
```

---

## 部署至 GitHub Pages

```bash
# 確保 index.html 在儲存庫根目錄
# 在 GitHub 儲存庫設定 → Pages → Source: Deploy from branch → main / (root)
# 部署後可透過 https://<username>.github.io/<repo>/ 訪問
```

**無需任何建置步驟**：純靜態網頁，推送即部署。

---

## 開發注意事項

1. **ES 模組**：所有 `src/*.js` 使用 `export`/`import`，`index.html` 需使用 `<script type="module">`
2. **本地測試**：若直接以 `file://` 開啟，ES 模組會因 CORS 限制失敗；建議使用本地 HTTP 伺服器
3. **localStorage**：最高分存於 `tetrisHighScore` key，可在瀏覽器 DevTools → Application → Local Storage 查看
4. **Canvas 解析度**：若在高 DPI 螢幕上顯示模糊，可設定 `canvas.width = 300 * devicePixelRatio`

---

## 規格文件

| 文件 | 說明 |
|------|------|
| `specs/001-tetris-game/spec.md` | 功能規格與驗收條件 |
| `specs/001-tetris-game/plan.md` | 實作計畫 |
| `specs/001-tetris-game/research.md` | 技術研究報告（SRS、7-bag 等） |
| `specs/001-tetris-game/data-model.md` | 資料模型（實體定義） |
| `specs/001-tetris-game/contracts/ui-contract.md` | UI 合約（DOM、Canvas、輸入規格） |
| `specs/001-tetris-game/tasks.md` | 實作任務清單（`/speckit.tasks` 產出）|
