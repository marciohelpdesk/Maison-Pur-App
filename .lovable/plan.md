

## Plano: Melhorias no Relatório Público

### 3 Problemas identificados

1. **PDF não baixa** — `generatePublicReportPdf` usa `window.open(blobUrl)` que é bloqueado em iframes/sandboxes. Precisa usar `<a download>` como fallback.
2. **Falta botão "Download All Photos"** — Não existe opção para o cliente baixar todas as fotos de uma vez.
3. **PDF em português com layout básico** — O PDF gerado na página pública usa um gerador simples inline (jsPDF direto) com textos em português. Precisa de layout melhorado e conteúdo em inglês.

---

### Mudanças

#### 1. `src/pages/PublicReport.tsx` — Fix PDF download + Add "Download Photos" button

**Fix PDF download (linhas 97-244):**
- Alterar `generatePublicReportPdf` para retornar um `Blob` em vez de abrir `window.open()`
- No `onClick` do botão, usar `document.createElement('a')` com `download` attribute como primary, e `window.open` como fallback
- Isso resolve o bloqueio em sandboxes e iframes

**Add "Download All Photos" button (abaixo do botão de PDF, ~linha 639):**
- Novo botão "Download Photos" que aparece apenas se houver fotos
- Ao clicar, faz fetch de todas as `photo_url` como blobs, empacota num ZIP usando JSZip, e dispara download
- Dependência: adicionar `jszip` ao projeto

**Tradução "downloadPhotos":**
- Adicionar chave `downloadPhotos` nas 5 línguas do objeto `translations`
- Adicionar chave `downloadingPhotos` para estado de loading

#### 2. `src/pages/PublicReport.tsx` — PDF layout melhorado e em inglês

Reescrever `generatePublicReportPdf` com:
- **Textos em inglês**: "Cleaning Inspection Report", "Property", "Date", "Completion", "Tasks", "Duration", "Rooms", "Checklist", "Damages Reported", "Notes"
- **Layout melhorado**:
  - Header bar mais elegante com gradiente stone-900
  - Property name com fonte maior e espaçamento adequado
  - Summary box com 4 stats em grid com ícones de texto (✓, 📷, ⏱, 🏠)
  - Room sections com header colorido (#717D62 — a cor da marca) e progress bar
  - Checklist items com checkmarks visuais (✓ / ○) e zebra striping
  - Damages section com severity badges
  - Footer com "© Maison Pur • maisonpurusa.com" e page numbers
  - Melhor uso de espaço e tipografia (hierarquia clara de fontes)

#### 3. `package.json` — Adicionar JSZip

- Instalar dependência `jszip` para empacotamento de fotos em ZIP

### Arquivos a modificar
- `src/pages/PublicReport.tsx` — fix download, novo botão, PDF reescrito
- `package.json` — adicionar `jszip`

