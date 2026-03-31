

## Plan: Simplify Checklist Base Cards

### What
Remove the background illustration images from the checklist template cards and make the cards more compact and discrete.

### Changes — `src/views/DashboardView.tsx`

1. **Remove `bgImage` from templates array**: Delete the `bgImage` property from all checklist template objects (keep the imports for Quick Actions which still use them).

2. **Restore emoji icons**: Always show the emoji `<span>` icon instead of conditionally rendering the background image.

3. **Make cards more compact and discrete**:
   - Reduce `min-w` from `160px` to `130px`
   - Reduce padding from `p-4` to `p-3`
   - Make emoji smaller: `text-2xl` instead of `text-3xl`
   - Reduce title font size: `text-xs` instead of `text-sm`
   - Remove `overflow-hidden` and `relative` (no longer needed without images)
   - Soften the left border: `border-l-2` instead of `border-l-4`

### Single file modified
- `src/views/DashboardView.tsx`

