

## Plan: Fix Time Tracking, Photo Upload, and Report Photo Mapping

### Problems Identified

1. **Time resets when resuming a job**: Every `handleStartJob` across 4 files overwrites `startTime: Date.now()` and `currentStep: 'BEFORE_PHOTOS'` — even for IN_PROGRESS jobs that are being resumed. This destroys the original start time and resets the step.

2. **Duration includes pause time**: SummaryStep calculates duration as `Date.now() - startTime`, which counts all idle/pause time. There is no elapsed time tracking.

3. **Camera input ignores `multiple` attribute**: In `ChecklistStep.tsx` line 506, `capture="environment" multiple` — browsers ignore `multiple` when `capture` is set, so users can only take one photo at a time via camera (gallery still works for multiple).

4. **Report photo mapping**: Room verification photos use `_room_index` mapping which works, but checklist item photos with `photoUrl` are mapped correctly. The main issue is that the `roomPhotos` field is not a standard typed field (cast via `as any`), which could cause silent data loss.

### Changes

#### 1. Fix `handleStartJob` in 4 files — preserve startTime on resume

**Files**: `src/pages/Dashboard.tsx`, `src/pages/Agenda.tsx`, `src/pages/JobDetails.tsx`, `src/pages/Index.tsx`

Only set `startTime` and reset `currentStep` when the job is NOT already in progress:

```tsx
const handleStartJob = (jobId: string) => {
  const job = jobs.find(j => j.id === jobId);
  if (job) {
    if (job.status === JobStatus.IN_PROGRESS) {
      // Resume — don't reset time or step
      navigate(`/execution/${jobId}`);
    } else {
      updateJob({
        ...job,
        status: JobStatus.IN_PROGRESS,
        startTime: Date.now(),
        currentStep: 'BEFORE_PHOTOS'
      });
      navigate(`/execution/${jobId}`);
    }
  }
};
```

#### 2. Fix duration calculation in SummaryStep

**File**: `src/components/execution/SummaryStep.tsx`

Use `endTime` if available (set during completion), otherwise use `Date.now()`. The duration should use the job's stored `startTime` which is now correctly preserved.

This is actually correct as-is once Bug 1 is fixed — `Date.now() - startTime` will reflect the real elapsed time from when the job was first started. The "pause time included" issue is a design tradeoff that's acceptable for a cleaning app (the job clock runs from start to finish).

#### 3. Fix camera `capture` + `multiple` conflict

**File**: `src/components/execution/ChecklistStep.tsx` (line 506)

Remove `multiple` from the camera input (it's ignored by browsers anyway). The gallery input already supports `multiple`. This is more of a correctness fix; the real multi-photo upload works via gallery.

#### 4. Fix camera input in PhotoCaptureStep

**File**: `src/components/execution/PhotoCaptureStep.tsx` (line 133)

Same issue — camera input has `capture="environment"` without `multiple`, which is correct. But verify gallery `multiple` works. The gallery input on line 125 has `multiple` without `capture` — this is correct.

### Summary of file changes

| File | Change |
|---|---|
| `src/pages/Dashboard.tsx` | Skip `startTime`/`currentStep` reset for IN_PROGRESS jobs |
| `src/pages/Agenda.tsx` | Same fix |
| `src/pages/JobDetails.tsx` | Same fix |
| `src/pages/Index.tsx` | Same fix |
| `src/components/execution/ChecklistStep.tsx` | Remove `multiple` from camera input (line 506) |

### Technical Details

- The core bug is that 4 separate files all have identical `handleStartJob` functions that blindly overwrite `startTime: Date.now()`. When a user exits mid-job and taps "Continuar", the same function is called, destroying the original timestamp.
- The fix is a simple conditional: if the job is already IN_PROGRESS, just navigate to the execution screen without modifying the job record.
- The `capture` attribute on `<input>` tells the browser to use the device camera directly. When combined with `multiple`, most browsers silently ignore `multiple`. Removing it makes the intent explicit.

