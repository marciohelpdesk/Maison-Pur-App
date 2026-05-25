# Plano: Auditoria de Suprimentos no Checklist

## Objetivo
Mover o controle de estoque/suprimentos da edição da propriedade para uma etapa final dentro da execução do checklist, espelhando o padrão de "Achados & Perdidos" e "Danos". O cleaner faz uma checagem rápida do que ficou faltando na casa (papel higiênico, sabonete, pilhas, talheres etc.), com **quantidade restante, foto e nota escrita**.

## Fluxo Novo (Execução)

Substituir o passo atual `INVENTORY_CHECK` (que pede "quantidade usada" e é confuso) por um novo passo **`SUPPLIES_AUDIT`** posicionado logo antes do `AFTER_PHOTOS`:

```text
BEFORE → CHECKLIST → DAMAGE → LOST&FOUND → SUPPLIES AUDIT → AFTER → SUMMARY
```

Na tela de Auditoria de Suprimentos o cleaner vê:

- Lista pré-preenchida agrupada por categoria (Banheiro, Cozinha, Lavanderia, Quarto, Geral).
- Para cada item: status rápido em 3 botões — **OK / Baixo / Acabou**.
- Botão "+ Adicionar item" para incluir algo fora da lista padrão.
- Ícone de lixeira para remover itens não aplicáveis (mesmo padrão dos cômodos do checklist).
- Em qualquer item marcado como Baixo/Acabou: campo de **quantidade restante** (opcional), **foto** (opcional) e **observação escrita** (opcional).
- Resumo no topo: "X itens precisam de reposição".

## Itens Pré-preenchidos (catálogo padrão Maison Pur)

Banheiro: Papel higiênico, Sabonete em barra, Body Wash, Shampoo, Condicionador, Hand soap, Toalhas de papel, Lenços de papel, Cotonetes, Algodão.

Cozinha: Detergente, Esponja, Pano de prato, Papel toalha, Sacos de lixo, Filtro de café, Cápsulas Nespresso, Sal, Pimenta, Azeite, Açúcar, Café, Chá, Água engarrafada.

Lavanderia: Sabão de roupa, Amaciante, Tira-manchas, Sacos de lavanderia.

Geral / Outros: Pilhas AA, Pilhas AAA, Lâmpadas, Velas, Fósforos, Pet supplies (se aplicável), Aromatizador, Talheres extras (garfo/faca/colher), Taças, Copos.

Este catálogo vive em `src/data/supplies.ts` e é injetado automaticamente na primeira auditoria de cada propriedade.

## Mudanças por Arquivo

### Novos
- `src/data/supplies.ts` — catálogo padrão com `DEFAULT_SUPPLY_ITEMS` (name, category, unit).
- `src/components/execution/SuppliesAuditStep.tsx` — UI da nova etapa (lista, status OK/Baixo/Acabou, foto, nota, adicionar/remover).
- `src/hooks/usePropertySupplies.ts` — leitura/escrita do estado de suprimentos por propriedade (reutiliza tabela `inventory` existente — ver seção Técnica).

### Editados
- `src/types/index.ts` — adicionar tipo `SupplyAuditEntry { itemId, name, category, status: 'ok'|'low'|'out', remainingQty?, photoUrl?, note? }`. Trocar `ExecutionStep` `INVENTORY_CHECK` por `SUPPLIES_AUDIT`. Adicionar `Job.suppliesAudit: SupplyAuditEntry[]`.
- `src/views/ExecutionView.tsx` — substituir `InventoryCheckStep` por `SuppliesAuditStep` no `STEP_ORDER` e nas props.
- `src/components/execution/ExecutionStepper.tsx` — atualizar label/ícone do passo.
- `src/components/execution/SummaryStep.tsx` — exibir bloco "Suprimentos para repor" no resumo final, igual aos blocos de Danos/Achados.
- `src/lib/pdfGenerator.ts` — incluir seção "Supplies to Restock" no PDF do relatório, com foto e nota.
- `src/views/PropertyDetailsView.tsx` (e onde for renderizado) — **remover** o componente `PropertyInventory` da tela de edição da propriedade. Em seu lugar, mostrar um resumo somente-leitura: "Última auditoria: 3 dias atrás — 4 itens em falta", com link para o último relatório.
- `src/hooks/useJobs.ts` — persistir `suppliesAudit` no campo JSONB do job (campo `inventory_used` é reaproveitado, ver Técnica).
- `src/contexts/LanguageContext.tsx` — chaves novas em EN/PT-BR (`exec.supplies.*`).

### Removidos (após migração suave)
- `src/components/execution/InventoryCheckStep.tsx` — substituído.
- `src/components/PropertyInventory.tsx` — removido da UI da propriedade (arquivo pode ser deletado).

## Detalhes Técnicos

**Persistência sem migração de schema:**
- Reaproveitar a coluna `jobs.inventory_used` (JSONB já existente) para armazenar o array `SupplyAuditEntry[]`. Sem mudanças no banco.
- A tabela `inventory` continua existindo para guardar o **catálogo customizado por propriedade** (itens que o admin adicionou além do padrão). O hook `usePropertySupplies` faz merge entre `DEFAULT_SUPPLY_ITEMS` + itens da tabela `inventory` filtrados por `property_id`.
- Auditorias passadas ficam consultáveis via `cleaning_reports` (já guardam o snapshot do job).

**Upload de foto:** reusa `usePhotoUpload` apontando para o bucket `cleaning-photos` (mesmo padrão dos danos).

**Relatório público (Dossier):** a seção de suprimentos aparece no `PublicReport` apenas se houver itens com status `low` ou `out` — mantém o documento elegante quando está tudo OK.

**i18n:** chaves novas seguem padrão `exec.supplies.title`, `exec.supplies.status.ok|low|out`, `exec.supplies.addItem`, `exec.supplies.remaining`, `exec.supplies.note`.

## Fora de Escopo
- Pedidos automáticos a fornecedores.
- Histórico/gráfico de consumo (pode vir depois aproveitando os snapshots em `cleaning_reports`).
- Alertas push de baixo estoque (já existe infra; pode ser ativado em iteração futura).

## Pergunta única antes de implementar
O catálogo padrão acima cobre o que você precisa, ou quer ajustar/adicionar itens específicos (ex.: cápsulas de marca específica, produtos premium) antes de eu construir?
