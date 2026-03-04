
Objetivo aprovado: corrigir apenas o logo dentro das páginas públicas de Invoice e Checklist Report, mantendo o brand social (mulher + gota) igual ao que já estava escolhido para iMessage/WhatsApp.

Diagnóstico (causa raiz)
- O problema não é de rota nem de banco.
- O `BrandLogo` tenta carregar a URL externa (`i.ibb.co`) e, em alguns acessos, recebe a imagem-placeholder “imgbb image not found” com resposta válida (HTTP 200), então `onError` não dispara.
- A validação atual de placeholder no `BrandLogo` está restrita demais (`<50x50`) e não captura esse placeholder (que é maior).
- Além disso, `src/assets/pur-logo.png` e `public/logo-pur.png` estão corrompidos (contêm screenshot), então não podem ser usados como fallback.
- O asset confiável no projeto é `public/logo-512.png` (gota correta).

Escopo exato da correção
1) Manter o brand de compartilhamento social (preview de WhatsApp/iMessage) sem alteração.
   - Não alterar `BRAND_OG_IMAGE`.
   - Não alterar o comportamento das funções de compartilhamento (`share-invoice` / `share-report`) para o card social.

2) Corrigir somente exibição do logo dentro dos relatórios públicos:
   - Invoice público (`/invoice/:token`)
   - Checklist report público (`/r/:token`)

Plano de implementação
1. Ajustar `src/lib/brand.ts`
- Definir o logo local estável (`/logo-512.png`) como fonte principal para renderização dentro do app.
- Manter a URL externa apenas como opcional/backup (não como primária).
- Preservar `BRAND_OG_IMAGE` atual (mulher + gota) para previews sociais.

2. Ajustar `src/components/BrandLogo.tsx`
- Tornar o fluxo resiliente para nunca mostrar placeholder azul do imgbb:
  - Carregar primeiro o logo local estável.
  - Se houver tentativa de URL externa, validar placeholder por dimensão realista (não só `<50x50`).
  - Em qualquer falha/placeholder, forçar `/logo-512.png`.
- Resultado: logo sempre visível no Invoice e no Report, sem depender de hotlink externo.

3. Garantir consumo nos pontos públicos
- Confirmar que `src/pages/PublicInvoice.tsx` e `src/pages/PublicReport.tsx` continuam usando `<BrandLogo />` (já usam), então a correção central no componente propaga para ambos automaticamente.

4. Alinhar PDF (consistência de marca)
- Ajustar `src/lib/pdfGenerator.ts` para usar a mesma prioridade de logo estável (local primeiro), evitando placeholder em exportações de relatório.

Validação fim a fim
1) Abrir um link real de invoice público enviado ao cliente e confirmar o logo da gota no cabeçalho.
2) Abrir um link real de checklist report público e confirmar o logo no topo/rodapé.
3) Colar o link no WhatsApp e no iMessage e confirmar que o card de preview continua com o brand anterior (mulher + gota), sem regressão.
4) Fazer um teste com `?v=timestamp` para evitar cache antigo de preview.

Detalhes técnicos (resumo)
- Arquivos-alvo:
  - `src/lib/brand.ts`
  - `src/components/BrandLogo.tsx`
  - `src/lib/pdfGenerator.ts`
  - (validação de uso) `src/pages/PublicInvoice.tsx`, `src/pages/PublicReport.tsx`
- Sem alterações de banco de dados.
- Sem mudanças de autenticação/permite público como já está.
