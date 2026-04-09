

## Corrigir Acesso ao Checklist na Pagina de Execucao

### Diagnostico

Apos investigacao detalhada do codigo, dados e logs:

- Os 3 jobs de hoje (Mahalo, Lake Shore, Ocean Pearl) estao corretamente no banco com status `IN_PROGRESS`, `current_step: BEFORE_PHOTOS`, e checklist valido (5 secoes, ~27 itens cada)
- A autenticacao esta funcionando (login OK, role = "user"/admin)
- Nao ha erros de runtime no console

O problema mais provavel e uma **condicao de corrida** no fluxo de execucao: quando `updateJob.mutate()` atualiza o job (ao mudar de step ou marcar itens), o `onSuccess` invalida o cache do react-query, causando um refetch. Durante esse refetch, o react-query pode brevemente retornar `isLoading = true` (se o query key mudou) ou o `job` pode ficar `undefined` por um instante. Isso aciona o `useEffect` que redireciona para `/dashboard`, expulsando o usuario da tela de execucao.

Alem disso, a barra de progresso no card do dashboard nao tem largura definida (sempre 100%).

### Correcoes

**1. Tornar a Execution resiliente a refetches (Execution.tsx)**
- Usar `optimisticUpdates` no react-query para que o `updateJob` atualize o cache imediatamente sem causar loading/undefined
- OU guardar o `job` em um `useRef` para nunca perder a referencia durante refetches
- Ajustar o `useEffect` de redirect para incluir um delay/guard adicional (nao redirecionar se ja teve um job valido antes)

**2. Evitar que invalidateQueries cause perda do job (useJobs.ts)**
- Usar `optimistic update` no `updateJob` mutation: atualizar o cache do react-query imediatamente via `queryClient.setQueryData`, antes do refetch
- Isso garante que durante o refetch, `jobs` nunca fica vazio e `job` nunca fica `undefined`

**3. Corrigir barra de progresso no dashboard (DashboardView.tsx)**
- Adicionar `style={{ width: ... }}` na barra de progresso do card de job para refletir o progresso real

### Arquivos
- `src/pages/Execution.tsx` — guardar referencia do job, redirect mais seguro
- `src/hooks/useJobs.ts` — optimistic update no updateJob mutation
- `src/views/DashboardView.tsx` — fix na largura da barra de progresso

