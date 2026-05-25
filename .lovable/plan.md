# Correção do link público + redesign do PDF de Supplies

## 1. Bug: link público abre tela em branco

**Causa raiz (confirmada):** em `src/pages/PublicSupplyRequest.tsx`, o hook `useState(downloading)` está declarado **depois** dos `return` condicionais de loading/erro. Isso viola as Rules of Hooks do React — assim que o `useQuery` resolve com dados, a contagem de hooks muda entre renders e o React lança um erro, deixando a página em branco.

**Correção:** mover todos os hooks (`useState`, handlers) para o topo do componente, antes dos returns condicionais.

## 2. Redesign do PDF (`src/lib/supplyRequestPdf.ts`)

Objetivo: visual mais moderno, direto, sem menções à Lovable e com o logotipo respeitando a proporção original (sem "espremer").

### Mudanças visuais

- **Logo:** carregar com dimensões reais e renderizar dentro de uma caixa quadrada de 22mm mantendo `aspect-ratio` (calcular largura/altura proporcional a partir das dimensões naturais da imagem); adicionar um respiro extra à direita do logo. Nunca mais usar `addImage` com largura/altura fixa 18×18 sobre imagem retangular.
- **Header redesenhado:**
  - Faixa superior verde fina mantida.
  - Logo à esquerda em tamanho generoso, sem corte.
  - Título "SUPPLY REQUEST" alinhado à direita em tipografia maior, com data e ID curto logo abaixo em cinza claro.
  - Remover a linha "Luxury Eco-Friendly Cleaning" + "maisonpur.lovable.app · +1 (941)…" do topo (poluição visual; contato fica só no rodapé).
- **Bloco da propriedade:** cartão com fundo creme suave, nome em destaque e endereço em peso normal; badge de status arredondado à direita.
- **Itens:** mantidos agrupados por categoria, mas com:
  - Cabeçalho da categoria em verde-escuro sólido, texto branco.
  - Linhas com mais respiro vertical (espaçamento +30%).
  - Quantidade em destaque tipográfico maior à direita.
- **Notas:** caixa creme com barra lateral verde.
- **Remoções obrigatórias:**
  - Seção "View live online" + URL clicável → **removida totalmente** (usuário não quer expor link).
  - Qualquer referência a "lovable" no rodapé → trocar `maisonpur.lovable.app` por `maisonpurusa.com`.
- **Rodapé:** "Maison Pur · maisonpurusa.com · +1 (941) 330-4713" centralizado, discreto.

### Detalhes técnicos

- `loadLogo()` passa a retornar `{ dataUrl, width, height }` para preservar proporção.
- Helper `drawLogo(x, y, maxW, maxH)` calcula `scale = min(maxW/w, maxH/h)` e centraliza verticalmente.
- Nome do arquivo continua `supply-request-{slug}-{shortId}.pdf`.

## 3. Escopo

- **Arquivos alterados:**
  - `src/pages/PublicSupplyRequest.tsx` — reordenar hooks.
  - `src/lib/supplyRequestPdf.ts` — redesign completo do layout + carregamento de logo proporcional + remoção do link público e da string "lovable".
- **Sem mudanças** em banco de dados, RLS, rotas, ou no painel de inventário.

## 4. Verificação

- Abrir um link `/supplies/<token>` no preview → página renderiza normalmente.
- Gerar PDF a partir de um request existente → conferir logo sem distorção, ausência de qualquer URL/link e ausência da palavra "lovable".
