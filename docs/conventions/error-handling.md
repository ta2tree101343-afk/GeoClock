# エラーハンドリング規約

> 前提: TypeScript に習熟していること。neverthrow の基本を理解していること。

## 原則

- **エラーは戻り値**。失敗しうる関数は Result 型で返し、呼び出し側がエラーを無視できない設計にする
- **例外は想定外のみ**。バリデーションエラー、リソース未発見などビジネスロジック上の失敗は例外ではない
- **境界で変換**。外部ライブラリの例外はシステム境界で Result 型に変換し、内部では例外が飛ばない状態を維持する

---

## ライブラリ

[neverthrow](https://github.com/supermacro/neverthrow) を使用する。

---

## Result 型の使い分け

| 場面 | 使うもの |
| ------ | --------- |
| 同期処理 | `Result<T, E>` |
| 非同期処理 | `ResultAsync<T, E>` |
| 外部ライブラリの例外ラップ | `ResultAsync.fromPromise()` |

---

## 推奨パターン

### 失敗は伝播させる

処理チェーンの途中で失敗したら後続はスキップし、失敗をそのまま返す（Railway Oriented Programming）。

```ts
fetchUser(id)
  .andThen(validateUser)
  .andThen(updateUser)
  .map(toResponse);
```

### エラー型は Error 継承クラス

基底クラスを作り、派生クラスで具体的なエラーを表現する。

```ts
// 基底クラス
abstract class AppError extends Error {
  abstract readonly code: string;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

// 派生クラス
class ApiError extends AppError {
  readonly code = "API_ERROR";
}

class ValidationError extends AppError {
  readonly code = "VALIDATION_ERROR";
}
```

メリット:

- スタックトレースが取れる
- `cause` で元の例外を保持できる
- Sentry 等のエラー監視ツールとの互換性

### 境界で例外を変換する

```ts
function fetchWorker(id: string): ResultAsync<Worker, ApiError> {
  return ResultAsync.fromPromise(
    client.models.Worker.get({ id }),
    (e) => new ApiError("Worker fetch failed", { cause: e }),
  );
}
```

---

## `throw` を許容する唯一の境界: UI 側 async atom

Suspense / Error Boundary は例外機構で動くため、UI 境界では `throw` する。ここが「制御フローに例外を使わない」原則の**唯一の例外**。

```ts
// stores.ts
export const dataAtom = atom(async (get): Promise<Data[]> => {
  const result = await fetchData();
  if (result.isErr()) throw result.error; // ← ここだけ throw OK
  return result.value;
});
```

ルール:

- **throw できるのは Result → Error 変換のみ**。新しく `throw new Error(...)` を書かない
- **throw する場所は async atom / Container 内に限定**。services.ts では絶対に throw しない
- **Error Boundary が受け取る前提**。Error Boundary の外では従来通り Result を伝播させる

理由: React の Suspense + Error Boundary は宣言的なエラー UI を実現する仕組みで、これに乗るには throw が必要。UI 層に閉じるかぎり、内部ロジックの Result 型設計は壊れない。

---

## 禁止事項

### 制御フローに例外を使わない

```ts
// Bad
function getUser(id: string): User {
  const user = db.find(id);
  if (!user) throw new NotFoundError();
  return user;
}

// Good
function getUser(id: string): Result<User, "NOT_FOUND"> {
  const user = db.find(id);
  if (!user) return err("NOT_FOUND");
  return ok(user);
}
```

### エラーを握りつぶさない

```ts
// Bad
try {
  await save(data);
} catch (e) {
  console.error(e);
}

// Good
const result = await save(data);
if (result.isErr()) {
  return err(result.error);
}
```

---

## ファイル構成

```text
features/*/services.ts   外部APIの呼び出し → Result型に変換（システム境界）
features/*/hooks.ts      Resultを受け取りUIに反映
```
