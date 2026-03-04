

## Plano: Headers 100% Transparentes

### Problema
Os headers ainda têm `rgba(255,255,255,0.3)` + `backdrop-filter: blur(20px)`, criando uma camada branca sutil. O usuário quer **zero** fundo — apenas o texto flutuando sobre os gradientes rosa/índigo do app.

### Alterações

Trocar o `style={{ background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(20px)' }}` por `style={{ background: 'transparent' }}` em **7 arquivos**:

| Arquivo | Linha |
|---------|-------|
| `src/views/DashboardView.tsx` | 111 |
| `src/views/AgendaView.tsx` | 140 |
| `src/views/PropertiesView.tsx` | 49 |
| `src/views/SettingsView.tsx` | 43 |
| `src/pages/Reports.tsx` | 123 |
| `src/pages/Invoices.tsx` | 27 |
| `src/pages/InvoiceHistory.tsx` | 31 |

Cada header mantém `sticky top-0 z-20 px-6 py-4` para posicionamento, mas o fundo fica totalmente transparente — os gradientes rosa/índigo do app ficam 100% visíveis atrás do texto.

### Sem alterações de banco de dados

