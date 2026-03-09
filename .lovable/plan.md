

## Plano: Módulo de Estimates (Orçamentos)

### Objetivo
Criar um sistema de orçamentos (Estimates) seguindo exatamente o padrão do módulo de Invoices — com tabela dedicada, hook, componentes de criação/listagem, página pública e rota.

### Estrutura

#### 1. Tabela `estimates` no banco de dados
Mesma estrutura da tabela `invoices`, com campos adicionais específicos:
- `client_name`, `client_email`, `client_address`, `client_phone`
- `amount`, `status` (default: `draft`, opções: `draft`, `sent`, `accepted`, `declined`)
- `public_token` (hex 16 bytes, como invoices)
- `estimate_number` (ex: `EST-2026-001`)
- `line_items` (JSONB — mesma estrutura do invoice)
- `notes`, `discount`, `tax`, `due_date`, `valid_until` (data de validade do orçamento)
- `user_id`, `created_at`, `updated_at`
- RLS: owner gerencia tudo, público lê via token

#### 2. Arquivos novos
- `src/hooks/useEstimates.ts` — hook CRUD (clone de `useInvoices` adaptado)
- `src/components/EstimateSection.tsx` — formulário + listagem (clone de `InvoiceSection` adaptado)
- `src/pages/Estimates.tsx` — página dedicada com abas "New Estimate" / "History"
- `src/components/EstimateHistoryContent.tsx` — listagem completa com filtros
- `src/pages/PublicEstimate.tsx` — visualização pública do orçamento (clone de `PublicInvoice` com status visual diferente: Draft/Sent/Accepted/Declined)

#### 3. Rotas
- `/estimates` — página protegida (dentro do ProtectedLayout)
- `/estimate/:token` — página pública (sem auth)

#### 4. Integração
- Adicionar link para Estimates na página de Settings (ao lado de Invoices)
- Presets de serviço específicos para estimates: Sofa Cleaning, Carpet Cleaning, Commercial, Post-construction, Deep Clean, Move-in/out
- Botão "Convert to Invoice" nos estimates aceitos — copia os dados para criar uma invoice

#### 5. Página pública do Estimate
- Layout similar ao PublicInvoice (branding Maison Pur)
- Status badge visual (Draft=cinza, Sent=azul, Accepted=verde, Declined=vermelho)
- Texto "This is an estimate, not an invoice" no topo
- Validade do orçamento exibida
- Sem seção de pagamento (diferente da invoice)

### Sem dependências externas — apenas banco de dados + componentes React

