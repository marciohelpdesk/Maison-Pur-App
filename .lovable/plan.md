# Fix: "o app não está funcionando" (tela branca / erro de script)

## O que eu verifiquei agora

- Servidor de preview: responde 200 e a tela de login renderiza normalmente.
- Site publicado (maisonpur.lovable.app): carrega, a tela de login renderiza e nenhum arquivo retorna erro.
- No console só aparecem avisos do React sobre `ref` (não quebram nada).

Conclusão: o código está saudável nos dois ambientes. O erro recorrente
"Importing a module script failed" vem do **Service Worker do PWA + cache do
navegador** do seu dispositivo, que continua servindo um `index-*.js` antigo
depois de cada publicação. Por isso some com hard refresh e volta depois.

## O que fazer

1. **Auto-recuperação de chunk antigo**
   Adicionar um handler global em `src/main.tsx` que detecta falhas de
   carregamento de módulo/chunk e faz um único reload forçado da página
   (com marca em `sessionStorage` para não entrar em loop). Isso resolve o
   sintoma sozinho, sem o usuário precisar limpar cache.

2. **Service Worker que não segura assets**
   Revisar `public/push-sw.js` para garantir que ele só trate push/notificações
   e nunca faça cache de navegação/JS, e chamar `skipWaiting` + `clients.claim`
   para que a versão nova assuma imediatamente após publicar.

3. **Limpeza de registros antigos**
   No boot do app, desregistrar service workers obsoletos e apagar caches
   antigos da Cache Storage antes de registrar o atual.

4. **Higiene de console**
   Corrigir os avisos de `ref` em `Login` / `ForgotPasswordModal` envolvendo os
   componentes internos com `React.forwardRef`, para o console ficar limpo e
   erros reais ficarem visíveis.

5. **Republicar** e validar novamente no preview e no domínio publicado.

## Detalhe técnico

- Handler: escutar `window.addEventListener('vite:preloadError')` e
  `unhandledrejection` filtrando mensagens de "Failed to fetch dynamically
  imported module" / "Importing a module script failed"; guard em
  `sessionStorage` (`__chunk_reloaded`) limpo após load bem-sucedido.
- SW: sem `fetch` handler de cache-first para documentos/assets; apenas `push`
  e `notificationclick`.
- Nenhuma mudança de banco de dados ou de regras de acesso.

## Se o problema for outro

Se após isso ainda não funcionar, me diga a tela exata e o que aparece
(branco, erro, login travado) que eu investigo esse caso específico.
