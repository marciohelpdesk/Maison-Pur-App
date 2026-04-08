

## Sistema de Equipe com Acesso por Convite

### Situacao Atual
Hoje os "employees" sao apenas nomes registrados localmente — nao tem conta real no app. O dono faz tudo sozinho.

### Arquitetura Proposta

O admin (voce) convida funcionarios por email. Eles recebem uma conta real no app com **permissoes limitadas**.

```text
┌─────────────────────────────────────────┐
│  ADMIN (owner)                          │
│  - Tudo: properties, finance, KPIs...   │
│  - Convida membros da equipe            │
│  - Atribui jobs a membros               │
└─────────────────────────────────────────┘
         │ convite por email
         ▼
┌─────────────────────────────────────────┐
│  CLEANER (membro da equipe)             │
│  - Ve APENAS jobs atribuidos a si       │
│  - Acesso basico: endereco, checklist   │
│  - Pode executar job e gerar relatorio  │
│  - NAO ve: financeiro, precos, KPIs     │
└─────────────────────────────────────────┘
```

### Etapas de Implementacao

**1. Banco de Dados — Convites de Equipe**
- Nova tabela `team_invites` (admin_id, email, status, invite_token)
- Nova tabela `team_members` (admin_id, member_user_id) — vincula a conta do funcionario ao admin
- Edge function `invite-team-member` que cria a conta via Supabase Admin API e envia email com senha temporaria

**2. RLS baseado em papel**
- Membros com role `cleaner` so veem jobs onde `assigned_to` = seu ID e que pertencem ao seu admin
- Properties: acesso somente leitura a campos basicos (endereco, checklist_template, access_code) dos imoveis dos jobs atribuidos
- Bloquear acesso a: invoices, estimates, expenses, KPI, finance

**3. Frontend — Tela do Admin**
- Em Settings > Team: botao "Convidar Membro" com campo de email
- Lista de membros ativos com status (pendente/ativo)
- Opcao de remover acesso

**4. Frontend — Experiencia do Cleaner**
- Ao fazer login, detecta role `cleaner`
- Dashboard simplificado: so mostra "Seus Jobs de Hoje"
- Menu reduzido: Dashboard (jobs do dia) + Execucao
- Sem acesso a: Properties (gestao), Finance, KPIs, Estimates, Invoices
- Pode ver info basica da propriedade ao abrir o job (endereco, codigo acesso, wifi, checklist)

**5. Fluxo Completo**
1. Admin vai em Settings > Team > "Convidar"
2. Digita email do funcionario
3. Sistema cria conta + envia email com senha temporaria
4. Funcionario faz login → ve apenas seus jobs do dia
5. Funcionario executa o job (fotos, checklist, relatorio)
6. Admin ve o resultado no seu dashboard

### Detalhes Tecnicos

- **Roles**: usar a tabela `user_roles` existente com novo enum `cleaner`
- **team_members**: vincula cleaner ao admin para saber de quem sao os jobs/properties
- **Jobs RLS**: cleaner ve jobs onde `assigned_to` = seu member_id E `user_id` = seu admin_id
- **Properties RLS**: cleaner ve somente properties vinculadas aos seus jobs atribuidos (via subquery)
- **Edge Function**: usa `SUPABASE_SERVICE_ROLE_KEY` para criar conta do cleaner via `auth.admin.createUser()`
- **Route Guard**: componente `RequireRole` que verifica role e redireciona cleaners tentando acessar rotas bloqueadas
- **Nav condicional**: sidebar/bottom nav esconde itens baseado no role do usuario

