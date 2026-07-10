# 最終的なディレクトリ構成（目標）

MVP 完成時点で目指すディレクトリ構成。実装を進めるときはこの構造に沿って追加・整理する。

```text
.
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── cafeteria.tsx
│   │   ├── checklist.tsx
│   │   ├── clock.tsx
│   │   ├── history.tsx
│   │   ├── index.tsx
│   │   └── library.tsx
│   │
│   ├── checklist/
│   │   ├── [geofenceId].tsx
│   │   └── _layout.tsx
│
├── assets/
│   └── app.icon/
│       ├── Assets/
│       │   ├── icon.svg
│       │   └── icon.json
│       ├── adaptive-icon.png
│       ├── adaptive-icon.svg
│       ├── favicon.png
│       ├── icon.png
│       ├── icon.svg
│       ├── loggerLogo.svg
│       ├── shukkkinlogger_appicon.png
│       ├── splash-icon.png
│       └── splash-icon.svg
│
├── docs/
│   ├── conventions/
│   │   ├── README.md
│   │   ├── amplify-data.md
│   │   ├── error-handling.md
│   │   ├── external-dependencies.md
│   │   ├── jotai.md
│   │   ├── typescript.md
│   │   └── ui-integration.md
│   └── REQUIREMENTS.md
│
├── fastlane/
│   ├── Appfile
│   ├── Fastfile
│   ├── Matchfile
│   └── README.md
│
├── plugins/
│   ├── withAndroidLocalProperties.js
│   ├── withAndroidSigningConfig.js
│   └── withLocationServiceSession.js
│
├── scripts/
│   ├── increment-android-version-code...
│   ├── increment-build-number.sh
│   └── simulate-location.sh
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── ui/
│   │   │   ├── hooks.ts
│   │   │   └── store.ts
│   │   │
│   │   ├── cafeteria/
│   │   │   ├── ui/
│   │   │   ├── services.ts
│   │   │   └── stores.ts
│   │   │
│   │   ├── geofence/
│   │   │   ├── ui/
│   │   │   ├── hooks.ts
│   │   │   ├── pendingQueue.test.ts
│   │   │   ├── pendingQueue.ts
│   │   │   ├── services.ts
│   │   │   ├── shouldProcessEvent.test.ts
│   │   │   ├── stores.ts
│   │   │   ├── tasks.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── home/
│   │   │   └── ui/
│   │   │       └── HomeScreen.tsx
│   │   │
│   │   ├── last-exit-check/
│   │   │   ├── ui/
│   │   │   ├── hooks.ts
│   │   │   ├── services.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── library/
│   │   │   ├── ui/
│   │   │   ├── hooks.ts
│   │   │   ├── services.ts
│   │   │   ├── stores.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── location/
│   │   │   ├── ui/
│   │   │   ├── hooks.ts
│   │   │   ├── services.ts
│   │   │   ├── stores.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── location-event/
│   │   │   ├── ui/
│   │   │   ├── services.ts
│   │   │   ├── stores.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── notification/
│   │   └── worker/
│   │
│   ├── shared/
│   │   ├── api/
│   │   │   ├── generated/
│   │   │   ├── client.ts
│   │   │   └── setup.ts
│   │   ├── lib/
│   │   ├── theme/
│   │   └── ui/
│   │
│   └── declarations.d.ts
│
├── .env.sample
├── .gitignore
├── .npmrc
├── AGENTS.md
├── CLAUDE.md
├── Gemfile
├── Gemfile.lock
├── Makefile
├── README.md
├── app.json
├── biome.json
├── metro.config.js
├── orval.config.ts
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vitest.config.ts
```
