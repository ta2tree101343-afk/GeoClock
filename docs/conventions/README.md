# Conventions（コーディング規約）

## 概要

プロジェクト全体で一貫したコードスタイルと設計パターンを維持するための規約集。

## 説明

新しいコードを書く際、レビューする際の基準として使用してください。
各ファイルは特定の技術・パターンに関する規約をまとめています。

## ファイル一覧

| ファイル | 内容 | 読む順序 |
| --------- | ------ | --------- |
| [typescript.md](./typescript.md) | 型システムの使い方、判別共用体、`as` / `enum` 禁止 | 1 |
| [error-handling.md](./error-handling.md) | neverthrow による Result 型、境界での例外変換 | 2 |
| [external-dependencies.md](./external-dependencies.md) | services.ts / tasks.ts への外部ライブラリ依存集約 | 3 |
| [jotai.md](./jotai.md) | Atom 分類、State Machine パターン、Suspense 連携 | 4 |
| [amplify-data.md](./amplify-data.md) | Amplify Data の使い方（プロジェクト固有） | 4 |
| [ui-integration.md](./ui-integration.md) | AsyncBoundary、Container/Presenter 分離、リフレッシュ | 5 |

## 基本フォーマット

```markdown
# タイトル

> 前提や対象読者

## 原則

- なぜこの規約が必要か

---

## 推奨パターン

### パターン名

説明とコード例

## アンチパターン

避けるべき例
```
