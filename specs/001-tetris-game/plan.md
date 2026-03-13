# 實作計畫：俄羅斯方塊遊戲 (Tetris Game)

**Branch**: `001-tetris-game` | **Date**: 2026-03-13 | **Spec**: `/specs/001-tetris-game/spec.md`
**Input**: Feature specification from `/specs/001-tetris-game/spec.md`

## 摘要

以純前端靜態網頁（HTML5 + CSS3 + Vanilla JavaScript ES6+）實作標準俄羅斯方塊遊戲，
支援 7 種 Tetromino、SRS 旋轉系統（含 Wall Kick）、7-bag 隨機系統、計分與等級、
localStorage 最高分記錄，以及行動裝置觸控手勢，可直接部署至 GitHub Pages。

## Technical Context

**Language/Version**: HTML5, CSS3, Vanilla JavaScript (ES6+)  
**Primary Dependencies**: 無（純原生 Web 技術，不依賴任何第三方函式庫）  
**Storage**: `localStorage`（僅存最高分 `highScore`）  
**Testing**: 手動瀏覽器測試（MVP）；單元邏輯可選用 Jest（無需打包工具）  
**Target Platform**: 現代桌面瀏覽器（Chrome 90+, Firefox 88+, Edge 90+）、iOS Safari 14+、Android Chrome 90+  
**Project Type**: 靜態單頁網頁應用（Single-page static web app，可部署至 GitHub Pages）  
**Performance Goals**: 60 fps 動畫；鍵盤/觸控響應 < 50 ms  
**Constraints**: 無後端、離線可用、不安裝、單一 HTML 檔案或最少檔案數  
**Scale/Scope**: 單一頁面；無多使用者；無伺服器

## 憲章檢查

*GATE: 在 Phase 0 研究前必須通過。Phase 1 設計後重新確認。*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 文件語言（繁體中文） | ✅ 通過 | 本計畫及所有規格文件均使用繁體中文撰寫 |
| II. 最小必要與避免過度設計 | ✅ 通過 | 純 Vanilla JS，無框架、無打包工具；僅實作規格要求功能 |
| III. 測試先行（TDD） | ✅ 通過 | 遊戲邏輯（計分、消行、碰撞）須先寫測試，視覺層記錄不可測試原因 |
| IV. Git 可驗證流程 | ✅ 通過 | 每個主要階段執行 `git status --short --branch` 並記錄於 tasks.md |
| V. 實作追蹤與規格保護 | ✅ 通過 | 不刪除既有規格文件；tasks.md 即時勾選；不新增僅用於摘要的 Markdown |

**無憲章違規，可繼續進行 Phase 0。**

---

### Phase 1 後置憲章重新檢查

*Phase 1 設計（research.md、data-model.md、contracts/、quickstart.md）完成後再次確認。*

| 原則 | 狀態 | Phase 1 後驗證說明 |
|------|------|-------------------|
| I. 文件語言（繁體中文） | ✅ 通過 | research.md、data-model.md、quickstart.md、ui-contract.md 均以繁體中文撰寫 |
| II. 最小必要與避免過度設計 | ✅ 通過 | 資料模型僅有 5 個實體（Tetromino、Board、GameState、SevenBag、InputState），無多餘抽象層；合約僅定義規格要求的 UI 元素 |
| III. 測試先行（TDD） | ✅ 通過 | 已在 data-model.md 中標記可測試邏輯（計分、消行、碰撞、Wall Kick）；視覺層（Canvas 繪製）記錄為不可自動化測試 |
| IV. Git 可驗證流程 | ✅ 通過 | plan.md 完成後即執行 git commit；tasks.md 將在各階段記錄 git status |
| V. 實作追蹤與規格保護 | ✅ 通過 | 未刪除或覆蓋 spec.md；新增文件皆為規格內容（非純摘要 Markdown） |

**Phase 1 後置憲章檢查通過，可進行 Phase 2（/speckit.tasks）。**

## 專案結構

### 規格文件（本功能）

```text
specs/001-tetris-game/
├── plan.md          # 本檔案（/speckit.plan 輸出）
├── research.md      # Phase 0 輸出
├── data-model.md    # Phase 1 輸出
├── quickstart.md    # Phase 1 輸出
├── contracts/       # Phase 1 輸出
│   └── ui-contract.md
└── tasks.md         # Phase 2 輸出（/speckit.tasks 指令，本指令不建立）
```

### 原始碼（儲存庫根目錄）

```text
index.html           # 遊戲主頁面（HTML 結構 + CSS 樣式）
src/
├── tetrominos.js    # 7 種 Tetromino 形狀定義、SRS 旋轉矩陣、Wall Kick 資料表
├── board.js         # Board（10×20 方格矩陣）邏輯：放置、消行、碰撞偵測
├── game.js          # GameState 管理：分數、等級、速度、Game Over、重新開始
├── renderer.js      # Canvas 繪製：Board、當前方塊、預覽方塊、UI 數值
├── input.js         # 鍵盤事件 + 觸控手勢處理
└── main.js          # 進入點：初始化、requestAnimationFrame 遊戲迴圈
tests/
└── unit/
    ├── board.test.js       # 消行、碰撞偵測邏輯單元測試
    ├── game.test.js        # 計分、等級、速度計算單元測試
    └── tetrominos.test.js  # Wall Kick、旋轉邏輯單元測試
```

**結構決策**：選擇「單一靜態網頁」方案。前端原始碼以 ES 模組（`type="module"`）
組織於 `src/` 目錄，`index.html` 直接引用，無需打包工具。測試以 Jest（`--experimental-vm-modules`）
執行純邏輯單元測試，不依賴瀏覽器 DOM。
