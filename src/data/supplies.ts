// Maison Pur — default supplies catalog used by the Supplies Audit step.
// The cleaner sees this list pre-filled at the end of every job and marks each
// item as OK / Low / Out, optionally adding a photo and a note.

export type SupplyCategory =
  | 'Bathroom'
  | 'Kitchen'
  | 'Laundry'
  | 'Bedroom'
  | 'General';

export interface DefaultSupplyItem {
  id: string;        // stable slug used as itemId in SupplyAuditEntry
  name: string;
  category: SupplyCategory;
  unit?: string;     // optional, used when cleaner records remaining qty
}

export const DEFAULT_SUPPLY_ITEMS: DefaultSupplyItem[] = [
  // Bathroom
  { id: 'toilet-paper',    name: 'Toilet paper',        category: 'Bathroom', unit: 'rolls' },
  { id: 'paper-tissues',   name: 'Facial tissues',      category: 'Bathroom', unit: 'boxes' },
  { id: 'hand-soap',       name: 'Hand soap',           category: 'Bathroom', unit: 'bottles' },
  { id: 'body-wash',       name: 'Body wash',           category: 'Bathroom', unit: 'bottles' },
  { id: 'bar-soap',        name: 'Bar soap',            category: 'Bathroom', unit: 'bars' },
  { id: 'shampoo',         name: 'Shampoo',             category: 'Bathroom', unit: 'bottles' },
  { id: 'conditioner',     name: 'Conditioner',         category: 'Bathroom', unit: 'bottles' },
  { id: 'cotton-swabs',    name: 'Cotton swabs',        category: 'Bathroom', unit: 'packs' },
  { id: 'cotton-pads',     name: 'Cotton pads',         category: 'Bathroom', unit: 'packs' },
  { id: 'paper-towels-bath', name: 'Bath paper towels', category: 'Bathroom', unit: 'rolls' },

  // Kitchen
  { id: 'dish-soap',       name: 'Dish soap',           category: 'Kitchen',  unit: 'bottles' },
  { id: 'sponge',          name: 'Sponge',              category: 'Kitchen',  unit: 'units' },
  { id: 'dish-cloth',      name: 'Dish cloth',          category: 'Kitchen',  unit: 'units' },
  { id: 'paper-towels',    name: 'Paper towels',        category: 'Kitchen',  unit: 'rolls' },
  { id: 'trash-bags',      name: 'Trash bags',          category: 'Kitchen',  unit: 'units' },
  { id: 'coffee-filters',  name: 'Coffee filters',      category: 'Kitchen',  unit: 'units' },
  { id: 'nespresso-pods',  name: 'Nespresso pods',      category: 'Kitchen',  unit: 'units' },
  { id: 'salt',            name: 'Salt',                category: 'Kitchen' },
  { id: 'pepper',          name: 'Pepper',              category: 'Kitchen' },
  { id: 'olive-oil',       name: 'Olive oil',           category: 'Kitchen', unit: 'bottles' },
  { id: 'sugar',           name: 'Sugar',               category: 'Kitchen' },
  { id: 'coffee',          name: 'Coffee',              category: 'Kitchen', unit: 'bags' },
  { id: 'tea',             name: 'Tea',                 category: 'Kitchen', unit: 'boxes' },
  { id: 'bottled-water',   name: 'Bottled water',       category: 'Kitchen', unit: 'bottles' },
  { id: 'cutlery-extra',   name: 'Cutlery (fork/knife/spoon)', category: 'Kitchen', unit: 'sets' },
  { id: 'glassware',       name: 'Glassware',           category: 'Kitchen', unit: 'units' },

  // Laundry
  { id: 'laundry-detergent', name: 'Laundry detergent', category: 'Laundry', unit: 'bottles' },
  { id: 'fabric-softener',   name: 'Fabric softener',   category: 'Laundry', unit: 'bottles' },
  { id: 'stain-remover',     name: 'Stain remover',     category: 'Laundry', unit: 'bottles' },
  { id: 'laundry-bags',      name: 'Laundry bags',      category: 'Laundry', unit: 'units' },

  // Bedroom
  { id: 'linen-spray',     name: 'Linen spray',         category: 'Bedroom', unit: 'bottles' },
  { id: 'extra-towels',    name: 'Extra towels',        category: 'Bedroom', unit: 'units' },

  // General
  { id: 'batteries-aa',    name: 'Batteries AA',        category: 'General', unit: 'units' },
  { id: 'batteries-aaa',   name: 'Batteries AAA',       category: 'General', unit: 'units' },
  { id: 'light-bulbs',     name: 'Light bulbs',         category: 'General', unit: 'units' },
  { id: 'candles',         name: 'Candles',             category: 'General', unit: 'units' },
  { id: 'matches',         name: 'Matches',             category: 'General', unit: 'boxes' },
  { id: 'air-freshener',   name: 'Air freshener',       category: 'General', unit: 'bottles' },
  { id: 'pet-supplies',    name: 'Pet supplies',        category: 'General' },
];

export const SUPPLY_CATEGORY_ORDER: SupplyCategory[] = [
  'Bathroom',
  'Kitchen',
  'Laundry',
  'Bedroom',
  'General',
];
