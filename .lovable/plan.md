

## Corrigir Execution Travada em Jobs Atribuidos a Membros Removidos

### Problema
O job "Mahalo" esta com status `IN_PROGRESS` e `assigned_to` apontando para um usuario (`968df217...`) que nao existe mais na tabela `team_members`. O admin (dono do job) consegue ver o job via RLS, mas ao abrir `/execution/:jobId`, a pagina chama `navigate()` durante o render (linha 188-191), causando o erro React "Cannot update a component while rendering a different component" e travando a tela — sem botao de cancelar nem prosseguir.

### Correcoes

**1. Corrigir navigate durante render em `Execution.tsx`**
- Mover o redirect `if (!job) navigate('/dashboard')` para dentro de um `useEffect`
- Isso elimina o erro React e permite que a pagina renderize corretamente mesmo durante carregamento

**2. Permitir admin cancelar/resetar jobs travados**
- O admin e dono do job (`user_id` = admin), entao ele deve conseguir ver e interagir normalmente
- Adicionar um botao visivel para o admin poder resetar o status do job para `SCHEDULED` e limpar `assigned_to` quando o membro atribuido nao existe mais na equipe
- Ou simplesmente garantir que o fluxo de execucao funcione normalmente para o admin mesmo quando `assigned_to` aponta para alguem removido

**3. Limpar assigned_to de jobs com membros inexistentes**
- Na revogacao (edge function), ja limpamos jobs futuros — mas jobs IN_PROGRESS ficaram com o assigned_to antigo
- Adicionar logica na edge function para tambem limpar `assigned_to` de jobs IN_PROGRESS ao revogar

### Arquivos
- `src/pages/Execution.tsx` — useEffect para redirect + tratamento de job sem assignee valido
- `supabase/functions/invite-team-member/index.ts` — limpar assigned_to de jobs IN_PROGRESS na revogacao

