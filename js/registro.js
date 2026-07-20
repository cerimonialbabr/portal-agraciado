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

  
