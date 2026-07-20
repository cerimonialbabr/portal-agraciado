/**
 * ==========================================================
 * registro.js
 * Página individual do agraciado
 * ==========================================================
 */

let dadosRegistro = null;

document.addEventListener(

    "DOMContentLoaded",

    iniciarPagina

);



async function iniciarPagina() {

    try {

        mostrarCarregando(true);


        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const id =
            parametros.get("id");


        if (!id) {

            throw new Error(
                "Agraciado não informado."
            );

        }


        configurarEventos();


        dadosRegistro =
            await API.buscarRegistro(id);


        preencherTela(
            dadosRegistro
        );


        mostrarCarregando(false);

    }

    catch (erro) {

        console.error(erro);

        mostrarErro(
            erro.message
        );

    }

  function configurarEventos() {

    const botao =

        document.getElementById(
            "btnRegistrar"
        );

    if (botao) {

        botao.addEventListener(

            "click",

            abrirModal

        );

    }



    const cancelar =

        document.getElementById(
            "btnCancelar"
        );

    if (cancelar) {

        cancelar.addEventListener(

            "click",

            fecharModal

        );

    }



    const confirmar =

        document.getElementById(
            "btnConfirmar"
        );

    if (confirmar) {

        confirmar.addEventListener(

            "click",

            confirmarPresenca

        );

    }

}

  function preencherTela(dados) {

    preencherNome(dados);

    preencherPosicao(dados);

    preencherMensagens(dados);

    desenharDispositivo(dados);

    atualizarEstadoConfirmacao(dados);

}

  function preencherNome(dados) {

    document.getElementById(
        "nomeAgraciado"
    ).textContent =
        dados.nome;

}



function preencherPosicao(dados) {

    document.getElementById(
        "numeroPosicao"
    ).textContent =
        dados.posicao;

}

  function preencherMensagens(dados) {

    const individual =

        document.getElementById(
            "mensagemIndividual"
        );

    if (

        dados.mensagemIndividual

    ) {

        individual.hidden = false;

        individual.innerHTML =
            dados.mensagemIndividual;

    }

    else {

        individual.hidden = true;

    }



    const container =

        document.getElementById(
            "mensagensGerais"
        );

    container.innerHTML = "";


    (

        dados.mensagensGerais || []

    ).forEach(texto => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "mensagem-geral";

        div.innerHTML =
            texto;

        container.appendChild(div);

    });

}

  function desenharDispositivo(dados) {

    Dispositivo.renderizar({

        grade:

            document.getElementById(
                "gradeDispositivo"
            ),

        tituloSuperior:

            document.getElementById(
                "tituloSuperior"
            ),

        tituloInferior:

            document.getElementById(
                "tituloInferior"
            ),

        config:
            dados.config,

        layout:
            dados.layout,

        total:
            dados.total,

        posicaoSelecionada:
            dados.posicao

    });

}

    /**
 * ==========================================================
 * MODAL
 * ==========================================================
 */

function abrirModal() {

    if (!dadosRegistro) return;

    if (dadosRegistro.presente) return;

    document.getElementById(
        "modalConfirmacao"
    ).hidden = false;

}



function fecharModal() {

    document.getElementById(
        "modalConfirmacao"
    ).hidden = true;

}

    /**
 * ==========================================================
 * CONFIRMAÇÃO
 * ==========================================================
 */

async function confirmarPresenca() {

    const botao =

        document.getElementById(
            "btnConfirmar"
        );

    try {

        botao.disabled = true;

        botao.textContent =
            "Registrando...";


        const resposta =

            await API.confirmarPresenca(

                dadosRegistro.id

            );


        fecharModal();


        dadosRegistro.presente = true;

        dadosRegistro.dataHora =
            resposta.dataHora;


        atualizarEstadoConfirmacao(
            dadosRegistro
        );

    }

    catch (erro) {

        alert(

            erro.message ||

            "Erro ao registrar presença."

        );

    }

    finally {

        botao.disabled = false;

        botao.textContent =
            "Sim, confirmar";

    }

}

    /**
 * ==========================================================
 * ESTADO DA TELA
 * ==========================================================
 */

function atualizarEstadoConfirmacao(dados) {

    const botao =

        document.getElementById(
            "btnRegistrar"
        );


    const cartao =

        document.getElementById(
            "cartaoConfirmado"
        );


    if (!dados.presente) {

        botao.hidden = false;

        cartao.hidden = true;

        return;

    }


    botao.hidden = true;

    cartao.hidden = false;


    const hora =

        document.getElementById(
            "horaConfirmacao"
        );


    if (hora) {

        hora.textContent =
            dados.dataHora || "";

    }

}

    /**
 * ==========================================================
 * LOADING
 * ==========================================================
 */

function mostrarCarregando(visivel) {

    document.getElementById(
        "estadoCarregando"
    ).hidden = !visivel;


    document.getElementById(
        "conteudoPagina"
    ).hidden = visivel;


    document.getElementById(
        "estadoErro"
    ).hidden = true;

}

    /**
 * ==========================================================
 * ERRO
 * ==========================================================
 */

function mostrarErro(mensagem) {

    document.getElementById(
        "estadoCarregando"
    ).hidden = true;


    document.getElementById(
        "conteudoPagina"
    ).hidden = true;


    document.getElementById(
        "estadoErro"
    ).hidden = false;


    document.getElementById(
        "textoErro"
    ).textContent = mensagem;

}

    

  
