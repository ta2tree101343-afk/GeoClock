# Amplify Gen2 データアクセス規約

> 前提: AWS Amplify Gen2 / AppSync / DynamoDB の基本を理解していること
> 裏側は AppSync + GraphQL だが、`generateClient<Schema>()` により型安全な ORM 的インタフェースでアクセスする。GraphQL を直接書くことはない。

## Client

### Singleton で共有する

`lib/amplify.ts` で1回だけ生成し、全 feature から import する。

```ts
// lib/amplify.ts
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

export const client = generateClient<Schema>({
  authMode: "identityPool",
});
```

```ts
// features/*/services.ts
import { client } from "@/lib/amplify";
```

`generateClient` は React コンテキストに依存しない。バックグラウンドタスクからも同じ `client` を使う。

---

## 禁止事項

### `list()` をフィルタなし・index なしで使わない

`list()` は DynamoDB の Scan に相当する。レコード数に比例してコストと遅延が増大する。

```ts
// Bad: scan
await client.models.LocationEvent.list();
await client.models.LocationEvent.list({
  filter: { workerId: { eq: id } },
});
// ↑ filter つきでも scan + クライアントフィルタ

// Good: secondary index を使った query
await client.models.LocationEvent.listLocationEventByWorkerIdAndTimestamp(
  { workerId },
  { sortDirection: "DESC" },
);
```

`list()` が許容されるケース:

- 管理画面での一覧取得（レコード数が限定的で、適切な index がない場合）
- seed / migration スクリプト

### N+1 クエリを書かない

ループ内での個別 `get` / `list` を避ける。

```ts
// Bad: N+1
const statuses = await Promise.all(
  geofenceIds.map((id) => fetchWorkplaceStatus(workerId, id)),
);

// Good: 1回の query + クライアント側グルーピング
const { data: events } =
  await client.models.LocationEvent.listLocationEventByWorkerIdAndTimestamp(
    { workerId },
    { sortDirection: "DESC" },
  );
// events を geofenceId ごとに振り分け
```

例外: `get` by ID の並列呼び出しは、BatchGetItem 相当の API が Gen2 にないため現状許容。
ただし件数が固定的に少ない場合に限る（例: Worker の assignedGeofenceIds、上限 20）。

### Schema 型をそのまま返さない

services.ts の戻り値は feature 固有の型に変換する。Amplify の内部型が外部に漏れることを防ぐ。

```ts
// Bad
export async function fetchWorker(email: string) {
  const { data } = await client.models.Worker.listWorkerByEmail({ email });
  return data[0]; // Amplify の内部型
}

// Good
export async function fetchWorkerByEmail(email: string): Promise<WorkerInfo | null> {
  const { data: workers } = await client.models.Worker.listWorkerByEmail({ email });
  if (workers.length === 0) return null;
  const w = workers[0];
  return {
    id: w.id,
    email: w.email,
    name: w.name,
    assignedGeofenceIds: w.assignedGeofenceIds?.filter((id): id is string => id != null) ?? [],
  };
}
```

### `generateClient` を複数箇所で呼ばない

毎回生成すると設定の一貫性が保証できない。`lib/amplify.ts` の singleton を使う。

---

## 推奨パターン

### Secondary Index を設計してから query を書く

データアクセスパターンを先に洗い出し、`amplify/data/resource.ts` に index を定義する。

```ts
// schema 定義
LocationEvent: a.model({ ... })
  .secondaryIndexes((index) => [
    index("workerId").sortKeys(["timestamp"]),   // worker の勤怠履歴
    index("geofenceId").sortKeys(["timestamp"]), // 勤務地別の履歴
    index("date").sortKeys(["timestamp"]),       // 日次集計
  ]),

// client 側: 自動生成される listBy メソッドを使用
await client.models.LocationEvent.listLocationEventByWorkerIdAndTimestamp(
  { workerId },
  { sortDirection: "DESC", limit: 100 },
);
```

### `{ data, errors }` を常に分割代入する

```ts
const { data: workers, errors } = await client.models.Worker.listWorkerByEmail({ email });
if (errors) {
  console.error("fetch failed:", errors);
}
```

### sortDirection でサーバー側ソートする

クライアントソートではなく、DynamoDB の sortKey + `sortDirection: "DESC"` を使う。

---

## 構成

```text
amplify/data/resource.ts   スキーマ定義（Schema 型の源泉）
lib/amplify.ts             generateClient singleton
features/*/services.ts     client を使ったデータアクセス（唯一の利用箇所）
features/*/types.ts        feature 固有の型（Schema 型からの変換先）
```

components や stores.ts から `client` を直接 import しない。データアクセスは services.ts に集約する。

---

## キャッシュ戦略（将来方針）

現状はキャッシュなし（毎回 API コール）。MVP フェーズではこれで十分。

キャッシュが必要になったら SWR を導入する。`generateClient` は単なる async 関数を提供するだけなので、フェッチライブラリに依存しない。

```ts
// 導入時のイメージ
import useSWR from "swr";
import { client } from "@/lib/amplify";

function useWorker(email: string) {
  return useSWR(
    ["Worker", "listByEmail", { email }],
    () => fetchWorkerByEmail(email),
  );
}
```

---

## 認可モード

現在 `identityPool`（未認証アクセス許可）で運用中。本番前に見直し:

- `userPool`: Cognito 認証済みユーザーのみ
- モデルごとの認可ルール（owner-based, group-based）

変更時は `lib/amplify.ts` の `authMode` と `amplify/data/resource.ts` の `authorization` を同時に更新する。
