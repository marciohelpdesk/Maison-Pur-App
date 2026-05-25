## Objetivo

Remover Supplies/Inventário do fluxo de execução (checklist) e criar uma **seção dedicada** no mesmo padrão de Invoices e Estimates. A Kamila seleciona a propriedade, vê/edita o inventário daquela casa, adiciona itens com fotos e observações, e gera um documento público compartilhável com o cliente quando precisar de reposição.

## Estrutura

### 1. Nova rota `/supplies` (admin)
Adicionada ao menu (Dashboard desktop + bottom nav mobile) ao lado de Invoices e Estimates. Layout:
- **Desktop**: 2 colunas — lista de propriedades à esquerda, painel da propriedade selecionada à direita.
- **Mobile**: seletor de propriedade no topo, painel abaixo.

### 2. Painel da propriedade selecionada
- Cabeçalho: foto, nome, endereço, botão "Compartilhar lista com cliente".
- Tabs internas:
  - **Inventário** — tabela densa: nome, categoria, qty atual, unidade, threshold, status (Low/OK), foto miniatura. Ações inline: editar qty, +/−, remover, adicionar/trocar foto.
  - **Solicitar reposição** — marcar itens em falta, preencher qty desejada e nota, gerar Supply Request (token público).
  - **Histórico** — solicitações anteriores enviadas, com status (draft/sent/fulfilled) e link público.
- Botão "Adicionar item" abre Sheet (nome, categoria, qty, unidade, threshold, foto opcional).

### 3. Documento público `/supplies/:token`
- Sem login, padrão dos invoices (RPC `SECURITY DEFINER`).
- Branding Maison Pur: logo, propriedade, lista de itens necessários (foto + qty + nota), contato +1 (941) 330-4713.
- Botão "Compartilhar via WhatsApp" com resumo formatado.

### 4. Remover do fluxo de execução
- Tirar `SUPPLIES_AUDIT` de `STEP_ORDER` em `ExecutionStepper.tsx` e `ExecutionView.tsx`.
- `normalizeStep` mapeia legados `'SUPPLIES_AUDIT'` e `'INVENTORY_CHECK'` → `'AFTER_PHOTOS'` para não quebrar jobs em andamento.
- Excluir `SuppliesAuditStep.tsx` e referências em `SummaryStep` e `pdfGenerator` (PDF do report deixa de incluir auditoria de supplies).

## Densidade visual (aplicar refinamentos pedidos antes)
- Linhas/cards compactos (py-2, gap-2), divisórias finas `border-stone-200`.
- Chip âmbar para Low stock; verde claro para OK.
- Playfair só no cabeçalho da propriedade; Inter no resto.
- Ações sempre visíveis (Edit / Remove / +Foto), não escondidas em menu.

## Detalhes técnicos

- Reaproveita tabela `inventory` existente (`property_id`, `threshold`, `reorder_photo`) — sem migração para o inventário base.
- **Nova tabela `supply_requests`**:
  - `id`, `user_id`, `property_id`, `public_token` (default `gen_random_bytes`), `status` (`draft`/`sent`/`fulfilled`), `notes`, `items` jsonb `[{inventory_id, name, qty_needed, photo_url, note}]`, timestamps.
  - RLS: owner full; `anon SELECT` quando `status <> 'draft'`.
  - RPC `get_supply_request_by_token` `SECURITY DEFINER`.
- **Novos arquivos**:
  - `src/pages/Supplies.tsx`, `src/views/SuppliesView.tsx`
  - `src/components/supplies/PropertySuppliesPanel.tsx`, `InventoryItemRow.tsx`, `AddInventoryItemSheet.tsx`, `SupplyRequestSheet.tsx`
  - `src/pages/PublicSupplyRequest.tsx` + rota `/supplies/:token`
  - `src/hooks/useInventory.ts` (estender) e `useSupplyRequests.ts`
- Entrada no menu admin (Dashboard, MobileBottomNav) com `RequireAdmin`.
- i18n EN/PT-BR em `LanguageContext`.
- Hooks aguardam `!roleLoading` (regra do projeto).

## Fora de escopo
- Não alterar lógica financeira, reports, branding ou dependências.
