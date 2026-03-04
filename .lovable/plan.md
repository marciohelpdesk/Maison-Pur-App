
## Plano aprovado: forçar o logo oficial desse URL em todos os pontos de Reports + Invoices

### Diagnóstico (causa real do erro)
O arquivo `src/assets/pur-logo.png` está com conteúdo incorreto (uma captura de invoice com ícone quebrado), por isso o app continua mostrando “imagem quebrada” mesmo após mudanças anteriores.  
Para encerrar isso de vez, vamos parar de depender desse asset local nos fluxos de relatório/fatura e usar o logo oficial diretamente do URL que você enviou:

`https://i.ibb.co/yBMkg7CV/Design-sem-nome.png`

### Escopo
Aplicar o logo oficial em **todos os pontos de branding** de:
- Reports (incluindo checklist/report público e PDF do relatório)
- Invoices (invoice público)
- Metadados de compartilhamento (preview social de report/invoice)

---

### Detalhes técnicos (arquivos e mudanças)

1. **Centralizar URL oficial da marca**
- Criar constante única de branding (ex.: `src/lib/brand.ts`) com:
  - `BRAND_LOGO_URL = "https://i.ibb.co/yBMkg7CV/Design-sem-nome.png"`

2. **Atualizar páginas públicas**
- `src/pages/PublicReport.tsx`
  - Trocar `import purLogo from '@/assets/pur-logo.png'` por constante de branding.
  - Atualizar `<img src={...}>` do logo para usar `BRAND_LOGO_URL`.
  - Atualizar `ogUrl` do `useEffect` para o mesmo URL oficial.
- `src/pages/PublicInvoice.tsx`
  - Trocar `import purLogo from '@/assets/pur-logo.png'` por constante de branding.
  - Atualizar `<img src={...}>` do cabeçalho para o URL oficial.

3. **Atualizar geração de PDF de checklist/report**
- `src/lib/pdfGenerator.ts`
  - Remover dependência de `@/assets/pur-logo.png`.
  - Carregar o logo via `BRAND_LOGO_URL` no `loadLogo()` para o PDF usar exatamente a marca oficial.

4. **Atualizar previews de compartilhamento (OG/Twitter)**
- `supabase/functions/share-report/index.ts`
  - `OG_IMAGE` → URL oficial enviado.
- `supabase/functions/share-invoice/index.ts`
  - `OG_IMAGE` → URL oficial enviado.

5. **Blindagem contra quebra visual**
- Nos `<img>` críticos de Report/Invoice, incluir fallback visual (`onError`) para evitar ícone quebrado caso o host externo fique indisponível.

---

### Validação (fim-a-fim)
1. Abrir um link público de invoice (`/invoice/:token`) e confirmar o logo correto no topo.
2. Abrir um link público de report (`/r/:token`) e confirmar o logo correto no header.
3. Gerar/abrir PDF de relatório e confirmar o logo correto na capa.
4. Compartilhar links de report/invoice e verificar preview (WhatsApp/iMessage) com imagem atualizada.
5. Forçar refresh com cache-buster (`?v=timestamp`) para garantir que não é cache antigo.

### Banco de dados
Sem mudanças de banco.
