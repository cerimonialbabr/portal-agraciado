'use strict';

const API_URL = 'https://script.google.com/macros/s/AKfycby_Oeki-w1mFC8VPSPuszOpsRvPVfZ1fuCyvvz1cYkXogwll6jO051eh0R9y3ibWr8A/exec';

const CACHE_PUBLICO_SESSAO = 'sga_publico_v3';
const CACHE_PUBLICO_BACKUP = 'sga_publico_backup_v3';
const CACHE_SESSAO_MS = 10 * 60 * 1000;
const CACHE_BACKUP_MS = 30 * 60 * 1000;

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function lerCacheNavegador(storage, chave, validadeMs) {
  try {
    const bruto = storage.getItem(chave);
    if (!bruto) return null;

    const pacote = JSON.parse(bruto);
    if (!pacote || !pacote.salvoEm || !pacote.dados) return null;

    if ((Date.now() - pacote.salvoEm) > validadeMs) {
      storage.removeItem(chave);
      return null;
    }

    return pacote.dados;
  } catch (erro) {
    return null;
  }
}

function gravarCacheNavegador(storage, chave, dados) {
  try {
    storage.setItem(chave, JSON.stringify({
      salvoEm: Date.now(),
      dados
    }));
  } catch (erro) {
    /* Cache local é opcional. */
  }
}

async function apiGet(action, parametros = {}, opcoes = {}) {
  const tentativas = Math.max(1, Number(opcoes.tentativas) || 2);
  const timeoutMs = Math.max(5000, Number(opcoes.timeoutMs) || 18000);

  let ultimoErro;

  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      /*
        Pequeno espalhamento somente na primeira tentativa.
        Em cerimônias, dezenas de celulares costumam abrir a página
        quase no mesmo segundo. Esses milissegundos reduzem o pico.
      */
      if (tentativa === 1 && opcoes.jitter !== false) {
        await esperar(Math.floor(Math.random() * 280));
      }

      const url = new URL(API_URL);
      url.searchParams.set('action', action);
      url.searchParams.set('_', Date.now());

      Object.entries(parametros).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== '') {
          url.searchParams.set(chave, valor);
        }
      });

      const resposta = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store',
        redirect: 'follow',
        signal: controller.signal
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao carregar os dados (${resposta.status}).`);
      }

      const dados = await resposta.json();

      if (!dados || dados.ok === false) {
        throw new Error(dados?.erro || 'A API retornou uma resposta inválida.');
      }

      return dados;

    } catch (erro) {
      ultimoErro = erro;

      if (tentativa < tentativas) {
        await esperar(350 * tentativa + Math.floor(Math.random() * 300));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw ultimoErro || new Error('Não foi possível acessar o servidor.');
}

/*
  Pacote público único do Portal do Agraciado.
  O mesmo conteúdo é reaproveitado entre index -> presenca -> registro,
  evitando uma nova execução do Apps Script em cada mudança de página.
*/
async function apiObterPublico({forcar = false} = {}) {
  if (!forcar) {
    const sessao = lerCacheNavegador(
      sessionStorage,
      CACHE_PUBLICO_SESSAO,
      CACHE_SESSAO_MS
    );

    if (sessao) return sessao;
  }

  try {
    const dados = await apiGet('publico', {}, {
      tentativas: 3,
      timeoutMs: 18000,
      jitter: true
    });

    gravarCacheNavegador(sessionStorage, CACHE_PUBLICO_SESSAO, dados);
    gravarCacheNavegador(localStorage, CACHE_PUBLICO_BACKUP, dados);

    return dados;

  } catch (erro) {
    /*
      Se houver um pico momentâneo no Apps Script, um pacote obtido nos
      últimos 30 minutos ainda permite abrir o portal, a lista e a posição.
      A confirmação de presença continua sendo enviada ao servidor.
    */
    const backup = lerCacheNavegador(
      localStorage,
      CACHE_PUBLICO_BACKUP,
      CACHE_BACKUP_MS
    );

    if (backup) {
      console.warn('Usando cópia local temporária do portal.', erro);
      gravarCacheNavegador(sessionStorage, CACHE_PUBLICO_SESSAO, backup);
      return backup;
    }

    throw erro;
  }
}

/* Compatibilidade com scripts antigos do mesmo portal. */
async function apiObterDados() {
  return apiObterPublico();
}

function atualizarAgraciadoNoCache(id, alteracoes) {
  const atualizar = (storage, chave, validadeMs) => {
    const dados = lerCacheNavegador(storage, chave, validadeMs);
    if (!dados || !Array.isArray(dados.agraciados)) return;

    const item = dados.agraciados.find(
      agraciado => String(agraciado.ID).trim() === String(id).trim()
    );

    if (!item) return;

    Object.assign(item, alteracoes || {});
    gravarCacheNavegador(storage, chave, dados);
  };

  atualizar(sessionStorage, CACHE_PUBLICO_SESSAO, CACHE_SESSAO_MS);
  atualizar(localStorage, CACHE_PUBLICO_BACKUP, CACHE_BACKUP_MS);
}

async function apiConfirmarPresenca(id) {
  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8'},
    body: JSON.stringify({action: 'confirmar', id})
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao registrar a presença (${resposta.status}).`);
  }

  const resultado = await resposta.json();

  if (!resultado || resultado.ok === false) {
    throw new Error(resultado?.erro || 'Não foi possível registrar a presença.');
  }

  atualizarAgraciadoNoCache(id, {Status: 'PRESENTE'});

  return resultado;
}
