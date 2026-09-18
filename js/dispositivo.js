'use strict';

function renderizarDispositivo(container, dados, posicaoSelecionada) {
  container.innerHTML = '';

  const config = dados?.config || {};
  const total = numero(
    config.Total_Agraciados,
    (dados?.agraciados || []).length
  );

  const modo = normalizar(config.Modo_Layout);
  const layoutManual = Array.isArray(dados?.layout)
    ? dados.layout
    : [];

  const modelo =
    modo === 'MANUAL' && layoutManual.length
      ? construirModeloManual(layoutManual, total)
      : construirModeloAutomatico(config, total);

  if (!modelo.fileiras.length) {
    container.innerHTML =
      '<p class="estado-vazio">Dispositivo não configurado.</p>';
    return;
  }

  const maxColunas = Math.max(
    ...modelo.fileiras.flatMap(
      fileira =>
        fileira.blocos.map(
          bloco => bloco.capacidade
        )
    ),
    1
  );

  container.style.setProperty(
    '--quantidade-blocos',
    modelo.blocos.length
  );

  container.style.setProperty(
    '--max-colunas',
    maxColunas
  );

  for (const fileira of modelo.fileiras) {
    const linha = document.createElement('div');
    linha.className = 'dispositivo-fileira';

    /*
      A exibição é feita da direita para a esquerda para quem
      está diante do dispositivo.

      Os blocos são invertidos para manter a mesma orientação
      visual utilizada no restante do Sistema de Agraciados.
    */
    for (const bloco of [...fileira.blocos].reverse()) {
      const grupo = document.createElement('div');
      grupo.className = 'dispositivo-bloco';

      grupo.style.setProperty(
        '--capacidade-bloco',
        bloco.capacidade
      );

      /*
        As posições também são invertidas:
        1 fica à direita, depois 2, 3, 4...
      */
      const posicoes = [...bloco.posicoes].reverse();

      /*
        CORREÇÃO DO ALINHAMENTO

        Quando uma fileira não está completa, todos os espaços
        vazios devem permanecer à ESQUERDA.

        Assim, as posições existentes ficam alinhadas pela
        DIREITA de quem olha o dispositivo.

        Exemplo para capacidade 10 e total 29:

        10  9  8  7  6  5  4  3  2  1
        20 19 18 17 16 15 14 13 12 11
           29 28 27 26 25 24 23 22 21
      */
      const vazios = Math.max(
        0,
        bloco.capacidade - posicoes.length
      );

      for (let i = 0; i < vazios; i++) {
        grupo.appendChild(
          criarLugar(
            null,
            posicaoSelecionada
          )
        );
      }

      for (const posicao of posicoes) {
        grupo.appendChild(
          criarLugar(
            posicao,
            posicaoSelecionada
          )
        );
      }

      linha.appendChild(grupo);
    }

    container.appendChild(linha);
  }
}


function construirModeloManual(layout, total) {
  const itens = [...layout]
    .map(item => ({
      ordem: numero(item.Ordem),
      bloco: texto(item.Bloco) || 'A',
      fileira: numero(item.Fileira, 1),
      quantidade: numero(
        item['Posições'] ?? item.Posicoes
      )
    }))
    .filter(item => item.quantidade > 0)
    .sort(
      (a, b) =>
        a.ordem - b.ordem
    );

  if (!itens.length) {
    return {
      blocos: [],
      fileiras: []
    };
  }

  const blocos = [
    ...new Set(
      itens.map(
        item => item.bloco
      )
    )
  ];

  const fileirasNumeros = [
    ...new Set(
      itens.map(
        item => item.fileira
      )
    )
  ].sort(
    (a, b) => a - b
  );

  /*
    Cada bloco mantém a largura da maior fileira configurada
    para aquele bloco. Isso permite criar espaços invisíveis
    nas fileiras menores sem perder o alinhamento.
  */
  const capacidadePorBloco =
    Object.fromEntries(
      blocos.map(bloco => [
        bloco,
        Math.max(
          ...itens
            .filter(
              item => item.bloco === bloco
            )
            .map(
              item => item.quantidade
            ),
          1
        )
      ])
    );

  let proximaPosicao = 1;
  const mapa = new Map();

  /*
    No modo MANUAL, a distribuição da numeração obedece
    rigorosamente à coluna Ordem da aba LAYOUT.
  */
  for (const item of itens) {
    const chave =
      `${item.fileira}|${item.bloco}`;

    const posicoesExistentes =
      mapa.get(chave) || [];

    const posicoes =
      [...posicoesExistentes];

    for (
      let i = 0;
      i < item.quantidade &&
      proximaPosicao <= total;
      i++
    ) {
      posicoes.push(
        proximaPosicao++
      );
    }

    mapa.set(
      chave,
      posicoes
    );
  }

  return {
    blocos,

    fileiras:
      fileirasNumeros.map(
        fileira => ({
          numero: fileira,

          blocos:
            blocos.map(
              bloco => ({
                nome: bloco,

                capacidade:
                  capacidadePorBloco[bloco],

                posicoes:
                  mapa.get(
                    `${fileira}|${bloco}`
                  ) || []
              })
            )
        })
      )
  };
}


