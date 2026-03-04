
Problema real identificado (com causa raiz)
- Você não está vendo o logo no formulário e no report porque a URL configurada em `src/lib/brand.ts` (`https://i.ibb.co/yBMkg7CV/Design-sem-nome.png`) está retornando placeholder/404 do i.ibb em runtime.
- O arquivo antigo local também está corrompido: `src/assets/pur-logo.png` (e `public/logo-pur.png`) contém uma captura de invoice com “imgbb image not found”, não o logo.
- Existe um logo válido no projeto: `public/logo-512.png` (gota correta).

Do I know what the issue is?
- Sim. O app está apontando para uma origem externa instável/indisponível e, quando ela falha, cai em imagem inválida (ou em asset local corrompido).

Arquivos onde o erro aparece hoje
- Formulários/auth:
  - `src/pages/auth/Login.tsx`
  - `src/pages/auth/ResetPassword.tsx`
  - `src/views/LoginView.tsx`
  - `src/views/ResetPasswordView.tsx`
- Report/Invoice públicos:
  - `src/pages/PublicReport.tsx`
  - `src/pages/PublicInvoice.tsx`
- Outros pontos de branding:
  - `src/views/DashboardView.tsx`
  - `src/lib/pdfGenerator.ts`
  - `src/lib/brand.ts`

Plano de correção (definitivo)
1) Blindar branding central
- Atualizar `src/lib/brand.ts` para manter:
  - URL externa oficial (como primary)
  - fallback local confiável (`/logo-512.png`)
- Exemplo de estratégia: `BRAND_LOGO_PRIMARY`, `BRAND_LOGO_FALLBACK`, `BRAND_LOGO_URLS`.

2) Criar componente único de logo resiliente
- Criar `src/components/BrandLogo.tsx` para substituir `<img>` direto.
- Regras no componente:
  - `src` inicial = URL externa oficial.
  - `onError` -> troca para fallback local.
  - `onLoad` -> valida se imagem carregada é “placeholder” (ex.: dimensões muito pequenas / padrão de erro) e troca para fallback.
  - aplicar `referrerPolicy="no-referrer"` para reduzir bloqueio por hotlink.
- Resultado: continua priorizando o link que você enviou, mas sem quebrar visual quando ele falhar.

3) Aplicar o componente nos pontos visíveis (form e report + consistência geral)
- Trocar todos os `<img src={purLogo}>` por `<BrandLogo .../>` em:
  - `src/pages/auth/Login.tsx`
  - `src/pages/auth/ResetPassword.tsx`
  - `src/views/LoginView.tsx`
  - `src/views/ResetPasswordView.tsx`
  - `src/pages/PublicReport.tsx` (logo do topo e logo do footer)
  - `src/pages/PublicInvoice.tsx`
  - `src/views/DashboardView.tsx`

4) Corrigir logo no PDF/report exportado
- Em `src/lib/pdfGenerator.ts`, alterar `loadLogo()` para tentar múltiplas fontes:
  - 1º URL externa oficial
  - 2º fallback local `/logo-512.png`
- Validar imagem carregada antes de embutir (evitar salvar “imgbb not found” no PDF).

5) Pequena limpeza de consistência
- Em `src/pages/PublicReport.tsx`, trocar `ogUrl` hardcoded por `BRAND_OG_IMAGE` de `src/lib/brand.ts`.

Validação fim a fim (obrigatória)
1. Abrir `/login` e `/reset-password`: logo deve aparecer.
2. Abrir um link público de report `/r/:token`: logo do topo e footer devem aparecer.
3. Abrir um link público de invoice `/invoice/:token`: logo no header deve aparecer.
4. Gerar PDF de report: logo deve sair correto no documento.
5. Testar com cache-buster (`?v=timestamp`) para garantir que não é cache antigo.

Banco de dados
- Sem mudanças de banco.
