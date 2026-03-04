

## Plano: Headers Transparentes Aero em Todas as Telas Principais

### Problema
A página **Reports** (`src/pages/Reports.tsx`) ainda usa o gradiente teal antigo no header (linha 123):
```
background: 'linear-gradient(to bottom, hsl(160 35% 18%) 0%, hsl(160 40% 30%) 60%, transparent 100%)'
```
com texto `text-white`, criando uma faixa verde escura destacada no topo.

As demais telas (Dashboard, Agenda, Properties, Settings, Invoices, InvoiceHistory) já usam `rgba(255,255,255,0.7)` + `backdropFilter: blur(20px)`, porém essa opacidade de 0.7 cria uma faixa branca semi-opaca que também se destaca sobre o fundo pastel.

O objetivo é tornar **todos os headers mais transparentes**, permitindo que os gradientes rosa/índigo do fundo do app sejam visíveis através deles.

### Alterações

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Reports.tsx` (linha 123) | Substituir gradiente teal por fundo transparente aero. Texto de `text-white` para `text-foreground`. |
| `src/views/DashboardView.tsx` (linha 111) | Reduzir opacidade do header de `0.7` para `0.3` para maior transparência. |
| `src/views/AgendaView.tsx` (linha 140) | Idem: opacidade `0.3`. |
| `src/views/PropertiesView.tsx` (linha 49) | Idem: opacidade `0.3`. |
| `src/views/SettingsView.tsx` (linha 43) | Idem: opacidade `0.3`. |
| `src/pages/Invoices.tsx` (linha 27) | Idem: opacidade `0.3`. |
| `src/pages/InvoiceHistory.tsx` (linha 31) | Idem: opacidade `0.3`. |

### Estilo unificado aplicado
```css
background: rgba(255, 255, 255, 0.3);
backdrop-filter: blur(20px);
```
- Títulos: `text-foreground` (escuro, legível)
- Subtítulos: `text-muted-foreground`
- Fundo muito mais transparente, revelando os gradientes rosa/índigo do app

### Sem alterações de banco de dados

