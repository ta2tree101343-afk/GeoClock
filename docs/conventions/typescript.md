# TypeScript 型規約

> 前提: TypeScript に習熟していること。`strict: true` は有効。

## 原則

- **型はドキュメント**。コードを読む人が型だけで意図を理解できるようにする
- **コンパイラを信頼する**。推論できるものに手で型を書かない
- **不正状態を表現不可能にする**。実行時チェックより型制約

---

## 推奨パターン

### 判別共用体で状態を表現する

分岐を伴うデータは tagged union で。パターンマッチが網羅的になる。

```ts
type AddResult =
  | { success: true }
  | { success: false; reason: "permission_denied" | "limit_exceeded" };

function handle(result: AddResult) {
  if (result.success) {
    // result.reason にアクセスできない（型で排除済み）
  }
}
```

### リテラル型で値を制限する

取りうる値が有限なら `string` / `number` ではなくリテラル型。

```ts
// Good
type PermissionStatus = "granted" | "denied" | "undetermined";

// Bad
type PermissionStatus = string;
```

### 型推論に任せる

コンパイラが推論できる箇所に明示的な型注釈は書かない。

```ts
// Good
const count = items.length;
const names = workers.map((w) => w.name);

// Bad: 冗長
const count: number = items.length;
const names: string[] = workers.map((w) => w.name);
```

例外: **公開関数の引数**と**曖昧になりうる return 型**は明示する。

```ts
function fetchWorker(email: string): Promise<WorkerInfo | null> { ... }

// atom 初期値が null → 型パラメータ明示
const workerAtom = atom<WorkerInfo | null>(null);
```

### 外部入力は `unknown` で受ける

パース・バリデーション前のデータは `unknown`。型ガードで絞り込む。

```ts
// Good
function parseEvent(raw: unknown): GeofenceEvent { ... }

// Bad
function parseEvent(raw: any): GeofenceEvent { ... }
```

### `as const` でリテラル型を保持する

```ts
const GEOFENCE_LIMITS = { ios: 20, android: 100 } as const;
// typeof GEOFENCE_LIMITS.ios → 20（number ではない）

const ACTIONS = ["IN", "OUT"] as const;
type Action = (typeof ACTIONS)[number]; // "IN" | "OUT"

// satisfies と併用 → リテラル型保持 + 型チェック
const STATUS_LABEL = {
  granted: "許可済み",
  denied: "拒否",
  undetermined: "未確認",
} as const satisfies Record<PermissionStatus, string>;
```

### Branded Type で ID を区別する（必要時）

異なる種類の ID を取り違えるバグを防ぐ。

```ts
type WorkerId = string & { readonly __brand: "WorkerId" };
type GeofenceId = string & { readonly __brand: "GeofenceId" };
```

現時点では未導入。ID の取り違えが実際にバグを生んだら導入する。

---

## `interface` と `type` の使い分け

| 用途 | 使うもの | 例 |
| ------ | --------- | ----- |
| オブジェクトの形状定義 | `interface` | `interface WorkerInfo { id: string; ... }` |
| ユニオン・交差型 | `type` | `type Result = Success \| Failure` |
| リテラルユニオン | `type` | `type Status = "granted" \| "denied"` |
| 既存型のエイリアス | `type` | `type LastEvents = Record<string, LastEventType>` |
| 関数シグネチャ単体 | `type` | `type Handler = (event: Event) => void` |

**判断基準**: オブジェクトの形状 → `interface`、それ以外 → `type`。

```ts
// interface: データ構造。extends で拡張可能
interface AssignedGeofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
}

// type: 合成・制約
type AddResult =
  | { success: true }
  | { success: false; reason: "permission_denied" | "limit_exceeded" };

type LastEvents = Record<string, LastEventType>;
```

---

## 禁止事項

### `any` 禁止

`unknown` + 型ガード or ジェネリクスで解決する。
外部ライブラリの型不備で不可避な場合のみ `// biome-ignore` 付きで許可。

### `as` 型アサーション禁止

コンパイラの検証をバイパスする。型ガードか設計で解決する。

```ts
// Bad
const worker = data as WorkerInfo;

// Good
function isWorkerInfo(data: unknown): data is WorkerInfo {
  return typeof data === "object" && data !== null && "id" in data;
}
```

許可される例外:

| 構文 | 用途 | 理由 |
| ------ | ------ | ------ |
| `as const` | リテラル型を保持する | 型推論に必要、値検証はバイパスしない |
| `x as const satisfies T` | リテラル型保持 + 型チェック | `satisfies` が型検証を担うため安全 |
| `_exhaustiveCheck: never` | switch の網羅性チェック | コンパイラの検証を受ける側で、バイパスではない |

上記以外の `as` は原則 PR で reject。外部ライブラリの型不備で不可避な場合のみ `// biome-ignore` + 理由コメント付きで許可。

### `enum` 新規作成禁止

union 型を使う。既存の `GeofencingEventType` は外部ライブラリ互換で残す。

```ts
// Bad
enum Status { Active, Inactive }

// Good
type Status = "active" | "inactive";
```

理由: enum は TypeScript 固有の値生成構文で tree-shaking に不利、型レベルの操作と噛み合わない。

### Non-null assertion (`!`) 禁止

Optional chaining (`?.`) や early return で処理する。

```ts
// Bad
const name = worker!.name;

// Good
if (!worker) return;
const name = worker.name;
```

### `namespace` 禁止

ESM の import/export で名前空間を管理する。

---

## ツールによる強制（参考）

| 設定 | 効果 |
| ------ | ------ |
| `strict: true` | `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes` 等すべて有効 |
| Biome recommended | `noExplicitAny`, `useEnumInitializers` 等を lint |
| `noBarrelFile: error` | barrel file（re-export のみの index.ts）禁止 |
