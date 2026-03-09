

## Plano: Ativar botões de Notificações, Privacidade e Ajuda

Os três botões (Notifications, Privacy, Help) no Settings não têm `onClick` — são puramente visuais. Vou criar modais/sheets para cada um com conteúdo funcional.

### Alterações

**1. Criar `src/components/settings/NotificationsSheet.tsx`**
- Sheet/drawer com toggles para: notificações push, lembretes de jobs, alertas de novos agendamentos
- Switches usando o componente `Switch` já existente
- Estado salvo em `localStorage` (sem necessidade de backend para preferências simples)

**2. Criar `src/components/settings/PrivacySheet.tsx`**
- Sheet com opções: visibilidade do perfil, compartilhamento de dados
- Botão para alterar senha (chama `supabase.auth.updateUser`)
- Botão para solicitar exclusão de conta (com confirmação via AlertDialog)

**3. Criar `src/components/settings/HelpSheet.tsx`**
- Sheet com FAQ accordion (usando o componente Accordion existente)
- Link para email de suporte
- Versão do app

**4. Atualizar `src/views/SettingsView.tsx`**
- Adicionar estado para controlar abertura de cada sheet
- Associar `onClick` a cada item do `settingsItems`
- Renderizar os 3 novos componentes

### Traduções
- Adicionar chaves necessárias em `src/contexts/LanguageContext.tsx` (PT e EN)

### Zero alterações de banco de dados

