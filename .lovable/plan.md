

## Plano: Imagem de fundo nos cards de Checklist Base

### O que muda

**Arquivo:** `src/views/DashboardView.tsx`

1. **Copiar a imagem** do upload para `src/assets/checklist-bg.png`

2. **Importar a imagem** no componente: `import checklistBg from '@/assets/checklist-bg.png'`

3. **Alterar os cards de checklist** (linhas 251-264):
   - Remover o emoji (`tmpl.icon`) — a linha `<span className="text-3xl mb-2 block">{tmpl.icon}</span>` é removida
   - Adicionar a imagem como `backgroundImage` no card com `bg-cover bg-center`
   - Adicionar overlay escuro semi-transparente para manter legibilidade do texto
   - Texto passa a ser branco sobre o overlay

4. **Remover o campo `icon`** da definição dos templates (linhas 92-99), já que não será mais usado

### Resultado visual
Cards com a foto da profissional de limpeza como fundo, overlay escuro, texto branco com título e contagem de tarefas. A borda lateral colorida (`border-l-4`) é mantida para diferenciar os tipos.

### Sem alterações de banco de dados

