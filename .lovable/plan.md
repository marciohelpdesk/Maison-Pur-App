

## Plan: Fix Duplicate Photos on Multi-Upload

### Root Cause

There are **two race conditions** causing photos to appear duplicated or lost:

1. **Stale closure in `PhotoCaptureStep`**: `handleFileSelect` is wrapped in `useCallback` with `photos` in the dependency array. During upload (which takes time), if the component re-renders with new props, the callback still holds the OLD `photos` array. When it finally calls `onPhotosChange([...photos, ...newUrls])`, it merges old + new, potentially duplicating photos if the parent already received some via a previous update cycle.

2. **Debounce vs Immediate conflict in `ChecklistStep`**: The `propagate` function (800ms debounce) and `propagateImmediate` can conflict. If a user toggles a checklist item (debounced), then uploads photos (immediate) before the debounce fires, the debounce fires AFTER with the OLD checklist (without the new photos), overwriting the immediate update. This causes photo loss. The `useEffect` sync then re-applies the stale DB data.

3. **Report photo deduplication**: In `Execution.tsx`, photos from `roomPhotos` and `item.photoUrl` are both mapped as `verification` type. If the same photo URL appears in both places (unlikely but possible), it shows up twice in the report.

### Changes

#### 1. `src/components/execution/PhotoCaptureStep.tsx` — Fix stale closure

Replace the `useCallback` pattern with a functional approach that doesn't capture `photos`:

```tsx
const handleFileSelect = useCallback(async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  setIsProcessing(true);

  const results = await Promise.all(
    Array.from(files).map(file => processAndUploadFile(file))
  );
  const newUrls = results.filter((url): url is string => url !== null);

  if (newUrls.length > 0) {
    // Use functional update pattern — read latest photos from parent
    onPhotosChange(prev => [...prev, ...newUrls]);
    // OR: pass only newUrls and let parent handle merge
  }
  setIsProcessing(false);
  if (e.target) e.target.value = '';
}, [processAndUploadFile, onPhotosChange, toast, t]);
// Remove `photos` from deps
```

Since `onPhotosChange` is `(photos: string[]) => void` (not a setter), we need to change the parent to pass a stable merge function, OR simply remove `photos` from the deps and read it at call time via a ref.

**Approach**: Use a `useRef` to always hold the latest `photos` value, so `handleFileSelect` never captures a stale array.

#### 2. `src/components/execution/ChecklistStep.tsx` — Cancel debounce on immediate

When `propagateImmediate` fires, it already clears the debounce timer. But the issue is that `toggleItem` directly uses `setLocalChecklist(prev => ...)` with its own inline debounce — separate from `debounceRef`. This means `propagateImmediate` can't cancel it.

**Fix**: Ensure `toggleItem` uses the shared `debounceRef`, and `propagateImmediate` clears it. Also, deduplicate photos in `RoomPhotosSection.handleFileSelect` before saving.

#### 3. `src/components/execution/ChecklistStep.tsx` — Deduplicate room photos

Add a `Set`-based deduplication when merging new URLs:

```tsx
const allPhotos = [...roomPhotos, ...newUrls];
const uniquePhotos = [...new Set(allPhotos)];
return { ...s, roomPhotos: uniquePhotos } as any;
```

#### 4. `src/pages/Execution.tsx` — Deduplicate report photos

Before inserting photos into the report, deduplicate by `photo_url`:

```tsx
const uniquePhotos = photos.filter(
  (p, i, arr) => arr.findIndex(x => x.photo_url === p.photo_url) === i
);
```

### Files Modified

| File | Change |
|---|---|
| `src/components/execution/PhotoCaptureStep.tsx` | Use ref for latest `photos`; remove from `useCallback` deps |
| `src/components/execution/ChecklistStep.tsx` | Deduplicate room photos on merge; ensure debounce consistency |
| `src/pages/Execution.tsx` | Deduplicate photos array before report creation |

