

## Plano: Melhorar Layout Desktop + Adicionar Invoices/Estimates ao Sidebar

### Problemas Identificados (das screenshots)

1. **Dashboard**: Categorias e checklists expandem demais horizontalmente, sem contenção visual adequada
2. **Properties**: Cards de propriedade ocupam 100% da largura — ficam enormes no desktop. Deveria ser grid 2-3 colunas
3. **Reports**: Lista de reports ocupa toda a largura — itens muito espalhados
4. **Finance**: Layout 2 colunas dos summary cards OK, mas chart e payments list ficam muito largos
5. **Sidebar**: Faltam links para Invoices e Estimates

### Mudanças

#### 1. Sidebar — Adicionar Invoices e Estimates
**Arquivo**: `src/components/layout/DesktopSidebar.tsx`
- Adicionar `Receipt` (Faturas) e `ClipboardList` (Orçamentos) ao array `navItems`
- Paths: `/invoices` e `/estimates`

#### 2. Dashboard — Contenção Desktop
**Arquivo**: `src/views/DashboardView.tsx`
- Header: No desktop, esconder avatar/logo duplicados (já estão na sidebar)
- Categories: Limitar grid a `lg:grid-cols-4` com gap adequado (já existe, verificar)
- Next Job card: Limitar `max-w-2xl` no desktop
- Checklist Base: Grid `lg:grid-cols-3 xl:grid-cols-4` (não 7 colunas)
- Today timeline: Limitar largura com `max-w-3xl`
- Weekly Progress / Quick Actions: Layout em grid `lg:grid-cols-2` lado a lado

#### 3. Properties — Grid Desktop
**Arquivo**: `src/views/PropertiesView.tsx`
- Trocar lista vertical `space-y-4` por grid: `lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4`
- Stats row já é grid-cols-3, OK

#### 4. Finance — Contenção
**Arquivo**: `src/views/FinanceView.tsx`
- Summary cards: `lg:grid-cols-2` (OK)
- Chart + Stats: Colocar lado a lado `lg:grid lg:grid-cols-2`
- Recent Payments: Limitar `max-w-4xl`

#### 5. Agenda — Ajustes menores
**Arquivo**: `src/views/AgendaView.tsx`
- Calendar + Timeline side by side no desktop: `lg:grid lg:grid-cols-[1fr_1fr] gap-6`

#### 6. DesktopLayout — Max width
**Arquivo**: `src/components/layout/DesktopLayout.tsx`
- Manter `max-w-6xl` mas reduzir para `max-w-5xl` para evitar conteúdo muito espalhado

### Resumo de arquivos
- `src/components/layout/DesktopSidebar.tsx` — adicionar Invoices + Estimates
- `src/components/layout/DesktopLayout.tsx` — ajustar max-width
- `src/views/DashboardView.tsx` — grids proporcionais, contenção
- `src/views/PropertiesView.tsx` — grid 2-3 colunas para cards
- `src/views/FinanceView.tsx` — layout lado a lado chart+stats
- `src/views/AgendaView.tsx` — calendar+timeline side by side

