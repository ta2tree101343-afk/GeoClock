# 外部ライブラリ依存の管理規約

> 前提: Feature ディレクトリ構成を理解していること

## 原則

- **services.ts / tasks.ts が外部依存点**。外部ライブラリの import はこれらに集約
- **型はアプリ独自に定義**。外部ライブラリの型をそのまま公開しない
- **依存方向は一方通行**。types.ts ← services.ts/tasks.ts ← stores.ts ← UI

---

## 依存構造

```text
外部ライブラリ
    ↓ import
services.ts / tasks.ts   ← 外部依存点、変換層
    ↓ import                  ↓ import
types.ts                    stores.ts
    ↑ import                     ↓ import
    └─────────────────────── UI コンポーネント
```

### services.ts と tasks.ts の役割分担

| ファイル | 役割 |
| ---------- | ------ |
| `services.ts` | ビジネスロジック、API呼び出し、型変換 |
| `tasks.ts` | バックグラウンドタスク定義（トップレベル実行が必要な処理） |

### types.ts

外部ライブラリに**依存しない**型定義。アプリ内部で使う型を独自に定義する。

```ts
// Good: アプリ独自の型
export type LocationPermissionStatus = "granted" | "denied" | "undetermined";

// Bad: 外部ライブラリの型をそのまま使用
export type { PermissionStatus } from "expo-location";
```

### services.ts

外部ライブラリを import するファイル。外部の型をアプリ独自の型に変換する。

```ts
import * as Location from "expo-location";
import type { LocationPermissionStatus } from "./types";

// 外部ライブラリの型 → アプリ独自の型への変換
function toLocationPermissionStatus(
  status: Location.PermissionStatus,
): LocationPermissionStatus {
  switch (status) {
    case Location.PermissionStatus.GRANTED:
      return "granted";
    case Location.PermissionStatus.DENIED:
      return "denied";
    case Location.PermissionStatus.UNDETERMINED:
      return "undetermined";
    default: {
      const _exhaustiveCheck: never = status;
      return _exhaustiveCheck;
    }
  }
}

// 公開関数はアプリ独自の型を返す
export async function getLocationPermissionStatus(): Promise<LocationPermissionStatus> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return toLocationPermissionStatus(status);
}
```

### stores.ts / UI

types.ts と services.ts のみに依存。外部ライブラリを直接 import しない。

```ts
// Good: services.ts 経由で機能を使用
import { getLocationPermissionStatus } from "./services";
import type { LocationPermissionStatus } from "./types";

// Bad: 外部ライブラリを直接 import
import * as Location from "expo-location";
```

---

## 利点

| 利点 | 説明 |
| ------ | ------ |
| テスト容易性 | services.ts をモック化するだけで外部依存を切り離せる |
| 差し替え容易性 | 外部ライブラリの変更が services.ts に閉じる |
| 型の安定性 | 外部ライブラリの型変更がアプリ全体に波及しない |
| 可読性 | どこで外部依存があるか一目でわかる |

---

## 変換パターン

### 網羅性チェック付き switch

外部ライブラリの enum をアプリ型に変換する際、`never` 型で網羅性をチェック。

```ts
function toAppType(externalValue: ExternalEnum): AppType {
  switch (externalValue) {
    case ExternalEnum.A:
      return "a";
    case ExternalEnum.B:
      return "b";
    default: {
      // 外部ライブラリが新しい値を追加したらコンパイルエラー
      const _exhaustiveCheck: never = externalValue;
      return _exhaustiveCheck;
    }
  }
}
```

### 双方向変換（必要な場合のみ）

外部ライブラリに値を渡す必要がある場合は逆変換も用意。

```ts
// アプリ型 → 外部ライブラリの型
function toExternalType(appValue: AppType): ExternalEnum {
  switch (appValue) {
    case "a":
      return ExternalEnum.A;
    case "b":
      return ExternalEnum.B;
  }
}
```

---

## 例外

原則より例外を優先しないための判断基準:

### 例外を認める条件（すべて満たす）

1. **変更リスクが低い**: プラットフォーム標準・言語標準の型で、破壊的変更がほぼ起きない
2. **抽象化コストが利益を上回る**: 独自型に置き換えると UI コードが煩雑になる、または情報が失われる
3. **依存が UI 層に閉じる**: services.ts / stores.ts に外部ライブラリの型が漏れない

### 現時点で認められている例外

| ケース | 対象 | 理由 |
| ------- | ------ | ------ |
| types.ts での外部型参照 | `StyleProp<ViewStyle>` 等の RN 標準型 | プラットフォーム標準で変更リスクが低い |
| types.ts での外部型参照 | `Promise<T>` 等の言語標準型 | 言語仕様 |
| UI での直接使用 | `useAuthenticator` 等の認証 UI フック | UI 操作（サインアウト等）と密結合、抽象化コストが高い |

### 例外を追加するときのルール

- **必ずこの表に追記する**。「今回だけ」を認めない
- **判断基準3つすべてを説明する**。1つでも欠けたら services.ts に集約する
- **迷ったら例外を認めない**。原則を守る方が長期的に安い

---

## チェックリスト

新しい feature を追加するとき:

- [ ] 外部ライブラリの import は services.ts / tasks.ts に限定されているか
- [ ] types.ts は外部ライブラリに依存していないか
- [ ] stores.ts / UI は services.ts と types.ts のみに依存しているか（例外を除く）
- [ ] 外部型の変換に網羅性チェックがあるか
