

## Plano: Bolhas flutuantes no Execution + Confetti na finalização

### 1. Adicionar BackgroundEffects na tela de Execução

**Arquivo:** `src/pages/Execution.tsx`

O `MobileLayout` já inclui as bolhas flutuantes (cloud blobs) em todas as páginas principais. Porém, a tela de Execução (`/execution/:jobId`) usa um layout próprio que não passa pelo `MobileLayout`, então as bolhas não aparecem lá.

- Importar e renderizar `<BackgroundEffects />` dentro do `mobile-frame` div, antes do `<ExecutionContent>`.

### 2. Confetti na finalização do checklist

**Arquivos:** `src/components/execution/SummaryStep.tsx`

Quando o usuário clica em "Finalizar", disparar uma animação de confetti para celebrar a conclusão:

- Criar um componente `ConfettiExplosion` inline usando Framer Motion: ~30 partículas coloridas (lavanda, rosa, menta, dourado — cores do design system) que disparam do centro em direções aleatórias com rotação e gravidade.
- O confetti é ativado no momento do clique em "Finalizar" (antes de chamar `onComplete`), fica visível por ~2 segundos, e então a navegação prossegue.
- Sem dependências externas — 100% Framer Motion + CSS.

### Sem alterações de banco de dados

