
## Checklist Completo por Padrão (Remover ao Invés de Adicionar)

### Princípio
Hoje os 7 templates (`STANDARD`, `AIRBNB`, `DEEP_CLEAN`, `MOVE_IN_OUT`, `RECURRING`, `COMMERCIAL`, `POST_CONSTRUCTION` em `src/data/checklist.ts`) só cobrem cozinha, sala, quarto, banheiro e poucas áreas extras. Você quer o oposto: **toda casa começa com a lista cheia**, e o cleaner apaga as seções que não existem (sem piscina, sem sauna, etc.).

### O que vou adicionar a TODOS os templates

Novas seções padrão, com tarefas detalhadas em cada uma:

1. **Laundry Room** — máquina, secadora, filtro, dobrar toalhas, reabastecer detergente, limpar tanque/bancada, esvaziar lixo, mop.
2. **Pool Area** — skimmer/peneira, bordas, deck, espreguiçadeiras, mesa, organizar boias, conferir nível d'água, foto final.
3. **Hot Tub / Spa** — limpar borda, conferir tampa, organizar acessórios.
4. **Sauna / Steam Room** — limpar bancos, conferir pedras/vapor, ventilar, mop do piso.
5. **Gym / Fitness Area** — desinfetar equipamentos, esteira, halteres, espelho, mop.
6. **Garage** — varrer, organizar, lixo, foto.
7. **Outdoor / Backyard / Park Area** — varanda, jardim, móveis externos, churrasqueira/grill, brinquedos infantis, pet area.
8. **Home Office** — mesa, cadeira, monitor, organização de cabos.
9. **Kids Room / Playroom** — organizar brinquedos, desinfetar superfícies, lavar pelúcias se necessário.
10. **Game Room / Entertainment** — mesa de bilhar/ping-pong, console, controles.
11. **Wine Cellar / Bar** — organizar garrafas, polir taças, limpar bancada.
12. **Balcony / Terrace** — móveis, vasos, varrer, vidros.
13. **Elevator / Hallway** (para condomínios/Airbnb compartilhado).
14. **Pet Area** — bebedouro, comedouro, caminha, foto.

Cada template (Airbnb, Standard, Deep Clean etc.) recebe essas seções extras com **photoRequired** ativado nos itens-chave (foto da piscina, sauna, garagem, área kids).

### Comportamento esperado na execução
- Quando o cleaner abre o job, o checklist já vem com TODAS as áreas.
- Se a casa não tem piscina/sauna/etc., ele clica no ícone de **lixeira da seção** (já existe em `ChecklistTemplateEditor.tsx` e no fluxo dinâmico do execution — ver memória `checklist-dynamic-management`) para remover.
- Itens removidos não viram tarefas pendentes nem aparecem no relatório PDF.

### Verificações que vou confirmar antes de mexer
- Que o fluxo de execução (`ExecutionView` / `ChecklistStep`) realmente permite excluir seções inteiras de um job em andamento (não só editar template salvo na propriedade). Se não permitir, adiciono o botão de excluir seção com confirmação.
- Que o relatório PDF (`pdfGenerator.ts`) ignora seções removidas e não conta as tarefas delas no `total_tasks` do `cleaning_reports`.

### Arquivos que serão alterados
- `src/data/checklist.ts` — adicionar as ~14 novas seções a cada um dos 7 templates exportados.
- `src/components/execution/ChecklistStep.tsx` — garantir botão de "remover seção" no modo execução (se ainda não existir nesse contexto).
- `src/views/ExecutionView.tsx` — propagar a remoção para o `updateJob` salvar o checklist sem aquela seção.

### Fora de escopo
- Não vou tocar em propriedades já existentes que tenham `checklist_template` customizado salvo no banco — só os defaults novos. Se quiser que propriedades antigas também recebam as novas seções, me avise que faço uma migration de “merge” opcional.

### Pergunta
Quer que eu inclua TODAS as 14 áreas que listei, ou prefere um subconjunto (ex.: tirar "Wine Cellar" e "Elevator" porque não se aplicam ao seu mercado)? Se não responder, sigo com a lista completa.
