

## Plan: Add Illustrations to Quick Action Category Cards

### What
Replace the current Lucide icons in the 4 service category buttons (Airbnb, Residencial, Pós-obra, Comercial) with the same illustration images already used in the checklist template cards.

### Image Mapping
| Category | Image |
|---|---|
| Airbnb | `airbnb.jpg` |
| Residencial | `residencial.jpg` |
| Pós-obra | `posobra.jpg` |
| Comercial | No matching image — keep icon |

### Changes — `src/views/DashboardView.tsx`

1. **Update `categories` array** (lines 88-93): Add an optional `bgImage` field to each category, mapped to the imported assets.

2. **Update category card rendering** (lines 146-158): Replace the `<cat.icon>` inside the gradient circle with the illustration image when `bgImage` is available. The image will use `object-cover rounded-2xl` to fill the 64px square, with slight opacity overlay to maintain the colored tint.

```tsx
<div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cat.color} overflow-hidden shadow-lg relative`}>
  {cat.bgImage ? (
    <img src={cat.bgImage} alt="" className="w-full h-full object-cover opacity-80" />
  ) : (
    <cat.icon size={24} className="text-white absolute inset-0 m-auto" />
  )}
</div>
```

### Single file modified
- `src/views/DashboardView.tsx`

