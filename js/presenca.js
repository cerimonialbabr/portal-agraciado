"use strict";


// ==========================================================
// DADOS TEMPORÁRIOS PARA TESTE
// Depois esta lista será substituída pelos dados da API.
// ==========================================================

const AGRACIADOS_TESTE = [
    {
        id: "AGR001",
        posto: "Maj Brig",
        nome: "José Carlos da Silva"
    },
    {
        id: "AGR002",
        posto: "Brig",
        nome: "Antônio Roberto de Oliveira"
    },
    {
        id: "AGR003",
        posto: "Cel Av",
        nome: "Carlos Eduardo Pereira"
    },
    {
        id: "AGR004",
        posto: "Ten Cel Av",
        nome: "Marcos Vinícius Almeida"
    },
    {
        id: "AGR005",
        posto: "Maj Av",
        nome: "Paulo Henrique Rodrigues"
    },
    {
        id: "AGR006",
        posto: "Cap Av",
        nome: "João Pedro Fernandes"
    },
    {
        id: "AGR007",
        posto: "1º Ten",
        nome: "Ana Carolina Souza"
    },
    {
        id: "AGR008",
        posto: "2º Ten",
        nome: "Juliana Martins Ribeiro"
    },
    {
        id: "AGR009",
        posto: "SO",
        nome: "Ricardo Augusto Ferreira"
    },
    {
        id: "AGR010",
        posto: "1S",
        nome: "Fernando Luiz Costa"
    },
    {
        id: "AGR011",
        posto: "2S",
        nome: "Gustavo Henrique Lima"
    },
    {
        id: "AGR012",
        posto: "3S",
        nome: "Daniel Alves de Moraes"
    },
    {
        id: "AGR013",
        posto: "Cb",
        nome: "Lucas Gabriel Santos"
    },
    {
        id: "AGR014",
        posto: "S2",
        nome: "Rafael Gomes da Rocha"
    },
    {
        id: "AGR015",
        posto: "",
        nome: "Maria Helena Barbosa"
    }
];


// ==========================================================
// ELEMENTOS DA PÁGINA
// ==========================================================

const elementos = {
    campoPesquisa: document.getElementById("campo-pesquisa"),
    botaoLimparPesquisa: document.getElementById(
        "botao-limpar-pesquisa"
    ),
    contadorResultados: document.getElementById(
        "contador-resultados"
    ),
    listaAgraciados: document.getElementById(
        "lista-agraciados"
    ),
    semResultados: document.getElementById(
        "sem-resultados"
    ),
    modal: document.getElementById(
        "modal-confirmacao"
    ),
    nomeSelecionado: document.getElementById(
        "nome-selecionado"
    ),
    botaoCancelar: document.getElementById(
        "botao-cancelar"
    ),
    botaoContinuar: document.getElementById(
        "botao-continuar"
    )
};


let agraciadoSelecionado = null;


// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

document.addEventListener("DOMContentLoaded", iniciar);


function iniciar() {

    ordenarAgraciados();

    renderizarAgraciados(AGRACIADOS_TESTE);

    configurarEventos();

    elementos.campoPesquisa.focus();

}


// ==========================================================
// ORDENAÇÃO
// ==========================================================

function ordenarAgraciados() {

    AGRACIADOS_TESTE.sort((a, b) => {

        const nomeA = montarNomeCompleto(a);
        const nomeB = montarNomeCompleto(b);

        return nomeA.localeCompare(
            nomeB,
            "pt-BR",
            {
                sensitivity: "base"
            }
        );

    });

}


// ==========================================================
// EVENTOS
// ==========================================================

