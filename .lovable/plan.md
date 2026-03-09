

## Problema

O PDF Preview Modal usa um `<iframe>` com blob URL para exibir o PDF. Em navegadores móveis e dentro do iframe do Lovable, isso não funciona — o iframe fica em branco como mostra a screenshot.

## Solução

Substituir o iframe por uma **prévia HTML estilizada** do relatório diretamente no modal. Em vez de tentar renderizar o PDF dentro de um iframe (que falha em mobile), mostramos um resumo visual bonito com as mesmas informações do relatório: capa, estatísticas, checklist resumido, fotos, etc. O botão de download continua gerando e baixando o PDF real.

### Alterações

**1. `src/components/execution/PdfPreviewModal.tsx`**
- Remover o iframe e a lógica de blob URL para preview
- Aceitar os dados do relatório como props (`job`, `responsibleName`)
- Renderizar um preview HTML estilizado com:
  - Header com logo e nome da propriedade
  - Cards de estatísticas (duração, tarefas, fotos)
  - Resumo do checklist por seção (progresso)
  - Contagem de damages e lost & found
  - Thumbnails das fotos (antes/depois)
  - Nota do responsável
- Manter o botão "Download PDF" que gera e baixa o PDF real
- Remover controles de zoom (não necessários para HTML)

**2. `src/components/execution/SummaryStep.tsx`**
- Passar `job` e dados necessários para o `PdfPreviewModal` em vez de gerar o blob antecipadamente
- Mover a geração do PDF para o momento do download (não do preview)
- Simplificar o fluxo: abrir modal mostra preview HTML instantâneo, download gera PDF on-demand

### Resultado
- Preview aparece instantaneamente (sem loading de PDF)
- Funciona em qualquer navegador/dispositivo
- Download continua gerando o PDF profissional completo

