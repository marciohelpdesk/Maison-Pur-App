

## Plano: Reforçar as bolhas flutuantes

As bolhas existem no `BackgroundEffects`, mas são apenas 2 blobs grandes com `blur(60px)` e `opacity: 0.5` — praticamente invisíveis. A ideia é torná-las mais presentes sem poluir a interface.

### Alteração

**Arquivo:** `src/components/BackgroundEffects.tsx`

1. **Adicionar mais blobs** — passar de 2 para 5 bolhas em posições variadas (cantos e centro), com tamanhos entre 120px e 300px, usando as cores do design system (rosa, menta, lavanda, dourado)

2. **Aumentar visibilidade** — subir opacidade de 0.5 para 0.6–0.7 e reduzir blur de 60px para 40px nos blobs menores para ficarem mais perceptíveis

3. **Adicionar micro-bolhas decorativas** — 3-4 círculos pequenos (30-50px) semi-transparentes com blur menor (~20px) que flutuam com delays diferentes, criando sensação de profundidade

4. **Variar as animações** — usar durações diferentes (8s–14s) e delays escalonados para que as bolhas não se movam todas juntas

### Resultado

Fundo mais vivo e orgânico com bolhas visíveis mas não intrusivas, mantendo a estética "Frosted Cloud" da marca. Zero impacto no restante do código — tudo contido no `BackgroundEffects.tsx`.

### Sem alterações de banco de dados

