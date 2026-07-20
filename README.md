# Portal do Agraciado

Front-end estático para GitHub Pages, conectado ao Apps Script e à planilha já existentes.

## Publicação

1. Envie todos os arquivos e pastas para a raiz do repositório GitHub.
2. Em **Settings → Pages**, selecione **Deploy from a branch**.
3. Selecione a branch `main` e a pasta `/ (root)`.
4. Aguarde a publicação e abra o endereço informado pelo GitHub Pages.

## Arquivos

- `index.html`: página inicial, dados da solenidade, livreto e patrocinadores.
- `presenca.html`: pesquisa do nome do agraciado.
- `registro.html`: posição, confirmação, dispositivo e mensagens.
- `js/api.js`: URL e comunicação com o Apps Script.
- `js/dispositivo.js`: modos manual e automático do dispositivo.

## Observações

- O Apps Script não foi alterado.
- Os campos `Orientacao_1`, `Orientacao_2` e `Orientacao_3` são ignorados.
- As mensagens `Mensagem_Geral_1`, `Mensagem_Geral_2` etc. aparecem apenas na página do agraciado.
- O banner aparece nas três páginas. Quando `Imagem_Capa` estiver vazio, é exibido um cabeçalho visual de reserva.
