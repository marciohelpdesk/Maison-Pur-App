## Remover badge "SENT" do PDF de Supply Request

### Problema
No header do PDF, ao lado da propriedade, aparece um badge laranja "SENT" (ou "DRAFT"/"FULFILLED"). Visualmente parece um botão de UI clicável — não combina com um documento profissional impresso.

### Decisão
**Remover o badge de status completamente.** O status do pedido é uma informação interna do sistema (rastreada no app), não algo que precise aparecer no documento físico enviado a um fornecedor/cliente. O espaço fica mais limpo e o foco vai para o nome da propriedade.

### Em vez do badge, usar o espaço para algo realmente útil
No canto superior direito do cartão da propriedade, adicionar de forma discreta e tipográfica (sem caixa colorida):

- **"REQUESTED BY"** em label pequeno verde
- **"Maison Pur"** logo abaixo, em peso semibold stone-900
- **Data por extenso** (ex: "May 24, 2026") em stone-500 menor

Isso reforça a autoria do documento e dá contexto profissional — substituindo o ruído visual do badge por informação de valor.

### Arquivo alterado
- `src/lib/supplyRequestPdf.ts` — bloco da propriedade (seção PROPERTY BLOCK): remover o `roundedRect` do badge + texto "SENT" e adicionar o bloco "REQUESTED BY / Maison Pur / data" alinhado à direita dentro do mesmo cartão creme.

### Sem mudanças em
- Página pública (`PublicSupplyRequest.tsx`) — lá o status ainda faz sentido como contexto online, mas se preferir também removo de lá, é só sinalizar.
- Banco de dados, RLS, hooks ou painel de inventário.

### Verificação
Gerar PDF de um request e conferir que: (1) não há mais o badge laranja, (2) o cartão da propriedade está equilibrado, (3) a data/autoria aparece à direita de forma discreta.
