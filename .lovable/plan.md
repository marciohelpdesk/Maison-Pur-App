## Bug: tela branca no job "Ocean Pearl" em andamento

### Causa
O job tem `current_step = 'INVENTORY_CHECK'` salvo no banco. Esse step foi removido na refatoração do Supplies Audit, então `ExecutionView` não renderiza nenhuma das ramificações e a tela fica vazia. Qualquer job antigo nesse estado quebra da mesma forma.

### Correção (apenas `src/views/ExecutionView.tsx`)
1. Ao inicializar `currentStep`, validar contra `STEP_ORDER`. Se `job.currentStep` não estiver na lista (ex.: legado `INVENTORY_CHECK`, `BATHROOM_CHECK`, etc.), mapear:
   - `'INVENTORY_CHECK'` → `'SUPPLIES_AUDIT'` (substituto direto)
   - Qualquer outro valor desconhecido → `'BEFORE_PHOTOS'` (recomeço seguro)
2. Persistir imediatamente o step corrigido via `onUpdateJob({ ...job, currentStep: <novo> })` em um `useEffect` que roda uma vez, para que o banco fique consistente e o usuário não veja o problema de novo.

### Fora de escopo
- Sem migrations no banco (a auto-correção no client cobre os jobs órfãos ao serem abertos).
- Sem mudanças em outros componentes.
