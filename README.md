# GeoClock

工事現場の外国人労働者向けジオフェンス勤怠管理アプリ (MVP)。

- 労働者は本アプリで勤務地の 100m 圏内に入退場するだけで自動で出退勤を記録
- 打刻タイミングでローカル通知
- バックグラウンド動作制約時は打刻タブから手動打刻可
- 履歴タブで自分の打刻ログを閲覧
- 認可は Owner-based (Cognito sub) + Admin グループ
- iOS のみ地図表示 (Apple Maps)

要件詳細は [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md) を参照。

## 技術スタック

| レイヤー | 使用技術 |
| --- | --- |
| フレームワーク | Expo SDK 57 (React Native 0.86) + expo-router |
| 言語 | TypeScript |
| UI | React 19 + React Compiler + expo-router/unstable-native-tabs |
| 状態管理 | Jotai (async atom + `atomWithStorage`) |
| エラーハンドリング | neverthrow (`Result<T, E>` / `ResultAsync<T, E>`) |
| 地図 | expo-maps (iOS: Apple Maps) |
| 位置情報 | expo-location + expo-task-manager (バックグラウンド) |
| 通知 | expo-notifications (ローカル通知のみ) |
| 認証 / データ | AWS Amplify Gen2 (Cognito UserPool + AppSync + DynamoDB) |
| ローカル永続化 | AsyncStorage (バックグラウンドタスク共有) |
| テスト | Vitest (node 環境) |
| Lint / Format | Biome |
| CI | GitHub Actions (typecheck / lint / test) |

コーディング規約は [docs/conventions/](./docs/conventions/) を参照。

## 前提

- macOS (iOS シミュレータで動作確認するため)
- Node.js 24
- pnpm 11
- AWS アカウント + AWS CLI (`aws configure` 済み)
- Xcode (iOS ビルド用)

## 初回セットアップ

### 1. リポジトリを clone して依存インストール

```bash
git clone <this-repo>
cd GeoClock
pnpm install
```

### 2. AWS リージョンの CDK bootstrap (アカウントで初回のみ)

Sandbox デプロイ先の東京リージョンで初回だけ必要:

```bash
pnpm dlx aws-cdk bootstrap aws://<AWS_ACCOUNT_ID>/ap-northeast-1
```

### 3. Amplify sandbox をデプロイして `amplify_outputs.json` を生成

自分専用の Cognito / AppSync / DynamoDB を作成する:

```bash
pnpm ampx sandbox --once
```

- 完了までおよそ 5〜10 分
- `amplify_outputs.json` (git ignored) が自動生成される
- 削除するときは `pnpm ampx sandbox delete`

### 4. テスト用の労働者ユーザーを作成 (Cognito UserPool)

```bash
# UserPool ID は amplify_outputs.json > auth.user_pool_id から取得
POOL=$(jq -r '.auth.user_pool_id' amplify_outputs.json)

aws cognito-idp admin-create-user \
  --user-pool-id "$POOL" \
  --username test@example.com \
  --user-attributes \
    Name=email,Value=test@example.com \
    Name=email_verified,Value=true \
    Name=given_name,Value=テスト太郎 \
  --temporary-password 'Temp1234!' \
  --message-action SUPPRESS
```

初回ログイン時に `NEW_PASSWORD_REQUIRED` が発火するので、アプリでパスワードを設定する。

### 5. 勤務地データを Seed

`scripts/seed.sh` を実行して、3 つの勤務地 (新宿現場A / 渋谷現場B / 池袋現場C) と `test@example.com` への割り当てを DynamoDB に投入:

```bash
./scripts/seed.sh
```

Seed 内容はスクリプトを編集して調整可能。

### 6. iOS 開発ビルドを作成

`expo-maps` などのネイティブモジュールが含まれているため、Expo Go ではなく開発ビルドが必要:

```bash
pnpm dlx expo run:ios
```

