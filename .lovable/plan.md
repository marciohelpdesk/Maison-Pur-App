

## Corrigir Revogacao de Acesso

### Problema
A Edge Function `invite-team-member` tem um **erro de sintaxe fatal**: a variavel `adminClient` e declarada duas vezes (linhas 42 e 85). Isso impede a funcao de iniciar — todas as acoes (convite, revogacao, reset de senha) falham com erro 500.

Os logs confirmam:
```
Uncaught SyntaxError: Identifier 'adminClient' has already been declared
```

### Correcao
Remover a segunda declaracao `const adminClient = ...` na linha 85 do arquivo `supabase/functions/invite-team-member/index.ts`. A primeira declaracao na linha 42 ja cria o client corretamente e e acessivel em todo o escopo da funcao.

### Arquivo
- `supabase/functions/invite-team-member/index.ts` — remover linha 85 duplicada e re-deploy

### Resultado
- Convite, revogacao e reset de senha voltarao a funcionar
- O `RevokedGuard` no frontend ja esta correto e fara logout automatico de cleaners revogados

