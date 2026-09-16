<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Self Care (이 저장소)

- **Cursor 규칙**: `.cursor/rules/` (`project-core`, `safety`, `architecture`, …)
- **설계 문서**: `docs/` — `PROJECT_OVERVIEW.md`, `ARCHITECTURE.md`, `DATA_FLOW.md`, `API.md`, `DATABASE.md`, `DEVELOPMENT_GUIDE.md`
- **사람용 설치 안내**: `README.md`
- 레이어: `src/app/api` → `src/lib/services` → Prisma / `src/lib/calculations` / `src/lib/integrations`
