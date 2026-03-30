

## Plan: Fix Public Report — 5 Issues

### Problems

1. **Date off by one day** — `new Date("2026-03-30")` parses as UTC midnight, which in US Eastern timezone becomes March 29. Fix: use `parseISO` from date-fns.

2. **iMessage button has no phone number** — `href="sms:"` with no destination. Fix: `href="sms:+19413304713"`.

3. **Damage report only supports 1 photo** — Need 2 photos: close-up of damage + environment/context photo. Also need a `location` field to specify where in the property.

4. **Damage photos mixed into Before & After section** — `generalPhotos` includes damage and lost-found type photos because they have no `room_id`. Need to filter those out.

5. **DamageReport type missing `location` field** — No way to capture where the damage is located.

---

### Changes

#### 1. `src/types/index.ts` — Update DamageReport interface
- Add `location?: string` field (room/area name)
- Add `contextPhotoUrl?: string` (environment photo, second photo)
- Keep `photoUrl` for backward compatibility (close-up photo)

#### 2. `src/components/execution/DamageReportStep.tsx` — Enhanced form
- Add `location` text input (e.g. "Master Bedroom", "Kitchen counter")
- Add second photo upload slot: "Close-up" (existing `photoUrl`) and "Environment" (`contextPhotoUrl`)
- Show both photos + location in the damage card list
- Two separate camera/gallery button groups for each photo type

#### 3. `src/pages/PublicReport.tsx` — Multiple fixes

**Date fix (line 546):**
- Import `parseISO` from date-fns
- Replace `new Date(dateStr)` with `parseISO(dateStr)` to prevent timezone shift

**iMessage fix (line 737):**
- Change `href="sms:"` to `href="sms:+19413304713"`

**Filter damage/lost-found photos from Before & After (line 663):**
- Change `generalPhotos` to exclude `damage` and `lost_found` photo types:
  `photos.filter(p => !p.room_id && p.photo_type !== 'damage' && p.photo_type !== 'lost_found')`

**Show damage location and context photo in room damage cards (lines 957-982):**
- Display `d.contextPhotoUrl` as second thumbnail alongside close-up
- Location is already rendered (line 975-980) — just needs data populated

#### 4. `src/pages/Execution.tsx` — Update report generation
- Include `location` in damage data passed to room damages
- Map `contextPhotoUrl` as additional damage photo in the photos array
- Ensure damage photos get `photo_type: 'damage'` so they're properly categorized

### Files to modify
- `src/types/index.ts`
- `src/components/execution/DamageReportStep.tsx`
- `src/pages/PublicReport.tsx`
- `src/pages/Execution.tsx`

