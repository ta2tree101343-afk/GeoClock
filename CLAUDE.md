# CLAUDE.md

This file is loaded automatically by Claude Code at session start. Keep it terse — this is the entry point. See `README.md` for detailed setup, `docs/conventions/` for coding rules, and `docs/REQUIREMENTS.md` for the product spec.

## What this project is

MVP of a geofence-based attendance tracker for foreign workers at construction sites. When a worker enters/exits the 100 m radius of a workplace, an IN/OUT event is recorded automatically.

- **Stack**: Expo SDK 57 + React Native + expo-router + TypeScript + AWS Amplify Gen2 (Cognito + AppSync + DynamoDB) + Jotai + neverthrow
- **Platform**: iOS-focused (Apple Maps). Android compiles but is not verified.

## Common commands

```bash
pnpm start                # Metro only (JS changes hot-reload)
pnpm dlx expo run:ios     # Rebuild native (after app.json / native module changes)
pnpm typecheck            # tsc --noEmit
pnpm lint                 # biome lint
pnpm format               # biome format --write
pnpm test                 # vitest (35 cases)
pnpm ampx sandbox --once  # Deploy Amplify sandbox diff
```

## Do NOT touch (or touch carefully)

- **`app.json`**: any change requires `pnpm dlx expo prebuild --platform ios --clean` + `run:ios`
- **`expo-notifications` plugin** injects Push Notifications capability. On Free Apple Dev provisioning, delete `aps-environment` from `ios/GeoClock/GeoClock.entitlements` (prebuild regenerates it)
- **`amplify/data/resource.ts`**: after edits run `pnpm ampx sandbox --once`; watch out for owner-check breakage on existing rows
- **Authorization**: `Worker`, `WorkerGeofence`, `AttendanceLog` use `ownerDefinedIn("id" | "workerId")`; `Admin` group has full CRUD
- **React Compiler is ON** (`app.json > expo.experiments.reactCompiler: true`) — do NOT add `useMemo` / `useCallback`
- **GitHub Actions are SHA-pinned**. Let Dependabot bump them (`.github/dependabot.yml`)

## Conventions to follow

- **Feature slice**: `src/features/<name>/{types,services,stores,hooks,ui}`
- **External deps stay in `services.ts` / `tasks.ts`** (`docs/conventions/external-dependencies.md`)
- **Return Results, don't throw** (`ResultAsync<T, AppError>`); `throw` only inside async atoms / Container boundaries (`docs/conventions/error-handling.md`)
- **`AsyncBoundary` lives at the tab file layer**, not inside Screen components
- **Colors come from `useColors()`** — no hard-coded hex (`src/shared/theme/`)
- **Use `createLogger(category)`** instead of raw `console.*` (`src/shared/lib/logger.ts`)
- **Use the `@/` alias** for imports (see `tsconfig.json > paths`)
- **Background tasks cannot read Jotai atoms** → use the AsyncStorage + `atomWithStorage` double-write pattern

## Already implemented (MVP + polish)

- Cognito auth flow (login / new-password / forgot-password / reset-password / session restore)
- Auto-creation of `Worker` row (id = Cognito sub)
- Assigned workplaces via `WorkerGeofence` junction
- Map (Apple Maps: pins + geofence circles + blue user dot + fit-bounds camera)
- Background geofence monitoring (`expo-task-manager` + `expo-location`)
- Local notifications (`expo-notifications`)
- Manual punch tab
- History tab (SectionList grouped by date)
- `shouldProcessEvent` debouncing + `pendingQueue` retry for failed DB writes
- Admin group with write access to `Geofence`

## Not implemented (waiting on requirements / external accounts)

- `last-exit-check` (checklist) — needs product spec
- `cafeteria` / `library` tabs — needs product spec
- Fastlane + iOS/Android beta workflows — needs Apple Developer Program, Google Play Console, self-hosted runners
- Admin Console (web) — separate project scope

## Test users

Cognito UserPool: `ap-northeast-1_DZGT4Wh4k`

- Worker: `test@example.com` / initial password `Temp1234!` (must change on first login)
- Admin: `./scripts/create-admin.sh <email> <password> <name>`
- Seed geofences (Shinjuku / Shibuya / Ikebukuro): `./scripts/seed.sh`

## Common footguns

- **`Cannot find native module 'ExpoMaps'`** → `pnpm dlx expo prebuild --platform ios --clean && pnpm dlx expo run:ios`
- **`amplify_outputs.json` missing** → run `pnpm ampx sandbox --once` (file is git-ignored)
- **Push Notifications capability error** → delete `aps-environment` from entitlements (see above)
- **Simulator location defaults to San Francisco** → Simulator → Features → Location → Custom Location with Tokyo coordinates (e.g. 35.6895, 139.6917)
