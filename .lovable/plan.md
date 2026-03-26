

## Plano: Corrigir PDF do Relatório Público

### 3 Problemas no PDF

1. **Checkmark "✓" aparece como "E"** — jsPDF com fonte helvetica não suporta o caractere Unicode ✓. Precisa substituir por um desenho vetorial (linhas do PDF) ou usar a letra "v" estilizada como já feito no `pdfGenerator.ts` interno.

2. **Logo ausente** — O `generatePublicReportPdf` não carrega nem insere o logo. Precisa carregar `/logo-512.png` via canvas→dataURL e inserir no header do PDF.

3. **Falta campo de assinatura** — O footer atual só tem copyright e page number. Precisa de uma linha de assinatura com texto "Inspector Signature" abaixo.

### Sobre o botão "Download Photos"

O botão já existe no código (linha 797) e aparece **somente quando há fotos no relatório** (`photos.length > 0`). Se o relatório não tem fotos associadas, o botão não aparece — esse é o comportamento correto e esperado.

---

### Mudanças

#### `src/pages/PublicReport.tsx` — função `generatePublicReportPdf`

**1. Fix checkmark (linha 260):**
- Substituir `doc.text('✓', ...)` por desenho vetorial: duas linhas formando um "V" (check) usando `doc.line()`
- Substituir `doc.text('○', ...)` por `doc.circle()` vazio
- Isso garante renderização correta em qualquer fonte

**2. Adicionar logo no header (linhas 142-161):**
- Antes de gerar o PDF, carregar `/logo-512.png` via `Image` → canvas → `toDataURL('image/png')`
- Tornar `generatePublicReportPdf` **async** para aguardar o carregamento
- Inserir o logo no canto esquerdo do header bar escuro (ao lado de "MAISON PUR")
- Atualizar `handleDownloadPdf` para usar `await`

**3. Adicionar campo de assinatura no footer (após linha 338):**
- Antes do footer de copyright, adicionar uma seção com:
  - Linha horizontal para assinatura (~60mm)
  - Texto "Inspector Signature" centralizado abaixo da linha
  - Nome do cleaner abaixo
- Posicionar acima do footer existente

### Arquivo a modificar
- `src/pages/PublicReport.tsx` — 3 correções na função `generatePublicReportPdf`

