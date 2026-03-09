

## Plano: Safe Area no Header do Relatório Público (Mobile)

### Problema
No celular, a barra de status/notch do iPhone sobrepõe o logotipo e o seletor de idioma no topo do relatório público, pois o posicionamento atual usa apenas `top-6` (24px) sem considerar o safe-area do dispositivo.

### Solução
Adicionar `padding-top` com safe-area inset no container do header hero do `PublicReport.tsx`, para que o logo e o language switcher fiquem abaixo da barra de status/notch.

### Mudanças

**Arquivo**: `src/pages/PublicReport.tsx`

1. **Logo** (linha ~465): Trocar `top-6` por `top-[max(1.5rem,env(safe-area-inset-top,0px)_+_1rem)]` ou usar uma abordagem mais simples com classe adicional de padding
2. **Language Switcher** (linha ~470): Mesmo ajuste de `top-6` para incluir safe-area
3. Abordagem prática: Envolver logo + language switcher num container absoluto com `pt-[env(safe-area-inset-top)]` + padding extra, ou simplesmente aumentar o `top` para `top-12 sm:top-6` com fallback CSS de safe-area

A forma mais limpa: adicionar um wrapper div posicionado no topo do hero com `padding-top: calc(env(safe-area-inset-top, 0px) + 1.5rem)` via style inline, contendo logo à esquerda e language switcher à direita.

### Arquivos
- `src/pages/PublicReport.tsx` — ajustar posicionamento do logo e language switcher no header hero

