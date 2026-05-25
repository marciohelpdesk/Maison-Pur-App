Adicionar atalho "Supplies" no Settings mobile, logo abaixo de Invoice:

1. Em `src/views/SettingsView.tsx`:
- Importar ícone `Package` do lucide-react.
- Inserir novo botão `Supplies` (rota `/supplies`) entre Invoices e Estimates, no mesmo estilo `glass-panel` admin-only.
- Subtítulo: "Inventory & restock requests".

2. Validar no preview mobile que o item aparece logo após Invoices e navega para `/supplies`.

Sem alterações no bottom nav nem em outras telas.