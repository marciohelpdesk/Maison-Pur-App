

## Plano: Forçar logo do URL externo em TODOS os pontos do app

### Problema encontrado
O código das páginas públicas (PublicInvoice, PublicReport, pdfGenerator) **já foi atualizado** para usar `BRAND_LOGO_URL`. Porém, **5 arquivos ainda usam o asset local corrompido** `@/assets/pur-logo.png`:

| Arquivo | Status |
|---------|--------|
| `src/pages/auth/Login.tsx` | Usa asset local corrompido |
| `src/pages/auth/ResetPassword.tsx` | Usa asset local corrompido |
| `src/views/LoginView.tsx` | Usa asset local corrompido |
| `src/views/ResetPasswordView.tsx` | Usa asset local corrompido |
| `src/views/DashboardView.tsx` | Usa asset local corrompido |

Além disso, o app pode não ter sido **publicado** após as últimas alterações, então os links públicos ainda servem a versão antiga.

### Alterações

1. **Atualizar os 5 arquivos restantes** para usar `BRAND_LOGO_URL` de `src/lib/brand.ts` em vez do import local corrompido:
   - `src/pages/auth/Login.tsx`
   - `src/pages/auth/ResetPassword.tsx`
   - `src/views/LoginView.tsx`
   - `src/views/ResetPasswordView.tsx`
   - `src/views/DashboardView.tsx`

2. **Adicionar fallback `onError`** em todos os `<img>` do logo para exibir texto alternativo caso o host externo fique indisponível.

### Sem alterações de banco de dados

