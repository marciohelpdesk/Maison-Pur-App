

## Plano: Corrigir download do PDF no PC e adicionar logotipo

### Problemas
1. **Download no PC não funciona**: O código usa `window.open(blobUrl, '_blank')` como método principal — bloqueado por popup blockers em navegadores desktop. O fallback com `<a>` também tem `target: '_blank'` desnecessário.
2. **Logotipo no PDF**: O logo já aparece na capa e rodapé, mas o usuário quer que fique mais visível/proeminente no relatório.

### Solução

#### 1. Corrigir download (PdfPreviewModal.tsx)
- Inverter a lógica: usar `<a download>` como método **primário** (funciona sempre em desktop)
- Usar `window.open` apenas como **fallback** para mobile (onde `<a download>` pode não funcionar em iframes)
- Remover `target: '_blank'` do anchor

#### 2. Logotipo mais visível no PDF (pdfGenerator.ts)
- Aumentar o tamanho do logo na **capa** de 36x36mm para 42x42mm
- Adicionar logo no início de cada **página de conteúdo** (drawPageHeader) ao lado do nome "MAISON PUR"
- Aumentar logo no **rodapé** de 10x10mm para 12x12mm

### Arquivos a modificar
- `src/components/execution/PdfPreviewModal.tsx` — lógica de download
- `src/lib/pdfGenerator.ts` — tamanho do logo na capa, header de página e rodapé

