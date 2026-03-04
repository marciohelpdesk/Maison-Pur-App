

## Correção: Atualizar website para maisonpurusa.com na Invoice Pública

### Problema
A página pública da invoice (`PublicInvoice.tsx`) exibe o website como `maisonpur.com` em 3 locais, quando o correto é `maisonpurusa.com`.

O relatório público (`PublicReport.tsx`) já usa `maisonpurusa.com` corretamente.

### Alterações

**Arquivo:** `src/pages/PublicInvoice.tsx` — 3 correções:

1. **Header** (linha 67): link e texto `maisonpur.com` → `maisonpurusa.com`
2. **Pagamento** (linha 286): texto `maisonpur.com` → `maisonpurusa.com`
3. **Footer** (linha 311): texto `maisonpur.com` → `maisonpurusa.com`

### Sem alterações de banco de dados.

