## Financeiro Maison Pur — Roadmap de Inovação

Análise rápida do que existe hoje e onde dá pra ir muito além.

### Estado atual (verificado)

- `Finance` = só ganhos (gráfico semanal/mensal + lista de jobs pagos).
- `KpiDashboard` = revenue, expenses, profit, margin, completion rate, pie de despesas.
- `Invoices` = CRUD com line items, due_date, status pending/paid, public token.
- `Estimates` = igual invoices, com conversão.
- `Expenses` = CRUD básico, breakdown por categoria.

**Limitações reais hoje:**
- Tudo é descritivo (o que aconteceu), nada é preditivo.
- Pagamento ainda manual (sem integração de cobrança).
- Sem fluxo de caixa real (entradas previstas × saídas previstas).
- Sem visão por propriedade (qual casa dá mais lucro?).
- Sem "saúde do negócio" num único número.
- Faturas não enviam lembrete automático de cobrança.
- Sem export para contador (CSV/PDF mensal consolidado).
- Sem multi-moeda nem multi-conta (Zelle, Cash, etc.).

---

### Roadmap proposto — 4 ondas

#### 🌊 Onda 1 — "Comando Financeiro" (visão única, fluxo de caixa real)

**1.1. Cash Flow Forecast (Previsão de 30/60/90 dias)**
- Tela nova `/cashflow` com gráfico de área dual: **dinheiro previsto entrando** (jobs agendados × preço + invoices pending) vs **previsto saindo** (despesas recorrentes + custos médios por job).
- Linha de saldo projetado no tempo. Alerta visual quando saldo previsto fica negativo.
- Cada job/invoice/expense vira um "evento" no fluxo, clicável.

**1.2. Health Score do Negócio (1 número de 0-100)**
- Card no topo do `/kpi` — combina margem, taxa de pagamento em dia, crescimento mês a mês, taxa de conclusão de jobs e diversificação de clientes.
- Cor verde/amarelo/vermelho + 3 ações sugeridas pra subir o score ("3 invoices vencidas, cobre via WhatsApp").

**1.3. Profitability per Property**
- Ranking das propriedades por lucro líquido (revenue - despesas alocadas - tempo médio × custo/hora).
- Identifica casa que dá prejuízo. "Casa X gerou $480 esse mês mas custou $520 em produtos + 8h de deslocamento."

**1.4. Categorias inteligentes de despesa**
- Subcategorias (Supplies → Detergente, Toalhas, Químicos especiais) para ver onde o dinheiro escorre.
- Foto da nota fiscal já existe; adicionar **OCR via Lovable AI** (Gemini Vision) para auto-preencher valor + categoria a partir da foto da nota.

---

#### 🌊 Onda 2 — Cobrança e pagamento sem fricção

**2.1. Lembretes automáticos de invoice (Edge Function + cron)**
- 3 dias antes do vencimento → e-mail "lembrete amigável".
- No vencimento → e-mail "fatura vence hoje".
- 3 dias após → WhatsApp pré-formatado "fatura em atraso, pague aqui [link]".
- Toggle por invoice ("desativar lembretes para este cliente").

**2.2. Pagamento online integrado (Stripe nativo do Lovable)**
- Botão "Pay Now" no dossiê público da invoice → checkout Stripe.
- Webhook marca como `paid` automaticamente.
- Suporta cartão, Apple Pay, Google Pay, ACH.
- Adiciona campos `paid_at`, `payment_method`, `transaction_id` na tabela.

**2.3. Múltiplos métodos de pagamento por invoice**
- Cliente escolhe: Zelle (instruções), Cartão (Stripe), Cash (manual mark).
- Histórico de tentativas/recibos por invoice.

**2.4. Recibo automático em PDF**
- Quando muda para `paid`, gera recibo PDF com mesmo design da invoice e e-mail enviado ao cliente automaticamente.

---

#### 🌊 Onda 3 — Inteligência e automação

**3.1. AI Pricing Assistant**
- Botão na criação de invoice/estimate: "Sugerir preço".
- Chama Lovable AI passando: tipo de serviço, m², horas previstas, histórico de jobs similares, preço médio da região (que você define em Settings).
- Retorna 3 faixas (econômica, padrão, premium) com justificativa.

**3.2. Detecção de cliente em risco**
- "Cliente X pagou as últimas 3 faturas com 15+ dias de atraso. Considere exigir 50% upfront."
- Card no dashboard financeiro.

**3.3. Recurring invoices (Subscriptions)**
- Cliente recorrente → criar template "toda primeira segunda do mês, gera invoice automática de $X para casa Y".
- Job recorrente já existe? Linkar.

**3.4. Tax Mode**
- Toggle por workspace: ativar "modo imposto" — separa receita bruta, deduções (despesas dedutíveis), receita tributável e estimativa de imposto a pagar (% configurável).
- Export anual pronto para o contador.

---

#### 🌊 Onda 4 — Diferencial competitivo único

**4.1. "Hora Equivalente" (custo real do seu tempo)**
- App calcula: tempo médio de execução × custo/hora desejado.
- Mostra em cada job: "Esse job pagou $90/h, abaixo da sua meta de $120/h."
- Heatmap por dia da semana e tipo de serviço — descobre que Move-out aos sábados é a hora mais lucrativa.

**4.2. Goal Tracking com gamificação sutil**
- Define meta mensal/anual de receita.
- Barra de progresso elegante no dashboard com previsão: "Hoje é dia 15 e você está 45% da meta — no ritmo atual, fechará o mês em 92%."
- Marcos: 25%, 50%, 75%, 100% — animação Maison Pur (não infantil).

**4.3. Relatório executivo mensal automático**
- Todo dia 1, gera PDF + e-mail para o admin com:
  - Receita do mês × meta
  - Top 3 clientes em valor
  - Top 3 propriedades em lucro
  - Despesas por categoria
  - Faturas vencidas
  - Insights AI (Gemini): "Sua margem caiu 8% por aumento em Supplies. Considere comprar em atacado de X."

**4.4. Comparativo Year-over-Year**
- Toggle no KPI: "vs ano passado". Mostra setas e %.

**4.5. Custom Branding nas Invoices**
- Cliente escolhe cor da invoice + logo upload (já tem Maison Pur fixo).
- Permite white-label se um dia abrir a plataforma para outras empresas.

---

### O que EU sugiro entregar PRIMEIRO

Se você tivesse que escolher 5 itens com **maior impacto × menor esforço**, eu pegaria:

1. **2.1 Lembretes automáticos de invoice** — resolve o maior problema real (receber em dia).
2. **2.2 Stripe nativo** — paga o app sozinho, fricção zero pro cliente.
3. **1.1 Cash Flow Forecast** — visual marcante, ninguém de cleaning tem isso.
4. **1.3 Profitability per Property** — insight de negócio que muda decisão real.
5. **4.3 Relatório executivo mensal AI** — efeito "uau" único, todo mês cliente vê valor.

Tudo isso entra em ~2 sessões de implementação.

---

### Pergunta

Quer que eu siga com **esses 5 do "primeiro lote"**, ou prefere selecionar manualmente (ex.: "só Onda 1", "só 2.1+2.2", ou "tudo, na ordem que faz sentido")? Se não responder, sigo com os 5 acima na ordem listada.