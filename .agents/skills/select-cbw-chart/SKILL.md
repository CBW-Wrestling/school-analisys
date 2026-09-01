---
name: select-cbw-chart
description: 'Choose or implement the appropriate CBW chart from the local template patterns. Use when creating, updating, reviewing, or requesting dashboards, analytics, metrics, charts, visualizations, trends, comparisons, distributions, correlations, or maps.'
argument-hint: 'Describe the decision, measures, dimensions, period, and data source.'
---

# Select CBW Chart

Read [template patterns](../../../references/template-patterns.md) and the Charts section in [DESIGN.md](../../../DESIGN.md). Inspect a matching chart example in `references/next-shadcn-admin-dashboard` when one exists.

1. Determine the decision the user needs to make, grain, measures, dimensions, time period, cardinality, units, null handling, and whether a comparison is required.
2. Select the chart using the catalog: time trend -> line/area; category comparison -> bar; composition -> pie or stacked bar; distribution -> histogram/bars; relationship -> scatter; UF -> `BrazilHeatmap`; otherwise prefer KPI or table.
3. State `question -> chart -> reason` in one sentence. Reject charts that conceal labels, imply unsupported precision, or use more series/colors than users can compare.
4. Implement only with Recharts through `src/components/ui/chart.tsx`; give charts a stable height, semantic configuration, shadcn tooltip/legend, accessible text alternative, and loading, empty, and error states.
5. Do not introduce synthetic business data. Nivo remains only in the existing Explorer legacy until a dedicated migration.