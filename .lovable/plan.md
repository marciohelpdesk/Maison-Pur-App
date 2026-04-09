

## Corrigir Bug: Pagina de Execucao Redireciona Antes dos Dados Carregarem

### Causa Raiz Identificada

O problema esta no TanStack Query v5 combinado com o `useRole` que usa `useState/useEffect` (nao e cacheado).

Quando o usuario navega para `/execution/:jobId`:

1. O `useRole()` dentro de `useJobs` comeca com `isLoading=true`, o que desabilita a query de jobs (`enabled: false`)
2. No TanStack Query v5, uma query desabilitada sem cache retorna `query.isLoading = false` (porque `isLoading = isPending && isFetching = true && false = false`)
3. Portanto `jobsLoading = false` E `jobs = []` E `job = undefined`
4. O `useEffect` de redirect verifica: `!isLoading && !job && !hadJobRef.current` = `true` → redireciona para `/dashboard`
5. O usuario e expulso ANTES da query de jobs ter chance de executar

Se houver cache do Dashboard, os dados persistem e o bug nao ocorre. Mas se o cache foi limpo (invalido, expirado, ou navegacao direta), o redirect dispara prematuramente.

### Correcoes

**1. `src/hooks/useJobs.ts` — Incluir roleLoading no isLoading retornado**

Mudar a linha 210 de:
```typescript
isLoading: query.isLoading,
```
Para:
```typescript
isLoading: query.isLoading || roleLoading,
```

Isso garante que enquanto o role esta carregando (e a query esta desabilitada), os consumidores veem `isLoading=true` e nao tomam decisoes baseadas em dados ausentes.

**2. `src/pages/Execution.tsx` — Remover inventoryLoading do gate principal**

O inventario so e necessario no step INVENTORY_CHECK. Nao deve bloquear a renderizacao da pagina inteira. Mudar:
```typescript
const isLoading = jobsLoading || inventoryLoading;
```
Para:
```typescript
const isLoading = jobsLoading;
```

Isso elimina mais um motivo de atraso na renderizacao.

**3. `src/pages/Execution.tsx` — Fortalecer guard de redirect**

Adicionar verificacao extra no useEffect para nao redirecionar se `jobsLoading` acabou de mudar:
```typescript
useEffect(() => {
  if (!isLoading && !job && !hadJobRef.current) {
    navigate('/dashboard');
  }
}, [isLoading, job, navigate]);
```

Manter o guard `hadJobRef` que ja existe para cobrir o caso de refetches.

### Arquivos
- `src/hooks/useJobs.ts` — linha 210: incluir `roleLoading`
- `src/pages/Execution.tsx` — remover `inventoryLoading` do gate, manter guards