- 初回はネイティブビルドに数分かかる
- 以降 JS の変更は `pnpm start` で Metro を起動するだけで反映される
- `app.json` を変更したら再度 `pnpm dlx expo prebuild --platform ios --clean` + `pnpm dlx expo run:ios`

## 開発

### 起動

```bash
pnpm start          # Metro のみ起動
# Simulator で 'i' キーで iOS 起動 (開発ビルドが必要)
```

### 品質チェック

```bash
pnpm typecheck      # tsc --noEmit
pnpm lint           # biome lint
pnpm format         # biome format --write
pnpm test           # Vitest
pnpm test:watch     # Vitest watch モード
```

CI (`.github/workflows/ci.yml`) では PR ごとに `typecheck` / `lint` / `test` が自動実行される。

### 動作確認 (Simulator)

1. Simulator メニュー **Features → Location → Custom Location** から緯度経度を設定
   - 新宿駅: `35.6895` / `139.6917`
   - 渋谷駅: `35.6595` / `139.7005`
   - 池袋駅: `35.7295` / `139.7109`
2. アプリで `test@example.com` + 設定したパスワードでログイン
3. ホームタブで 3 勤務地の状態を確認、地図でピンとジオフェンス円を確認
4. **ジオフェンス監視**: 「監視を開始」→ 位置を勤務地の座標に変更 → IN/OUT 通知
5. **手動打刻**: 打刻タブ → 範囲内の勤務地カードから IN/OUT ボタン
6. **履歴**: 履歴タブで打刻ログを日付グループで表示

### DynamoDB を直接確認

```bash
# テーブル名は sandbox 環境ごとに異なる
aws dynamodb list-tables | jq '.TableNames[] | select(startswith("AttendanceLog"))'

aws dynamodb scan --table-name AttendanceLog-<hash>-NONE
```

## 管理者ユーザーの追加

Geofence の作成・変更は Admin グループのみ許可:

```bash
./scripts/create-admin.sh admin@example.com 'AdminTemp1!' 管理者
```

現行アプリには管理者 UI は無い (別プロジェクト "Admin Console" 想定)。

## ディレクトリ構成

```text
app/                # expo-router のルート (ファイルベースルーティング)
  (auth)/           # 未認証ユーザー向け画面
  (tabs)/           # ログイン後のタブナビゲーション
  checklist/        # 動的ルート
amplify/            # Amplify Gen2 バックエンド定義
  auth/             # Cognito 設定
  data/             # データスキーマ
scripts/            # seed / 管理者作成などの運用スクリプト
src/
  features/         # 機能ごとの縦割り (types / services / stores / hooks / ui)
    auth/           # 認証
    attendance-log/ # 勤怠履歴
    clock/          # 手動打刻
    geofence/       # 勤務地一覧 + バックグラウンドタスク
    home/           # ホーム画面
    location/       # 位置情報 + 地図
    location-event/ # 打刻イベント永続化
    notification/   # ローカル通知
    worker/         # ログイン中の Worker
  shared/           # 共通コンポーネント / lib / theme
```

将来目標の完全な構成は [docs/target-structure.md](./docs/target-structure.md) を参照。

## トラブルシューティング

### `Cannot find native module 'ExpoMaps'`

ネイティブモジュールがリンクされていない。`pnpm dlx expo prebuild --platform ios --clean` してから `pnpm dlx expo run:ios`。

### `The region ap-northeast-1 has not been bootstrapped`

`pnpm dlx aws-cdk bootstrap aws://<AWS_ACCOUNT_ID>/ap-northeast-1` を実行。

### `Push Notifications capability is not supported` (実機ビルド)

Free Apple Developer では Push Notifications capability が使えない。`ios/GeoClock/GeoClock.entitlements` から `aps-environment` を削除するか、Apple Developer Program に加入。GeoClock はローカル通知のみ使用のため削除で問題なし。

### `Developer Mode disabled` (実機ビルド)

iPhone の **設定 → プライバシーとセキュリティ → デベロッパモード** を有効化して再起動。

## ライセンス

Private (社内利用のみ)。
