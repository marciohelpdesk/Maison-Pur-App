

## Plano: Uniformizar headers — remover gradiente teal e aplicar fundo transparente aero

### Problema
Três páginas ainda usam o antigo gradiente teal escuro (`hsl(160 35% 18%)`) no header: **Reports**, **Invoices** e **InvoiceHistory**. Isso cria uma faixa verde/escura no topo que destoa do novo design "Frosted Cloud Geometry" transparente usado nas demais páginas (Dashboard, Agenda, Properties, Settings).

### Alterações

| Arquivo | O que muda |
|---------|-----------|
| `src/pages/Reports.tsx` | Header: trocar gradiente teal por `rgba(255,255,255,0.7)` + `backdrop-filter: blur(20px)`. Texto de `text-white` para `text-foreground` e `text-white/70` para `text-muted-foreground`. |
| `src/pages/Invoices.tsx` | Mesmo: fundo translúcido, texto escuro. Botão back de `text-white/80` para `text-muted-foreground`. Tabs ativas de `bg-white/20 text-white` para estilo consistente com o tema. |
| `src/pages/InvoiceHistory.tsx` | Mesmo: fundo translúcido, texto escuro. Botão back adaptado. |

### Padrão aplicado (igual às views já corrigidas)
```css
style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)' }}
```
- Títulos: `text-foreground` (escuro)
- Subtítulos: `text-muted-foreground`
- Botões de ação: adaptados para cores escuras/primary

### Sem alterações de banco de dados

