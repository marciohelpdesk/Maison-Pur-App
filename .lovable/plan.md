Plano para corrigir o download do PDF de Supplies/Inventory:

1. Ajustar o gerador do PDF
- Alterar `generateSupplyRequestPdf` para gerar um `Blob`, igual ao fluxo que já funciona nos relatórios.
- Substituir o uso direto de `pdf.save()` por download via link temporário (`URL.createObjectURL` + `<a download>`), que é mais confiável em navegadores e no preview.
- Manter tolerância a falhas em logo/fotos para que uma imagem quebrada nunca impeça o PDF de baixar.

2. Corrigir os botões de download
- Atualizar o botão `PDF` no histórico da área `/supplies` para usar o novo fluxo de download.
- Atualizar o botão `Download PDF` da página pública `/supplies/:token` para baixar o mesmo documento sem depender de login.
- Adicionar estado de carregamento/desabilitado durante a geração para evitar cliques duplicados.

3. Remover dependências de compartilhamento
- Manter somente download do PDF e link público simples.
- Não reintroduzir botão de WhatsApp.

4. Verificar acesso público
- Confirmar que `/supplies/:token` continua fora da proteção de login.
- Manter a leitura pública por token existente, sem mudar regras de banco se não for necessário.

5. Validar o resultado
- Verificar no preview se o botão da área Supplies gera o download.
- Verificar se o link público abre sem login e se o botão público baixa o PDF.
- Conferir erros de console/rede caso algum download ainda falhe.