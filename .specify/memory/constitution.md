<!--
Sync Impact Report
- Version change: unversioned template -> 1.0.0
- Modified principles:
	- Template Principle 1 -> I. 文件語言一致（繁體中文）
	- Template Principle 2 -> II. 最小必要與避免過度設計
	- Template Principle 3 -> III. 測試先行（TDD，非可選）
	- Template Principle 4 -> IV. Git 可驗證流程
	- Template Principle 5 -> V. 實作追蹤與規格保護
- Added sections:
	- 專案約束
	- 開發工作流
- Removed sections:
	- 無
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ✅ not applicable: .specify/templates/commands/*.md (directory absent)
- Follow-up TODOs:
	- 無
-->

# Project 1 Constitution

## Core Principles

### I. 文件語言一致（繁體中文）
所有 `spec.md`、`plan.md`、`tasks.md` 與代理回覆 MUST 使用繁體中文。
僅在外部規格、第三方 API 欄位或程式語言關鍵字不可翻譯時，才可保留原文。
理由：降低溝通成本，確保需求、設計與實作解讀一致。

### II. 最小必要與避免過度設計
每次變更 MUST 以最小可行範圍完成需求，不得預先實作未被要求的抽象層、
模組或文件。新增設計若增加明顯複雜度，必須在計畫中說明必要性與替代方案。
理由：維持交付速度、可維護性與需求對焦。

### III. 測試先行（TDD，非可選）
功能開發 MUST 遵循 Red-Green-Refactor：先寫測試、先看到失敗、再實作、再重構。
若任務無法合理自動化測試，必須在任務中記錄原因與可驗證替代方式。
理由：避免回歸問題並提升需求可驗證性。

### IV. Git 可驗證流程
每個主要階段（規格、計畫、任務、實作前後）MUST 執行可驗證的 Git 狀態檢查
（至少 `git status --short --branch`），確保變更範圍與工作樹狀態可追蹤。
理由：降低誤改、漏改與不明來源變更風險。

### V. 實作追蹤與規格保護
實作階段 MUST 即時更新 `tasks.md` 勾選狀態，且不得刪除、覆蓋或破壞既有規格文件
（`spec.md`、`plan.md`、`tasks.md`），包含套用框架模板時也同樣適用。
除非使用者明確要求，不得新增 Markdown 檔案僅用於變更摘要。
理由：保留決策脈絡並維持規格與執行一致性。

## 專案約束

- 若專案為網站型態，預設 MUST 採用前端靜態網站方案，並以可部署至 GitHub Pages
	為基準。
- 若需求明確要求後端或動態能力，才可在計畫中加入對應元件與理由。

## 開發工作流

1. 規格階段：以繁體中文定義可獨立驗證的使用者故事與驗收條件。
2. 計畫階段：執行憲章檢查，確認無過度設計並定義測試策略與 Git 驗證點。
3. 任務階段：任務需含明確檔案路徑，並安排先測試後實作順序。
4. 實作階段：依 TDD 進行，完成即勾選 `tasks.md`，且不覆寫規格文件。
5. 驗證階段：確認測試、文件與 Git 狀態皆符合本憲章。

## Governance

本憲章優先於其他慣例與模板。任何修訂 MUST 透過明確變更提案，說明影響範圍，並
同步更新受影響模板。

版本規則採語意化版本：
- MAJOR：移除或重定義核心原則，造成流程不相容。
- MINOR：新增原則或新增具約束力章節。
- PATCH：文字澄清、措辭修正或不改變治理語意的編修。

合規審查要求：每次 `/speckit.plan`、`/speckit.tasks`、`/speckit.implement` 產出前後，
都 MUST 重新檢查本憲章對應條款；若不符合，必須先修正再繼續。

**Version**: 1.0.0 | **Ratified**: 2026-03-06 | **Last Amended**: 2026-03-06
