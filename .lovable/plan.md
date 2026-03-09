

## Plano: Inventário por Propriedade

Atualmente o inventário é global por usuário. Vamos reestruturar para que cada propriedade tenha seu próprio estoque de suprimentos.

### Alterações no Banco de Dados

**Adicionar coluna `property_id` à tabela `inventory`:**
- Nova coluna `property_id uuid` (nullable para backward compatibility, referenciando `properties.id`)
- Atualizar RLS para manter o mesmo modelo (user_id)
- Criar índice em `(user_id, property_id)`

### Alterações no Frontend

**1. `src/hooks/useInventory.ts`**
- Aceitar `propertyId` como parâmetro opcional
- Filtrar inventário por `property_id` quando fornecido
- Incluir `property_id` nos inserts

**2. `src/views/PropertyDetailsView.tsx`**
- Adicionar nova seção "Inventário / Suprimentos" na página de detalhes da propriedade
- Permitir adicionar, editar, remover itens de estoque diretamente no imóvel
- Mostrar alertas de estoque baixo

**3. Novo componente `src/components/PropertyInventory.tsx`**
- Lista de itens do inventário da propriedade com categorias
- Botão para adicionar novo item (nome, quantidade, unidade, threshold, categoria)
- Edição inline de quantidades
- Indicador visual de estoque baixo (abaixo do threshold)
- Botão de copiar inventário de outra propriedade (para facilitar setup inicial)

**4. `src/pages/Execution.tsx` e `src/views/ExecutionView.tsx`**
- Carregar inventário filtrado pelo `property_id` do job em execução
- O step de Inventory Check já funciona — só precisa receber os dados filtrados

**5. `src/types/index.ts`**
- Adicionar `propertyId?: string` ao `InventoryItem`

**6. Traduções em `src/contexts/LanguageContext.tsx`**
- Chaves para: título da seção, adicionar item, copiar de outra propriedade, estoque baixo, etc.

### Fluxo do Usuário

```text
Propriedade → Detalhes → Seção "Suprimentos"
  ├── Ver itens (toalhas, produtos, etc.)
  ├── Adicionar item (nome, qtd, unidade, limite)
  ├── Copiar de outra propriedade
  └── Alertas de estoque baixo

Execução de Job → Step "Inventário"
  └── Carrega itens da propriedade vinculada ao job
```

### Nenhuma breaking change
- Inventário existente (sem `property_id`) continua funcionando
- A coluna é nullable, então dados antigos não quebram

