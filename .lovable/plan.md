## PDF de Solicitação de Suprimentos

Gerar um PDF profissional ao finalizar uma supply request, no mesmo padrão visual dos documentos da Maison Pur, pronto para enviar ao cliente.

### 1. Novo gerador `src/lib/supplyRequestPdf.ts`
- Baseado em `jsPDF` (já instalado), inspirado no estilo de `pdfGenerator.ts`
- Header: logo `/logo-512.png` + "MAISON PUR" + contato (`+1 941-330-4713`, `maisonpur.lovable.app`)
- Bloco "SUPPLY REQUEST #XXXXXXXX" com data e badge de status (SENT / FULFILLED)
- Bloco da propriedade (nome + endereço) destacado
- Itens **agrupados por área** (Kitchen, Bathroom, Bedroom, Laundry, Cleaning, General), cada grupo com faixa verde Maison Pur
- Para cada item: thumbnail da foto (se houver), nome, nota opcional e quantidade necessária à direita
- Notas gerais da solicitação em bloco neutro
- Link público clicável (`/supplies/:token`) ao final
- Rodapé com identidade Maison Pur em todas as páginas
- Paleta: Emerald `#107A57` + Stone-900 (consistente com identidade)

### 2. Integração em `PropertySuppliesPanel.tsx`
**Aba Request — após criar:**
- Ao concluir `createRequest` com sucesso, oferecer toast "Request created" com ação "Download PDF" que dispara o gerador

**Aba History — em cada cartão de request:**
- Adicionar botão **"PDF"** (ícone `FileDown`) ao lado de "Copy link" / "WhatsApp" / "Open"
- Clique → `generateSupplyRequestPdf(request)` → download imediato no dispositivo

### 3. Sem migração de banco
- Geração é client-side e on-demand (mesma abordagem que invoices/estimates do projeto)
- Nada precisa ser persistido — o PDF é sempre regenerado a partir do registro atual em `supply_requests`

### Detalhes técnicos
- Carregamento de logo via `<canvas>` → dataURL (padrão `pdfGenerator.ts`)
- Fotos dos itens redimensionadas para máx. 400px e convertidas para JPEG 70% antes de embutir (economia de tamanho)
- `pdf.textWithLink` para o link público clicável no PDF
- Quebra automática de página via helper `ensure(need)` reaproveitado do padrão existente
- Nome do arquivo: `supply-request-{property-slug}-{shortId}.pdf`
