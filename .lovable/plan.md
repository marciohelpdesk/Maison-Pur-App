

## Plan: Add Illustration Backgrounds to Checklist Template Cards

### What
Apply the 5 uploaded cleaning illustration images as subtle background decorations on the checklist template cards, matching the style shown in the screenshot — images positioned in the top-right area of each card with a soft fade.

### Image Mapping
| Template | Image |
|---|---|
| Airbnb Premium | Welcome/bed illustration (CC.jpg) |
| Residencial | Vacuuming illustration (4A599C7B.jpg) |
| Deep Clean | Bathroom cleaning illustration (CC_2.jpg) |
| Move-in/out | Moving/fridge cleaning illustration (CC_4.jpg) |
| Pós-obra | Construction illustration (CC_3.jpg) |
| Recorrente | No image (keep emoji only) |
| Comercial | No image (keep emoji only) |

### Changes

#### 1. Copy images to `src/assets/checklist/`
Copy all 5 uploaded images into the project assets folder.

#### 2. `src/views/DashboardView.tsx`
- Add an optional `bgImage` field to the checklist templates array
- Import the 5 images and assign them to the matching templates
- Update the card rendering to show the illustration as a positioned background image (top-right, ~60-70px, with opacity ~0.3-0.4 so text stays readable)
- Remove the emoji `<span>` for templates that have a background image (the illustration replaces it)

### Technical Detail
The image will be rendered as an `<img>` with `absolute` positioning, `right-2 top-2`, sized ~16-20 (64-80px), with `opacity-30` and `object-cover rounded-xl`, inside the existing `relative overflow-hidden` card container.

### File modified
- `src/views/DashboardView.tsx`

