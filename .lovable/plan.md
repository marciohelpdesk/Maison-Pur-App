

## Plano: Layout Responsivo Desktop + Mobile

### Problema
Atualmente, no desktop (>769px), o app é renderizado dentro de um "frame de celular" de 390x844px centralizado na tela. O usuário quer um layout de dashboard completo no PC, mantendo a experiência mobile no celular.

### Abordagem

Criar um sistema de layout dual: **Desktop Layout** (sidebar + conteúdo expandido) para telas ≥1024px, e manter o **Mobile Layout** atual para telas <1024px.

```text
┌─────────────────────────────────────────────────┐
│  DESKTOP (≥1024px)                              │
│  ┌──────────┬──────────────────────────────────┐ │
│  │ Sidebar  │  Main Content Area               │ │
│  │          │  (full width, no phone frame)     │ │
│  │ 🏠 Home  │                                   │ │
│  │ 📅 Agenda│  Dashboard cards em grid          │ │
│  │ 📄 Report│  de 2-3 colunas                   │ │
│  │ 🏢 Props │                                   │ │
│  │ ⚙️ Config│                                   │ │
│  │          │                                   │ │
│  │ Logo +   │                                   │ │
│  │ Profile  │                                   │ │
│  └──────────┴──────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

┌──────────┐
│  MOBILE  │  (mantém exatamente como está)
│  (<1024)  │
│  phone   │
│  frame   │
└──────────┘
```

### Arquivos a criar/modificar

#### 1. `src/components/layout/DesktopSidebar.tsx` (novo)
- Sidebar fixa à esquerda (~240px)
- Logo Maison Pur no topo
- Links de navegação com ícones (mesmos do BottomNav)
- Avatar + nome do usuário no rodapé
- Estilo glass-panel consistente com o design system

#### 2. `src/components/layout/DesktopLayout.tsx` (novo)
- Layout wrapper para desktop: sidebar + área de conteúdo principal
- Background florida-sky sem o frame de celular
- Conteúdo ocupa toda a largura disponível

#### 3. `src/components/layout/MobileLayout.tsx` (modificar)
- Manter exatamente como está — sem mudanças

#### 4. `src/components/layout/ResponsiveLayout.tsx` (novo)
- Usa `useIsMobile()` (ou breakpoint 1024px) para decidir:
  - Desktop → `<DesktopLayout>` com sidebar
  - Mobile → `<MobileLayout>` com bottom nav (atual)

#### 5. `src/lib/routes.tsx` (modificar)
- `ProtectedLayout` passa a usar `<ResponsiveLayout>` em vez de `<MobileLayout>`

#### 6. `src/views/DashboardView.tsx` (modificar)
- Adicionar classes responsivas para grids mais largos no desktop
- Ex: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` nos cards
- Header adaptado (sem precisar de safe-area no desktop)

#### 7. `src/index.css` (modificar)
- Remover ou condicionar o `mobile-frame` no desktop quando usar DesktopLayout
- O mobile-frame continua existindo mas só é usado no mobile path

### Comportamento
- **Mobile (<1024px)**: Tudo idêntico ao atual — phone frame, bottom nav, scroll vertical
- **Desktop (≥1024px)**: Sidebar lateral fixa, conteúdo em largura total, grids responsivos, sem bottom nav, sem phone frame

### Sem dependências externas — apenas CSS + componentes React

