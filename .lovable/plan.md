

## Plano: Alinhar design dos Estimates com a identidade Maison Pur

### Mudanças

#### 1. Cores: Emerald/verde como Invoices (remover azul)
- `EstimateSection.tsx`: Trocar ícone header de `from-blue-500/20` para `from-emerald-500/20`
- `EstimateHistoryContent.tsx`: Status "sent" manter azul (faz sentido semântico), mas ajustar cards de resumo
- `PublicEstimate.tsx`: Trocar toda a paleta azul (`#1e40af`, `#3b82f6`) para verde Maison Pur (`#2D5016`, `#4A7C2E`) — barra superior, título "ESTIMATE", footer, badges, CTAs

#### 2. Branding na página pública
- Aumentar logo centralizado de `h-14 sm:h-16` para `h-16 sm:h-20`
- Seção "Prepared For" com borda verde em vez de azul
- Footer com gradiente verde (igual ao PublicInvoice)
- CTA de contato com fundo verde em vez de azul
- Manter o aviso "This is an estimate, not an invoice" mas com cor verde suave

#### 3. Layout improvements
- `EstimateSection.tsx`: Adicionar resumo financeiro no header (como Invoice mostra "total · earned")
- `EstimateHistoryContent.tsx`: Adicionar card de totais (Total Estimated, Accepted, Pending) — espelhando o grid de 3 colunas do InvoiceHistoryContent
- `Estimates.tsx`: Adicionar `useLanguage` para consistência

#### 4. Página pública redesign
- Trocar TODA a paleta de azul para verde Maison Pur (`#2D5016` como cor primária)
- Barra decorativa superior: gradiente verde (como invoice)
- Título "ESTIMATE" em verde escuro
- Tabela header verde em vez de azul
- Seção financeira com borda verde
- Footer verde com slogan
- Manter layout responsivo (tabela desktop / cards mobile)

### Arquivos a modificar
- `src/components/EstimateSection.tsx` — cores e header info
- `src/components/EstimateHistoryContent.tsx` — cards de resumo financeiro
- `src/pages/Estimates.tsx` — useLanguage
- `src/pages/PublicEstimate.tsx` — paleta completa azul → verde Maison Pur

