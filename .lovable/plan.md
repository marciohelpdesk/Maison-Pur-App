

## Varredura do Aplicativo: Falhas, Inconsistências e Problemas de Workflow

Esta é uma análise de auditoria — não vou alterar código agora. Abaixo, os problemas reais encontrados, agrupados por severidade.

---

### 🔴 Críticos (impactam funcionamento ou segurança)

**1. Nome do cleaner hardcoded no relatório**
- `src/pages/Execution.tsx` (linhas 144, 162) e `src/pages/Reports.tsx` (linha 80) gravam `cleaner_name: 'Kamila Petters'` em todo relatório gerado.
- Resultado: quando um membro da equipe (faxineira convidada) finaliza um job, o relatório público mostra o nome da Kamila, não de quem realmente limpou.
- Correção: ler `profile.name` (do `useProfile`) ou nome do `team_member` autenticado.

**2. Política RLS de DELETE em `properties` com lista de e-mails fixa**
- A policy `Only admins can delete properties` permite DELETE só para `kamila13petters@gmail.com` e `marcioasoliveira@hotmail.com` (hardcoded no banco).
- Quebra o modelo de roles (`has_role` / `user_roles`) usado no resto do app. Qualquer novo admin não consegue excluir propriedades; trocar e-mail derruba a regra.
- Correção: usar `public.has_role(auth.uid(), 'admin')`.

**3. `useTeamMembers` mapeia e-mails por índice de array**
- `src/hooks/useTeamMembers.ts` (linhas 59-64) faz `inviteEmails[idx]` para casar membro com convite. Não há garantia nenhuma de que a ordem de `team_members` bate com a de `team_invites`.
- Resultado: nomes/e-mails de membros da equipe podem aparecer trocados na UI e em jobs atribuídos.
- Correção: precisa de uma coluna de ligação (ex.: `team_members.invite_id` ou casar via `auth.users.email` num view/RPC `security definer`).

**4. Inconsistência no enum `JobStatus` vs default do banco**
- O banco tem `jobs.status DEFAULT 'Scheduled'` (capitalizado), mas o enum no front é `'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'` (caixa alta).
- Hoje só existem `IN_PROGRESS` e `COMPLETED` no banco. Se algum INSERT cair no default (faltar status no payload), o job vira `'Scheduled'` e some de todos os filtros (`j.status === JobStatus.SCHEDULED` retorna `false`).
- Correção: alinhar default no banco para `'SCHEDULED'` (migration).

**5. Sem realtime nem refetch ao alternar entre abas**
- Mudanças feitas por outro membro do time (ex.: admin atribui job no desktop) só aparecem para a faxineira no celular após pull-to-refresh manual ou login novo.
- Não há `supabase.channel(...).on('postgres_changes')` em `useJobs`/`useProperties`.

---

### 🟠 Workflow / lógica destoante

**6. Três caminhos diferentes de “iniciar job”**
- `Dashboard.tsx`, `Agenda.tsx` e `JobDetails.tsx` têm cada um sua própria função `handleStartJob` praticamente idêntica (muda status para `IN_PROGRESS`, seta `startTime`, navega para `/execution/:id`).
- Risco: divergência futura (já aconteceu — `JobDetails` tem também `handleEditCompletedJob` que pula para `'CHECKLIST'`, enquanto os outros começam em `'BEFORE_PHOTOS'`).
- Correção: extrair para um único hook `useStartJob()`.

**7. `queryKey` inconsistente no `useJobs`**
- A query usa `['jobs', userId, isCleaner]`, mas as invalidações usam só `['jobs', userId]` (sem `isCleaner`). Funciona por prefix-match do TanStack, mas é frágil.
- O `cancelQueries` do optimistic update usa a chave completa — então em um cenário de race, a invalidação pode disparar refetch antes do optimistic settle.

**8. `useProperties` não tem `userId` no `queryKey`**
- `queryKey: ['properties', isCleaner]`. Se o usuário trocar de conta sem reload (logout/login), o cache da conta anterior pode vazar para a nova.

