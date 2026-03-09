

## Plano: Melhorias de Design no Dossiê Digital

### 1. Adicionar Resumo Executivo (novo bloco após info card)
- Card com estatísticas gerais: total de tarefas completas (%), total de fotos, damages count, duração
- Barra de progresso visual mostrando completion rate
- Posição: entre o info card e o primeiro cômodo

### 2. Navegação Rápida por Cômodos
- Barra sticky horizontal com pills/chips dos nomes dos cômodos
- Click scroll suave para a seção correspondente
- Indicador visual do cômodo ativo (scroll spy)
- Posição: abaixo do info card, sticky no topo ao scrollar

### 3. Corrigir ordem mobile (fotos vs checklist)
- No mobile, mostrar checklist ANTES das fotos (inverter order)
- Manter layout desktop: checklist esquerda, fotos direita

### 4. Eliminar "No photos" vazio
- Quando não há fotos, expandir checklist para largura total (12 cols)
- Remover o placeholder cinza "No photos"

### 5. Melhorar cards de Damages
- Fotos de damages maiores (80px em vez de 48px)
- Adicionar badge de severidade mais destacado
- Border colorida mais visível

### 6. Traduzir "Before & After"
- Adicionar chave de tradução para o título da seção
- Substituir emoji 📸 por ícone SVG no badge circular
- Traduzir labels "Before"/"After" nos badges das fotos

### 7. Footer enriquecido
- Adicionar linha de contato (email, telefone)
- Logo maior e mais visível
- Powered by Maison Pur com link

### Arquivos a modificar
- `src/pages/PublicReport.tsx` — todas as alterações de layout e novos componentes inline

### Nenhuma alteração de banco de dados necessária
Todas as mudanças são puramente visuais/frontend.

