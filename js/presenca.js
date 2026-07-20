'use strict';

let agraciados = [];

const campoBusca = document.getElementById('busca');
const lista = document.getElementById('listaAgraciados');
const contador = document.getElementById('contador');

campoBusca.addEventListener('input', filtrarAgraciados);
document.addEventListener('DOMContentLoaded', iniciarPresenca);

async function iniciarPresenca() {
  try {
    const dados = await apiObterDados();
    configurarBanner(dados.config || {});
    document.querySelector('[data-banner]')?.classList.remove('oculto');

    agraciados = (dados.agraciados || [])
      .filter(item => texto(item.ID) && texto(item.Nome))
      agraciados.sort(

    (a,b)=>

    Number(a["Posição"]) -

    Number(b["Posição"])

);

    renderizarLista(agraciados);
    document.getElementById('carregando').hidden = true;
    document.getElementById('conteudo').hidden = false;
    campoBusca.focus({preventScroll: true});
  } catch (erro) {
    console.error(erro);
    document.getElementById('carregando').hidden = true;
    const caixa = document.getElementById('erro');
    caixa.textContent = 'Não foi possível carregar a lista. Atualize a página ou procure a equipe de cerimonial.';
    caixa.hidden = false;
  }
}

function filtrarAgraciados() {
  const termo = normalizar(campoBusca.value);
  const resultado = termo
    ? agraciados.filter(item => normalizar(item.Nome).includes(termo))
    : agraciados;
  renderizarLista(resultado);
}

function renderizarLista(itens) {
  contador.textContent = `${itens.length} ${itens.length === 1 ? 'nome encontrado' : 'nomes encontrados'}`;
  lista.innerHTML = '';

  if (!itens.length) {
    lista.innerHTML = '<div class="estado-vazio">Nenhum nome encontrado. Verifique a grafia ou procure a equipe de cerimonial.</div>';
    return;
  }

  const fragmento = document.createDocumentFragment();
  for (const item of itens) {
    const link = document.createElement('a');
    link.className = 'nome-link';
    link.href = `registro.html?id=${encodeURIComponent(item.ID)}`;
    link.textContent = item.Nome;
    fragmento.appendChild(link);
  }
  lista.appendChild(fragmento);
}
