

## Plano: Substituir logo externo quebrado por asset local

### Problema
O logotipo da Maison Pur está hospedado no imgbb (`https://i.ibb.co/LXGHmRYY/Logo-solo.png`) e o link quebrou — aparece "image not found" nas páginas públicas de Invoice e Report.

### Solução
Copiar o logotipo enviado pelo usuário (`logotipo.jpeg`) para o projeto como asset local e referenciar em todos os lugares onde o logo quebrado é usado.

### Alterações

| Ação | Detalhe |
|------|---------|
| Copiar `logotipo.jpeg` para `public/logo-pur.jpeg` | Usa `public/` pois as páginas públicas (Invoice/Report) precisam de URL direta, não import ES6 |
| `src/pages/PublicInvoice.tsx` (linha 5) | Trocar `purLogo` de URL imgbb para `/logo-pur.jpeg` |
| `src/pages/PublicReport.tsx` (linha 6) | Idem: `/logo-pur.jpeg` |

### Nota
Os OG images (`Branding.png`) no `index.html`, `share-report` e `share-invoice` usam uma URL imgbb diferente que ainda funciona — não serão alterados agora.

### Sem alterações de banco de dados

