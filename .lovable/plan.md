

## Correção: Remover o sinal "@" do valor nos line items da invoice pública

### Problema
Na página pública da invoice (`/invoice/:token`), cada line item exibe o preço no formato `@ $220.00`. O usuário quer remover o `@`.

### Alteração
**Arquivo:** `src/pages/PublicInvoice.tsx` (linha 198)

Mudar de:
```
<span>@ ${Number(li.rate || li.total).toFixed(2)}</span>
```
Para:
```
<span>${Number(li.rate || li.total).toFixed(2)}</span>
```

Resultado: `Qty: 1  $220.00` em vez de `Qty: 1  @ $220.00`.

### Sem alterações de banco de dados.

