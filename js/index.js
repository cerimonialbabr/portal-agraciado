'use strict';

document.addEventListener('DOMContentLoaded', iniciarIndex);

async function iniciarIndex() {
  try {
    const dados = await apiObterDados();
    const config = dados.config || {};

    configurarBanner(config);
    definirTexto('solenidade', config.Solenidade);
    definirTexto('data', config.Data);
    definirTexto('local', config.Local);

    configurarLivreto(config);
    configurarPatrocinadores(config);

   document.getElementById('carregando').hidden = true;
   document.getElementById('conteudo').hidden = false;
    
  } catch (erro) {
    console.error(erro);
    document.getElementById('carregando').hidden = true;
    const caixa = document.getElementById('erro');
    caixa.textContent = 'Não foi possível carregar as informações. Atualize a página ou procure a equipe de cerimonial.';
    caixa.hidden = false;
  }
}

function configurarLivreto(config) {
  const botao = document.getElementById('botaoLivreto');
  const link = texto(config.Link_Livreto);
  if (!link) {
    botao.hidden = true;
    return;
  }

  botao.href = link;
  definirTexto('tituloLivreto', config.Titulo_Livreto || 'Programa Oficial');
}

function configurarPatrocinadores(config) {
  const area = document.getElementById('areaPatrocinadores');
  const lista = document.getElementById('patrocinadores');
  const patrocinadores = [];

  for (let i = 1; i <= 3; i++) {
    const imagem = urlImagem(config[`Patrocinador_${i}_Imagem`]);
    const link = texto(config[`Patrocinador_${i}_Link`]);
    if (imagem) patrocinadores.push({imagem, link, indice: i});
  }

  if (!patrocinadores.length) {
    area.hidden = true;
    return;
  }

  definirTexto('tituloPatrocinadores', config.Titulo_Patrocinadores || 'APOIO');
  lista.innerHTML = '';

  for (const patrocinador of patrocinadores) {
    const imagem = document.createElement('img');
    console.log(patrocinador.imagem);
    imagem.src = patrocinador.imagem;
    imagem.alt = `Patrocinador ${patrocinador.indice}`;
    imagem.loading = 'lazy';

    if (patrocinador.link) {
      const ancora = document.createElement('a');
      ancora.href = patrocinador.link;
      ancora.target = '_blank';
      ancora.rel = 'noopener noreferrer';
      ancora.appendChild(imagem);
      lista.appendChild(ancora);
    } else {
      const caixa = document.createElement('div');
      caixa.appendChild(imagem);
      lista.appendChild(caixa);
    }
  }

  area.hidden = false;
}
