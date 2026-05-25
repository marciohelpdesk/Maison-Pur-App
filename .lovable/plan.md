# Redesign da página Suprimentos & Inventário

Hoje a tela `/supplies` mostra todas as propriedades empilhadas na lateral e o inventário aparece como uma lista plana, sem agrupamento. Vou reorganizar a página em duas camadas claras: **seleção de propriedade** → **inventário por ambiente**, com sugestões prontas para acelerar o cadastro.

## 1. Topo: seletor de propriedade (uma por vez)

Substituir a sidebar fixa por um **seletor compacto no topo**:

- Card horizontal com foto da propriedade selecionada, nome, endereço e badge de "Low stock".
- Botão "Trocar propriedade" abre um `Sheet` com busca + lista de propriedades (foto, nome, endereço, contagem de itens). Só uma fica ativa de cada vez.
- Persiste a última escolha em `localStorage` (`supplies:lastPropertyId`) para abrir direto.

## 2. Abas mantidas, mas Inventário reorganizado por área

Mantém `Inventory · Request · History`. O conteúdo da aba **Inventory** muda:

### Agrupamento por ambiente
Itens agrupados em seções colapsáveis por `category`, na ordem fixa:
**Kitchen · Bathroom · Bedroom · Laundry · Cleaning · General**

Cada seção mostra:
- Cabeçalho com ícone (lucide: `ChefHat`, `Bath`, `Bed`, `WashingMachine`, `Spray`, `Package`), nome do ambiente, contagem `X items · Y low`.
- Linhas compactas como já existem (foto, nome, qty − / + , editar, excluir), com badge LOW.
- Seções vazias ficam colapsadas com botão "+ Add to Kitchen" inline.

### Biblioteca de itens pré-preenchidos (Quick add)

Acima da lista, um bloco "Suggested items" com chips clicáveis por ambiente. Um toque adiciona o item com `quantity` padrão sugerida e `threshold` padrão — sem abrir formulário. Itens já presentes no inventário ficam marcados (✓) e não duplicam (incrementam quantidade).

Presets propostos (em `src/data/supplyPresets.ts`):

- **Kitchen**: Dish soap, Sponges, Trash bags, Paper towels, Coffee filters, Dishwasher pods, Salt, Pepper, Olive oil, Sugar
- **Bathroom**: Toilet paper, Hand soap, Shampoo, Conditioner, Body wash, Bath towels, Hand towels, Toilet brush, Cotton swabs
- **Bedroom**: Bed sheets (Queen), Bed sheets (King), Pillowcases, Mattress protector, Extra blankets, Hangers
- **Laundry**: Laundry detergent, Fabric softener, Bleach, Dryer sheets, Stain remover
- **Cleaning**: All-purpose cleaner, Glass cleaner, Disinfectant wipes, Microfiber cloths, Vacuum bags, Mop refills, Rubber gloves
- **General**: Light bulbs, Batteries (AA), Batteries (AAA), Welcome cards, Pens

Cada preset traz `name`, `category`, `unit`, `defaultQuantity`, `defaultThreshold`.

### Botão "+ Add custom item"
Permanece visível no topo da aba e no rodapé de cada ambiente, abrindo o `AddInventoryItemSheet` já existente (com `category` pré-selecionada quando aberto a partir da seção).

## 3. Sem mudanças nas abas Request / History
Continuam como estão; apenas herdam o item agrupado por categoria visualmente quando renderizar a lista de seleção.

## 4. Mobile
- Seletor de propriedade vira card de largura total.
- Chips de suggested items ficam em `flex-wrap` com scroll horizontal opcional.
- Seções colapsáveis (`<details>` estilizado) para evitar rolagem longa.

## Arquivos afetados

- `src/views/SuppliesView.tsx` — remove sidebar; adiciona card seletor + `Sheet` de troca de propriedade; persiste `localStorage`.
- `src/components/supplies/PropertySuppliesPanel.tsx` — reescrita da aba Inventory: agrupamento por categoria + bloco de Suggested items + add com categoria pré-selecionada.
- `src/components/supplies/AddInventoryItemSheet.tsx` — aceita prop opcional `defaultCategory`.
- `src/data/supplyPresets.ts` *(novo)* — lista dos presets por ambiente.

## Fora do escopo

- Sem mudanças em RLS, tabelas, hooks (`useInventory`, `useSupplyRequests`) ou rotas.
- Sem mudanças no fluxo público `/supplies/:token`.
- Sem mudanças em branding/cores além dos tokens já existentes.
