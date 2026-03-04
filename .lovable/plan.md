

## Plano: Logo da Gota em Todos os Pontos do App

### Diagnóstico
O arquivo `public/logo-pur.jpeg` **não está sendo servido** pelo servidor de produção — ao acessar `https://maisonpur.lovable.app/logo-pur.jpeg`, o servidor retorna a página 404 do SPA em vez da imagem. Isso explica a imagem quebrada nas páginas públicas (Invoice e Report).

As telas internas (Login, Dashboard, etc.) usam `import purLogo from '@/assets/pur-logo.png'` — um import ES que o Vite processa e embute no bundle, funcionando de forma confiável. As páginas públicas usam `/logo-pur.jpeg` (caminho direto), que está falhando.

### Solução
Unificar **todos** os pontos do app para usar o mesmo mecanismo confiável: **ES import do asset** em `src/assets/`. O arquivo `image-7.png` enviado será usado como logo oficial.

### Alterações

| Ação | Detalhe |
|------|---------|
| Copiar `image-7.png` → `src/assets/pur-logo.png` | Substitui o arquivo antigo pelo novo logo da gota (PNG com transparência) |
| Copiar `image-7.png` → `public/logo-pur.png` | Backup para acesso direto por URL (edge functions, OG tags) |
| `src/pages/PublicInvoice.tsx` | Trocar `const purLogo = '/logo-pur.jpeg'` por `import purLogo from '@/assets/pur-logo.png'` |
| `src/pages/PublicReport.tsx` | Idem: usar ES import em vez de caminho direto |

### Arquivos que já funcionam (sem alteração necessária)
Estes já usam `import purLogo from '@/assets/pur-logo.png'` e receberão o novo logo automaticamente ao substituir o arquivo:
- `src/views/DashboardView.tsx`
- `src/views/LoginView.tsx`
- `src/views/ResetPasswordView.tsx`
- `src/pages/auth/Login.tsx`
- `src/pages/auth/ResetPassword.tsx`
- `src/lib/pdfGenerator.ts`

### Por que isso resolve
O ES import (`import x from '@/assets/...'`) faz o Vite processar a imagem e gerar uma URL com hash no bundle final. Isso é 100% confiável — não depende do servidor servir arquivos estáticos de `/public/`.

### Sobre créditos
Para solicitar reembolso de créditos, entre em contato com o suporte em **support@lovable.dev**.

### Sem alterações de banco de dados

