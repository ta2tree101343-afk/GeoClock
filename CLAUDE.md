# CLAUDE.md

このファイルは Claude Code のセッション開始時に自動で読み込まれる。プロジェクトを短時間で把握できるよう要点だけ書く。詳細な手順は `README.md`、コーディング規約は `docs/conventions/`、要件は `docs/REQUIREMENTS.md` を参照。

## プロジェクト概要

工事現場の外国人労働者向けのジオフェンス勤怠管理アプリ (MVP)。労働者が勤務地の 100m 圏内に入退場するだけで自動で出退勤を記録する。

- **技術スタック**: Expo SDK 57 + React Native + expo-router + TypeScript + AWS Amplify Gen2 (Cognito + AppSync + DynamoDB) + Jotai + neverthrow
- **プラットフォーム**: iOS 中心 (Apple Maps 利用のため)。Android は動作するがビルド未検証

## 開発コマンド

```bash
pnpm start          # Metro のみ (JS 変更はホットリロード)
pnpm dlx expo run:ios  # ネイティブビルド (app.json / native module 変更後)
pnpm typecheck      # tsc --noEmit
pnpm lint           # biome lint
pnpm format         # biome format --write
pnpm test           # vitest (35 ケース)
pnpm ampx sandbox --once  # Amplify sandbox 差分デプロイ
```

## 触ってはいけない / 慎重に触るもの

- **`app.json`**: 変更したら `pnpm dlx expo prebuild --platform ios --clean` + `run:ios` が必要
- **`expo-notifications` plugin** は Push Notifications capability を要求。Free Apple Dev で実機ビルドしたい時は `ios/GeoClock/GeoClock.entitlements` から `aps-environment` を削除する (prebuild で再生成される点に注意)
- **`amplify/data/resource.ts`**: 変更したら `pnpm ampx sandbox --once` で再デプロイ、既存データとの互換性に注意
- **owner-based 認可**: Worker / WorkerGeofence / AttendanceLog は `ownerDefinedIn("id" or "workerId")` + Admin グループ全操作
- **React Compiler が有効**: `useMemo` / `useCallback` は書かなくてよい (`app.json > expo.experiments.reactCompiler: true`)
- **GitHub Actions は SHA pin**: Dependabot 週次更新に任せる (`.github/dependabot.yml`)

## 設計方針 (conventions)

- **feature 縦割り**: `src/features/<name>/{types,services,stores,hooks,ui}`
- **外部依存は `services.ts` / `tasks.ts` に集約** (`docs/conventions/external-dependencies.md`)
- **エラーは Result 型** で返す (`ResultAsync<T, AppError>`)、`throw` は async atom / Container 境界のみ (`docs/conventions/error-handling.md`)
- **`AsyncBoundary` はタブファイル層** で明示配置、Screen 内では包まない
- **テーマ色は `useColors()`** ハック禁止 (`src/shared/theme/`)
- **ロガーは `createLogger(category)`** 使用、`console.*` 直呼び出しは避ける (`src/shared/lib/logger.ts`)
- **`@/` エイリアス** で import (`tsconfig.json` の `paths` 設定)
- **バックグラウンドタスクは Jotai atom を読めない** → `atomWithStorage` + AsyncStorage 直接アクセスの二重構成

## 実装済み機能 (MVP + 磨き)

- Cognito 認証 (login / new-password / forgot-password / reset-password / セッション復元)
- Worker 自動作成 (Cognito sub と id 一致)
- 勤務地一覧 (WorkerGeofence junction 経由)
- 地図表示 (Apple Maps, ピン + ジオフェンス円 + 青ドット + fit bounds)
- バックグラウンドジオフェンス監視 (`expo-task-manager` + `expo-location`)
- ローカル通知 (`expo-notifications`)
- 手動打刻タブ
- 履歴タブ (SectionList で日付グループ表示)
- `shouldProcessEvent` で頻発抑制 + `pendingQueue` で DB 書き込み失敗の再送
- Admin グループ + Geofence 書き込み制限

## 未実装 (要件待ち / 外部アカウント待ち)

- `last-exit-check` (checklist) — 業務要件のヒアリング必要
- `cafeteria` / `library` — 業務要件のヒアリング必要
- Fastlane + iOS/Android beta ワークフロー — Apple Developer Program + Google Play Console + self-hosted runner
- Admin Console (Web) — 別プロジェクトのスコープ

## テストユーザー

Cognito UserPool: `ap-northeast-1_DZGT4Wh4k`

- 一般: `test@example.com` / 初期パスワード `Temp1234!` (初回変更必須)
- 管理者作成: `./scripts/create-admin.sh <email> <password> <name>`

勤務地 seed: `./scripts/seed.sh` (新宿・渋谷・池袋現場を投入)

## 詰まりやすいポイント

- **`Cannot find native module 'ExpoMaps'`** → `pnpm dlx expo prebuild --platform ios --clean && pnpm dlx expo run:ios`
- **`amplify_outputs.json` が無い** → `pnpm ampx sandbox --once` で生成 (git ignored)
- **Push Notifications capability エラー** → 上記の entitlements 削除
- **Simulator の現在地がサンフランシスコ** → Features → Location → Custom Location で東京の座標 (35.6895, 139.6917 など) に設定
