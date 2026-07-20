'use strict';

function texto(valor) {
  return String(valor ?? '').trim();
}

function numero(valor, padrao = 0) {
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : padrao;
}

function normalizar(valor) {
  return texto(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function escaparHtml(valor) {
  return texto(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatarDataHora(valor) {
  if (!valor) return 'Presença já registrada';
  const data = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Presença já registrada';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(data);
}

function urlImagem(valor) {
  const original = texto(valor);
  if (!original) return '';

  const matchId = original.match(/[-\w]{25,}/);
  if (/drive\.google\.com|docs\.google\.com/i.test(original) && matchId) {
    return `https://drive.google.com/thumbnail?id=${matchId[0]}&sz=w1600`;
  }

  return original;
}

function configurarBanner(config) {
  const banner = document.querySelector('[data-banner]');
  if (!banner) return;

  const imagem = urlImagem(config?.Imagem_Capa);

  const img = banner.querySelector('img');
  const fallback = banner.querySelector('.banner-fallback');

  if (!img || !fallback) {
    console.error('Banner inválido.', banner);
    return;
  }

  if (imagem) {
    img.src = imagem;
    img.hidden = false;
    fallback.hidden = true;

    img.addEventListener('error', () => {
      img.hidden = true;
      fallback.hidden = false;
    }, { once: true });

  } else {
    img.hidden = true;
    fallback.hidden = false;
  }
}

function definirTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = texto(valor);
}
