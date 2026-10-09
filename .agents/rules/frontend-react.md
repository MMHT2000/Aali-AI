---
trigger: glob
description: React, TypeScript and accessible UI conventions.
globs: "apps/web/**/*.ts, apps/web/**/*.tsx, apps/web/**/*.css"
---
# Frontend conventions
- Use React function components, strict TypeScript, reusable feature components and a typed API client.
- Keep domain calculations on the API/domain side; UI may format and explain a returned breakdown but must not be the sole enforcement point.
- For offline SOS, persist to IndexedDB before transport attempts. Distinguish draft, queued, handoff opened, accepted by API, failed and simulated states. Never equate copied text with delivery.
- Provide loading, empty, error and stale-data indicators. Map failure must leave list/table use intact.
- Use accessible labels, keyboard focus, semantic controls, text labels in addition to colors, responsive layouts, and test Bangla strings.
- All simulation/replay data must be labelled in visible context. Do not hide those labels in tooltips only.
