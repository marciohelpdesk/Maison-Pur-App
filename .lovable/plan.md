

## Plano: Acelerar checklist e upload de fotos na execução

### Problema identificado
Cada clique no checklist chama `onUpdateJob` → `updateJob.mutate` (Execution.tsx) → escrita no banco de dados + `invalidateQueries` que recarrega todos os jobs. Isso causa um round-trip de rede **a cada toggle**, gerando lentidão perceptível. Além disso, as animações spring do framer-motion em cada item adicionam overhead visual.

### Solução

#### 1. Estado local com debounce no ChecklistStep
- Manter o checklist em **estado local** (`useState`) dentro do `ChecklistStep`
- Propagar mudanças para o pai via `onChecklistChange` com **debounce de 800ms** usando `useRef` + `setTimeout`
- Isso elimina a escrita no banco a cada clique — o save acontece apenas quando o usuário para de clicar

#### 2. Remover animações pesadas dos itens
- Remover `AnimatePresence` do loop de itens do checklist (linhas 299-315) — manter apenas transição entre rooms
- Remover `motion.div` com `layout` do `ChecklistItemCard` — usar `div` simples
- Remover animação spring (`scale: [1, 1.2, 1]`) do checkbox — usar transição CSS leve
- Manter apenas a animação do progress bar no header

#### 3. Fotos em batch no PhotoCaptureStep
- Já suporta `multiple` na galeria — verificar que funciona corretamente
- Adicionar `multiple` também no input de câmera do `RoomPhotosSection` (linha 480 — falta `multiple`)
- No `ChecklistItemCard`, permitir múltiplas fotos por item quando `photoRequired` (atualmente aceita apenas 1)

#### 4. Otimizar re-renders
- O `ChecklistItemCard` já é `memo`, mas recebe `onToggle` como arrow function inline (`() => toggleItem(...)`) que quebra a memoização
- Passar `sectionId` + `itemId` e usar `useCallback` estável no pai

### Arquivos a modificar
- `src/components/execution/ChecklistStep.tsx` — estado local + debounce + remover animações pesadas + fix memo
- `src/components/execution/PhotoCaptureStep.tsx` — sem mudanças necessárias (já suporta batch)

### Sem alterações de banco de dados

