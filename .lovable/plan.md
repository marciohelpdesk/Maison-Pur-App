## Objetivo
Manter apenas dois templates de checklist no sistema — **Standard** e **Airbnb** — e torná-los significativamente mais completos, cobrindo todos os cômodos e áreas possíveis (sauna, piscina, lavanderia, academia, garagem, escritório, kids, game room, bar, varanda, hall, pet, etc.). Cleaners removerão na lixeira o que não se aplica ao imóvel.

## Mudanças

### 1. `src/data/checklist.ts` — Reformular templates
- **Expandir as áreas-base do Standard**:
  - Kitchen: adicionar dishwasher, geladeira (interno básico), descalcificar torneira, exaustor, rodapés, interruptores.
  - Living Room: ventilador de teto, rodapés, controle remoto, janelas internas, plantas.
  - Bedroom: trocar capa de travesseiro, rodapés, ventilador, espelho do guarda-roupa, persianas.
  - Bathroom: descalcificar chuveiro, exaustor, rejunte, embaixo da pia, secador.
  - Adicionar nova seção base "Entry & Hallway" (porta principal, capacho, sapateira).
- **Expandir as áreas-base do Airbnb**:
  - Reforçar Kitchen com Nespresso/cápsulas, sal/pimenta, papel toalha, filtro de café (alinhado com Guest Supplies).
  - Adicionar inspeção de roupas de cama extras (pack n' play, blankets) na seção Bedroom.
  - Adicionar Welcome Touches (cartão de boas-vindas, mapa local, manual da casa).
  - Adicionar Safety Check (extintor, detectores, primeiros socorros) reforçado.
- **Manter `buildExtraAreaSections`** já existentes (14 áreas: Laundry, Pool, Spa, Sauna, Gym, Garage, Outdoor, Office, Kids, Game, Bar, Balcony, Hallway, Pet) anexadas a ambos os templates.
- **Adicionar novas áreas extras**:
  - **Cinema/Media Room** (projetor, poltronas reclináveis, pipoqueira)
  - **Rooftop/Terrace** (jacuzzi, fire pit, vista)
  - **Dock/Pier** (cadeiras, salva-vidas) — útil para casas de praia
  - **EV Charger / Garage Tech** (limpar carregador, organizar cabos)
  - **Guest House / In-Law Suite** (mini-cozinha, banheiro extra)
  - **Mudroom / Drop Zone** (cabides, organizadores, sapatos)
- **Remover do arquivo**:
  - `DEEP_CLEAN_BASE_SECTIONS`, `DEEP_CLEAN_CHECKLIST_TEMPLATE`
  - `MOVE_IN_OUT_BASE_SECTIONS`, `MOVE_IN_OUT_CHECKLIST_TEMPLATE`
  - `RECURRING_BASE_SECTIONS`, `RECURRING_CHECKLIST_TEMPLATE`
  - `POST_CONSTRUCTION_BASE_SECTIONS`, `POST_CONSTRUCTION_CHECKLIST_TEMPLATE`
  - `COMMERCIAL_BASE_SECTIONS`, `COMMERCIAL_CHECKLIST_TEMPLATE`
- **Atualizar `CHECKLIST_PRESETS`** mantendo apenas `standard`, `airbnb`, `guest_supplies_3_4br`, `guest_supplies_5_6br` (os Guest Supplies são complementos úteis, não duplicam a função).
- **Atualizar `ChecklistPresetKey`** para refletir os tipos restantes.

### 2. `src/views/DashboardView.tsx`
- Remover imports de `DEEP_CLEAN_CHECKLIST_TEMPLATE`, `MOVE_IN_OUT_CHECKLIST_TEMPLATE`, `RECURRING_CHECKLIST_TEMPLATE`, `POST_CONSTRUCTION_CHECKLIST_TEMPLATE`, `COMMERCIAL_CHECKLIST_TEMPLATE`.
- Remover os 5 cards de quick action correspondentes (Deep Clean, Move-in/out, Recorrente, Pós-obra, Comercial), deixando apenas Standard e Airbnb com cards visuais reforçados.

### 3. `src/contexts/LanguageContext.tsx`
- Remover chaves de tradução não usadas: `checklist.preset.deepClean`, `moveInOut`, `recurring`, `postConstruction`, `commercial` (EN e PT-BR).

### 4. Validação
- Garantir que `selectedProperty?.checklistTemplate` segue funcional para imóveis existentes (já é JSONB independente).
- Tipo `Job['type']` em `src/types/index.ts` continua aceitando `'Standard' | 'Deep Clean' | 'Move-out'` — manter por compatibilidade com jobs antigos no banco, sem oferecer Deep Clean/Move-out na criação. (Opcional: simplificar UI de tipo de serviço em `JobFormFields` para só Standard/Airbnb, se aplicável.)

## Resultado esperado
- Apenas **dois templates oficiais** exibidos na UI: Standard e Airbnb.
- Cada um nasce com **~25 seções e 130+ itens** cobrindo toda área que um imóvel residencial de luxo possa ter.
- Cleaners apagam (ícone lixeira) o que não se aplica em cada execução, conforme já funciona.
- Dashboard fica mais limpo (2 quick actions principais em vez de 7).