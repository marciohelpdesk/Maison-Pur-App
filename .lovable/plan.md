## Otimização visual do Supplies Audit

A página de auditoria de suprimentos hoje fica espaçada demais, sobretudo quando o usuário marca "Low/Out" e abre o painel de detalhes. Além disso, só existe um botão genérico "Adicionar item" no final da lista, sem referência clara da categoria — diferente do que acontece na seção de Lavanderia/Cozinha, onde só aparece a opção de remover.

### Mudanças (apenas em `src/components/execution/SuppliesAuditStep.tsx`)

**1. Densidade e hierarquia visual**
- Reduzir padding das linhas (`p-3` → `px-3 py-2`) e do header (gap menor, sem `mb-2` extra).
- Substituir `divide-white/10` por linhas mais sutis e adicionar um leve fundo alternado / hover para melhor distinção entre itens.
- Diminuir altura dos botões de status (OK/Low/Out) — chips compactos com ícone (check/alert/x) + label curto, em vez do bloco atual.
- Encolher o painel expandido: input + unidade na mesma linha (h-8), textarea com `min-h-[44px]`, miniatura de foto 16×16 em vez de 24×24, gap `space-y-1.5`.
- Header da seção (categoria) menor e mais grudado no card (`mb-1`, `mt-3`).
- Banner de "X precisam de reposição" mais fino (`py-1.5`).

**2. Botão "Adicionar" por categoria (resolve a falta de referência)**
- No cabeçalho de cada categoria, ao lado do título ("LAUNDRY", "KITCHEN", etc.), adicionar um botão `+` discreto.
- Clicar abre o mesmo formulário inline, **já com a categoria pré-selecionada** (passa `cat` para `setCustomCategory` e abre `showAddForm`), e o formulário renderiza logo abaixo daquele grupo em vez de no rodapé.
- Manter o botão "+ Add custom item" geral no final, mas como fallback secundário (mais discreto).

**3. Microajustes**
- Auto-focus no input ao abrir o formulário.
- Permitir Enter para confirmar adição.
- Animação de entrada de novos itens via `layout` do framer-motion (já está em uso no projeto) para feedback rápido.

### Detalhes técnicos
- Sem mudanças em tipos, hooks, dados ou backend.
- Estado novo: `addingInCategory: SupplyCategory | null` para saber onde renderizar o formulário inline.
- Reaproveitar `addCustom()` existente; apenas usar `customCategory` setado pelo botão da seção.
- Sem mudanças em `src/data/supplies.ts` nem em traduções (reaproveita chaves existentes `exec.supplies.addItem`, `exec.supplies.newItem`, etc.).

### Fora de escopo
- Lógica de persistência, PDF e tipos permanecem intactos.
- Sem alterações em outras etapas (Checklist, Damage, Lost & Found).
