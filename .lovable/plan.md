

## Corrigir Jobs Nao Aparecendo para Cleaner + Controle de Senha

### Problemas Encontrados

1. **Jobs atribuidos ao ID errado**: Os jobs no banco tem `assigned_to` com UUIDs que nao correspondem ao `member_user_id` real na tabela `team_members`. O RLS compara `assigned_to = auth.uid()::text`, entao o cleaner nao ve nada.

2. **Race condition no useJobs**: `useRole` e assincrono — `isCleaner` comeca como `false`, fazendo a query inicial filtrar por `user_id` (que exclui jobs do cleaner). Precisa esperar o role carregar antes de fazer a query.

3. **Sem controle de senha**: O admin ve a senha temporaria uma unica vez no modal. Nao tem como resetar depois se perder.

4. **Propriedade mostra preco**: Em algumas telas o `hidePrice` nao e passado corretamente.

### Correcoes

**1. Corrigir useJobs — esperar role carregar**
- Adicionar `isLoading` do `useRole` como condicao no `enabled` da query
- So rodar a query quando `isLoading` do role for `false`
- Isso garante que `isCleaner` ja tem o valor correto antes de decidir o filtro

```text
useJobs:
  enabled: !!userId && !roleLoading
  queryKey: ['jobs', userId, isCleaner]
```

**2. Corrigir useProperties — mesmo padrao**
- Esperar role carregar antes de fazer query

**3. Adicionar botao "Resetar Senha" na tela de equipe**
- No `TeamInviteManagement`, ao lado do botao de revogar, adicionar opcao de resetar senha
- Chama a edge function com `action: 'reset-password'`
- Edge function usa `adminClient.auth.admin.updateUserById()` para gerar nova senha
- Mostra a nova senha no modal para o admin copiar e enviar

**4. Atualizar edge function para suportar reset de senha**
- Nova acao `reset-password` que recebe `memberId`
- Gera nova senha temporaria e atualiza via Admin API
- Retorna a nova senha para o admin

**5. Garantir que assigned_to usa o member_user_id correto**
- O `JobFormFields` ja usa `member.member_user_id` como value no Select
- Verificar que nao ha conversao errada no fluxo

### Arquivos Modificados
- `src/hooks/useJobs.ts` — esperar role carregar
- `src/hooks/useProperties.ts` — esperar role carregar  
- `src/components/TeamInviteManagement.tsx` — botao resetar senha
- `src/hooks/useTeamInvites.ts` — funcao resetPassword
- `supabase/functions/invite-team-member/index.ts` — acao reset-password

