"use strict";


/**
 * Renderiza o dispositivo de posicionamento do agraciado.
 *
 * Configuração esperada:
 *
 * {
 *     modoLayout: "AUTOMATICO" ou "MANUAL",
 *     totalAgraciados: 30,
 *     quantidadeBlocos: 2,
 *     linhasPorBloco: 3,
 *     colunasPorBloco: 5,
 *     tituloSuperior: "TRIBUNA",
 *     tituloInferior: "TROPA",
 *     layoutManual: []
 * }
 */
window.DispositivoAgraciado = {

    renderizar(configuracao, posicaoSelecionada) {

        const config = configuracao || {};

        const grade = document.getElementById(
            "grade-dispositivo"
        );

        const referenciaSuperior = document.getElementById(
            "referencia-superior"
        );

        const referenciaInferior = document.getElementById(
            "referencia-inferior"
        );

        if (
            !grade ||
            !referenciaSuperior ||
            !referenciaInferior
        ) {
            return;
        }

        referenciaSuperior.textContent =
            config.tituloSuperior || "TRIBUNA";

        referenciaInferior.textContent =
            config.tituloInferior || "TROPA";

        grade.innerHTML = "";

        const modo = normalizarModo(
            config.modoLayout || "AUTOMATICO"
        );

        const total = obterNumeroPositivo(
            config.totalAgraciados,
            1
        );

        if (
            modo === "MANUAL" &&
            Array.isArray(config.layoutManual) &&
            config.layoutManual.length > 0
        ) {

            desenharManual(
                grade,
                config.layoutManual,
                total,
                posicaoSelecionada
            );

            return;

        }

        desenharAutomatico(
            grade,
            config,
            total,
            posicaoSelecionada
        );

    }

};


function desenharAutomatico(
    grade,
    config,
    total,
    posicaoSelecionada
) {

    const quantidadeBlocos = obterNumeroPositivo(
        config.quantidadeBlocos,
        1
    );

    const linhas = obterNumeroPositivo(
        config.linhasPorBloco,
        1
    );

    const colunas = obterNumeroPositivo(
        config.colunasPorBloco,
        total
    );

    const tamanho = calcularTamanhoCirculo(
        quantidadeBlocos,
        colunas
    );

    aplicarEstiloGrade(grade, tamanho);

    for (let linha = 0; linha < linhas; linha += 1) {

        const linhaGlobal = document.createElement("div");

        linhaGlobal.className = "mini-linha-global";

        const inicioLinhaGlobal =
            (linha * quantidadeBlocos * colunas) + 1;

        /*
         * Os blocos são exibidos da direita para a esquerda,
         * mantendo a mesma lógica visual do sistema anterior.
         */
        for (
            let bloco = quantidadeBlocos;
            bloco >= 1;
            bloco -= 1
        ) {

            const blocoLinha = document.createElement("div");

            blocoLinha.className = "mini-bloco-linha";

            const inicioBloco =
                inicioLinhaGlobal +
                ((bloco - 1) * colunas);

            const fimBloco =
                inicioBloco + colunas - 1;

            for (
                let posicao = fimBloco;
                posicao >= inicioBloco;
                posicao -= 1
            ) {

                blocoLinha.appendChild(
                    criarCirculo(
                        posicao,
                        total,
                        posicaoSelecionada
                    )
                );

            }

            linhaGlobal.appendChild(blocoLinha);

        }

        grade.appendChild(linhaGlobal);

    }

}


