'use strict';

function renderizarDispositivo(container, dados, posicaoSelecionada) {
  container.innerHTML = '';

  const config = dados?.config || {};
  const total = numero(config.Total_Agraciados, (dados?.agraciados || []).length);
  const modo = normalizar(config.Modo_Layout);
  const layoutManual = Array.isArray(dados?.layout) ? dados.layout : [];

  const modelo = modo === 'MANUAL' && layoutManual.length
    ? construirModeloManual(layoutManual, total)
    : construirModeloAutomatico(config, total);

  if (!modelo.fileiras.length) {
    container.innerHTML = '<p class="estado-vazio">Dispositivo não configurado.</p>';
    return;
  }

  const maxColunas = Math.max(...modelo.fileiras.flatMap(f => f.blocos.map(b => b.capacidade)), 1);
  container.style.setProperty('--quantidade-blocos', modelo.blocos.length);
  container.style.setProperty('--max-colunas', maxColunas);

  for (const fileira of modelo.fileiras) {
    const linha = document.createElement('div');
    linha.className = 'dispositivo-fileira';

    // Exibição da esquerda para a direita vista pelo agraciado, diante do dispositivo.
    for (const bloco of [...fileira.blocos].reverse()) {
      const grupo = document.createElement('div');
      grupo.className = 'dispositivo-bloco';
      grupo.style.setProperty('--capacidade-bloco', bloco.capacidade);

      const posicoes = [...bloco.posicoes].reverse();
      const vazios = Math.max(0, bloco.capacidade - posicoes.length);
      const vazioEsquerda = Math.floor(vazios / 2);
      const vazioDireita = vazios - vazioEsquerda;

      for (let i = 0; i < vazioEsquerda; i++) grupo.appendChild(criarLugar(null, posicaoSelecionada));
      for (const posicao of posicoes) grupo.appendChild(criarLugar(posicao, posicaoSelecionada));
      for (let i = 0; i < vazioDireita; i++) grupo.appendChild(criarLugar(null, posicaoSelecionada));

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
      quantidade: numero(item['Posições'] ?? item.Posicoes)
    }))
    .filter(item => item.quantidade > 0)
    .sort((a, b) => a.ordem - b.ordem);

  const blocos = [...new Set(itens.map(item => item.bloco))];
  const fileirasNumeros = [...new Set(itens.map(item => item.fileira))].sort((a, b) => a - b);
  const capacidadePorBloco = Object.fromEntries(
    blocos.map(bloco => [bloco, Math.max(...itens.filter(i => i.bloco === bloco).map(i => i.quantidade), 1)])
  );

  let proximaPosicao = 1;
  const mapa = new Map();

  // A numeração obedece rigorosamente à coluna Ordem da aba LAYOUT.
  for (const item of itens) {
    const posicoes = [];
    for (let i = 0; i < item.quantidade && proximaPosicao <= total; i++) {
      posicoes.push(proximaPosicao++);
    }
    mapa.set(`${item.fileira}|${item.bloco}`, posicoes);
  }

  return {
    blocos,
    fileiras: fileirasNumeros.map(fileira => ({
      numero: fileira,
      blocos: blocos.map(bloco => ({
        nome: bloco,
        capacidade: capacidadePorBloco[bloco],
        posicoes: mapa.get(`${fileira}|${bloco}`) || []
      }))
    }))
  };
}

function construirModeloAutomatico(config, total) {
  const quantidadeBlocos = Math.max(1, numero(config.Quantidade_Blocos, 1));
  const linhas = Math.max(1, numero(config.Linhas_Por_Bloco, 1));
  const colunas = Math.max(1, numero(config.Colunas_Por_Bloco, Math.ceil(total / quantidadeBlocos / linhas)));
  const blocos = Array.from({length: quantidadeBlocos}, (_, i) => String.fromCharCode(65 + i));
  const capacidadeBloco = linhas * colunas;

  const fileiras = [];
  for (let fileira = 1; fileira <= linhas; fileira++) {
    const itensBloco = blocos.map((bloco, indiceBloco) => {
      const inicio = indiceBloco * capacidadeBloco + (fileira - 1) * colunas + 1;
      const posicoes = [];
      for (let i = 0; i < colunas; i++) {
        const posicao = inicio + i;
        if (posicao <= total) posicoes.push(posicao);
      }
      return {nome: bloco, capacidade: colunas, posicoes};
    });
    fileiras.push({numero: fileira, blocos: itensBloco});
  }

  return {blocos, fileiras};
}

function criarLugar(posicao, selecionada) {
  const lugar = document.createElement('div');
  lugar.className = 'dispositivo-lugar';

  if (posicao == null) {
    lugar.classList.add('vazio');
    lugar.setAttribute('aria-hidden', 'true');
    return lugar;
  }

  lugar.textContent = posicao;
  lugar.title = `Posição ${posicao}`;

  if (numero(posicao) === numero(selecionada)) {
    lugar.classList.add('selecionado');
    lugar.setAttribute('aria-label', `Sua posição: ${posicao}`);
  } else {
    lugar.setAttribute('aria-label', `Posição ${posicao}`);
  }

  return lugar;
}
