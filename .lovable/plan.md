

## Plano: Melhorar seção "Checklist Base" com todas as categorias e interatividade

### Situação atual
- A seção "Checklist Base" no Dashboard tem 4 templates estáticos (Airbnb Premium, Residencial, Comercial, Pós-obra) sem ação ao clicar
- O sistema possui 7 templates de checklist: Standard, Airbnb, Deep Clean, Move-in/out, Recurring, Post Construction, Commercial
- Os cards não têm `onClick` — são visuais apenas

### Mudanças em `src/views/DashboardView.tsx`

**1. Expandir `checklistTemplates` para incluir todas as 7 categorias** com dados reais calculados a partir dos templates:

| Template | Ícone | Cor | Cômodos | Tarefas |
|---|---|---|---|---|
| Airbnb Premium | 🏠 | orange | 7 seções | 42 tarefas |
| Residencial | 🏡 | emerald | 5 seções | 27 tarefas |
| Deep Clean | 🧹 | blue | 5 seções | 45 tarefas |
| Move-in/out | 📦 | purple | 5 seções | 47 tarefas |
| Recorrente | 🔄 | teal | 5 seções | 24 tarefas |
| Pós-obra | 🔨 | amber | 6 seções | 37 tarefas |
| Comercial | 🏢 | slate | 6 seções | 36 tarefas |

**2. Adicionar interatividade ao clicar** — Abrir um Drawer com:
- Nome do template e ícone
- Lista das seções com contagem de tarefas
- Botão "Criar Job com este template" que navega para `/agenda`

**3. Remover botão "Ver todos"** (já que todas as categorias estarão visíveis no scroll horizontal)

### Seção técnica
- Arquivo: `src/views/DashboardView.tsx`
- Adicionar estado `selectedTemplate` (número | null)
- Importar os templates de `src/data/checklist.ts` para calcular dados reais
- Adicionar segundo `Drawer` para exibir detalhes do template selecionado

