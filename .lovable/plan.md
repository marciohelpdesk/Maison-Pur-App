
Objetivo

Deixar 1 única lógica clara:
- você convida o cleaner por e-mail
- ele entra no app e vê somente os jobs/casas atribuídos
- ele faz checklist/relatório
- ao revogar, perde o acesso ao app imediatamente

Diagnóstico do que encontrei

- Hoje existem 2 sistemas paralelos: `employees` local + membros convidados reais. Isso quebra a lógica de agenda/atribuição.
- O convite remove só o vínculo visual; a revogação não vira um estado de acesso confiável.
- `useRole` está frágil: usuários convidados ficam com `user` + `cleaner`, e o hook pega “a primeira role”, podendo tratar cleaner como admin.
- A agenda e o detalhe do job ainda usam `employees`, então o job pode ser atribuído a um ID local em vez do usuário convidado real.
- O cleaner ainda consegue cair em telas que não fazem sentido (`properties`, detalhe de propriedade, etc.) e algumas telas ainda mostram UUID/preço/controles de gestão.
- O fluxo de execução ainda está inconsistente para cleaner, porque atualização de job e geração de relatório ainda assumem o `user_id` errado em partes do app.

Plano de correção

1. Unificar o sistema de equipe
- Remover do código o fluxo local de `employees`, `TeamManagement` e qualquer seletor baseado em funcionário local.
- Manter apenas 1 módulo: “Equipe”, baseado em convites reais por e-mail.
- A tela de equipe passa a listar somente cleaners convidados/ativos/revogados.

2. Revogar acesso de verdade
- Trocar a remoção atual por revogação explícita de acesso.
- Salvar estado de membro como `active/revoked` e marcar o convite como revogado também.
- Ao revogar: retirar o cleaner da equipe, desatribuir jobs futuros dele e bloquear o acesso no app.
- Adicionar um guard global para que cleaner revogado seja desconectado/redirecionado e nunca “caia” como admin.

3. Corrigir a lógica de papel/acesso
- Refatorar `useRole` para não depender da “primeira role” retornada.
- Resolver estados de acesso assim: owner/admin do workspace, cleaner ativo, cleaner revogado.
- Garantir que cleaner revogado nunca veja navegação nem telas administrativas.

4. Simplificar o app do cleaner
- Cleaner ficará só com o necessário: Dashboard com jobs atribuídos, Job Details e Execução.
- Proteger como owner-only: `/agenda`, `/properties`, `/properties/:id`, `/finance`, `/kpi`, `/expenses`, `/reports`, `/invoices`, `/estimates`.
- Em vez de abrir a gestão completa da propriedade, o cleaner verá apenas informações básicas da casa dentro do job atribuído.

5. Corrigir atribuição de jobs
- A agenda e o detalhe do job passarão a usar membros reais da equipe, não `employees`.
- O campo “Assign To” mostrará nome/e-mail do cleaner convidado e salvará o `member_user_id` real.
- Os cards e detalhes de job deixarão de exibir UUID bruto e passarão a mostrar o nome/e-mail do cleaner.

6. Corrigir o fluxo real do cleaner
- Ajustar hooks e políticas para o cleaner atualizar apenas jobs atribuídos.
- Ajustar criação/atualização de relatório para funcionar no contexto correto do workspace, para o dono continuar vendo o resultado.
- Como você pediu um fluxo mínimo, vou enxugar a experiência do cleaner para focar em checklist + relatório; se o passo de inventário não for essencial para esse perfil, ele sai do fluxo do cleaner.

7. Limpeza de código confuso
- Remover referências a `useEmployees` de Settings, Agenda e Job Details.
- Unir a UI de “Team” + “Equipe (Convites)” em uma única seção coerente.
- Padronizar os textos para falar só de “Equipe” e “Cleaner convidado”, sem conceitos duplicados.

Detalhes técnicos

- Backend/migração:
  - adicionar estado de revogação em `team_members`/`team_invites`
  - endurecer RLS para aceitar somente membership ativo
  - permitir que cleaner trabalhe apenas em jobs atribuídos e nunca volte a enxergar dados administrativos
- Edge function:
  - `invite-team-member` passará a revogar acesso em vez de apenas apagar vínculo
  - ao revogar, também limpará atribuições pendentes desse cleaner
- Frontend:
  - refatorar `useRole`, `useJobs`, `useReports`
  - trocar `useEmployees` por fonte única de membros convidados
  - proteger rotas e esconder telas de gestão do cleaner
  - mover dados básicos da casa para a tela de job do cleaner

Arquivos/áreas principais

- Remover/refatorar: `src/components/TeamManagement.tsx`, `src/hooks/useEmployees.ts`
- Ajustar: `src/components/TeamInviteManagement.tsx`, `src/views/SettingsView.tsx`, `src/pages/Settings.tsx`
- Ajustar atribuição: `src/components/AddJobModal.tsx`, `src/components/JobFormFields.tsx`, `src/pages/Agenda.tsx`, `src/pages/JobDetails.tsx`, `src/views/JobDetailsView.tsx`
- Ajustar acesso: `src/hooks/useRole.ts`, `src/lib/routes.tsx`
- Ajustar fluxo cleaner: `src/hooks/useJobs.ts`, `src/hooks/useReports.ts`, possivelmente `src/pages/Execution.tsx`
- Ajustar backend: `supabase/functions/invite-team-member/index.ts` + nova migração RLS/status

Resultado esperado

- some o sistema duplicado de equipe
- o convite por e-mail vira a única forma de adicionar cleaners
- o cleaner vê somente as casas/jobs atribuídos
- ele só executa checklist/relatório
- ao revogar, o acesso dele deixa de funcionar de forma confiável
