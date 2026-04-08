

## Corrigir Experiencia do Cleaner — Acesso Restrito e Dados Filtrados

### Problemas Identificados

1. **useJobs filtra por `user_id`**: O codigo JS faz `.eq('user_id', userId)` — como o cleaner nao e o dono do job, nao retorna nada. O RLS permite via `assigned_to`, mas o filtro JS bloqueia.
2. **useProperties sem filtro de role**: Cleaner consegue acessar `/properties` e ver precos (`basePrice`) nos cards.
3. **Rotas nao protegidas**: Cleaner pode navegar para `/properties`, `/finance`, `/invoices` etc. digitando a URL.
4. **Dashboard mostra dados financeiros**: Earnings do mes, precos nos jobs — nao devem aparecer para cleaners.

### Plano de Implementacao

**1. Corrigir useJobs para Cleaners**
- Detectar role do usuario via `useRole`
- Se cleaner: remover o filtro `.eq('user_id', userId)` e deixar o RLS fazer o trabalho (so retorna jobs assigned ao cleaner)
- Se admin: manter filtro atual

**2. Corrigir useProperties para Cleaners**  
- Se cleaner: remover filtro `.eq('user_id', userId)` — o RLS ja restringe a properties vinculadas aos jobs atribuidos
- Nao precisa de query especial, o RLS ja cuida

**3. Esconder precos no PropertyCard**
- Receber prop `hidePrice` no PropertyCard
- Quando cleaner, nao renderizar o badge de `$basePrice`

**4. Criar componente RequireRole para rotas**
- Componente que verifica role e redireciona cleaner para `/dashboard` se tentar acessar rota admin-only
- Aplicar nas rotas: `/properties`, `/finance`, `/kpi`, `/expenses`, `/invoices`, `/estimates`

**5. Dashboard simplificado para Cleaner**
- Esconder secao de earnings (`monthEarnings`)
- Esconder precos nos job cards
- Manter: jobs do dia, next job, checklist templates, execucao

**6. Ajustar DashboardView**
- Receber prop `isCleaner` 
- Condicionar exibicao de valores financeiros

### Arquivos Modificados
- `src/hooks/useJobs.ts` — query condicional por role
- `src/hooks/useProperties.ts` — query condicional por role  
- `src/components/PropertyCard.tsx` — prop `hidePrice`
- `src/views/DashboardView.tsx` — esconder financeiro
- `src/views/PropertiesView.tsx` — passar `hidePrice`
- `src/pages/Dashboard.tsx` — passar `isCleaner`
- `src/lib/routes.tsx` — RequireRole wrapper nas rotas admin-only

