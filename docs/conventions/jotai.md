# Jotai 状態管理規約

> 前提: TypeScript / React / Jotai の基本を理解していること

## 設計原則

- **1 atom = 1 関心事**。巨大オブジェクトに詰め込まない
- **不正状態を型で排除する**。booleanの組み合わせより判別共用体
- **副作用は Action Atom に閉じ込める**。services.ts は Jotai 非依存

---

## Atom 分類と命名

| 分類 | サフィックス | 定義 | 例 |
| ------ | ------------- | ------ | ---- |
| State | `~Atom` | `atom<T>(初期値)` / `atomWithStorage` | `workerAtom`, `geofencesAtom` |
| Derived | `~Atom` | `atom((get) => ...)` 読み取り専用 | `hasPermissionAtom`, `geofenceCountAtom` |
| Async | `~Atom` | `atom(async (get) => ...)` Suspense対応 | `workplaceStatusesAtom`, `eventHistoryAtom` |
| Action | `~Action` | `atom(null, (get, set, arg) => ...)` write-only | `initWorkerAction`, `refreshDataAction` |

Action には `Atom` サフィックスを**つけない**。import文で種別が一目でわかる。

```ts
import { workerAtom, workplaceStatusesAtom } from "./stores"; // State / Async
import { initWorkerAction, refreshDataAction } from "./stores"; // Action
```

---

## State Machine パターン

booleanの組み合わせで矛盾しうる状態を許容しない。

```ts
// Bad: isLoading=true かつ user!=null が同時に起こりうる
const isLoadingAtom = atom(false);
const userAtom = atom<User | null>(null);
const errorAtom = atom<string | null>(null);

// Good: 判別共用体で不正状態を型レベルで排除
type AuthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "error"; error: string };

const authStateAtom = atom<AuthState>({ status: "idle" });
```

**適用基準**: 3つ以上の状態があり不正な組み合わせを防ぎたい場合。
単純な on/off には不要。

より厳密な遷移制御が必要なら `atomWithReducer` で不正遷移を防ぐ:

```ts
const dataAtom = atomWithReducer<State, Event>(
  { status: "idle" },
  (state, event) => {
    switch (state.status) {
      case "idle":
        return event.type === "FETCH" ? { status: "loading" } : state;
      case "loading":
        return event.type === "SUCCESS" ? { status: "done", data: event.data } : state;
      // 不正遷移は現在のstateをそのまま返す
      default:
        return state;
    }
  },
);
```

---

## Async Atom と Suspense

async atom は Suspense と連携する。エラーは throw して Error Boundary に委譲。

```ts
export const dataAtom = atom(async (get): Promise<Data[]> => {
  const result = await fetchData();
  if (result.isErr()) throw result.error;
  return result.value;
});
```

**リフレッシュ**: refresh key パターンを使う。stores.ts 側の書き方はここ、Container 側（`useTransition` との連携）は `ui-integration.md` を参照。

```ts
const refetchKeyAtom = atom(0);

export const dataAtom = atom(async (get): Promise<Data[]> => {
  get(refetchKeyAtom); // キー変更で再実行
  // ...
});

export const refreshDataAction = atom(null, (_get, set) => {
  set(refetchKeyAtom, (n) => n + 1);
});
```

責任分界:

- **jotai.md（stores 側）**: `refetchKeyAtom` + async atom + Action Atom の構造
- **ui-integration.md（Container 側）**: `useTransition` と組み合わせて再サスペンドを回避する使い方

---

## Action Atom の実装パターン

### 単純な更新

```ts
const refreshStatusAction = atom(null, async (_get, set) => {
  const status = await getPermissionStatus();
  set(permissionStatusAtom, status);
});
```

### Result 型で成否を返す

失敗理由を UI に伝える必要がある場合:

```ts
type AddResult =
  | { success: true }
  | { success: false; reason: "permission_denied" | "limit_exceeded" };

const addGeofenceAction = atom(
  null,
  async (get, set, region: GeofenceRegion): Promise<AddResult> => {
    if (get(permissionStatusAtom) !== "granted") {
      return { success: false, reason: "permission_denied" };
    }
    // ...
    set(geofencesAtom, newGeofences);
    return { success: true };
  },
);
```

---

## Jotai で管理する / しない

| Jotai で管理する | useState 等で管理する |
| ----------------- | --------------------- |
| 複数コンポーネントで共有 | 単一コンポーネントの UI 状態（モーダル開閉等） |
| バックグラウンドタスクと共有 | 一時的な計算結果（`useMemo`） |
| アプリライフサイクルを跨ぐ（永続化） | ナビゲーション状態 |
| feature 間で参照される | フォーム入力値 |

---

## ファイル構成

```text
features/<feature>/
  types.ts      型定義
  services.ts   ビジネスロジック・API呼び出し（Jotai非依存）
  stores.ts     State + Derived + Action Atom
  hooks.ts      useAtom ラップ（必要な場合のみ）
```

stores.ts が肥大化したら `atoms.ts` / `actions.ts` に分割。先にやらない。

---

## Feature 間の依存

- State Atom の import は**一方向**。循環依存禁止
- feature 間連携は Action Atom 内で他 feature の State Atom を `get` / `set`
- services.ts は Jotai に依存しない

```text
permission ← geofence   (パーミッション状態を参照)
permission ← worker     (パーミッション状態を参照)
worker → geofence/services (ジオフェンス登録を呼び出し)
```

---

## AsyncStorage との二重構成

バックグラウンドタスク（expo-task-manager）から Jotai store にはアクセスできない。
共有データは `atomWithStorage` + AsyncStorage 直接アクセスの二重構成:

```ts
// Jotai コンテキスト内
export const lastEventsAtom = atomWithStorage<LastEvents>(KEY, {}, storage);

// バックグラウンドタスクから直接
export async function getLastEvent(id: string): Promise<LastEventType | null> {
  const json = await AsyncStorage.getItem(KEY);
  return json ? JSON.parse(json)[id] ?? null : null;
}
```

ストレージキーは定数で定義し、両者で共有する。
