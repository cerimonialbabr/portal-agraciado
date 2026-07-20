'use strict';

let dadosRegistro;
let agraciadoAtual;

const idAgraciado = new URLSearchParams(location.search).get('id');

document.getElementById('botaoConfirmar').addEventListener('click', confirmarPresenca);
document.addEventListener('DOMContentLoaded', iniciarRegistro);

async function iniciarRegistro() {
  if (!idAgraciado) {
    mostrarErro('Agraciado não informado. Retorne à lista e selecione seu nome.');
    return;
  }

  try {
    dadosRegistro = await apiObterDados();
    configurarBanner(dadosRegistro.config || {});
    document.querySelector('[data-banner]')?.classList.remove('oculto');

    agraciadoAtual = (dadosRegistro.agraciados || []).find(
      item => texto(item.ID) === texto(idAgraciado)
    );

    if (!agraciadoAtual) {
      mostrarErro('Agraciado não encontrado. Retorne à lista e selecione seu nome.');
      return;
    }

    renderizarRegistro();
  } catch (erro) {
    console.error(erro);
    mostrarErro('Não foi possível carregar os dados. Atualize a página ou procure a equipe de cerimonial.');
  }
}

function renderizarRegistro() {
  document.title = `${texto(agraciadoAtual.Nome) || 'Agraciado'} | Registro de Presença`;
  definirTexto('nomeAgraciado', agraciadoAtual.Nome);
  definirTexto('posicaoAgraciado', agraciadoAtual['Posição']);

  renderizarDispositivo(
    document.getElementById('gradeDispositivo'),
    dadosRegistro,
    agraciadoAtual['Posição']
  );

  definirTexto('tituloSuperior', dadosRegistro.config?.Titulo_Superior || 'TRIBUNA');
  definirTexto('tituloInferior', dadosRegistro.config?.Titulo_Inferior || 'TELÃO');

  renderizarMensagemIndividual();
  renderizarMensagensGerais();

  if (normalizar(agraciadoAtual.Status) === 'PRESENTE') {
    mostrarConfirmacao(localizarHoraCheckin());
  }

  document.getElementById('carregando').hidden = true;
  document.getElementById('conteudo').hidden = false;
}

function renderizarMensagemIndividual() {
  const secao = document.getElementById('secaoMensagemIndividual');
  const caixa = document.getElementById('mensagemIndividual');
  const mensagem = texto(agraciadoAtual['Mensagem Individual']);

  if (!mensagem) {
    secao.hidden = true;
    return;
  }

  caixa.textContent = mensagem;
  secao.hidden = false;
}

function renderizarMensagensGerais() {
  const config = dadosRegistro.config || {};
  const mensagens = Object.keys(config)
    .filter(chave => /^Mensagem_Geral_\d+$/i.test(chave))
    .sort((a, b) => numero(a.match(/\d+/)?.[0]) - numero(b.match(/\d+/)?.[0]))
    .map(chave => texto(config[chave]))
    .filter(Boolean);

  const secao = document.getElementById('secaoMensagensGerais');
  const lista = document.getElementById('mensagensGerais');

  if (!mensagens.length) {
    secao.hidden = true;
    return;
  }

  lista.innerHTML = '';
  for (const mensagem of mensagens) {
    const item = document.createElement('li');
    item.textContent = mensagem;
    lista.appendChild(item);
  }
  secao.hidden = false;
}

async function confirmarPresenca() {
  const botao = document.getElementById('botaoConfirmar');
  const erroAcao = document.getElementById('erroAcao');
  erroAcao.hidden = true;
  botao.disabled = true;
  botao.textContent = 'REGISTRANDO...';

  try {
    const resultado = await apiConfirmarPresenca(agraciadoAtual.ID);
    agraciadoAtual.Status = 'PRESENTE';
    mostrarConfirmacao(resultado.dataHora || resultado.hora || resultado.data || new Date());
  } catch (erro) {
    console.error(erro);
    botao.disabled = false;
    botao.textContent = 'REGISTRAR PRESENÇA';
    erroAcao.textContent = 'Não foi possível registrar a presença. Tente novamente ou procure a equipe de cerimonial.';
    erroAcao.hidden = false;
  }
}

function mostrarConfirmacao(dataHora) {
  document.getElementById('botaoConfirmar').hidden = true;
  definirTexto('confirmacaoData', formatarDataHora(dataHora));
  document.getElementById('confirmacaoCard').hidden = false;
}

function localizarHoraCheckin() {
  const checkin = (dadosRegistro.checkins || []).find(item => texto(item.ID) === texto(agraciadoAtual.ID));
  return checkin?.Hora || agraciadoAtual.Hora || agraciadoAtual.DataHora || '';
}

function mostrarErro(mensagem) {
  document.getElementById('carregando').hidden = true;
  const caixa = document.getElementById('erro');
  caixa.textContent = mensagem;
  caixa.hidden = false;
}