function construirModeloAutomatico(config, total) {
  const quantidadeBlocos = Math.max(
    1,
    numero(
      config.Quantidade_Blocos,
      1
    )
  );

  const linhas = Math.max(
    1,
    numero(
      config.Linhas_Por_Bloco,
      1
    )
  );

  const colunas = Math.max(
    1,
    numero(
      config.Colunas_Por_Bloco,
      Math.ceil(
        total /
        quantidadeBlocos /
        linhas
      )
    )
  );

  const blocos = Array.from(
    {
      length: quantidadeBlocos
    },
    (_, indice) =>
      nomeBloco(indice + 1)
  );

  const fileiras = [];

  /*
    CORREÇÃO DA NUMERAÇÃO AUTOMÁTICA

    A numeração precisa continuar pela FILEIRA GLOBAL,
    independentemente do bloco.

    Exemplo:
    2 blocos, 2 fileiras e 3 posições por bloco.

    Fileira 1:
      Bloco A -> 1 2 3
      Bloco B -> 4 5 6

    Fileira 2:
      Bloco A -> 7 8 9
      Bloco B -> 10 11 12

    Depois a função renderizarDispositivo() inverte visualmente
    blocos e posições para mostrar o dispositivo da direita
    para a esquerda para o agraciado.
  */
  for (
    let fileira = 1;
    fileira <= linhas;
    fileira++
  ) {
    const inicioFileiraGlobal =
      (
        (fileira - 1) *
        quantidadeBlocos *
        colunas
      ) + 1;

    const itensBloco =
      blocos.map(
        (bloco, indiceBloco) => {
          const inicio =
            inicioFileiraGlobal +
            (
              indiceBloco *
              colunas
            );

          const posicoes = [];

          for (
            let i = 0;
            i < colunas;
            i++
          ) {
            const posicao =
              inicio + i;

            if (
              posicao <= total
            ) {
              posicoes.push(
                posicao
              );
            }
          }

          return {
            nome: bloco,
            capacidade: colunas,
            posicoes
          };
        }
      );

    fileiras.push({
      numero: fileira,
      blocos: itensBloco
    });
  }

  return {
    blocos,
    fileiras
  };
}


function criarLugar(
  posicao,
  selecionada
) {
  const lugar =
    document.createElement('div');

  lugar.className =
    'dispositivo-lugar';

  if (posicao == null) {
    lugar.classList.add(
      'vazio'
    );

    /*
      O lugar vazio PRECISA continuar ocupando espaço físico.
      Por isso usamos visibility:hidden, e não display:none.

      O estilo inline também protege o alinhamento caso o CSS
      da página não possua a regra .vazio corretamente.
    */
    lugar.style.visibility =
      'hidden';

    lugar.style.pointerEvents =
      'none';

    lugar.setAttribute(
      'aria-hidden',
      'true'
    );

    return lugar;
  }

  lugar.textContent =
    posicao;

  lugar.title =
    `Posição ${posicao}`;

  if (
    numero(posicao) ===
    numero(selecionada)
  ) {
    lugar.classList.add(
      'selecionado'
    );

    lugar.setAttribute(
      'aria-label',
      `Sua posição: ${posicao}`
    );
  } else {
    lugar.setAttribute(
      'aria-label',
      `Posição ${posicao}`
    );
  }

  return lugar;
}


/*
  Gera os nomes dos blocos:

  1  -> A
  2  -> B
  ...
  26 -> Z
  27 -> AA
  28 -> AB

  Isso evita problemas caso futuramente sejam usados
  mais de 26 blocos.
*/
function nomeBloco(numeroBloco) {
  let n = Math.max(
    1,
    Math.floor(
      Number(numeroBloco) || 1
    )
  );

  let nome = '';

  while (n > 0) {
    n--;

    nome =
      String.fromCharCode(
        65 + (n % 26)
      ) + nome;

    n =
      Math.floor(
        n / 26
      );
  }

  return nome;
}
