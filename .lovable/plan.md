

## Plano: Aplicar Design System "Frosted Cloud Geometry"

### O que muda
Apenas a **aparência visual** (cores, bordas, sombras, fundo, navegação). Nenhuma funcionalidade, rota, ou lógica de dados será alterada.

### Resumo das mudanças visuais

1. **Paleta de cores** — trocar o verde-teal atual por tons pastel (roxo lavanda, rosa, menta, dourado)
2. **Fundo da app** — trocar gradiente teal por radial gradients suaves rosa/índigo com blobs animados
3. **Cantos mais arredondados** — de 1.5rem para ~42px (cloud-radius) nos painéis
4. **Bottom Nav redesenhada** — item ativo "flutua" para cima com destaque roxo (como na referência)
5. **Headers das páginas** — fundo mais suave/translúcido em vez do gradiente escuro teal
6. **Cards e painéis** — bordas mais suaves, sombras mais leves, background glass atualizado

### Arquivos a serem modificados

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Atualizar variáveis CSS (--primary, --background, cores), glass-panel, bg-florida-sky, mobile-frame, mercury-drop |
| `src/components/BackgroundEffects.tsx` | Trocar drops por cloud blobs animados (rosa/menta) |
| `src/components/layout/BottomNavRouter.tsx` | Item ativo com translateY(-10px), cor roxa, estilo flutuante |
| `src/views/DashboardView.tsx` | Header: fundo translúcido suave em vez de teal escuro; categorias com cores pastel |
| `src/views/SettingsView.tsx` | Header com fundo suave/translúcido |
| `src/views/AgendaView.tsx` | Header com fundo suave/translúcido |
| `src/views/PropertiesView.tsx` | Header com fundo suave/translúcido |
| `src/views/LoginView.tsx` | Adaptar glass-panel ao novo tema pastel |
| `tailwind.config.ts` | Verificar/ajustar se necessário para novas cores |

### Detalhes técnicos

**Nova paleta CSS (`:root`)**:
- `--primary`: 252 70% 72% (roxo lavanda ~#9287ff)
- `--background`: 220 20% 98% (#f9fbfd)
- `--accent-pink`: 330 100% 86% (#ffb8e0)
- `--accent-mint`: 170 80% 82% (#b2f5ea)
- `--accent-gold`: 40 100% 87% (#ffebbc)
- Manter `--cta` (âmbar) e `--destructive` como estão

**Background** — substituir `bg-florida-sky-fixed` de gradiente linear teal por:
```css
background: radial-gradient(circle at 0% 0%, #fdf2f8 0%, transparent 40%),
            radial-gradient(circle at 100% 100%, #eef2ff 0%, transparent 40%);
```

**BackgroundEffects** — substituir mercury-drops por 2 cloud blobs:
- Blob 1: rosa (#ffb8e0), 300px, top-left, blur(60px)
- Blob 2: menta (#b2f5ea), 250px, bottom-right, blur(60px)

**BottomNav** — item ativo:
- Background roxo (--primary)
- `translateY(-10px)` + box-shadow roxo
- Ícone branco quando ativo

**Headers das views** — trocar `hsl(160 35% 18%)` por fundo translúcido com blur:
```css
background: rgba(255,255,255,0.7);
backdrop-filter: blur(20px);
```
Texto dos headers de branco para `var(--text-main)` escuro.

### Sem alterações de banco de dados

