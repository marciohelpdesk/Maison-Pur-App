export interface SupplyPreset {
  name: string;
  category: string;
  unit: string;
  defaultQuantity: number;
  defaultThreshold: number;
}

export const SUPPLY_CATEGORIES = [
  'Kitchen',
  'Bathroom',
  'Bedroom',
  'Laundry',
  'Cleaning',
  'General',
] as const;

export type SupplyCategory = (typeof SUPPLY_CATEGORIES)[number];

export const SUPPLY_PRESETS: SupplyPreset[] = [
  // Kitchen
  { name: 'Dish soap', category: 'Kitchen', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Sponges', category: 'Kitchen', unit: 'packs', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Trash bags', category: 'Kitchen', unit: 'rolls', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Paper towels', category: 'Kitchen', unit: 'rolls', defaultQuantity: 2, defaultThreshold: 2 },
  { name: 'Coffee filters', category: 'Kitchen', unit: 'packs', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Dishwasher pods', category: 'Kitchen', unit: 'packs', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Salt', category: 'Kitchen', unit: 'units', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Pepper', category: 'Kitchen', unit: 'units', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Olive oil', category: 'Kitchen', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Sugar', category: 'Kitchen', unit: 'units', defaultQuantity: 1, defaultThreshold: 1 },

  // Bathroom
  { name: 'Toilet paper', category: 'Bathroom', unit: 'rolls', defaultQuantity: 4, defaultThreshold: 4 },
  { name: 'Hand soap', category: 'Bathroom', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Shampoo', category: 'Bathroom', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Conditioner', category: 'Bathroom', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Body wash', category: 'Bathroom', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Bath towels', category: 'Bathroom', unit: 'pieces', defaultQuantity: 4, defaultThreshold: 4 },
  { name: 'Hand towels', category: 'Bathroom', unit: 'pieces', defaultQuantity: 4, defaultThreshold: 4 },
  { name: 'Toilet brush', category: 'Bathroom', unit: 'pieces', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Cotton swabs', category: 'Bathroom', unit: 'packs', defaultQuantity: 1, defaultThreshold: 1 },

  // Bedroom
  { name: 'Bed sheets (Queen)', category: 'Bedroom', unit: 'sets', defaultQuantity: 2, defaultThreshold: 2 },
  { name: 'Bed sheets (King)', category: 'Bedroom', unit: 'sets', defaultQuantity: 2, defaultThreshold: 2 },
  { name: 'Pillowcases', category: 'Bedroom', unit: 'pieces', defaultQuantity: 4, defaultThreshold: 4 },
  { name: 'Mattress protector', category: 'Bedroom', unit: 'pieces', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Extra blankets', category: 'Bedroom', unit: 'pieces', defaultQuantity: 2, defaultThreshold: 1 },
  { name: 'Hangers', category: 'Bedroom', unit: 'pieces', defaultQuantity: 10, defaultThreshold: 6 },

  // Laundry
  { name: 'Laundry detergent', category: 'Laundry', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Fabric softener', category: 'Laundry', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Bleach', category: 'Laundry', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Dryer sheets', category: 'Laundry', unit: 'packs', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Stain remover', category: 'Laundry', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },

  // Cleaning
  { name: 'All-purpose cleaner', category: 'Cleaning', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Glass cleaner', category: 'Cleaning', unit: 'bottles', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Disinfectant wipes', category: 'Cleaning', unit: 'packs', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Microfiber cloths', category: 'Cleaning', unit: 'pieces', defaultQuantity: 6, defaultThreshold: 4 },
  { name: 'Vacuum bags', category: 'Cleaning', unit: 'packs', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Mop refills', category: 'Cleaning', unit: 'pieces', defaultQuantity: 2, defaultThreshold: 1 },
  { name: 'Rubber gloves', category: 'Cleaning', unit: 'pairs', defaultQuantity: 2, defaultThreshold: 1 },

  // General
  { name: 'Light bulbs', category: 'General', unit: 'pieces', defaultQuantity: 4, defaultThreshold: 2 },
  { name: 'Batteries (AA)', category: 'General', unit: 'packs', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Batteries (AAA)', category: 'General', unit: 'packs', defaultQuantity: 1, defaultThreshold: 1 },
  { name: 'Welcome cards', category: 'General', unit: 'pieces', defaultQuantity: 5, defaultThreshold: 2 },
  { name: 'Pens', category: 'General', unit: 'pieces', defaultQuantity: 3, defaultThreshold: 2 },
];

export const CATEGORY_META: Record<
  SupplyCategory,
  { icon: string; label: string }
> = {
  Kitchen: { icon: 'ChefHat', label: 'Kitchen' },
  Bathroom: { icon: 'Bath', label: 'Bathroom' },
  Bedroom: { icon: 'Bed', label: 'Bedroom' },
  Laundry: { icon: 'WashingMachine', label: 'Laundry' },
  Cleaning: { icon: 'SprayCan', label: 'Cleaning' },
  General: { icon: 'Package', label: 'General' },
};
