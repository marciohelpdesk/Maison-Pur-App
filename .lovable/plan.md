## Objetivo

Criar uma seção de **Vistoria de Propriedade (Walkthrough / Site Survey)** onde, ao visitar uma casa nova, você percorre um checklist completo por área (cozinha, banheiros, quartos, sala, closet, lavanderia, áreas externas etc.), marca o que existe / o que falta, registra quantidades (ex.: nº de toalhas, jogos de lençol, panelas), tira fotos e anota observações. Ao final, a vistoria gera:

1. Um **resumo de precificação** que pode ser convertido em Estimate com 1 clique.
2. Um **relatório em PDF** (mesmo padrão visual do Supply Request) para enviar ao cliente.
3. Um **link público** (sem login) para o cliente visualizar e baixar o PDF.

## Onde fica

- Nova rota `/walkthrough` (lista + nova vistoria), com atalho em **Settings**, logo abaixo de *Estimates*, e no menu desktop — mesmo estilo `glass-panel` já usado por Supplies/Invoices, restrito a admin.
- Dentro da página `Estimates`, uma terceira aba **"Walkthrough"** listando vistorias prontas para converter em orçamento.
- Rota pública `/walkthrough/:token` (sem autenticação), igual ao padrão de `/supplies/:token`.

## Fluxo da vistoria

```text
1. Selecionar propriedade (ou digitar nome/endereço de prospect)
2. Config rápida: nº de quartos, banheiros, tem lavanderia? closet? piscina?
   -> gera automaticamente as áreas do checklist
3. Percorrer áreas (accordion, uma por vez, denso e rápido):
     [Cozinha]  Panelas .......  [Tem][Falta][N/A]  Qtd: 4   📷  📝
                Talheres ......  [Tem][Falta][N/A]  Qtd: 12  📷  📝
     [Banheiro 1] Toalhas de banho [Tem][Falta] Qtd: 2 ...
   + botão "Add item" em cada área
4. Aba "Condição & Esforço": estado geral por área (Bom/Regular/Pesado),
   nº de andares, animais, sujeira acumulada -> multiplicadores
5. Resumo: itens faltantes, fotos, horas estimadas, preço sugerido
6. Salvar -> gera PDF + link público -> botão "Convert to Estimate"
```

## Catálogo pré-preenchido (novo arquivo `src/data/walkthroughCatalog.ts`)

Itens por área, com unidade e quantidade "ideal" de referência:

- **Kitchen**: panelas, frigideiras, talheres, pratos, copos, taças, tábua, facas, abridor, torradeira, cafeteira, liquidificador, potes, formas, luvas térmicas, panos de prato, lixeira.
- **Bathroom** (por banheiro): toalhas de banho, de rosto, de piso, cortina, tapete, lixeira, secador, kit amenities, papel higiênico, escova sanitária, dispensers.
- **Bedroom** (por quarto): jogos de lençol, fronhas, travesseiros, edredom, protetor de colchão, cobertores, cabides, cortinas/blackout, abajur.
- **Living**: almofadas, mantas, controle remoto, decoração, tapete.
- **Closet**: cabides, organizadores, ferro, tábua de passar, cofre.
- **Laundry**: detergente, amaciante, alvejante, tira-manchas, cesto, varal, ferro.
- **Outdoor/Extras**: móveis de área externa, churrasqueira, toalhas de piscina, guarda-sol.
- **Cleaning/Consumables**: produtos de limpeza, sacos de lixo, papel toalha, esponjas, pilhas, lâmpadas.

Cada item: `Presente / Faltando / Danificado / N/A`, quantidade encontrada vs. ideal, foto opcional e nota.

## Precificação

Bloco de estimativa calculado no cliente (`src/lib/walkthroughPricing.ts`):
- Horas base a partir de quartos/banheiros/m² + tipo de serviço.
- Ajuste por condição de cada área (Bom ×1.0, Regular ×1.25, Pesado ×1.6).
- Extras marcados (piscina, pós-obra, animais).
- Preço sugerido = horas × taxa/hora (configurável no formulário) + custo estimado de reposição dos itens faltantes.
- Botão **Convert to Estimate** pré-preenche `EstimateSection` com line items: serviço de limpeza + (opcional) linha de reposição de suprimentos.

## Relatório para o cliente

- PDF gerado com `jsPDF`, reaproveitando o layout já aprovado em `src/lib/supplyRequestPdf.ts` (logo proporcional, cabeçalhos emerald, sem menções externas): capa com propriedade e data, sumário (itens OK / faltando / danificados), tabela por área, grade de fotos, bloco de recomendação e preço sugerido.
- Botão de download no app e na página pública.

## Detalhes técnicos

- **Banco**: nova tabela `walkthroughs` (user_id, property_id, property_name, property_address, client_name/email, status, config jsonb, areas jsonb com itens/quantidades/fotos, condition jsonb, pricing jsonb, public_token, timestamps) + GRANTs, RLS por `auth.uid()` e RPC `get_walkthrough_by_token` com `SECURITY DEFINER` para o link público (mesmo padrão de `get_supply_request_by_token`).
- **Fotos**: bucket `report-photos` já existente, com a compressão de `src/lib/imageUtils.ts`.
- **Novos arquivos**: `src/data/walkthroughCatalog.ts`, `src/hooks/useWalkthroughs.ts`, `src/pages/Walkthrough.tsx`, `src/views/WalkthroughView.tsx`, `src/components/walkthrough/*` (AreaAccordion, ItemRow, ConditionStep, SummaryStep), `src/lib/walkthroughPricing.ts`, `src/lib/walkthroughPdf.ts`, `src/pages/PublicWalkthrough.tsx`.
- **Alterados**: `src/lib/routes.tsx` (rotas nova + pública), `src/views/SettingsView.tsx` (atalho admin), `src/pages/Estimates.tsx` (aba Walkthrough), `src/components/EstimateSection.tsx` (aceitar pré-preenchimento vindo da vistoria).
- UI densa, mobile-first, no mesmo padrão visual já usado em Supplies.
