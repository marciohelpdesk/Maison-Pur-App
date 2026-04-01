

## Plan: Edit Completed Job (Re-enter Execution Without Resetting)

### What
Add the ability to re-open a completed job's execution flow to add missing photos, register damages, or fix checklist items — without losing any existing data. After saving edits, the report is automatically regenerated.

### How It Works
1. On the **Reports page** and **JobDetails page**, add an "Editar" button for completed jobs
2. Clicking it sets the job status back to `IN_PROGRESS` but **preserves all existing data** (photos, checklist, damages, startTime, etc.)
3. The user navigates through the execution steps freely, making additions/corrections
4. On completion, the old report is deleted and a new one is generated with updated data

### Changes

#### 1. `src/pages/JobDetails.tsx` — Add "Edit completed job" action
- Add a `handleEditCompletedJob` function that sets status to `IN_PROGRESS`, sets `currentStep` to `'CHECKLIST'` (most common edit target), preserves all other data, and navigates to `/execution/{jobId}`

#### 2. `src/views/JobDetailsView.tsx` — Show edit button for completed jobs
- When `job.status === COMPLETED`, show an "Editar Relatório" button alongside existing actions
- Pass the new `onEditJob` callback from the page

#### 3. `src/pages/Reports.tsx` — Add edit button on report cards
- Add a pencil/edit icon button on each report card
- Find the matching completed job, set it back to `IN_PROGRESS` preserving data, navigate to execution

#### 4. `src/pages/Execution.tsx` — Delete old report on re-completion
- Before creating a new report in `handleComplete`, check if a report already exists for this `job_id` and delete it first
- This prevents duplicate reports for the same job

#### 5. `src/hooks/useReports.ts` — No changes needed
- `deleteReport` already handles cascading deletes of rooms/photos

### Files Modified
| File | Change |
|---|---|
| `src/pages/JobDetails.tsx` | Add `handleEditCompletedJob` handler |
| `src/views/JobDetailsView.tsx` | Show "Editar" button for completed jobs |
| `src/pages/Reports.tsx` | Add edit button per report card, navigate to execution |
| `src/pages/Execution.tsx` | Delete existing report before creating new one on re-completion |

