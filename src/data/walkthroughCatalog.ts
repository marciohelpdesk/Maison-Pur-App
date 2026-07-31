export type WalkthroughItemStatus = 'present' | 'missing' | 'damaged' | 'na';

export interface WalkthroughCatalogItem {
  name: string;
  unit: string;
  ideal: number;
  /** rough replacement cost in USD, used for the supply budget suggestion */
  cost?: number;
}

export interface WalkthroughAreaTemplate {
  key: string;
  label: string;
  emoji: string;
  /** repeat per bedroom / bathroom count */
  repeatBy?: 'bedrooms' | 'bathrooms';
  /** only added when the matching config flag is on */
  optionalFlag?: string;
  items: WalkthroughCatalogItem[];
}

export const WALKTHROUGH_TEMPLATES: WalkthroughAreaTemplate[] = [
  {
    key: 'kitchen',
    label: 'Kitchen',
    emoji: '🍳',
    items: [
      { name: 'Pots', unit: 'units', ideal: 3, cost: 25 },
      { name: 'Pans / skillets', unit: 'units', ideal: 2, cost: 22 },
      { name: 'Cutlery sets', unit: 'sets', ideal: 8, cost: 4 },
      { name: 'Dinner plates', unit: 'units', ideal: 8, cost: 6 },
      { name: 'Bowls', unit: 'units', ideal: 8, cost: 5 },
      { name: 'Drinking glasses', unit: 'units', ideal: 8, cost: 4 },
      { name: 'Wine glasses', unit: 'units', ideal: 6, cost: 5 },
      { name: 'Mugs', unit: 'units', ideal: 6, cost: 4 },
      { name: 'Knife set', unit: 'sets', ideal: 1, cost: 35 },
      { name: 'Cutting board', unit: 'units', ideal: 1, cost: 15 },
      { name: 'Can / bottle opener', unit: 'units', ideal: 1, cost: 8 },
      { name: 'Cooking utensils', unit: 'sets', ideal: 1, cost: 20 },
      { name: 'Coffee maker', unit: 'units', ideal: 1, cost: 60 },
      { name: 'Toaster', unit: 'units', ideal: 1, cost: 30 },
      { name: 'Blender', unit: 'units', ideal: 1, cost: 40 },
      { name: 'Microwave', unit: 'units', ideal: 1, cost: 90 },
      { name: 'Baking trays', unit: 'units', ideal: 2, cost: 12 },
      { name: 'Food storage containers', unit: 'units', ideal: 4, cost: 5 },
      { name: 'Oven mitts', unit: 'units', ideal: 2, cost: 8 },
      { name: 'Dish towels', unit: 'units', ideal: 4, cost: 5 },
      { name: 'Trash bin', unit: 'units', ideal: 1, cost: 20 },
      { name: 'Cabinets (count)', unit: 'units', ideal: 10 },
    ],
  },
  {
    key: 'bathroom',
    label: 'Bathroom',
    emoji: '🚿',
    repeatBy: 'bathrooms',
    items: [
      { name: 'Bath towels', unit: 'units', ideal: 2, cost: 12 },
      { name: 'Hand towels', unit: 'units', ideal: 2, cost: 7 },
      { name: 'Face cloths', unit: 'units', ideal: 2, cost: 4 },
      { name: 'Bath mat', unit: 'units', ideal: 1, cost: 15 },
      { name: 'Shower curtain / liner', unit: 'units', ideal: 1, cost: 18 },
      { name: 'Toilet paper', unit: 'rolls', ideal: 4, cost: 1 },
      { name: 'Toilet brush', unit: 'units', ideal: 1, cost: 8 },
      { name: 'Plunger', unit: 'units', ideal: 1, cost: 10 },
      { name: 'Trash bin', unit: 'units', ideal: 1, cost: 12 },
      { name: 'Hair dryer', unit: 'units', ideal: 1, cost: 30 },
      { name: 'Amenities kit (soap/shampoo)', unit: 'kits', ideal: 1, cost: 10 },
      { name: 'Soap dispenser', unit: 'units', ideal: 1, cost: 8 },
    ],
  },
  {
    key: 'bedroom',
    label: 'Bedroom',
    emoji: '🛏️',
    repeatBy: 'bedrooms',
    items: [
      { name: 'Sheet sets', unit: 'sets', ideal: 2, cost: 45 },
      { name: 'Pillowcases', unit: 'units', ideal: 4, cost: 8 },
      { name: 'Pillows', unit: 'units', ideal: 4, cost: 20 },
      { name: 'Duvet / comforter', unit: 'units', ideal: 1, cost: 70 },
      { name: 'Duvet cover', unit: 'units', ideal: 2, cost: 40 },
      { name: 'Mattress protector', unit: 'units', ideal: 1, cost: 30 },
      { name: 'Extra blanket', unit: 'units', ideal: 1, cost: 25 },
      { name: 'Hangers', unit: 'units', ideal: 10, cost: 1 },
      { name: 'Blackout curtains', unit: 'units', ideal: 1, cost: 40 },
      { name: 'Bedside lamp', unit: 'units', ideal: 2, cost: 25 },
      { name: 'Trash bin', unit: 'units', ideal: 1, cost: 12 },
    ],
  },
  {
    key: 'living',
    label: 'Living Room',
    emoji: '🛋️',
    items: [
      { name: 'Throw pillows', unit: 'units', ideal: 4, cost: 15 },
      { name: 'Throw blankets', unit: 'units', ideal: 2, cost: 25 },
      { name: 'Remote controls', unit: 'units', ideal: 1, cost: 15 },
      { name: 'Area rug', unit: 'units', ideal: 1, cost: 80 },
      { name: 'Decor items', unit: 'units', ideal: 3, cost: 20 },
      { name: 'Upholstered furniture (pieces)', unit: 'units', ideal: 2 },
    ],
  },
  {
    key: 'dining',
    label: 'Dining Room',
    emoji: '🍽️',
    items: [
      { name: 'Dining chairs', unit: 'units', ideal: 6 },
      { name: 'Placemats', unit: 'units', ideal: 6, cost: 6 },
      { name: 'Table linens', unit: 'units', ideal: 2, cost: 20 },
      { name: 'Centerpiece / decor', unit: 'units', ideal: 1, cost: 25 },
    ],
  },
  {
    key: 'closet',
    label: 'Closet & Storage',
    emoji: '🚪',
    items: [
      { name: 'Hangers', unit: 'units', ideal: 20, cost: 1 },
      { name: 'Storage bins', unit: 'units', ideal: 2, cost: 12 },
      { name: 'Iron', unit: 'units', ideal: 1, cost: 30 },
      { name: 'Ironing board', unit: 'units', ideal: 1, cost: 35 },
      { name: 'Safe', unit: 'units', ideal: 1, cost: 60 },
      { name: 'Luggage rack', unit: 'units', ideal: 1, cost: 30 },
    ],
  },
  {
    key: 'laundry',
    label: 'Laundry',
    emoji: '🧺',
    optionalFlag: 'laundry',
    items: [
      { name: 'Washer', unit: 'units', ideal: 1 },
      { name: 'Dryer', unit: 'units', ideal: 1 },
      { name: 'Laundry detergent', unit: 'bottles', ideal: 1, cost: 12 },
      { name: 'Fabric softener', unit: 'bottles', ideal: 1, cost: 8 },
      { name: 'Bleach', unit: 'bottles', ideal: 1, cost: 6 },
      { name: 'Stain remover', unit: 'bottles', ideal: 1, cost: 8 },
      { name: 'Laundry basket', unit: 'units', ideal: 1, cost: 15 },
      { name: 'Drying rack', unit: 'units', ideal: 1, cost: 25 },
    ],
  },
  {
    key: 'cleaning',
    label: 'Cleaning & Consumables',
    emoji: '🧼',
    items: [
      { name: 'All-purpose cleaner', unit: 'bottles', ideal: 1, cost: 7 },
      { name: 'Glass cleaner', unit: 'bottles', ideal: 1, cost: 6 },
      { name: 'Bathroom cleaner', unit: 'bottles', ideal: 1, cost: 7 },
      { name: 'Floor cleaner', unit: 'bottles', ideal: 1, cost: 9 },
      { name: 'Dish soap', unit: 'bottles', ideal: 1, cost: 5 },
      { name: 'Dishwasher pods', unit: 'packs', ideal: 1, cost: 12 },
      { name: 'Sponges', unit: 'units', ideal: 3, cost: 2 },
      { name: 'Microfiber cloths', unit: 'units', ideal: 5, cost: 3 },
      { name: 'Paper towels', unit: 'rolls', ideal: 2, cost: 3 },
      { name: 'Trash bags', unit: 'packs', ideal: 1, cost: 10 },
      { name: 'Vacuum cleaner', unit: 'units', ideal: 1, cost: 150 },
      { name: 'Mop & bucket', unit: 'sets', ideal: 1, cost: 30 },
      { name: 'Broom & dustpan', unit: 'sets', ideal: 1, cost: 20 },
      { name: 'Light bulbs', unit: 'units', ideal: 4, cost: 4 },
      { name: 'Batteries', unit: 'packs', ideal: 1, cost: 8 },
    ],
  },
  {
    key: 'outdoor',
    label: 'Outdoor Area',
    emoji: '🌳',
    optionalFlag: 'outdoor',
    items: [
      { name: 'Patio furniture (pieces)', unit: 'units', ideal: 4 },
      { name: 'Outdoor cushions', unit: 'units', ideal: 4, cost: 25 },
      { name: 'Grill / BBQ', unit: 'units', ideal: 1, cost: 200 },
      { name: 'Grill tools', unit: 'sets', ideal: 1, cost: 25 },
      { name: 'Umbrella / shade', unit: 'units', ideal: 1, cost: 80 },
      { name: 'Outdoor trash bin', unit: 'units', ideal: 1, cost: 25 },
    ],
  },
  {
    key: 'pool',
    label: 'Pool Area',
    emoji: '🏊',
    optionalFlag: 'pool',
    items: [
      { name: 'Pool towels', unit: 'units', ideal: 6, cost: 15 },
      { name: 'Lounge chairs', unit: 'units', ideal: 4 },
      { name: 'Pool skimmer / net', unit: 'units', ideal: 1, cost: 30 },
      { name: 'Safety equipment', unit: 'units', ideal: 1, cost: 40 },
    ],
  },
  {
    key: 'hot_tub',
    label: 'Hot Tub / Sauna',
    emoji: '♨️',
    optionalFlag: 'hotTub',
    items: [
      { name: 'Hot tub cover', unit: 'units', ideal: 1, cost: 150 },
      { name: 'Chemical kit', unit: 'kits', ideal: 1, cost: 40 },
      { name: 'Extra towels', unit: 'units', ideal: 4, cost: 12 },
    ],
  },
  {
    key: 'garage',
    label: 'Garage',
    emoji: '🚗',
    optionalFlag: 'garage',
    items: [
      { name: 'Garage remotes', unit: 'units', ideal: 1, cost: 35 },
      { name: 'Shelving / storage', unit: 'units', ideal: 1 },
      { name: 'Tools', unit: 'sets', ideal: 1, cost: 50 },
    ],
  },
  {
    key: 'office',
    label: 'Home Office',
    emoji: '💻',
    optionalFlag: 'office',
    items: [
      { name: 'Desk', unit: 'units', ideal: 1 },
      { name: 'Office chair', unit: 'units', ideal: 1 },
      { name: 'Desk lamp', unit: 'units', ideal: 1, cost: 25 },
      { name: 'Power strip', unit: 'units', ideal: 1, cost: 15 },
    ],
  },
  {
    key: 'general',
    label: 'General / Safety',
    emoji: '🏠',
    items: [
      { name: 'Smoke detectors', unit: 'units', ideal: 2, cost: 25 },
      { name: 'Carbon monoxide detector', unit: 'units', ideal: 1, cost: 30 },
      { name: 'Fire extinguisher', unit: 'units', ideal: 1, cost: 40 },
      { name: 'First aid kit', unit: 'kits', ideal: 1, cost: 25 },
      { name: 'House manual / guest book', unit: 'units', ideal: 1, cost: 15 },
      { name: 'Spare keys / lockbox', unit: 'units', ideal: 1, cost: 30 },
      { name: 'Wi-Fi router access info', unit: 'units', ideal: 1 },
    ],
  },
];

export const OPTIONAL_FLAGS: { key: string; label: string; emoji: string }[] = [
  { key: 'laundry', label: 'Laundry', emoji: '🧺' },
  { key: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { key: 'pool', label: 'Pool', emoji: '🏊' },
  { key: 'hotTub', label: 'Hot tub / Sauna', emoji: '♨️' },
  { key: 'garage', label: 'Garage', emoji: '🚗' },
  { key: 'office', label: 'Home office', emoji: '💻' },
];

export const STATUS_META: Record<WalkthroughItemStatus, { label: string; short: string; className: string }> = {
  present: { label: 'Present', short: 'Have', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/40' },
  missing: { label: 'Missing', short: 'Missing', className: 'bg-destructive/10 text-destructive border-destructive/40' },
  damaged: { label: 'Damaged', short: 'Damaged', className: 'bg-amber-500/15 text-amber-600 border-amber-500/40' },
  na: { label: 'Not applicable', short: 'N/A', className: 'bg-muted text-muted-foreground border-border' },
};