function desenharManual(
    grade,
    layoutManual,
    total,
    posicaoSelecionada
) {

    const linhasMapeadas = {};
    const ordemFileiras = [];

    let contadorPosicao = 1;

    layoutManual
        .slice()
        .sort((a, b) => {

            return (
                Number(a.ordem || a.Ordem || 0) -
                Number(b.ordem || b.Ordem || 0)
            );

        })
        .forEach((item) => {

            const fileira = String(
                item.fileira ||
                item.Fileira ||
                ""
            ).trim();

            const bloco = String(
                item.bloco ||
                item.Bloco ||
                ""
            ).trim();

            const quantidade = Number(
                item.posicoes ||
                item["Posições"] ||
                item.Posicoes ||
                0
            );

            if (
                !fileira ||
                !bloco ||
                !quantidade
            ) {
                return;
            }

            if (!linhasMapeadas[fileira]) {

                linhasMapeadas[fileira] = [];
                ordemFileiras.push(fileira);

            }

            const posicoes = [];

            for (
                let indice = 0;
                indice < quantidade;
                indice += 1
            ) {

                posicoes.push(
                    contadorPosicao <= total
                        ? contadorPosicao
                        : null
                );

                contadorPosicao += 1;

            }

            linhasMapeadas[fileira].push({
                bloco,
                posicoes
            });

        });


    const nomesBlocos = [];

    ordemFileiras.forEach((fileira) => {

        linhasMapeadas[fileira].forEach((item) => {

            if (!nomesBlocos.includes(item.bloco)) {
                nomesBlocos.push(item.bloco);
            }

        });

    });

    nomesBlocos.sort().reverse();


    const maximoPorBloco = {};

    nomesBlocos.forEach((bloco) => {
        maximoPorBloco[bloco] = 0;
    });

    ordemFileiras.forEach((fileira) => {

        linhasMapeadas[fileira].forEach((item) => {

            maximoPorBloco[item.bloco] = Math.max(
                maximoPorBloco[item.bloco],
                item.posicoes.length
            );

        });

    });


    const quantidadeBlocos = nomesBlocos.length || 1;

    const mediaColunas = Math.ceil(
        nomesBlocos.reduce(
            (totalColunas, bloco) => {

                return (
                    totalColunas +
                    maximoPorBloco[bloco]
                );

            },
            0
        ) / quantidadeBlocos
    ) || 1;

    const tamanho = calcularTamanhoCirculo(
        quantidadeBlocos,
        mediaColunas
    );

    aplicarEstiloGrade(grade, tamanho);


    ordemFileiras.forEach((fileira) => {

        const linhaGlobal = document.createElement("div");

        linhaGlobal.className = "mini-linha-global";

        nomesBlocos.forEach((nomeBloco) => {

            const blocoLinha = document.createElement("div");

            blocoLinha.className = "mini-bloco-linha";

            const blocoEncontrado =
                linhasMapeadas[fileira].find(
                    (item) => item.bloco === nomeBloco
                );

            const posicoes = blocoEncontrado
                ? blocoEncontrado.posicoes.slice()
                : [];

            while (
                posicoes.length <
                maximoPorBloco[nomeBloco]
            ) {
                posicoes.push(null);
            }

            posicoes
                .slice()
                .reverse()
                .forEach((posicao) => {

                    blocoLinha.appendChild(
                        criarCirculo(
                            posicao,
                            total,
                            posicaoSelecionada
                        )
                    );

                });

            linhaGlobal.appendChild(blocoLinha);

        });

        grade.appendChild(linhaGlobal);

    });

}


function criarCirculo(
    posicao,
    total,
    posicaoSelecionada
) {

    const circulo = document.createElement("div");

    circulo.className = "mini-circulo";

    if (
        !posicao ||
        Number(posicao) > Number(total)
    ) {

        circulo.classList.add("mini-vazio");
        circulo.textContent = "";

        return circulo;

    }

    if (
        Number(posicao) ===
        Number(posicaoSelecionada)
    ) {

        circulo.classList.add("mini-destaque");
        circulo.textContent = posicao;

        return circulo;

    }

    circulo.classList.add("mini-normal");
    circulo.textContent = posicao;

    return circulo;

}


function aplicarEstiloGrade(grade, tamanho) {

    grade.style.setProperty(
        "--mini-circle-size",
        `${tamanho}px`
    );

    grade.style.setProperty(
        "--mini-gap-circulos",
        `${Math.max(
            3,
            Math.floor(tamanho * 0.15)
        )}px`
    );

    grade.style.setProperty(
        "--mini-gap-linhas",
        `${Math.max(
            4,
            Math.floor(tamanho * 0.18)
        )}px`
    );

    grade.style.setProperty(
        "--mini-gap-blocos",
        `${Math.max(
            16,
            Math.floor(tamanho * 0.75)
        )}px`
    );

}


function calcularTamanhoCirculo(
    quantidadeBlocos,
    colunas
) {

    const area = document.querySelector(".mini-area");

    const larguraDisponivel = area
        ? area.clientWidth * 0.90
        : 600;

    const totalColunas =
        Math.max(
            1,
            quantidadeBlocos * colunas
        );

    let tamanho = Math.floor(
        larguraDisponivel /
        (totalColunas + 4)
    );

    if (tamanho > 32) {
        tamanho = 32;
    }

    if (tamanho < 14) {
        tamanho = 14;
    }

    return tamanho;

}


function obterNumeroPositivo(valor, valorPadrao) {

    const numero = Number(valor);

    if (
        Number.isFinite(numero) &&
        numero > 0
    ) {
        return Math.floor(numero);
    }

    return valorPadrao;

}


function normalizarModo(valor) {

    return String(valor || "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

}
