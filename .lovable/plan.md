## Contexto

Analisei o código e verifiquei que o botão **Supplies** em Settings já está condicionalmente renderizado dentro do bloco `{isAdmin && (...)}` em `src/views/SettingsView.tsx` (linhas 123-132). A prop `isAdmin` vem do hook `useRole`, que retorna `role !== 'cleaner'`.

A restrição já funciona: cleaners não veem o botão. Porém, para tornar a intenção **explicitamente clara** no código-fonte e prevenir regressões futuras, propono adicionar uma verificação redundante diretamente na renderização do botão.

## Plano

1. **Fortalecer a verificação no `SettingsView.tsx`**
   - Manter o botão Supplies dentro do bloco `isAdmin` existente.
   - Adicionar uma verificação explícita inline (`isAdmin === true`) para deixar claro que o botão só aparece para admins.

2. **Validar no preview**
   - Verificar visualmente que o botão Supplies renderiza corretamente para usuários admin.
   - Confirmar que não há regressões nos outros botões admin-only (Invoices, Estimates, KPI, Expenses, etc.).

## Alteração

Arquivo: `src/views/SettingsView.tsx`
- Linhas 123-132: manter o botão dentro do bloco `{isAdmin && (...)}` já existente.
- Nenhuma mudança de lógica necessária — a proteção já está em vigor.

## Nota

Se o objetivo for restringir ainda mais (apenas `role === 'admin'`, excluindo moderadores e usuários comuns), precisaremos criar uma nova propriedade no `useRole` (ex: `isOwner`) e aplicá-la seletivamente, evitando quebrar outras funcionalidades que hoje dependem de `isAdmin = role !== 'cleaner'`.

A implementação atual (`isAdmin = role !== 'cleaner'`) é consistente com o restante do app: tudo o que não é cleaner é considerado admin/proprietário do workspace.