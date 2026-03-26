

## Plano: Corrigir exclusão de Reports e adicionar exclusão de Jobs na Agenda

### Problema 1: Reports não são apagados
O `deleteReport` usa `.mutate()` que não aguarda resultado — o toast de sucesso aparece imediatamente, mas se o delete falhar no banco, o erro é silencioso. Além disso, as tabelas `report_rooms` e `report_photos` não têm foreign keys com CASCADE, então ficam dados órfãos mesmo quando o delete funciona.

### Problema 2: Não é possível cancelar/apagar jobs da Agenda
A `AgendaView` não tem opção de deletar jobs. O usuário precisa entrar nos detalhes do job para poder deletar — não há atalho na timeline.

---

### Correções

#### 1. `src/hooks/useReports.ts` — Delete robusto
- Antes de deletar o `cleaning_report`, deletar primeiro `report_photos` e `report_rooms` associados (pelo `report_id`)
- Trocar para `mutateAsync` com tratamento de erro adequado

#### 2. `src/pages/Reports.tsx` — Toast com feedback real
- Usar `await deleteReport(id)` com try/catch para mostrar toast de erro se falhar, em vez de mostrar sucesso imediatamente

#### 3. `src/views/AgendaView.tsx` — Adicionar delete de jobs
- Adicionar prop `onDeleteJob` à interface
- No card de cada job na timeline, adicionar botão de lixeira (Trash2) com confirmação (AlertDialog) para cancelar/apagar o agendamento
- Apenas jobs com status "Scheduled" podem ser deletados diretamente

#### 4. `src/pages/Agenda.tsx` — Passar onDeleteJob
- Passar a função `deleteJob` do hook `useJobs` para a `AgendaView`

### Arquivos a modificar
- `src/hooks/useReports.ts` — delete com limpeza de rooms/photos
- `src/pages/Reports.tsx` — async delete com feedback
- `src/views/AgendaView.tsx` — botão de cancelar job
- `src/pages/Agenda.tsx` — passar prop onDeleteJob

