# UI 統合規約

> 前提: React / Jotai の基本を理解していること
> jotai.md / error-handling.md を読んでいること

## 原則

- **宣言的 > 命令的**。ローディング/エラー状態を各コンポーネントで管理せず、Suspense + Error Boundary に委譲
- **Container / Presenter 分離**。データ取得と表示ロジックを分ける
- **Presenter は純粋に**。props のみに依存し、hooks や atoms を直接使わない

---

## コンポーネント分類

| 分類 | 責任 | 依存できるもの |
| ------ | ------ | --------------- |
| Page | レイアウト、境界配置 | Container, Presenter, AsyncBoundary |
| Container | データ取得、状態購読 | hooks, atoms |
| Presenter | 表示ロジック、スタイル | props のみ |

---

## AsyncBoundary

Suspense + Error Boundary を組み合わせたコンポーネント。Page 層で配置する。

```tsx
// shared/ui/AsyncBoundary.tsx
export function AsyncBoundary({ children, fallback, errorFallback }: Props) {
  return (
    <ErrorBoundary fallbackRender={errorFallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
```

```tsx
// pages/HomeScreen.tsx
<AsyncBoundary
  fallback={<LoadingView />}
  errorFallback={({ error, resetErrorBoundary }) => (
    <ErrorView error={error} onRetry={resetErrorBoundary} />
  )}
>
  <WorkplaceListContainer />
</AsyncBoundary>
```

---

## 非同期 Atom

Jotai の async atom を Suspense と連携させる。エラーは throw して Error Boundary に委譲。

```ts
// stores.ts
const workplaceStatusesAtom = atom(async (get) => {
  const worker = get(workerAtom);
  if (!worker) return new Map();

  const result = await fetchWorkplaceStatuses(worker.id);
  if (result.isErr()) throw result.error;
  return result.value;
});
```

---

## リフレッシュ（UIバージョニング）

ユーザー起点の再取得には **refresh key パターン**を使う。

### stores.ts

```ts
// リフェッチキー（UIバージョニング）
const dataRefetchKeyAtom = atom(0);

// async atom（keyに依存 → keyが変わると再実行）
export const dataAtom = atom(async (get) => {
  get(dataRefetchKeyAtom); // キー変更で再実行
  const result = await fetchData();
  if (result.isErr()) throw result.error;
  return result.value;
});

// リフレッシュ action（キーをインクリメントするだけ）
export const refreshDataAction = atom(null, (_get, set) => {
  set(dataRefetchKeyAtom, (n) => n + 1);
});
```

### Container での useTransition

`useTransition` でリフレッシュ中の状態を管理する。これにより：

- **再サスペンドしない**（ローディングフォールバックが出ない）
- **既存データを表示したままリフレッシュ**
- **手動の isRefreshing atom が不要**

```tsx
// XxxContainer.tsx
import { useTransition } from "react";
import { RefreshControl } from "react-native";
import { useAtomValue, useSetAtom } from "jotai";

export function DataContainer() {
  const data = useAtomValue(dataAtom);
  const refresh = useSetAtom(refreshDataAction);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      refresh();
    });
  };

  const refreshControl = (
    <RefreshControl refreshing={isPending} onRefresh={handleRefresh} />
  );

  return <DataList data={data} refreshControl={refreshControl} />;
}
```

### なぜこのパターンか

| 方式 | 問題点 |
| ----- | ------- |
| `isRefreshingAtom` を手動管理 | atom が増える、set/reset の漏れ |
| async action で fetch + state 更新 | async atom とは別の state atom が必要、購読先が分散 |
| **refresh key + useTransition** | シンプル、React の機能を活用、atom は最小単位 |

---

## 禁止事項

### コンポーネント内でのローディング/エラー状態管理

```tsx
// Bad
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData()
    .then(setData)
    .catch(setError)
    .finally(() => setIsLoading(false));
}, []);

if (isLoading) return <ActivityIndicator />;
if (error) return <Text>{error}</Text>;
```

AsyncBoundary + async atom で置き換える。

### Presenter 内での atom / hooks 使用

```tsx
// Bad
function WorkplaceCard({ geofence }: Props) {
  const worker = useAtomValue(workerAtom);
}

// Good
function WorkplaceCard({ geofence, worker }: Props) {
  // props のみ使用
}
```

### 個別のエラーハンドリング UI

各コンポーネントで `if (error) return <Error />` を書かない。Error Boundary に任せる。

---

## 構成

```text
features/<feature>/
  ui/
    XxxContainer.tsx   # hooks/atoms 使用可
    XxxList.tsx        # props のみ（Presenter）
    XxxCard.tsx        # props のみ（Presenter）

shared/ui/
  AsyncBoundary.tsx
  ErrorView.tsx
  LoadingView.tsx
```

---

## 追加パッケージ

`react-error-boundary` を使用する。