**9. Geração de relatório no `handleComplete` agrupa por título de seção via `includes()`**
- `src/pages/Execution.tsx` linhas 67-96: associa damages e lost&found a cômodos comparando `description.includes(section.title.toLowerCase())`. Isso é frágil (ex.: dano descrito como “quarto principal” pode bater com seção “Quarto”, ou nenhuma) e o fallback joga tudo para a primeira seção.
- Resultado: relatórios com danos em locais errados.

**10. Segurança: ausência total de validação de “limite de fotos”**
- `PhotoCaptureStep` usa `minPhotos={0}`. Não há regra para impedir que um cleaner finalize um job sem nenhuma foto. Como o relatório é o produto entregue ao cliente, vale ao menos exigir mínimo configurável por tipo de job.

**11. `Reports.tsx` também cria relatórios manualmente com `cleaner_name` hardcoded**
- Mesma falha do item 1, mas em fluxo separado — confirma falta de função utilitária única para criar relatório.

---

### 🟡 Organização / manutenibilidade

**12. Lógica de progresso do checklist duplicada 3+ vezes**
- Cálculo `total / completed` aparece em `DashboardView.tsx` (duas vezes nas linhas 379-395), `ExecutionView.tsx`, `JobDetailsView.tsx` e provavelmente outros.
- Correção: helper `getChecklistProgress(job)` em `src/lib/`.

**13. `Execution.tsx` é gigante (225 linhas de glue + lógica de PDF/relatório)**
- Toda a lógica de geração de relatório + upload de PDF deveria viver num hook (`useFinalizeJob`) ou serviço, não no componente de página.

**14. `useRole` não usa TanStack Query**
- É `useState/useEffect` puro, sem cache. Toda página que chama `useRole(user.id)` refaz duas queries (`user_roles` + `team_members`). Quatro componentes podem disparar simultaneamente.
- Correção: migrar para `useQuery` com `queryKey: ['role', userId]`.

**15. Imagens estáticas no `DashboardView` são importadas sempre**
- `airbnb.jpg`, `residencial.jpg`, `posobra.jpg`, `comercial.jpg` carregadas no bundle inicial mesmo que o usuário nunca abra o dashboard. Considerar lazy import.

**16. `getInvoiceByToken` / `getEstimateByToken` são `SECURITY DEFINER` retornando `SETOF`**
- Funcionam, mas expõem **todos os campos** da tabela (incluindo `client_email`, `client_phone`) para qualquer um com o token. Aceitável se o token é o segredo, mas vale documentar.

**17. `handle_new_user` insere role `'user'`, nunca `'admin'`**
- Combinado com a policy hardcoded de DELETE de propriedades (item 2), nenhum usuário novo recebe role `'admin'` automaticamente. Precisa de processo manual.

---

### 🟢 Pontos positivos confirmados

- RLS bem desenhada em `jobs`, `cleaning_reports`, `report_rooms`, `report_photos` (cleaners enxergam só jobs atribuídos via `team_members.status = 'active'`).
- `useAuth` segue o padrão correto: `onAuthStateChange` antes de `getSession`.
- Lazy loading de páginas via `React.lazy` no `routes.tsx`.
- Optimistic update em `updateJob` com rollback (recém-adicionado).
- Guard contra redirect prematuro em `Execution.tsx` com `hadJobRef` (recém-adicionado).

---

### Recomendação de ordem de correção

Se você aprovar implementação, sugiro este lote por impacto:

1. **Item 1 + 11** — `cleaner_name` real (10 min).
2. **Item 2** — RLS de DELETE properties via `has_role` (migration, 5 min).
3. **Item 3** — Refazer `useTeamMembers` casando por user_id real (30 min, requer view ou RPC).
4. **Item 4** — Migration alinhando default de `jobs.status` (2 min).
5. **Item 6 + 12** — Consolidar `useStartJob` e helper de progresso (20 min).
6. **Item 14** — Migrar `useRole` para `useQuery` (15 min).
7. **Item 9** — Repensar associação dano→cômodo (perguntar UX desejado).

Itens 5, 8, 10, 13, 15 podem entrar num lote de “qualidade” depois.

Diga quais lotes quer que eu execute (pode ser “todos”, “só os críticos”, ou listar números específicos) que eu sigo.
