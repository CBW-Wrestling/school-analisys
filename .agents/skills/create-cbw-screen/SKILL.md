---
name: create-cbw-screen
description: 'Create a CBW page, dashboard, list, form, import flow, detail view, or authentication screen using the local template catalog. Use when creating or adding a screen, route, page, dashboard, table, form, upload, athlete detail, profile, login, or registration.'
argument-hint: 'Describe the screen, its real data source, actions, and route.'
---

# Create CBW Screen

Read [DESIGN.md](../../../DESIGN.md) and [template patterns](../../../references/template-patterns.md) first. Inspect the selected source route in `references/next-shadcn-admin-dashboard` before editing.

1. Identify the user decision, route, navigation placement, real data source, available actions, and loading, empty, error, disabled, desktop, mobile, light, and dark states.
2. Select the closest catalog pattern and state `need -> source screen -> reason` before implementation. If no pattern applies, use the closest composition rather than inventing a new visual language.
3. For any dashboard, analysis, metrics, chart, or visualization, invoke `select-cbw-chart` before choosing KPI presentation or a chart. Apply its `question -> chart -> reason` decision before implementation.
4. Build with CBW primitives, `PageHeader`, semantic tokens, Lucide, and container queries. Keep business logic in existing `src/lib`, hooks, and types.
5. Do not copy Next.js/RSC code, template UI wrappers, Table v9 APIs, dependencies, mock operational data, endpoints, payloads, or auth logic.
6. Validate the smallest relevant lint/type/build check and verify keyboard focus, overflow, and appropriate visual states.