## Contexto
A aba **History** em `PropertySuppliesPanel.tsx` (linha 469-472) já possui um estado vazio, porém é apenas um texto simples (`<p>No requests sent yet.</p>`). O usuário deseja algo mais visual, profissional e completo.

## Alterações
1. **Substituir** o texto simples por um componente de estado vazio rico contendo:
   - Ícone ilustrativo (`ClipboardList` ou `FileText`) com opacidade reduzida
   - Título em destaque: "No supply requests yet"
   - Descrição curta explicando como criar uma solicitação
   - Botão de ação que troca para a aba "Request" para iniciar o fluxo

2. **Arquivo alvo:** `src/components/supplies/PropertySuppliesPanel.tsx` (linhas 468-473)

3. **Estilo:** seguir o padrão do projeto — ícone centralizado, tipografia usando tokens do design system (`text-muted-foreground`, `font-semibold`), padding generoso e borda tracejada opcional para manter consistência com o estado vazio de "no properties" em `SuppliesView.tsx`.

## Não inclui
- Nenhuma mudança em lógica de dados, hooks, RLS ou banco
- Nenhuma alteração nas outras abas (Inventory, Request)