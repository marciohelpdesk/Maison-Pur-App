import { ChecklistSection } from '@/types';

/**
 * Extra-area sections appended to every base template so that every property
 * starts with the FULL list of possible spaces (laundry, pool, sauna, gym,
 * garage, outdoor, home office, kids room, game room, wine cellar, balcony,
 * elevator/hallway, pet area). Cleaners remove the sections that don't apply
 * by tapping the trash icon in the execution checklist.
 *
 * The `prefix` argument keeps IDs unique across templates so React keys never
 * collide when multiple templates are loaded in memory.
 */
export const buildExtraAreaSections = (prefix: string): ChecklistSection[] => [
  {
    id: `${prefix}-laundry`,
    title: 'Laundry Room',
    items: [
      { id: `${prefix}-lr1`, label: 'Wipe washer and dryer exteriors', completed: false, photoRequired: false },
      { id: `${prefix}-lr2`, label: 'Clean lint trap and dryer filter', completed: false, photoRequired: true },
      { id: `${prefix}-lr3`, label: 'Wipe down folding counter / utility sink', completed: false, photoRequired: false },
      { id: `${prefix}-lr4`, label: 'Refill detergent, fabric softener and stain remover', completed: false, photoRequired: false },
      { id: `${prefix}-lr5`, label: 'Fold and stock clean towels and sheets', completed: false, photoRequired: false },
      { id: `${prefix}-lr6`, label: 'Empty trash and replace bag', completed: false, photoRequired: false },
      { id: `${prefix}-lr7`, label: 'Sweep and mop floor', completed: false, photoRequired: false },
    ],
  },
  {
    id: `${prefix}-pool`,
    title: 'Pool Area',
    items: [
      { id: `${prefix}-po1`, label: 'Skim leaves and debris from water surface', completed: false, photoRequired: false },
      { id: `${prefix}-po2`, label: 'Brush pool edges and tile line', completed: false, photoRequired: false },
      { id: `${prefix}-po3`, label: 'Sweep and rinse pool deck', completed: false, photoRequired: false },
      { id: `${prefix}-po4`, label: 'Wipe down lounge chairs and side tables', completed: false, photoRequired: false },
      { id: `${prefix}-po5`, label: 'Organize floats, noodles and pool toys', completed: false, photoRequired: false },
      { id: `${prefix}-po6`, label: 'Check water level and clarity', completed: false, photoRequired: false },
      { id: `${prefix}-po7`, label: 'Final pool area photo', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-spa`,
    title: 'Hot Tub / Spa',
    items: [
      { id: `${prefix}-sp1`, label: 'Wipe spa shell and headrests', completed: false, photoRequired: false },
      { id: `${prefix}-sp2`, label: 'Clean and re-secure cover', completed: false, photoRequired: false },
      { id: `${prefix}-sp3`, label: 'Check water clarity and skim debris', completed: false, photoRequired: false },
      { id: `${prefix}-sp4`, label: 'Organize spa accessories and steps', completed: false, photoRequired: false },
    ],
  },
  {
    id: `${prefix}-sauna`,
    title: 'Sauna / Steam Room',
    items: [
      { id: `${prefix}-sa1`, label: 'Wipe down all wooden benches', completed: false, photoRequired: false },
      { id: `${prefix}-sa2`, label: 'Inspect sauna stones / steam generator', completed: false, photoRequired: false },
      { id: `${prefix}-sa3`, label: 'Air out the room (door open)', completed: false, photoRequired: false },
      { id: `${prefix}-sa4`, label: 'Clean glass door inside and out', completed: false, photoRequired: false },
      { id: `${prefix}-sa5`, label: 'Sweep and mop floor', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-gym`,
    title: 'Gym / Fitness Area',
    items: [
      { id: `${prefix}-gy1`, label: 'Disinfect machines, benches and handles', completed: false, photoRequired: false },
      { id: `${prefix}-gy2`, label: 'Wipe treadmill, bike and elliptical screens', completed: false, photoRequired: false },
      { id: `${prefix}-gy3`, label: 'Re-rack dumbbells and free weights', completed: false, photoRequired: false },
      { id: `${prefix}-gy4`, label: 'Clean mirrors thoroughly', completed: false, photoRequired: false },
      { id: `${prefix}-gy5`, label: 'Refresh towels and water if provided', completed: false, photoRequired: false },
      { id: `${prefix}-gy6`, label: 'Vacuum or mop floor / mats', completed: false, photoRequired: false },
    ],
  },
  {
    id: `${prefix}-garage`,
    title: 'Garage',
    items: [
      { id: `${prefix}-ga1`, label: 'Sweep garage floor', completed: false, photoRequired: false },
      { id: `${prefix}-ga2`, label: 'Organize tools, bikes and storage', completed: false, photoRequired: false },
      { id: `${prefix}-ga3`, label: 'Empty trash and recycling bins', completed: false, photoRequired: false },
      { id: `${prefix}-ga4`, label: 'Wipe down workbench and surfaces', completed: false, photoRequired: false },
      { id: `${prefix}-ga5`, label: 'Final garage photo', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-outdoor`,
    title: 'Outdoor / Backyard',
    items: [
      { id: `${prefix}-od1`, label: 'Sweep patio, deck and walkways', completed: false, photoRequired: false },
      { id: `${prefix}-od2`, label: 'Wipe outdoor furniture and cushions', completed: false, photoRequired: false },
      { id: `${prefix}-od3`, label: 'Clean grill / BBQ exterior and grates', completed: false, photoRequired: false },
      { id: `${prefix}-od4`, label: 'Tidy garden, planters and outdoor decor', completed: false, photoRequired: false },
      { id: `${prefix}-od5`, label: 'Pick up cigarette butts, leaves and trash', completed: false, photoRequired: false },
      { id: `${prefix}-od6`, label: 'Final exterior photo', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-office`,
    title: 'Home Office',
    items: [
      { id: `${prefix}-of1`, label: 'Dust desk, monitor and shelves', completed: false, photoRequired: false },
      { id: `${prefix}-of2`, label: 'Wipe keyboard, mouse and peripherals', completed: false, photoRequired: false },
      { id: `${prefix}-of3`, label: 'Organize cables and chargers', completed: false, photoRequired: false },
      { id: `${prefix}-of4`, label: 'Empty trash and shredder bin', completed: false, photoRequired: false },
      { id: `${prefix}-of5`, label: 'Vacuum or mop floor', completed: false, photoRequired: false },
    ],
  },
  {
    id: `${prefix}-kids`,
    title: 'Kids Room / Playroom',
    items: [
      { id: `${prefix}-ki1`, label: 'Sort and store toys in bins', completed: false, photoRequired: false },
      { id: `${prefix}-ki2`, label: 'Disinfect tables, chairs and play surfaces', completed: false, photoRequired: false },
      { id: `${prefix}-ki3`, label: 'Spot-clean plush toys if visibly soiled', completed: false, photoRequired: false },
      { id: `${prefix}-ki4`, label: 'Make beds / arrange cribs neatly', completed: false, photoRequired: false },
      { id: `${prefix}-ki5`, label: 'Vacuum rugs and mop hard floors', completed: false, photoRequired: false },
      { id: `${prefix}-ki6`, label: 'Final playroom photo', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-game`,
    title: 'Game Room / Entertainment',
    items: [
      { id: `${prefix}-gm1`, label: 'Wipe pool / ping-pong / foosball table', completed: false, photoRequired: false },
      { id: `${prefix}-gm2`, label: 'Organize cues, paddles and game pieces', completed: false, photoRequired: false },
      { id: `${prefix}-gm3`, label: 'Clean console and controllers', completed: false, photoRequired: false },
      { id: `${prefix}-gm4`, label: 'Dust TV / projector screen', completed: false, photoRequired: false },
      { id: `${prefix}-gm5`, label: 'Vacuum / mop floor', completed: false, photoRequired: false },
    ],
  },
  {
    id: `${prefix}-bar`,
    title: 'Wine Cellar / Bar',
    items: [
      { id: `${prefix}-ba1`, label: 'Wipe bar counter and back-bar shelves', completed: false, photoRequired: false },
      { id: `${prefix}-ba2`, label: 'Polish wine glasses and tumblers', completed: false, photoRequired: false },
      { id: `${prefix}-ba3`, label: 'Organize bottles by type', completed: false, photoRequired: false },
      { id: `${prefix}-ba4`, label: 'Clean ice bucket, shaker and bar tools', completed: false, photoRequired: false },
      { id: `${prefix}-ba5`, label: 'Sweep and mop floor', completed: false, photoRequired: false },
    ],
  },
  {
    id: `${prefix}-balcony`,
    title: 'Balcony / Terrace',
    items: [
      { id: `${prefix}-bl1`, label: 'Sweep balcony floor', completed: false, photoRequired: false },
      { id: `${prefix}-bl2`, label: 'Wipe balcony furniture and railings', completed: false, photoRequired: false },
      { id: `${prefix}-bl3`, label: 'Clean glass railings or windows', completed: false, photoRequired: false },
      { id: `${prefix}-bl4`, label: 'Water plants and tidy planters', completed: false, photoRequired: false },
    ],
  },
  {
    id: `${prefix}-hallway`,
    title: 'Elevator / Hallway',
    items: [
      { id: `${prefix}-hw1`, label: 'Wipe elevator buttons and handrails', completed: false, photoRequired: false },
      { id: `${prefix}-hw2`, label: 'Clean elevator mirrors and walls', completed: false, photoRequired: false },
      { id: `${prefix}-hw3`, label: 'Sweep and mop hallway floor', completed: false, photoRequired: false },
      { id: `${prefix}-hw4`, label: 'Dust hallway tables, art and lamps', completed: false, photoRequired: false },
    ],
  },
  {
    id: `${prefix}-pet`,
    title: 'Pet Area',
    items: [
      { id: `${prefix}-pe1`, label: 'Wash food and water bowls', completed: false, photoRequired: false },
      { id: `${prefix}-pe2`, label: 'Shake out and replace pet bed cover', completed: false, photoRequired: false },
      { id: `${prefix}-pe3`, label: 'Sanitize litter box / pee pad area', completed: false, photoRequired: false },
      { id: `${prefix}-pe4`, label: 'Sweep loose fur and vacuum pet zone', completed: false, photoRequired: false },
      { id: `${prefix}-pe5`, label: 'Final pet area photo', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-cinema`,
    title: 'Cinema / Media Room',
    items: [
      { id: `${prefix}-ci1`, label: 'Dust projector, screen and speakers', completed: false, photoRequired: false },
      { id: `${prefix}-ci2`, label: 'Wipe reclining chairs and remotes', completed: false, photoRequired: false },
      { id: `${prefix}-ci3`, label: 'Clean popcorn machine and snack bar', completed: false, photoRequired: false },
      { id: `${prefix}-ci4`, label: 'Organize movie collection / streaming devices', completed: false, photoRequired: false },
      { id: `${prefix}-ci5`, label: 'Vacuum carpet and aisles', completed: false, photoRequired: false },
    ],
  },
  {
    id: `${prefix}-rooftop`,
    title: 'Rooftop / Terrace',
    items: [
      { id: `${prefix}-ro1`, label: 'Sweep rooftop deck thoroughly', completed: false, photoRequired: false },
      { id: `${prefix}-ro2`, label: 'Wipe lounge furniture and cushions', completed: false, photoRequired: false },
      { id: `${prefix}-ro3`, label: 'Clean fire pit / outdoor fireplace', completed: false, photoRequired: false },
      { id: `${prefix}-ro4`, label: 'Check rooftop jacuzzi water and cover', completed: false, photoRequired: false },
      { id: `${prefix}-ro5`, label: 'Tidy planters and outdoor decor', completed: false, photoRequired: false },
      { id: `${prefix}-ro6`, label: 'Final rooftop photo with view', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-dock`,
    title: 'Dock / Pier / Beach Access',
    items: [
      { id: `${prefix}-do1`, label: 'Sweep dock boards and remove debris', completed: false, photoRequired: false },
      { id: `${prefix}-do2`, label: 'Inspect and wipe life jackets / safety gear', completed: false, photoRequired: false },
      { id: `${prefix}-do3`, label: 'Tidy beach chairs, umbrellas and toys', completed: false, photoRequired: false },
      { id: `${prefix}-do4`, label: 'Rinse sand off beach access path', completed: false, photoRequired: false },
      { id: `${prefix}-do5`, label: 'Final waterfront photo', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-ev`,
    title: 'EV Charger / Tech Garage',
    items: [
      { id: `${prefix}-ev1`, label: 'Wipe EV charger unit and screen', completed: false, photoRequired: false },
      { id: `${prefix}-ev2`, label: 'Coil and organize charging cable', completed: false, photoRequired: false },
      { id: `${prefix}-ev3`, label: 'Sweep around charging area', completed: false, photoRequired: false },
      { id: `${prefix}-ev4`, label: 'Check status indicator (green/working)', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-guesthouse`,
    title: 'Guest House / In-Law Suite',
    items: [
      { id: `${prefix}-gh1`, label: 'Make bed with fresh linens', completed: false, photoRequired: true },
      { id: `${prefix}-gh2`, label: 'Clean mini-kitchen / kitchenette', completed: false, photoRequired: false },
      { id: `${prefix}-gh3`, label: 'Sanitize private bathroom', completed: false, photoRequired: false },
      { id: `${prefix}-gh4`, label: 'Restock towels and toiletries', completed: false, photoRequired: false },
      { id: `${prefix}-gh5`, label: 'Vacuum / mop floor', completed: false, photoRequired: false },
      { id: `${prefix}-gh6`, label: 'Final guest house photo', completed: false, photoRequired: true },
    ],
  },
  {
    id: `${prefix}-mudroom`,
    title: 'Mudroom / Drop Zone',
    items: [
      { id: `${prefix}-mu1`, label: 'Organize hooks, hangers and cubbies', completed: false, photoRequired: false },
      { id: `${prefix}-mu2`, label: 'Wipe bench and storage surfaces', completed: false, photoRequired: false },
      { id: `${prefix}-mu3`, label: 'Align shoes and arrange footwear', completed: false, photoRequired: false },
      { id: `${prefix}-mu4`, label: 'Empty trash and shake out rugs', completed: false, photoRequired: false },
      { id: `${prefix}-mu5`, label: 'Sweep and mop floor', completed: false, photoRequired: false },
    ],
  },
];

const STANDARD_BASE_SECTIONS: ChecklistSection[] = [
  {
    id: 'entry',
    title: 'Entry & Hallway',
    items: [
      { id: 'e1', label: 'Clean front door (inside and out) and handle', completed: false, photoRequired: false },
      { id: 'e2', label: 'Shake out doormat / replace welcome mat', completed: false, photoRequired: false },
      { id: 'e3', label: 'Wipe entry console, mirror and decor', completed: false, photoRequired: false },
      { id: 'e4', label: 'Organize shoe rack and coat hooks', completed: false, photoRequired: false },
      { id: 'e5', label: 'Sweep and mop entry floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'kitchen',
    title: 'Kitchen',
    items: [
      { id: 'k1', label: 'Wipe down all countertops and backsplash', completed: false, photoRequired: false },
      { id: 'k2', label: 'Clean stovetop, burners and oven exterior', completed: false, photoRequired: false },
      { id: 'k3', label: 'Clean microwave inside and out', completed: false, photoRequired: false },
      { id: 'k4', label: 'Clean range hood and filter', completed: false, photoRequired: false },
      { id: 'k5', label: 'Wipe cabinet fronts and handles', completed: false, photoRequired: false },
      { id: 'k6', label: 'Clean refrigerator exterior + quick interior wipe', completed: false, photoRequired: false },
      { id: 'k7', label: 'Run / empty dishwasher and wipe front', completed: false, photoRequired: false },
      { id: 'k8', label: 'Descale sink and faucet', completed: false, photoRequired: false },
      { id: 'k9', label: 'Wipe small appliances (toaster, kettle, coffee maker)', completed: false, photoRequired: false },
      { id: 'k10', label: 'Empty and sanitize trash can', completed: false, photoRequired: false },
      { id: 'k11', label: 'Wipe light switches and outlets', completed: false, photoRequired: false },
      { id: 'k12', label: 'Sweep and mop floor + baseboards', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'dining',
    title: 'Dining Room',
    items: [
      { id: 'd1', label: 'Wipe dining table and chairs', completed: false, photoRequired: false },
      { id: 'd2', label: 'Polish chandelier / pendant lights', completed: false, photoRequired: false },
      { id: 'd3', label: 'Dust buffet, sideboard and decor', completed: false, photoRequired: false },
      { id: 'd4', label: 'Arrange centerpiece neatly', completed: false, photoRequired: false },
      { id: 'd5', label: 'Vacuum / mop floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'living',
    title: 'Living Room',
    items: [
      { id: 'l1', label: 'Dust all surfaces, shelves and electronics', completed: false, photoRequired: false },
      { id: 'l2', label: 'Vacuum carpets, rugs and upholstery', completed: false, photoRequired: false },
      { id: 'l3', label: 'Mop hard floors and wipe baseboards', completed: false, photoRequired: false },
      { id: 'l4', label: 'Fluff and arrange pillows / throws', completed: false, photoRequired: false },
      { id: 'l5', label: 'Wipe down TV screen, console and remotes', completed: false, photoRequired: false },
      { id: 'l6', label: 'Clean mirrors, glass and picture frames', completed: false, photoRequired: false },
      { id: 'l7', label: 'Dust ceiling fan and light fixtures', completed: false, photoRequired: false },
      { id: 'l8', label: 'Wipe interior windows and sills', completed: false, photoRequired: false },
      { id: 'l9', label: 'Water and tidy indoor plants', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    items: [
      { id: 'b1', label: 'Change bed sheets, pillowcases and duvet cover', completed: false, photoRequired: true },
      { id: 'b2', label: 'Make bed neatly (hotel-style)', completed: false, photoRequired: false },
      { id: 'b3', label: 'Dust nightstands, dressers and lamps', completed: false, photoRequired: false },
      { id: 'b4', label: 'Wipe headboard and mirror', completed: false, photoRequired: false },
      { id: 'b5', label: 'Dust ceiling fan and light fixtures', completed: false, photoRequired: false },
      { id: 'b6', label: 'Clean window sills and dust blinds', completed: false, photoRequired: false },
      { id: 'b7', label: 'Wipe baseboards and door frames', completed: false, photoRequired: false },
      { id: 'b8', label: 'Organize closet hangers and shoes', completed: false, photoRequired: false },
      { id: 'b9', label: 'Vacuum / mop floors and under bed', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'bathroom',
    title: 'Bathroom',
    items: [
      { id: 'ba1', label: 'Scrub and sanitize toilet (including base)', completed: false, photoRequired: false },
      { id: 'ba2', label: 'Clean shower/tub and glass doors', completed: false, photoRequired: false },
      { id: 'ba3', label: 'Descale showerhead and faucets', completed: false, photoRequired: false },
      { id: 'ba4', label: 'Scrub tile grout and shower tracks', completed: false, photoRequired: false },
      { id: 'ba5', label: 'Wipe sink, vanity and underneath', completed: false, photoRequired: false },
      { id: 'ba6', label: 'Clean mirror and medicine cabinet', completed: false, photoRequired: false },
      { id: 'ba7', label: 'Wipe exhaust fan cover', completed: false, photoRequired: false },
      { id: 'ba8', label: 'Replace towels and bath mat', completed: false, photoRequired: true },
      { id: 'ba9', label: 'Refill toiletries (soap, shampoo, conditioner)', completed: false, photoRequired: false },
      { id: 'ba10', label: 'Replace toilet paper roll', completed: false, photoRequired: false },
      { id: 'ba11', label: 'Empty trash and sanitize can', completed: false, photoRequired: false },
      { id: 'ba12', label: 'Mop floor + wipe baseboards', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'outdoor',
    title: 'Outdoor',
    items: [
      { id: 'o1', label: 'Sweep patio / balcony floor', completed: false, photoRequired: false },
      { id: 'o2', label: 'Wipe outdoor furniture and cushions', completed: false, photoRequired: false },
      { id: 'o3', label: 'Check for cigarette butts, leaves and trash', completed: false, photoRequired: false },
      { id: 'o4', label: 'Tidy planters and outdoor decor', completed: false, photoRequired: false },
    ]
  }
];

const AIRBNB_BASE_SECTIONS: ChecklistSection[] = [
  {
    id: 'airbnb-entry',
    title: 'Entry & First Impressions',
    items: [
      { id: 'ae1', label: 'Clean front door and handle', completed: false, photoRequired: false },
      { id: 'ae2', label: 'Sweep/vacuum entryway', completed: false, photoRequired: false },
      { id: 'ae3', label: 'Organize shoe rack/coat hooks', completed: false, photoRequired: false },
      { id: 'ae4', label: 'Check welcome sign/decor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-kitchen',
    title: 'Kitchen',
    items: [
      { id: 'ak1', label: 'Clean all countertops', completed: false, photoRequired: false },
      { id: 'ak2', label: 'Clean stovetop and oven', completed: false, photoRequired: false },
      { id: 'ak3', label: 'Clean microwave inside and out', completed: false, photoRequired: false },
      { id: 'ak4', label: 'Clean refrigerator interior (check for old food)', completed: false, photoRequired: false },
      { id: 'ak5', label: 'Run and empty dishwasher', completed: false, photoRequired: false },
      { id: 'ak6', label: 'Restock coffee/tea supplies', completed: false, photoRequired: true },
      { id: 'ak7', label: 'Check dish soap and sponge', completed: false, photoRequired: false },
      { id: 'ak8', label: 'Clean sink and faucet', completed: false, photoRequired: false },
      { id: 'ak9', label: 'Empty trash and replace bag', completed: false, photoRequired: false },
      { id: 'ak10', label: 'Sweep and mop floor', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'airbnb-living',
    title: 'Living Room',
    items: [
      { id: 'al1', label: 'Dust all surfaces', completed: false, photoRequired: false },
      { id: 'al2', label: 'Vacuum/mop floors', completed: false, photoRequired: false },
      { id: 'al3', label: 'Fluff and arrange pillows/throws', completed: false, photoRequired: false },
      { id: 'al4', label: 'Clean TV screen', completed: false, photoRequired: false },
      { id: 'al5', label: 'Replace remote batteries if needed', completed: false, photoRequired: false },
      { id: 'al6', label: 'Check WiFi info card is visible', completed: false, photoRequired: false },
      { id: 'al7', label: 'Organize books/magazines', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-bedroom',
    title: 'Bedroom(s)',
    items: [
      { id: 'ab1', label: 'Strip and remake bed with fresh linens', completed: false, photoRequired: true },
      { id: 'ab2', label: 'Fluff pillows and arrange decoratively', completed: false, photoRequired: false },
      { id: 'ab3', label: 'Dust all furniture', completed: false, photoRequired: false },
      { id: 'ab4', label: 'Vacuum/mop floors', completed: false, photoRequired: false },
      { id: 'ab5', label: 'Check nightstand drawers (empty)', completed: false, photoRequired: false },
      { id: 'ab6', label: 'Organize closet with hangers', completed: false, photoRequired: false },
      { id: 'ab7', label: 'Check for forgotten items under bed', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-bathroom',
    title: 'Bathroom(s)',
    items: [
      { id: 'aba1', label: 'Scrub and sanitize toilet', completed: false, photoRequired: false },
      { id: 'aba2', label: 'Clean shower/tub thoroughly', completed: false, photoRequired: false },
      { id: 'aba3', label: 'Clean glass doors (no water spots)', completed: false, photoRequired: false },
      { id: 'aba4', label: 'Wipe sink and vanity', completed: false, photoRequired: false },
      { id: 'aba5', label: 'Clean and polish mirror', completed: false, photoRequired: false },
      { id: 'aba6', label: 'Hang fresh towels (hotel fold)', completed: false, photoRequired: true },
      { id: 'aba7', label: 'Refill shampoo/conditioner/body wash', completed: false, photoRequired: true },
      { id: 'aba8', label: 'Refill hand soap', completed: false, photoRequired: false },
      { id: 'aba9', label: 'Replace toilet paper (fold end)', completed: false, photoRequired: false },
      { id: 'aba10', label: 'Empty trash', completed: false, photoRequired: false },
      { id: 'aba11', label: 'Mop floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-amenities',
    title: 'Guest Amenities',
    items: [
      { id: 'am1', label: 'Check hair dryer is working', completed: false, photoRequired: false },
      { id: 'am2', label: 'Verify iron/ironing board available', completed: false, photoRequired: false },
      { id: 'am3', label: 'Check first aid kit', completed: false, photoRequired: false },
      { id: 'am4', label: 'Verify fire extinguisher accessible', completed: false, photoRequired: false },
      { id: 'am5', label: 'Test smoke/CO detectors', completed: false, photoRequired: false },
      { id: 'am6', label: 'Check all lights working', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'airbnb-final',
    title: 'Final Touches',
    items: [
      { id: 'af1', label: 'Set thermostat to default', completed: false, photoRequired: false },
      { id: 'af2', label: 'Close all blinds/curtains uniformly', completed: false, photoRequired: false },
      { id: 'af3', label: 'Turn off all lights except entry', completed: false, photoRequired: false },
      { id: 'af4', label: 'Lock all windows', completed: false, photoRequired: false },
      { id: 'af5', label: 'Take final walkthrough photo', completed: false, photoRequired: true },
    ]
  }
];

const DEEP_CLEAN_BASE_SECTIONS: ChecklistSection[] = [
  {
    id: 'deep-kitchen',
    title: 'Kitchen (Deep Clean)',
    items: [
      { id: 'dk1', label: 'Clean inside oven', completed: false, photoRequired: true },
      { id: 'dk2', label: 'Clean range hood and filter', completed: false, photoRequired: false },
      { id: 'dk3', label: 'Deep clean refrigerator (all shelves)', completed: false, photoRequired: true },
      { id: 'dk4', label: 'Clean inside cabinets', completed: false, photoRequired: false },
      { id: 'dk5', label: 'Degrease backsplash', completed: false, photoRequired: false },
      { id: 'dk6', label: 'Clean dishwasher interior', completed: false, photoRequired: false },
      { id: 'dk7', label: 'Descale faucet and sink', completed: false, photoRequired: false },
      { id: 'dk8', label: 'Clean garbage disposal', completed: false, photoRequired: false },
      { id: 'dk9', label: 'Wipe down all appliances', completed: false, photoRequired: false },
      { id: 'dk10', label: 'Clean light fixtures', completed: false, photoRequired: false },
      { id: 'dk11', label: 'Scrub grout lines', completed: false, photoRequired: false },
      { id: 'dk12', label: 'Move appliances and clean behind', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'deep-bathroom',
    title: 'Bathroom (Deep Clean)',
    items: [
      { id: 'dba1', label: 'Descale showerhead', completed: false, photoRequired: false },
      { id: 'dba2', label: 'Remove and clean shower door tracks', completed: false, photoRequired: false },
      { id: 'dba3', label: 'Clean exhaust fan', completed: false, photoRequired: false },
      { id: 'dba4', label: 'Scrub tile grout', completed: false, photoRequired: true },
      { id: 'dba5', label: 'Clean inside medicine cabinet', completed: false, photoRequired: false },
      { id: 'dba6', label: 'Clean under sink cabinet', completed: false, photoRequired: false },
      { id: 'dba7', label: 'Sanitize toothbrush holder area', completed: false, photoRequired: false },
      { id: 'dba8', label: 'Clean toilet tank interior', completed: false, photoRequired: false },
      { id: 'dba9', label: 'Descale faucets', completed: false, photoRequired: false },
      { id: 'dba10', label: 'Clean light fixtures', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'deep-bedroom',
    title: 'Bedroom (Deep Clean)',
    items: [
      { id: 'dbe1', label: 'Vacuum mattress', completed: false, photoRequired: false },
      { id: 'dbe2', label: 'Flip/rotate mattress', completed: false, photoRequired: false },
      { id: 'dbe3', label: 'Clean under bed thoroughly', completed: false, photoRequired: false },
      { id: 'dbe4', label: 'Dust ceiling fan blades', completed: false, photoRequired: false },
      { id: 'dbe5', label: 'Clean inside closet shelves', completed: false, photoRequired: false },
      { id: 'dbe6', label: 'Wipe baseboards', completed: false, photoRequired: false },
      { id: 'dbe7', label: 'Clean window tracks', completed: false, photoRequired: false },
      { id: 'dbe8', label: 'Dust blinds/curtains', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'deep-living',
    title: 'Living Areas (Deep Clean)',
    items: [
      { id: 'dl1', label: 'Move furniture and vacuum underneath', completed: false, photoRequired: false },
      { id: 'dl2', label: 'Clean upholstery/couch cushions', completed: false, photoRequired: false },
      { id: 'dl3', label: 'Dust ceiling fans and fixtures', completed: false, photoRequired: false },
      { id: 'dl4', label: 'Clean all window interiors', completed: false, photoRequired: true },
      { id: 'dl5', label: 'Wipe all baseboards', completed: false, photoRequired: false },
      { id: 'dl6', label: 'Clean door frames and handles', completed: false, photoRequired: false },
      { id: 'dl7', label: 'Dust crown molding', completed: false, photoRequired: false },
      { id: 'dl8', label: 'Clean vents and registers', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'deep-extras',
    title: 'Extra Deep Clean Tasks',
    items: [
      { id: 'de1', label: 'Clean inside washer/dryer', completed: false, photoRequired: false },
      { id: 'de2', label: 'Clean dryer vent', completed: false, photoRequired: false },
      { id: 'de3', label: 'Clean garage floor', completed: false, photoRequired: false },
      { id: 'de4', label: 'Pressure wash outdoor areas', completed: false, photoRequired: true },
      { id: 'de5', label: 'Clean outdoor furniture thoroughly', completed: false, photoRequired: false },
    ]
  }
];

const MOVE_IN_OUT_BASE_SECTIONS: ChecklistSection[] = [
  {
    id: 'move-kitchen',
    title: 'Kitchen (Move Cleaning)',
    items: [
      { id: 'mk1', label: 'Clean inside all cabinets', completed: false, photoRequired: true },
      { id: 'mk2', label: 'Clean inside drawers', completed: false, photoRequired: false },
      { id: 'mk3', label: 'Deep clean oven interior', completed: false, photoRequired: true },
      { id: 'mk4', label: 'Clean oven racks', completed: false, photoRequired: false },
      { id: 'mk5', label: 'Clean refrigerator interior completely', completed: false, photoRequired: true },
      { id: 'mk6', label: 'Clean freezer interior', completed: false, photoRequired: false },
      { id: 'mk7', label: 'Clean dishwasher interior', completed: false, photoRequired: false },
      { id: 'mk8', label: 'Clean range hood and filter', completed: false, photoRequired: false },
      { id: 'mk9', label: 'Degrease all surfaces', completed: false, photoRequired: false },
      { id: 'mk10', label: 'Clean countertops and backsplash', completed: false, photoRequired: false },
      { id: 'mk11', label: 'Clean sink and garbage disposal', completed: false, photoRequired: false },
      { id: 'mk12', label: 'Clean and polish faucets', completed: false, photoRequired: false },
      { id: 'mk13', label: 'Clean light fixtures', completed: false, photoRequired: false },
      { id: 'mk14', label: 'Scrub floors thoroughly', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'move-bathroom',
    title: 'Bathroom (Move Cleaning)',
    items: [
      { id: 'mba1', label: 'Clean inside medicine cabinet', completed: false, photoRequired: false },
      { id: 'mba2', label: 'Clean inside vanity cabinets', completed: false, photoRequired: false },
      { id: 'mba3', label: 'Deep clean toilet (including behind)', completed: false, photoRequired: false },
      { id: 'mba4', label: 'Scrub tub/shower thoroughly', completed: false, photoRequired: true },
      { id: 'mba5', label: 'Clean shower door tracks', completed: false, photoRequired: false },
      { id: 'mba6', label: 'Descale all fixtures', completed: false, photoRequired: false },
      { id: 'mba7', label: 'Clean exhaust fan', completed: false, photoRequired: false },
      { id: 'mba8', label: 'Scrub tile grout', completed: false, photoRequired: false },
      { id: 'mba9', label: 'Clean mirror thoroughly', completed: false, photoRequired: false },
      { id: 'mba10', label: 'Scrub and mop floor', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'move-bedroom',
    title: 'Bedrooms (Move Cleaning)',
    items: [
      { id: 'mbe1', label: 'Clean inside all closets', completed: false, photoRequired: true },
      { id: 'mbe2', label: 'Clean closet shelves and rods', completed: false, photoRequired: false },
      { id: 'mbe3', label: 'Clean window sills and tracks', completed: false, photoRequired: false },
      { id: 'mbe4', label: 'Wipe all baseboards', completed: false, photoRequired: false },
      { id: 'mbe5', label: 'Clean ceiling fan', completed: false, photoRequired: false },
      { id: 'mbe6', label: 'Clean light fixtures', completed: false, photoRequired: false },
      { id: 'mbe7', label: 'Clean door and door frame', completed: false, photoRequired: false },
      { id: 'mbe8', label: 'Vacuum/mop floors thoroughly', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'move-living',
    title: 'Living Areas (Move Cleaning)',
    items: [
      { id: 'ml1', label: 'Clean all windows interior', completed: false, photoRequired: false },
      { id: 'ml2', label: 'Clean window blinds/shades', completed: false, photoRequired: false },
      { id: 'ml3', label: 'Clean all baseboards', completed: false, photoRequired: false },
      { id: 'ml4', label: 'Clean vents and registers', completed: false, photoRequired: false },
      { id: 'ml5', label: 'Clean all door handles', completed: false, photoRequired: false },
      { id: 'ml6', label: 'Clean light switches and outlets', completed: false, photoRequired: false },
      { id: 'ml7', label: 'Clean ceiling fans', completed: false, photoRequired: false },
      { id: 'ml8', label: 'Clean fireplace (if applicable)', completed: false, photoRequired: false },
      { id: 'ml9', label: 'Vacuum/mop all floors', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'move-other',
    title: 'Other Areas',
    items: [
      { id: 'mo1', label: 'Clean laundry area', completed: false, photoRequired: false },
      { id: 'mo2', label: 'Clean inside washer/dryer', completed: false, photoRequired: false },
      { id: 'mo3', label: 'Clean garage floor (if applicable)', completed: false, photoRequired: false },
      { id: 'mo4', label: 'Clean patio/balcony', completed: false, photoRequired: false },
      { id: 'mo5', label: 'Clean front door inside and out', completed: false, photoRequired: false },
      { id: 'mo6', label: 'Final walkthrough inspection', completed: false, photoRequired: true },
    ]
  }
];

const RECURRING_BASE_SECTIONS: ChecklistSection[] = [
  {
    id: 'rec-kitchen',
    title: 'Kitchen',
    items: [
      { id: 'rk1', label: 'Wipe countertops', completed: false, photoRequired: false },
      { id: 'rk2', label: 'Clean stovetop', completed: false, photoRequired: false },
      { id: 'rk3', label: 'Wipe microwave exterior', completed: false, photoRequired: false },
      { id: 'rk4', label: 'Clean sink', completed: false, photoRequired: false },
      { id: 'rk5', label: 'Empty and replace trash', completed: false, photoRequired: false },
      { id: 'rk6', label: 'Wipe appliance exteriors', completed: false, photoRequired: false },
      { id: 'rk7', label: 'Sweep and mop floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'rec-bathroom',
    title: 'Bathroom(s)',
    items: [
      { id: 'rba1', label: 'Clean and sanitize toilet', completed: false, photoRequired: false },
      { id: 'rba2', label: 'Clean shower/tub', completed: false, photoRequired: false },
      { id: 'rba3', label: 'Clean sink and vanity', completed: false, photoRequired: false },
      { id: 'rba4', label: 'Clean mirror', completed: false, photoRequired: false },
      { id: 'rba5', label: 'Empty trash', completed: false, photoRequired: false },
      { id: 'rba6', label: 'Mop floor', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'rec-bedroom',
    title: 'Bedroom(s)',
    items: [
      { id: 'rbe1', label: 'Make beds', completed: false, photoRequired: false },
      { id: 'rbe2', label: 'Dust surfaces', completed: false, photoRequired: false },
      { id: 'rbe3', label: 'Vacuum/mop floors', completed: false, photoRequired: false },
      { id: 'rbe4', label: 'Empty trash', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'rec-living',
    title: 'Living Areas',
    items: [
      { id: 'rl1', label: 'Dust all surfaces', completed: false, photoRequired: false },
      { id: 'rl2', label: 'Vacuum carpets/rugs', completed: false, photoRequired: false },
      { id: 'rl3', label: 'Mop hard floors', completed: false, photoRequired: false },
      { id: 'rl4', label: 'Tidy up general clutter', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'rec-general',
    title: 'General Tasks',
    items: [
      { id: 'rg1', label: 'Empty all trash cans', completed: false, photoRequired: false },
      { id: 'rg2', label: 'Spot clean mirrors/glass', completed: false, photoRequired: false },
      { id: 'rg3', label: 'Wipe light switches/door handles', completed: false, photoRequired: false },
    ]
  }
];

const POST_CONSTRUCTION_BASE_SECTIONS: ChecklistSection[] = [
  {
    id: 'pc-dust',
    title: 'Dust & Debris Removal',
    items: [
      { id: 'pd1', label: 'Remove all construction debris', completed: false, photoRequired: true },
      { id: 'pd2', label: 'Vacuum all surfaces (walls, ceilings)', completed: false, photoRequired: false },
      { id: 'pd3', label: 'Wipe down all walls', completed: false, photoRequired: false },
      { id: 'pd4', label: 'Clean all vents and registers', completed: false, photoRequired: false },
      { id: 'pd5', label: 'Dust light fixtures and ceiling fans', completed: false, photoRequired: false },
      { id: 'pd6', label: 'Clean HVAC vents thoroughly', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'pc-windows',
    title: 'Windows & Glass',
    items: [
      { id: 'pw1', label: 'Remove stickers/labels from windows', completed: false, photoRequired: false },
      { id: 'pw2', label: 'Clean all windows inside and out', completed: false, photoRequired: true },
      { id: 'pw3', label: 'Clean window tracks and frames', completed: false, photoRequired: false },
      { id: 'pw4', label: 'Clean all glass doors', completed: false, photoRequired: false },
      { id: 'pw5', label: 'Clean all mirrors', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'pc-kitchen',
    title: 'Kitchen',
    items: [
      { id: 'pk1', label: 'Remove protective film from appliances', completed: false, photoRequired: false },
      { id: 'pk2', label: 'Clean inside all cabinets', completed: false, photoRequired: true },
      { id: 'pk3', label: 'Clean inside all drawers', completed: false, photoRequired: false },
      { id: 'pk4', label: 'Clean all appliances inside and out', completed: false, photoRequired: false },
      { id: 'pk5', label: 'Clean countertops thoroughly', completed: false, photoRequired: false },
      { id: 'pk6', label: 'Clean sink and faucets', completed: false, photoRequired: false },
      { id: 'pk7', label: 'Scrub and seal grout lines', completed: false, photoRequired: false },
      { id: 'pk8', label: 'Clean floors (remove any adhesive)', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'pc-bathroom',
    title: 'Bathrooms',
    items: [
      { id: 'pba1', label: 'Remove protective film/stickers', completed: false, photoRequired: false },
      { id: 'pba2', label: 'Clean inside vanity cabinets', completed: false, photoRequired: false },
      { id: 'pba3', label: 'Clean toilet thoroughly', completed: false, photoRequired: false },
      { id: 'pba4', label: 'Clean tub/shower (remove grout residue)', completed: false, photoRequired: true },
      { id: 'pba5', label: 'Clean glass shower doors', completed: false, photoRequired: false },
      { id: 'pba6', label: 'Clean all fixtures', completed: false, photoRequired: false },
      { id: 'pba7', label: 'Scrub tile and grout', completed: false, photoRequired: false },
      { id: 'pba8', label: 'Clean exhaust fan', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'pc-floors',
    title: 'Floors & Surfaces',
    items: [
      { id: 'pf1', label: 'Remove paint drips from floors', completed: false, photoRequired: false },
      { id: 'pf2', label: 'Remove adhesive residue', completed: false, photoRequired: false },
      { id: 'pf3', label: 'Clean all baseboards', completed: false, photoRequired: false },
      { id: 'pf4', label: 'Vacuum all floors', completed: false, photoRequired: false },
      { id: 'pf5', label: 'Mop all hard floors', completed: false, photoRequired: true },
      { id: 'pf6', label: 'Clean stairs and railings', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'pc-final',
    title: 'Final Inspection',
    items: [
      { id: 'pfi1', label: 'Check for any remaining debris', completed: false, photoRequired: false },
      { id: 'pfi2', label: 'Verify all surfaces dust-free', completed: false, photoRequired: false },
      { id: 'pfi3', label: 'Final quality inspection', completed: false, photoRequired: true },
      { id: 'pfi4', label: 'Take completion photos', completed: false, photoRequired: true },
    ]
  }
];

const COMMERCIAL_BASE_SECTIONS: ChecklistSection[] = [
  {
    id: 'comm-lobby',
    title: 'Lobby & Reception',
    items: [
      { id: 'cl1', label: 'Clean entrance doors and glass', completed: false, photoRequired: false },
      { id: 'cl2', label: 'Vacuum/mop lobby floor', completed: false, photoRequired: false },
      { id: 'cl3', label: 'Clean reception desk', completed: false, photoRequired: false },
      { id: 'cl4', label: 'Dust waiting area furniture', completed: false, photoRequired: false },
      { id: 'cl5', label: 'Water plants (if applicable)', completed: false, photoRequired: false },
      { id: 'cl6', label: 'Empty trash cans', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'comm-office',
    title: 'Office Areas',
    items: [
      { id: 'co1', label: 'Dust all desks and workstations', completed: false, photoRequired: false },
      { id: 'co2', label: 'Clean computer screens and keyboards', completed: false, photoRequired: false },
      { id: 'co3', label: 'Empty all desk trash cans', completed: false, photoRequired: false },
      { id: 'co4', label: 'Vacuum office floors', completed: false, photoRequired: false },
      { id: 'co5', label: 'Clean conference room tables', completed: false, photoRequired: false },
      { id: 'co6', label: 'Clean whiteboards', completed: false, photoRequired: false },
      { id: 'co7', label: 'Dust window sills', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'comm-break',
    title: 'Break Room / Kitchen',
    items: [
      { id: 'cb1', label: 'Clean countertops', completed: false, photoRequired: false },
      { id: 'cb2', label: 'Clean microwave inside and out', completed: false, photoRequired: false },
      { id: 'cb3', label: 'Clean coffee maker', completed: false, photoRequired: false },
      { id: 'cb4', label: 'Clean refrigerator exterior', completed: false, photoRequired: false },
      { id: 'cb5', label: 'Load/unload dishwasher', completed: false, photoRequired: false },
      { id: 'cb6', label: 'Clean sink', completed: false, photoRequired: false },
      { id: 'cb7', label: 'Clean tables and chairs', completed: false, photoRequired: false },
      { id: 'cb8', label: 'Empty trash and recycling', completed: false, photoRequired: false },
      { id: 'cb9', label: 'Sweep and mop floor', completed: false, photoRequired: true },
    ]
  },
  {
    id: 'comm-restroom',
    title: 'Restrooms',
    items: [
      { id: 'cr1', label: 'Clean and sanitize all toilets', completed: false, photoRequired: false },
      { id: 'cr2', label: 'Clean urinals (if applicable)', completed: false, photoRequired: false },
      { id: 'cr3', label: 'Clean all sinks', completed: false, photoRequired: false },
      { id: 'cr4', label: 'Clean mirrors', completed: false, photoRequired: false },
      { id: 'cr5', label: 'Refill soap dispensers', completed: false, photoRequired: true },
      { id: 'cr6', label: 'Refill paper towels', completed: false, photoRequired: true },
      { id: 'cr7', label: 'Refill toilet paper', completed: false, photoRequired: false },
      { id: 'cr8', label: 'Empty trash and sanitary bins', completed: false, photoRequired: false },
      { id: 'cr9', label: 'Mop floors', completed: false, photoRequired: false },
      { id: 'cr10', label: 'Check air fresheners', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'comm-common',
    title: 'Common Areas',
    items: [
      { id: 'cc1', label: 'Vacuum/mop hallways', completed: false, photoRequired: false },
      { id: 'cc2', label: 'Clean elevator interior (if applicable)', completed: false, photoRequired: false },
      { id: 'cc3', label: 'Dust handrails', completed: false, photoRequired: false },
      { id: 'cc4', label: 'Clean stairwells', completed: false, photoRequired: false },
      { id: 'cc5', label: 'Empty all common area trash', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'comm-final',
    title: 'Final Tasks',
    items: [
      { id: 'cf1', label: 'Lock all doors', completed: false, photoRequired: false },
      { id: 'cf2', label: 'Turn off lights in empty areas', completed: false, photoRequired: false },
      { id: 'cf3', label: 'Set alarm (if applicable)', completed: false, photoRequired: false },
      { id: 'cf4', label: 'Complete cleaning log', completed: false, photoRequired: false },
    ]
  }
];

/**
 * Final exported templates: each one starts with the base sections specific to
 * the service type AND every possible extra area (laundry, pool, sauna, gym,
 * etc.). Cleaners delete sections that don't apply during execution.
 */
export const STANDARD_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  ...STANDARD_BASE_SECTIONS,
  ...buildExtraAreaSections('std-extra'),
];

export const AIRBNB_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  ...AIRBNB_BASE_SECTIONS,
  ...buildExtraAreaSections('abnb-extra'),
];

export const DEEP_CLEAN_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  ...DEEP_CLEAN_BASE_SECTIONS,
  ...buildExtraAreaSections('deep-extra'),
];

export const MOVE_IN_OUT_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  ...MOVE_IN_OUT_BASE_SECTIONS,
  ...buildExtraAreaSections('move-extra'),
];

export const RECURRING_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  ...RECURRING_BASE_SECTIONS,
  ...buildExtraAreaSections('rec-extra'),
];

export const POST_CONSTRUCTION_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  ...POST_CONSTRUCTION_BASE_SECTIONS,
  ...buildExtraAreaSections('pc-extra'),
];

export const COMMERCIAL_CHECKLIST_TEMPLATE: ChecklistSection[] = [
  ...COMMERCIAL_BASE_SECTIONS,
  ...buildExtraAreaSections('comm-extra'),
];

export const GUEST_SUPPLIES_3_4BR_TEMPLATE: ChecklistSection[] = [
  {
    id: 'gs34-bath',
    title: 'Bathrooms Supplies',
    items: [
      { id: 'gs34-b1', label: '3 rolls of toilet paper per bathroom (partial + 3 full). Do not remove partial roll', completed: false, photoRequired: false },
      { id: 'gs34-b2', label: '1 trash bag for each bathroom can (+ leave extra)', completed: false, photoRequired: false },
      { id: 'gs34-b3', label: 'Refill shampoo, conditioner, body wash and hand soap dispensers (at least half filled)', completed: false, photoRequired: true },
      { id: 'gs34-b4', label: '1 bottle of hand soap per sink (at least half full)', completed: false, photoRequired: false },
      { id: 'gs34-b5', label: '1-2 bath rugs for guest bathrooms (depending on shower/tub)', completed: false, photoRequired: false },
      { id: 'gs34-b6', label: 'Q-Tips for each bathroom', completed: false, photoRequired: false },
      { id: 'gs34-b7', label: 'Toilet brush in each bathroom', completed: false, photoRequired: false },
      { id: 'gs34-b8', label: 'Plunger in each bathroom', completed: false, photoRequired: false },
      { id: 'gs34-b9', label: 'Wash shower curtain and shower liner routinely', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs34-kitchen',
    title: 'Kitchen Supplies',
    items: [
      { id: 'gs34-k1', label: '2 rolls of paper towels (+ partial roll)', completed: false, photoRequired: false },
      { id: 'gs34-k2', label: '1 roll of trash bags under the sink (at least ½ full)', completed: false, photoRequired: false },
      { id: 'gs34-k3', label: '1 bottle multi-purpose cleaning solution under the sink (at least ½ full)', completed: false, photoRequired: false },
      { id: 'gs34-k4', label: '1 bottle of dish soap to hand wash dishes', completed: false, photoRequired: false },
      { id: 'gs34-k5', label: '1 bottle of hand soap (at least half full)', completed: false, photoRequired: false },
      { id: 'gs34-k6', label: '1 bottle of dishwasher detergent (1 full + partial)', completed: false, photoRequired: false },
      { id: 'gs34-k7', label: '1 NEW dishwashing sponge', completed: false, photoRequired: false },
      { id: 'gs34-k8', label: '4 kitchen towels (no less than four!)', completed: false, photoRequired: true },
      { id: 'gs34-k9', label: 'Coffee grounds (at least ½ full) and sugar (at least ½ full)', completed: false, photoRequired: false },
      { id: 'gs34-k10', label: 'Coffee filter', completed: false, photoRequired: false },
      { id: 'gs34-k11', label: 'Salt and black pepper (at least ½ full)', completed: false, photoRequired: false },
      { id: 'gs34-k12', label: 'Pack of min 10 AA and 10 AAA batteries (on top of fridge or microwave)', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs34-kitchen-notes',
    title: 'Kitchen Notes',
    items: [
      { id: 'gs34-kn1', label: '1 highchair — always keep in the kitchen', completed: false, photoRequired: false },
      { id: 'gs34-kn2', label: 'Condiments: if previous guests left unopened, leave for future guests', completed: false, photoRequired: false },
      { id: 'gs34-kn3', label: 'Drinks: can take alcoholic drinks home, but NOT soft drinks and water', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs34-laundry',
    title: 'Laundry Room Supplies',
    items: [
      { id: 'gs34-l1', label: '1 bottle of laundry detergent (1 full + partial)', completed: false, photoRequired: false },
      { id: 'gs34-l2', label: 'Mop, broom, vacuum cleaner and dust pan (preferably in guest closet)', completed: false, photoRequired: false },
      { id: 'gs34-l3', label: '4-6 laundry baskets (kept in laundry room)', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs34-bedrooms',
    title: 'Bedrooms — Pillows & Towels',
    items: [
      { id: 'gs34-bed1', label: '4 pillows for each King/Queen bed', completed: false, photoRequired: false },
      { id: 'gs34-bed2', label: '2-3 pillows for each Full bed', completed: false, photoRequired: false },
      { id: 'gs34-bed3', label: '1-2 pillows for each Twin bed', completed: false, photoRequired: false },
      { id: 'gs34-bed4', label: 'KING beds: 4 bath towels, 2 hand towels, 2 washcloths', completed: false, photoRequired: false },
      { id: 'gs34-bed5', label: 'QUEEN beds: 3 bath towels, 2 hand towels, 2 washcloths', completed: false, photoRequired: false },
      { id: 'gs34-bed6', label: 'FULL beds: 2 bath towels, 2 hand towels, 2 washcloths', completed: false, photoRequired: false },
      { id: 'gs34-bed7', label: 'TWIN beds: 1 bath towel, 1 hand towel, 1 washcloth', completed: false, photoRequired: false },
      { id: 'gs34-bed8', label: 'Leave extra 2-3 blankets for guests', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs34-bed-notes',
    title: 'Bedrooms Notes',
    items: [
      { id: 'gs34-bn1', label: '2 Pack n play (in master or guest closet)', completed: false, photoRequired: false },
      { id: 'gs34-bn2', label: 'TV Remote on nightstand, console, coffee table or wall mount', completed: false, photoRequired: false },
      { id: 'gs34-bn3', label: 'Lock garage and owner closet doors. Turn off their lights', completed: false, photoRequired: false },
      { id: 'gs34-bn4', label: 'Keep curtains open after each clean', completed: false, photoRequired: false },
      { id: 'gs34-bn5', label: 'Extra sheets/blankets/quilts kept in owner garage or closet (not for guests)', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs34-beach',
    title: 'Beach Supplies',
    items: [
      { id: 'gs34-bs1', label: '4-6 beach chairs', completed: false, photoRequired: false },
      { id: 'gs34-bs2', label: '10 beach towels for 3BR / 12 for 4BR (in basket or on shelves)', completed: false, photoRequired: false },
      { id: 'gs34-bs3', label: '2-3 beach umbrellas', completed: false, photoRequired: false },
      { id: 'gs34-bs4', label: '1 wagon', completed: false, photoRequired: false },
      { id: 'gs34-bs5', label: '1 beach mat', completed: false, photoRequired: false },
      { id: 'gs34-bs6', label: '1 beach cooler', completed: false, photoRequired: false },
    ]
  },
];

export const GUEST_SUPPLIES_5_6BR_TEMPLATE: ChecklistSection[] = [
  {
    id: 'gs56-bath',
    title: 'Bathrooms Supplies',
    items: [
      { id: 'gs56-b1', label: '3 rolls of toilet paper per bathroom (partial + 3 full). Do not remove partial roll', completed: false, photoRequired: false },
      { id: 'gs56-b2', label: '1 trash bag for each bathroom can (+ leave extra)', completed: false, photoRequired: false },
      { id: 'gs56-b3', label: 'Refill shampoo, conditioner, body wash and hand soap dispensers (at least half filled)', completed: false, photoRequired: true },
      { id: 'gs56-b4', label: '1 bottle of hand soap per sink (at least half full)', completed: false, photoRequired: false },
      { id: 'gs56-b5', label: '1-2 bath rugs for guest bathrooms (depending on shower/tub)', completed: false, photoRequired: false },
      { id: 'gs56-b6', label: 'Q-Tips for each bathroom', completed: false, photoRequired: false },
      { id: 'gs56-b7', label: 'Toilet brush for each bathroom', completed: false, photoRequired: false },
      { id: 'gs56-b8', label: 'Plunger for each bathroom', completed: false, photoRequired: false },
      { id: 'gs56-b9', label: 'Wash shower curtain and shower liner routinely', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs56-kitchen',
    title: 'Kitchen Supplies',
    items: [
      { id: 'gs56-k1', label: '3 rolls of paper towels (+ partial roll)', completed: false, photoRequired: false },
      { id: 'gs56-k2', label: '1 roll of trash bags under the sink (at least ½ full)', completed: false, photoRequired: false },
      { id: 'gs56-k3', label: '1 bottle multi-purpose cleaning solution under the sink (at least ½ full)', completed: false, photoRequired: false },
      { id: 'gs56-k4', label: '1 bottle of dish soap to hand wash dishes', completed: false, photoRequired: false },
      { id: 'gs56-k5', label: '1 bottle of hand soap (at least half full)', completed: false, photoRequired: false },
      { id: 'gs56-k6', label: '1 bottle of dishwasher detergent (1 full + partial)', completed: false, photoRequired: false },
      { id: 'gs56-k7', label: '1 NEW dishwashing sponge', completed: false, photoRequired: false },
      { id: 'gs56-k8', label: '4 kitchen towels (no less than four!)', completed: false, photoRequired: true },
      { id: 'gs56-k9', label: '1 can of ground coffee (at least ½ full) and sugar (at least ½ full)', completed: false, photoRequired: false },
      { id: 'gs56-k10', label: 'Coffee filter', completed: false, photoRequired: false },
      { id: 'gs56-k11', label: 'Salt and black pepper (at least ½ full)', completed: false, photoRequired: false },
      { id: 'gs56-k12', label: 'Pack of min 10 AA and 10 AAA batteries (on top of fridge or microwave)', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs56-kitchen-notes',
    title: 'Kitchen Notes',
    items: [
      { id: 'gs56-kn1', label: '1 highchair — always keep in the dining area', completed: false, photoRequired: false },
      { id: 'gs56-kn2', label: 'Condiments: if previous guests left unopened, leave for future guests', completed: false, photoRequired: false },
      { id: 'gs56-kn3', label: 'Drinks: can take alcoholic drinks home, but NOT soft drinks and water', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs56-laundry',
    title: 'Laundry Room Supplies',
    items: [
      { id: 'gs56-l1', label: '1 bottle of laundry detergent (1 full + partial)', completed: false, photoRequired: false },
      { id: 'gs56-l2', label: 'Mop, broom, vacuum cleaner and dust pan (preferably in guest closet)', completed: false, photoRequired: false },
      { id: 'gs56-l3', label: '4-6 laundry baskets (kept in laundry room)', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs56-bedrooms',
    title: 'Bedrooms — Pillows & Towels',
    items: [
      { id: 'gs56-bed1', label: '4 pillows for each King/Queen bed', completed: false, photoRequired: false },
      { id: 'gs56-bed2', label: '2-3 pillows for each Full bed', completed: false, photoRequired: false },
      { id: 'gs56-bed3', label: '1-2 pillows for each Twin bed', completed: false, photoRequired: false },
      { id: 'gs56-bed4', label: 'KING beds: 4 bath towels, 2 hand towels, 2 washcloths', completed: false, photoRequired: false },
      { id: 'gs56-bed5', label: 'QUEEN beds: 3 bath towels, 2 hand towels, 2 washcloths', completed: false, photoRequired: false },
      { id: 'gs56-bed6', label: 'FULL beds: 2 bath towels, 2 hand towels, 2 washcloths', completed: false, photoRequired: false },
      { id: 'gs56-bed7', label: 'TWIN beds: 1 bath towel, 1 hand towel, 1 washcloth', completed: false, photoRequired: false },
      { id: 'gs56-bed8', label: 'Leave extra 2-3 blankets for guests', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs56-bed-notes',
    title: 'Bedrooms Notes',
    items: [
      { id: 'gs56-bn1', label: '2 Pack n play (in master or guest closet)', completed: false, photoRequired: false },
      { id: 'gs56-bn2', label: 'TV Remote on nightstand, console, coffee table or wall mount', completed: false, photoRequired: false },
      { id: 'gs56-bn3', label: 'Lock garage and owner closet doors. Turn off their lights', completed: false, photoRequired: false },
      { id: 'gs56-bn4', label: 'Keep curtains open after each clean', completed: false, photoRequired: false },
      { id: 'gs56-bn5', label: 'Extra sheets/blankets/quilts kept in owner garage or closet (not for guests)', completed: false, photoRequired: false },
    ]
  },
  {
    id: 'gs56-beach',
    title: 'Beach Supplies',
    items: [
      { id: 'gs56-bs1', label: '4-6 beach chairs', completed: false, photoRequired: false },
      { id: 'gs56-bs2', label: '14 beach towels for 5BR / 16 for 6BR (in basket or on shelves)', completed: false, photoRequired: false },
      { id: 'gs56-bs3', label: '2-3 beach umbrellas', completed: false, photoRequired: false },
      { id: 'gs56-bs4', label: '1 wagon', completed: false, photoRequired: false },
      { id: 'gs56-bs5', label: '1 beach cooler', completed: false, photoRequired: false },
    ]
  },
];

export type ChecklistPresetKey = 
  | 'standard' 
  | 'airbnb' 
  | 'deep_clean' 
  | 'move_in_out' 
  | 'recurring' 
  | 'post_construction' 
  | 'commercial'
  | 'guest_supplies_3_4br'
  | 'guest_supplies_5_6br';

export const CHECKLIST_PRESETS: Record<ChecklistPresetKey, {
  labelKey: string;
  template: ChecklistSection[];
}> = {
  standard: {
    labelKey: 'checklist.preset.standard',
    template: STANDARD_CHECKLIST_TEMPLATE,
  },
  airbnb: {
    labelKey: 'checklist.preset.airbnb',
    template: AIRBNB_CHECKLIST_TEMPLATE,
  },
  deep_clean: {
    labelKey: 'checklist.preset.deepClean',
    template: DEEP_CLEAN_CHECKLIST_TEMPLATE,
  },
  move_in_out: {
    labelKey: 'checklist.preset.moveInOut',
    template: MOVE_IN_OUT_CHECKLIST_TEMPLATE,
  },
  recurring: {
    labelKey: 'checklist.preset.recurring',
    template: RECURRING_CHECKLIST_TEMPLATE,
  },
  post_construction: {
    labelKey: 'checklist.preset.postConstruction',
    template: POST_CONSTRUCTION_CHECKLIST_TEMPLATE,
  },
  commercial: {
    labelKey: 'checklist.preset.commercial',
    template: COMMERCIAL_CHECKLIST_TEMPLATE,
  },
  guest_supplies_3_4br: {
    labelKey: 'checklist.preset.guestSupplies3_4br',
    template: GUEST_SUPPLIES_3_4BR_TEMPLATE,
  },
  guest_supplies_5_6br: {
    labelKey: 'checklist.preset.guestSupplies5_6br',
    template: GUEST_SUPPLIES_5_6BR_TEMPLATE,
  },
};
