
Objetivo: remover com segurança o job travado “Mahalo” e fechar as brechas que podem recriar esse problema em novos agendamentos.

Diagnóstico confirmado
- O job atual “Mahalo” travado é `d45c56c7-decb-4634-aa18-27da4817edfc`.
- Ele está `IN_PROGRESS`, com `assigned_to = null`, `current_step = BEFORE_PHOTOS` e sem progresso salvo relevante: sem fotos, sem danos, sem itens perdidos, sem inventário usado e sem relatório vinculado.
- Existem outros jobs “Mahalo” antigos já `COMPLETED` com relatório publicado; eles não devem ser tocados.
- O motivo de você não conseguir recuperar esse job pela interface é que hoje o admin só pode editar/excluir jobs com status `SCHEDULED`.
- Há também uma causa raiz para recorrência: a revogação de acesso está limpando jobs usando status diferentes dos realmente salvos no app (`SCHEDULED` / `IN_PROGRESS`), então alguns jobs podem continuar presos.
- Ainda existe um redirect durante render em `JobDetails.tsx`, o que pode gerar comportamento instável quando um job some após exclusão/reset.

Plano de correção
1. Limpeza pontual do Mahalo
- Excluir apenas o job travado `d45c56c7-decb-4634-aa18-27da4817edfc`.
- Não apagar os Mahalo concluídos nem seus relatórios.
- Como esse job travado não tem relatório nem anexos registrados no banco, a exclusão é segura e não deve deixar referência quebrada.

2. Dar controle real ao admin em jobs travados
- Em `src/views/JobDetailsView.tsx`, adicionar ações de recuperação para jobs `IN_PROGRESS` quando o usuário for admin:
  - Continuar
  - Resetar para agendado
  - Excluir job
- Manter confirmação antes de resetar ou excluir.

3. Tornar a exclusão robusta
- Em `src/hooks/useJobs.ts`, transformar a exclusão em fluxo completo:
  - apagar relatórios ligados ao job, se existirem
  - apagar `report_rooms` e `report_photos`
  - limpar PDF/URLs rastreadas do job quando houver
  - só depois apagar o registro do job
- Fazer a UI navegar apenas após sucesso real da exclusão.

4. Corrigir a causa raiz da revogação
- Em `supabase/functions/invite-team-member/index.ts`, ajustar a limpeza de jobs revogados para os status reais usados pelo app (`SCHEDULED` e `IN_PROGRESS`) ou remover esse filtro frágil.
- Assim novos jobs atribuídos a membros removidos não ficarão presos.

5. Blindar a tela de detalhes
- Em `src/pages/JobDetails.tsx`, mover o redirect de `!job` para `useEffect`, igual já foi feito em `Execution.tsx`.
- Isso evita travamento/comportamento estranho logo após excluir ou resetar um job.

Validação final
- Confirmar que o Mahalo travado desaparece da agenda/dashboard.
- Criar um novo job, atribuir a um membro, revogar esse membro e validar que o job não fica preso.
- Testar reset e exclusão de um job `IN_PROGRESS` pelo admin.
- Confirmar que jobs concluídos e relatórios antigos continuam intactos.

Arquivos principais
- `src/views/JobDetailsView.tsx`
- `src/pages/JobDetails.tsx`
- `src/hooks/useJobs.ts`
- `supabase/functions/invite-team-member/index.ts`
