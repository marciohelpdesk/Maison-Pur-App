

## Plan: Improve Lightbox — Pinch-to-Zoom + Safe Area Close Button

### Problems
1. **No zoom on photos** — Lightbox shows full image but no way to pinch-to-zoom or double-tap to zoom on mobile
2. **Close button too close to status bar** — `top-6` (24px) is not enough on notched iPhones; overlaps with Wi-Fi/battery indicators, making it impossible to tap

### Changes — `src/pages/PublicReport.tsx`

**1. Close button safe area fix (line 1156):**
- Change positioning from `top-6` to use `top-[calc(env(safe-area-inset-top,20px)+16px)]` so the X button sits below the notch/status bar on all devices
- Increase button size from `p-2` to `p-3` for easier tapping

**2. Add pinch-to-zoom support:**
- Wrap the lightbox `<img>` in a container with CSS `touch-action: manipulation` and use React state + touch event handlers for pinch-to-zoom and double-tap-to-zoom
- Track scale (1x–4x) and translate position via `onTouchStart`, `onTouchMove`, `onTouchEnd`
- Double-tap toggles between 1x and 2.5x zoom
- Pinch gesture calculates distance between two touch points to adjust scale
- Apply `transform: scale(${scale}) translate(${x}px, ${y}px)` to the image
- Reset zoom when lightbox closes
- Stop propagation on image touch events so backdrop click-to-close still works

### Single file to modify
- `src/pages/PublicReport.tsx` — lightbox section only (lines 1148–1165)

