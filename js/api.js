'use strict';

const API_URL = 'https://script.google.com/macros/s/AKfycby_Oeki-w1mFC8VPSPuszOpsRvPVfZ1fuCyvvz1cYkXogwll6jO051eh0R9y3ibWr8A/exec';

async function apiObterDados() {
  const resposta = await fetch(`${API_URL}?action=dados&_=${Date.now()}`, {
    method: 'GET',
    cache: 'no-store',
    redirect: 'follow'
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao carregar os dados (${resposta.status}).`);
  }

  const dados = await resposta.json();
  if (!dados || dados.ok === false) {
    throw new Error(dados?.erro || 'A API retornou uma resposta inválida.');
  }

  return dados;
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

  return resultado;
}
