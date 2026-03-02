

## Plano: Gestão de Invoices

### 1. Banco de dados — nova tabela `invoices`

```sql
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',  -- 'pending' | 'paid'
  public_token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Owner CRUD
CREATE POLICY "Users can manage own invoices" ON public.invoices
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Public read via token (for /invoice/:id page)
CREATE POLICY "Public can view invoices by token" ON public.invoices
  FOR SELECT TO anon, authenticated USING (true);
  -- We'll filter by token in code; broad SELECT is needed for public page
```

### 2. Novos ficheiros

| Ficheiro | Finalidade |
|---|---|
| `src/hooks/useInvoices.ts` | Hook CRUD com react-query + supabase |
| `src/components/InvoiceSection.tsx` | Formulário de criação + lista de invoices (usado no Settings) |
| `src/pages/PublicInvoice.tsx` | Página pública `/invoice/:token` — estilo recibo profissional com botão "Pagar agora" |

### 3. Ficheiros modificados

| Ficheiro | Mudança |
|---|---|
| `src/views/SettingsView.tsx` | Adicionar `<InvoiceSection />` abaixo do perfil, recebendo `userId` |
| `src/lib/routes.tsx` | Adicionar rota pública `/invoice/:token` → `<PublicInvoice />` |

### 4. Detalhes de implementação

**InvoiceSection** — Dentro das Settings, abaixo do profile card:
- Formulário com campos: nome do cliente, e-mail, descrição do serviço, valor (€)
- Tabela com colunas: Cliente, Valor, Status (badge), Data, Ações (copiar link)
- O link copiado será `https://maisonpur.lovable.app/invoice/{public_token}`

**PublicInvoice** — Rota pública sem auth:
- Busca invoice pelo token na URL
- Layout estilo recibo: logo Pur, dados do serviço, valor, status
- Botão "Pagar agora" (placeholder visual — sem integração de pagamento)

**useInvoices** — Hook:
- `useQuery` para listar invoices do user
- `useMutation` para criar invoice
- `useMutation` para alternar status pending↔paid

