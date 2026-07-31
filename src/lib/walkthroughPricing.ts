import { WALKTHROUGH_TEMPLATES, WalkthroughItemStatus } from '@/data/walkthroughCatalog';

export type AreaCondition = 'good' | 'regular' | 'heavy';

export interface WalkthroughItem {
  id: string;
  name: string;
  unit: string;
  ideal: number;
  cost?: number;
  status: WalkthroughItemStatus;
  found: number;
  photo_url?: string | null;
  note?: string;
}

export interface WalkthroughArea {
  id: string;
  templateKey: string;
  label: string;
  emoji: string;
  condition: AreaCondition;
  items: WalkthroughItem[];
}

export interface WalkthroughConfig {
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  serviceType: string;
  hourlyRate: number;
  pets: boolean;
  postConstruction: boolean;
  flags: Record<string, boolean>;
}

export interface WalkthroughPricing {
  baseHours: number;
  adjustedHours: number;
  laborTotal: number;
  suppliesTotal: number;
  suggestedTotal: number;
  missingCount: number;
  damagedCount: number;
}

export const DEFAULT_CONFIG: WalkthroughConfig = {
  bedrooms: 3,
  bathrooms: 2,
  sqft: 0,
  serviceType: 'Airbnb Cleaning',
  hourlyRate: 45,
  pets: false,
  postConstruction: false,
  flags: { laundry: true, outdoor: false, pool: false, hotTub: false, garage: false, office: false },
};

const CONDITION_MULTIPLIER: Record<AreaCondition, number> = { good: 1, regular: 1.25, heavy: 1.6 };

const uid = () => Math.random().toString(36).slice(2, 10);

export function buildAreas(config: WalkthroughConfig): WalkthroughArea[] {
  const areas: WalkthroughArea[] = [];

  for (const tpl of WALKTHROUGH_TEMPLATES) {
    if (tpl.optionalFlag && !config.flags[tpl.optionalFlag]) continue;

    const count = tpl.repeatBy === 'bedrooms'
      ? Math.max(0, config.bedrooms)
      : tpl.repeatBy === 'bathrooms'
        ? Math.max(0, config.bathrooms)
        : 1;

    for (let i = 0; i < count; i++) {
      areas.push({
        id: uid(),
        templateKey: tpl.key,
        label: count > 1 ? `${tpl.label} ${i + 1}` : tpl.label,
        emoji: tpl.emoji,
        condition: 'good',
        items: tpl.items.map((it) => ({
          id: uid(),
          name: it.name,
          unit: it.unit,
          ideal: it.ideal,
          cost: it.cost,
          status: 'present' as WalkthroughItemStatus,
          found: it.ideal,
          photo_url: null,
          note: '',
        })),
      });
    }
  }

  return areas;
}

export function newBlankItem(name = 'New item'): WalkthroughItem {
  return { id: uid(), name, unit: 'units', ideal: 1, status: 'missing', found: 0, photo_url: null, note: '' };
}

export function computePricing(config: WalkthroughConfig, areas: WalkthroughArea[]): WalkthroughPricing {
  // Base hours: 1h fixed + 0.75h per bedroom + 1h per bathroom + 0.6h per 1000 sqft
  let baseHours = 1 + config.bedrooms * 0.75 + config.bathrooms * 1 + (config.sqft / 1000) * 0.6;

  // Optional areas add time
  const extraAreaHours: Record<string, number> = {
    laundry: 0.5, outdoor: 0.75, pool: 0.5, hotTub: 0.5, garage: 0.5, office: 0.4,
  };
  Object.entries(config.flags).forEach(([k, on]) => {
    if (on) baseHours += extraAreaHours[k] || 0;
  });

  // Condition multiplier weighted by the areas
  const multipliers = areas.map((a) => CONDITION_MULTIPLIER[a.condition] ?? 1);
  const avgMultiplier = multipliers.length
    ? multipliers.reduce((s, m) => s + m, 0) / multipliers.length
    : 1;

  let adjustedHours = baseHours * avgMultiplier;
  if (config.pets) adjustedHours *= 1.1;
  if (config.postConstruction) adjustedHours *= 1.5;
  adjustedHours = Math.round(adjustedHours * 4) / 4;

  let suppliesTotal = 0;
  let missingCount = 0;
  let damagedCount = 0;

  areas.forEach((a) => a.items.forEach((it) => {
    if (it.status === 'missing' || it.status === 'damaged') {
      if (it.status === 'missing') missingCount++; else damagedCount++;
      const qty = Math.max(1, (it.ideal || 1) - (it.found || 0));
      suppliesTotal += (it.cost || 0) * qty;
    }
  }));

  const laborTotal = Math.round(adjustedHours * config.hourlyRate);
  suppliesTotal = Math.round(suppliesTotal);

  return {
    baseHours: Math.round(baseHours * 4) / 4,
    adjustedHours,
    laborTotal,
    suppliesTotal,
    suggestedTotal: laborTotal + suppliesTotal,
    missingCount,
    damagedCount,
  };
}
