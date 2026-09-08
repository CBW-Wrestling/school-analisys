---
name: update-cbw-screen
description: 'Review, modernize, redesign, or fix an existing CBW screen using the local template patterns. Use when updating a page, screen, dashboard, table, form, import flow, profile, or authentication UI.'
argument-hint: 'Name the existing screen and the UI outcome you need.'
---

# Update CBW Screen

Read [DESIGN.md](../../../DESIGN.md) and [template patterns](../../../references/template-patterns.md) first. Inspect the current screen and the closest source route before editing.

1. Find the component that controls the reported layout or interaction, then state a falsifiable local hypothesis and the cheapest check.
2. Select and state `current need -> source screen -> reason`. Preserve business contracts in `src/lib`, types, endpoints, payloads, and authentication.
3. For any dashboard, analysis, metrics, chart, or visualization change, invoke `select-cbw-chart` before changing KPI presentation or a chart. Apply its `question -> chart -> reason` decision before implementation.
4. Make the smallest visual, copy, accessibility, responsive, or state-management change that tests the hypothesis. Reuse CBW primitives and components.
5. Do not copy Next.js/RSC, template UI files, Table v9 APIs, or mock operational data.
6. Immediately validate the edited slice. Confirm loading, empty, error, keyboard focus, overflow, and applicable theme behavior before widening scope.