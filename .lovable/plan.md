

## Plano: Indicadores visuais de scroll na navegação de cômodos (mobile)

### Problema
No mobile, a barra de navegação por cômodos é scrollável horizontalmente, mas não há nenhuma dica visual informando o cliente que existem mais opções à direita. O usuário pode não perceber que pode deslizar.

### Solução
Adicionar ao componente de navegação sticky (linhas ~546-580 de `PublicReport.tsx`):

1. **Seta animada à direita** — Um indicador com ícone de chevron (`›`) que pulsa suavemente com animação CSS, posicionado no lado direito da barra. Ele aparece apenas quando há conteúdo para scrollar à direita e desaparece automaticamente quando o usuário atinge o final.

2. **Gradiente de fade** — Um gradiente semi-transparente (fade-out) no lado direito da barra, reforçando visualmente que há mais conteúdo oculto. O gradiente esquerdo aparece quando há scroll para a esquerda.

3. **Lógica de detecção de scroll** — Um `useEffect` + `onScroll` listener no container `overflow-x-auto` para detectar:
   - `canScrollRight`: mostra seta + gradiente direito
   - `canScrollLeft`: mostra gradiente esquerdo
   - Atualiza ao scroll e ao resize

4. **Auto-hide após interação** — A seta some depois que o usuário faz o primeiro swipe, para não poluir a interface.

### Arquivo a modificar
- `src/pages/PublicReport.tsx` — seção "Sticky Room Navigation" (linhas 546-580)

### Sem alterações de banco de dados