function configurarEventos() {

    elementos.campoPesquisa.addEventListener(
        "input",
        filtrarAgraciados
    );

    elementos.botaoLimparPesquisa.addEventListener(
        "click",
        limparPesquisa
    );

    elementos.botaoCancelar.addEventListener(
        "click",
        fecharModal
    );

    elementos.botaoContinuar.addEventListener(
        "click",
        continuarParaRegistro
    );

    elementos.modal.addEventListener(
        "click",
        tratarCliqueModal
    );

    document.addEventListener(
        "keydown",
        tratarTeclado
    );

}


// ==========================================================
// LISTA DE AGRACIADOS
// ==========================================================

function renderizarAgraciados(agraciados) {

    elementos.listaAgraciados.innerHTML = "";

    elementos.semResultados.hidden = agraciados.length > 0;

    atualizarContador(agraciados.length);

    if (agraciados.length === 0) {
        return;
    }

    const fragmento = document.createDocumentFragment();

    agraciados.forEach((agraciado) => {

        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "item-agraciado";

        botao.dataset.id = agraciado.id;

        botao.textContent = montarNomeCompleto(agraciado);

        botao.addEventListener(
            "click",
            () => abrirModal(agraciado)
        );

        fragmento.appendChild(botao);

    });

    elementos.listaAgraciados.appendChild(fragmento);

}


function montarNomeCompleto(agraciado) {

    const posto = String(agraciado.posto || "").trim();
    const nome = String(agraciado.nome || "").trim();

    return posto
        ? `${posto} ${nome}`
        : nome;

}


// ==========================================================
// PESQUISA
// ==========================================================

function filtrarAgraciados() {

    const termoOriginal = elementos.campoPesquisa.value.trim();

    elementos.botaoLimparPesquisa.hidden =
        termoOriginal.length === 0;

    const termoNormalizado = normalizarTexto(termoOriginal);

    if (!termoNormalizado) {

        renderizarAgraciados(AGRACIADOS_TESTE);

        return;

    }

    const resultados = AGRACIADOS_TESTE.filter(
        (agraciado) => {

            const textoAgraciado = normalizarTexto(
                montarNomeCompleto(agraciado)
            );

            return textoAgraciado.includes(termoNormalizado);

        }
    );

    renderizarAgraciados(resultados);

}


function limparPesquisa() {

    elementos.campoPesquisa.value = "";

    elementos.botaoLimparPesquisa.hidden = true;

    renderizarAgraciados(AGRACIADOS_TESTE);

    elementos.campoPesquisa.focus();

}


function normalizarTexto(texto) {

    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");

}


function atualizarContador(quantidade) {

    if (quantidade === 0) {

        elementos.contadorResultados.textContent =
            "Nenhum resultado encontrado.";

        return;

    }

    if (quantidade === 1) {

        elementos.contadorResultados.textContent =
            "1 agraciado encontrado.";

        return;

    }

    elementos.contadorResultados.textContent =
        `${quantidade} agraciados encontrados.`;

}


// ==========================================================
// MODAL
// ==========================================================

function abrirModal(agraciado) {

    agraciadoSelecionado = agraciado;

    elementos.nomeSelecionado.textContent =
        montarNomeCompleto(agraciado);

    elementos.modal.hidden = false;

    document.body.classList.add("modal-aberto");

    elementos.botaoContinuar.focus();

}


function fecharModal() {

    elementos.modal.hidden = true;

    document.body.classList.remove("modal-aberto");

    agraciadoSelecionado = null;

}


function tratarCliqueModal(evento) {

    const deveFechar = evento.target.hasAttribute(
        "data-fechar-modal"
    );

    if (deveFechar) {
        fecharModal();
    }

}


function tratarTeclado(evento) {

    if (
        evento.key === "Escape" &&
        !elementos.modal.hidden
    ) {

        fecharModal();

    }

}


// ==========================================================
// NAVEGAÇÃO
// ==========================================================

function continuarParaRegistro() {

    if (!agraciadoSelecionado) {
        return;
    }

    const id = encodeURIComponent(
        agraciadoSelecionado.id
    );

    window.location.href =
        `registro.html?id=${id}`;

}
