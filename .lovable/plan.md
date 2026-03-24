

## Plano: Adicionar Checklists de Suprimentos para Hóspedes

### O que será feito
Adicionar duas novas seções de checklist "Guest Supplies" ao sistema — uma para casas de 3-4 quartos e outra para 5-6 quartos. Cada item da lista será um item verificável durante a execução do job.

### Mudanças

#### 1. `src/data/checklist.ts` — Novos templates de suprimentos

Criar dois novos templates exportados:

**`GUEST_SUPPLIES_3_4BR_TEMPLATE`** com seções:
- **Bathrooms Supplies** (9 itens): 3 rolls TP per bathroom, trash bags, refill dispensers, hand soap, bath rugs, Q-tips, toilet brush, plunger, wash shower curtain
- **Kitchen Supplies** (12 itens): 2 rolls paper towels, trash bags, cleaning solution, dish soap, hand soap, dishwasher detergent, new sponge, 4 kitchen towels, coffee/sugar, coffee filter, salt/pepper, batteries
- **Kitchen Notes** (3 itens): highchair in kitchen, condiments check, check drinks
- **Laundry Room Supplies** (3 itens): laundry detergent, mop/broom/vacuum/dustpan, 4-6 laundry baskets
- **Bedrooms - Pillows & Towels** (7 itens): pillow counts per bed size, towel counts per bed size, extra blankets
- **Bedrooms Notes** (4 itens): pack n plays, TV remotes, lock garage/owner closet, keep curtains open
- **Beach Supplies** (7 itens): 4-6 chairs, 10 beach towels (3BR)/12 (4BR), 2-3 umbrellas, wagon, beach mat, cooler

**`GUEST_SUPPLIES_5_6BR_TEMPLATE`** — Mesmo formato, com diferenças:
- Kitchen: 3 rolls paper towels, highchair in dining area
- Beach: 14 towels (5BR)/16 (6BR), sem beach mat

#### 2. `src/data/checklist.ts` — Registrar nos presets

Adicionar ao `CHECKLIST_PRESETS`:
- `guest_supplies_3_4br` → "Guest Supplies (3-4 BR)"
- `guest_supplies_5_6br` → "Guest Supplies (5-6 BR)"

Atualizar o tipo `ChecklistPresetKey` para incluir as novas chaves.

#### 3. `src/contexts/LanguageContext.tsx` — Traduções

Adicionar chaves de tradução:
- `checklist.preset.guestSupplies3_4br` → "Guest Supplies (3-4 BR)" / "Suprimentos (3-4 Quartos)"
- `checklist.preset.guestSupplies5_6br` → "Guest Supplies (5-6 BR)" / "Suprimentos (5-6 Quartos)"

### Resultado
Os novos templates aparecerão na seção "Checklist Base" do Dashboard e poderão ser selecionados ao criar jobs ou configurar templates de propriedades, permitindo verificar cada item de suprimento durante a execução da limpeza.

### Arquivos a modificar
- `src/data/checklist.ts`
- `src/contexts/LanguageContext.tsx`

