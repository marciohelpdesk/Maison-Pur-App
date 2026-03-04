
Plano aprovado para resolver de forma definitiva o problema do link que aparece como “código” em vez do card + invoice.

### Diagnóstico objetivo (o que encontrei)
1. O botão **Copy link** de invoice ainda copia URL da **função de backend** (`.../functions/v1/share-invoice?...`), não a URL pública da invoice.
2. Essa URL da função está sendo interpretada por alguns apps de mensagem como texto/arquivo, por isso aparece “código”.
3. O preview de mensageiros (iMessage/WhatsApp) também faz cache agressivo por URL; quando a URL é igual, ele reaproveita preview antigo.
4. A rota pública `https://maisonpur.lovable.app/invoice/:token` já existe e é a forma mais estável para abrir a invoice no cliente.

### Implementação proposta
1. **Trocar a geração de link compartilhado para URL pública direta (produção)**  
   - Invoice: `https://maisonpur.lovable.app/invoice/${token}`
   - Report: `https://maisonpur.lovable.app/r/${token}`
2. **Adicionar cache-buster no link copiado** (para forçar novo card nos mensageiros):  
   - Exemplo: `?v=${Date.now()}`
   - Isso evita que o cliente veja preview antigo em cache.
3. **Manter branding oficial no card** com a imagem:
   - `https://i.ibb.co/1Yh2WJjw/Branding.png`
   - Confirmar nas metas globais e nos pontos dinâmicos já existentes.
4. **Endurecer as funções de compartilhamento como fallback** (para links antigos que já foram enviados):
   - Garantir `Content-Type: text/html; charset=utf-8`
   - Garantir `og:image` com a imagem oficial
   - Ajustar cache para reduzir respostas antigas
5. **Publicar e validar ponta a ponta** com link novo (não reutilizar link antigo sem cache-buster).

### Arquivos que serão ajustados
- `src/components/InvoiceSection.tsx` (copyLink)
- `src/components/InvoiceHistoryContent.tsx` (copyLink)
- `src/pages/Reports.tsx` (getShareUrl)
- `supabase/functions/share-invoice/index.ts` (fallback de links antigos)
- `supabase/functions/share-report/index.ts` (fallback de links antigos)
- `index.html` (apenas validação final de OG/Twitter image)

### Resultado esperado
- Ao copiar e enviar o link público para o cliente, ele verá **card com a imagem Branding** (em vez de código).
- Ao abrir o link, cairá direto na **invoice pública**.
- Links antigos continuarão funcionando via fallback.

### Observação importante
Mesmo após correção, previews antigos em iMessage podem permanecer para a **mesma URL**. Por isso, o `?v=timestamp` no link copiado é parte essencial da solução.

### Banco de dados
- **Sem alterações de banco**.
