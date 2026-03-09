

## Plano: Reduzir arredondamento dos cards de Reports

O `glass-panel` usa `--cloud-radius: 42px` globalmente — alterar isso afetaria toda a aplicação. Em vez disso, vou aplicar um `border-radius` mais moderado especificamente nos cards da página Reports.

### Alteração

**Arquivo:** `src/pages/Reports.tsx`

- Nos `motion.div` dos report cards (linha ~178 e ~142), adicionar classe `!rounded-2xl` para sobrescrever o `glass-panel` de 42px para 16px (`rounded-2xl`).
- O mesmo ajuste nos cards de "unreported jobs".

Resultado: cantos arredondados suaves (16px) em vez dos 42px atuais, mantendo o glassmorphism intacto. O restante da app continua com o cloud-radius padrão.

### Sem alterações de banco de dados

