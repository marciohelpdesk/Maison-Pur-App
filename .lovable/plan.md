

## Plan: Simplify Summary Step

Remove two sections from `src/components/execution/SummaryStep.tsx` that are redundant since the report is auto-generated on completion:

1. **Remove the "Service Value" card** (price + star rating) — lines ~225-240
2. **Remove the "Preview PDF" button** and related `PdfPreviewModal` — lines ~243-257

Also remove unused imports: `Star`, `Eye`, `PdfPreviewModal`, and the `showPreview` state.

Single file change: `src/components/execution/SummaryStep.tsx`

