

## Plano: Ocultar jobs da "Pending Generation" após exclusão de report

### Problema real
O delete do report **funciona** (o toast "Report deleted" aparece e o report é removido do banco). Porém, como o filtro `unreportedJobs` mostra todos os jobs concluídos que NÃO têm um report associado, ao apagar o report o job volta a aparecer em "Pending Generation" — como se pedisse para gerar novamente.

### Solução
Quando um job é concluído pelo fluxo normal (Execution), o campo `reportPdfUrl` é preenchido no job. Usar esse campo como indicador de que o job já teve um report gerado, mesmo que o report tenha sido excluído depois.

### Mudança

**Arquivo**: `src/pages/Reports.tsx` (linha 29-31)

Alterar o filtro `unreportedJobs` para também excluir jobs que já possuem `reportPdfUrl`:

```typescript
const unreportedJobs = completedJobs.filter(
  (j) => !reports.some((r) => r.job_id === j.id) && !j.reportPdfUrl
);
```

Isso garante que:
- Jobs concluídos pelo fluxo normal (que já geraram PDF) nunca voltam para "Pending Generation"
- Jobs concluídos manualmente sem PDF e sem report continuam aparecendo para gerar

### Arquivo a modificar
- `src/pages/Reports.tsx` — uma linha de filtro

