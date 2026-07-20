const Dispositivo = (() => {

    /**
     * Função pública utilizada pelas páginas do portal.
     *
     * Exemplo:
     *
     * Dispositivo.renderizar({
     *     grade: document.getElementById("gradeDispositivo"),
     *     config: dados.config,
     *     layout: dados.layout,
     *     total: 200,
     *     posicaoSelecionada: 27,
     *     tituloSuperior: document.getElementById("tituloSuperior"),
     *     tituloInferior: document.getElementById("tituloInferior")
     * });
     */
    function renderizar({
        grade,
        config = {},
        layout = [],
        total = 0,
        posicaoSelecionada = null,
        tituloSuperior = null,
        tituloInferior = null
    }) {

        if (!grade) {
            console.error(
                "Dispositivo: o elemento da grade não foi informado."
            );

            return;
        }


        const totalNormalizado = normalizarNumero(total);

        const posicaoNormalizada =
            normalizarNumero(posicaoSelecionada);


        grade.innerHTML = "";


        atualizarTitulos({
            config,
            tituloSuperior,
            tituloInferior
        });


        if (totalNormalizado <= 0) {

            mostrarMensagemSemLayout(
                grade,
                "Não há posições cadastradas."
            );

            return;
        }


        const modoLayout = normalizarTexto(
            config["Modo_Layout"] || "AUTOMATICO"
        );


        if (modoLayout === "MANUAL") {

            desenharModoManual({
                grade,
                config,
                layout,
                total: totalNormalizado,
                posicaoSelecionada: posicaoNormalizada
            });

            return;
        }


        desenharModoAutomatico({
            grade,
            config,
            total: totalNormalizado,
            posicaoSelecionada: posicaoNormalizada
        });

    }


    /**
     * Atualiza os textos exibidos acima e abaixo do dispositivo.
     */
    function atualizarTitulos({
        config,
        tituloSuperior,
        tituloInferior
    }) {

        const superior =
            config["Titulo_Superior"] ||
            config.tituloSuperior ||
            "TRIBUNA";


        const inferior =
            config["Titulo_Inferior"] ||
            config.tituloInferior ||
            "TROPA";


        if (tituloSuperior) {
            tituloSuperior.textContent = superior;
        }


        if (tituloInferior) {
            tituloInferior.textContent = inferior;
        }

    }


    /**
     * Exibe uma mensagem dentro da área do dispositivo
     * quando não for possível montar a grade.
     */
    function mostrarMensagemSemLayout(
        grade,
        mensagem
    ) {

        const elemento = document.createElement("div");

        elemento.className = "dispositivo-sem-layout";

        elemento.textContent = mensagem;

        grade.appendChild(elemento);

    }


    /**
     * Cria uma linha horizontal completa do dispositivo.
     */
    function criarLinhaGlobal() {

        const linha = document.createElement("div");

        linha.className = "dispositivo-linha-global";

        return linha;

    }


    /**
     * Cria o recipiente de um bloco dentro de uma fileira.
     */
    function criarBlocoLinha() {

        const bloco = document.createElement("div");

        bloco.className = "dispositivo-bloco-linha";

        return bloco;

    }


    /**
     * Cria um círculo que representa uma posição.
     */
    function criarCirculo({
        posicao,
        total,
        posicaoSelecionada
    }) {

        const circulo = document.createElement("div");

        circulo.className = "dispositivo-circulo";


        if (
            posicao === null ||
            posicao === undefined ||
            posicao <= 0 ||
            posicao > total
        ) {

            circulo.classList.add(
                "dispositivo-vazio"
            );

            circulo.setAttribute(
                "aria-hidden",
                "true"
            );

            return circulo;

        }


        circulo.textContent = posicao;


        if (
            Number(posicao) ===
            Number(posicaoSelecionada)
        ) {

            circulo.classList.add(
                "dispositivo-destaque"
            );

            circulo.setAttribute(
                "aria-label",
                `Sua posição: ${posicao}`
            );

        } else {

            circulo.classList.add(
                "dispositivo-normal"
            );

            circulo.setAttribute(
                "aria-label",
                `Posição ${posicao}`
            );

        }


        return circulo;

    }


    /**
     * Calcula automaticamente o tamanho dos círculos
     * de acordo com a largura disponível.
     */
    function calcularTamanhoCirculo({
        grade,
        quantidadeBlocos,
        colunasPorBloco
    }) {

        const area =
            grade.closest(".dispositivo-area");


        const larguraDisponivel =
            area
                ? area.clientWidth
                : window.innerWidth;


        const blocos =
            Math.max(
                1,
                normalizarNumero(quantidadeBlocos)
            );


        const colunas =
            Math.max(
                1,
                normalizarNumero(colunasPorBloco)
            );


        const totalColunas =
            blocos * colunas;


        const espacoEntreBlocos =
            Math.max(
                0,
                blocos - 1
            ) * 18;


        const larguraUtil =
            Math.max(
                120,
                larguraDisponivel -
                espacoEntreBlocos -
                24
            );


        let tamanho =
            Math.floor(
                larguraUtil /
                totalColunas
            );


        if (tamanho > 34) {
            tamanho = 34;
        }


        if (tamanho < 14) {
            tamanho = 14;
        }


        return tamanho;

    }


    /**
     * Aplica variáveis CSS usadas pelo dispositivo.
     */
    function aplicarDimensoes({
        grade,
        tamanhoCirculo
    }) {

        const tamanho =
            Math.max(
                14,
                normalizarNumero(tamanhoCirculo)
            );


        const gapCirculos =
            Math.max(
                3,
                Math.floor(
                    tamanho * 0.15
                )
            );


        const gapLinhas =
            Math.max(
                4,
                Math.floor(
                    tamanho * 0.18
                )
            );


        const gapBlocos =
            Math.max(
                16,
                Math.floor(
                    tamanho * 0.75
                )
            );


        grade.style.setProperty(
            "--mini-circle-size",
            `${tamanho}px`
        );


        grade.style.setProperty(
            "--mini-gap-circulos",
            `${gapCirculos}px`
        );


        grade.style.setProperty(
            "--mini-gap-linhas",
            `${gapLinhas}px`
        );


        grade.style.setProperty(
            "--mini-gap-blocos",
            `${gapBlocos}px`
        );

            /**
     * ============================================================
     * MODO AUTOMÁTICO
     * ============================================================
     */

    function desenharModoAutomatico({
        grade,
        config,
        total,
        posicaoSelecionada
    }) {

        const quantidadeBlocos =
            Math.max(
                1,
                normalizarNumero(
                    config["Quantidade_Blocos"] ||
                    config.quantidadeBlocos ||
                    1
                )
            );


        const linhasPorBloco =
            Math.max(
                1,
                normalizarNumero(
                    config["Linhas_Por_Bloco"] ||
                    config.linhasPorBloco ||
                    1
                )
            );


        const colunasPorBloco =
            Math.max(
                1,
                normalizarNumero(
                    config["Colunas_Por_Bloco"] ||
                    config.colunasPorBloco ||
                    total
                )
            );


        aplicarDimensoes({

            grade,

            tamanhoCirculo:
                calcularTamanhoCirculo({

                    grade,

                    quantidadeBlocos,

                    colunasPorBloco

                })

        });


        let contador = 1;


        for (

            let linha = 0;

            linha < linhasPorBloco;

            linha++

        ) {

            const linhaGlobal =
                criarLinhaGlobal();


            /**
             * Mantemos os blocos
             * da direita para a esquerda,
             * igual ao sistema antigo.
             */

            for (

                let bloco = quantidadeBlocos;

                bloco >= 1;

                bloco--

            ) {

                const blocoLinha =
                    criarBlocoLinha();


                /**
                 * Descobre
                 * qual o primeiro número
                 * deste bloco.
                 */

                const inicioBloco =

                    (
                        linha *
                        quantidadeBlocos *
                        colunasPorBloco
                    )

                    +

                    (
                        (bloco - 1)
                        *
                        colunasPorBloco
                    )

                    + 1;


                const fimBloco =
                    inicioBloco +
                    colunasPorBloco - 1;


                /**
                 * Desenha
                 * da direita para esquerda.
                 */

                for (

                    let posicao = fimBloco;

                    posicao >= inicioBloco;

                    posicao--

                ) {

                    blocoLinha.appendChild(

                        criarCirculo({

                            posicao,

                            total,

                            posicaoSelecionada

                        })

                    );

                }


                linhaGlobal.appendChild(
                    blocoLinha
                );

            }


            grade.appendChild(
                linhaGlobal
            );

        }

    }

            /**
     * ============================================================
     * MODO MANUAL
     * ============================================================
     */

    function desenharModoManual({
        grade,
        layout,
        total,
        posicaoSelecionada
    }) {

        if (!Array.isArray(layout) || layout.length === 0) {

            mostrarMensagemSemLayout(
                grade,
                "Layout manual não encontrado."
            );

            return;

        }


        const linhas = agruparLayout(layout);


        const maiorQuantidade = obterMaiorQuantidade(layout);


        aplicarDimensoes({

            grade,

            tamanhoCirculo:
                calcularTamanhoCirculo({

                    grade,

                    quantidadeBlocos:
                        obterMaiorNumeroBlocos(linhas),

                    colunasPorBloco:
                        maiorQuantidade

                })

        });


        let contadorPosicao = 1;


        linhas.forEach(fileira => {

            const linhaGlobal =
                criarLinhaGlobal();


            const blocosOrdenados =
                [...fileira]

                .sort((a, b) =>
                    b.bloco - a.bloco
                );


            blocosOrdenados.forEach(bloco => {

                const blocoLinha =
                    criarBlocoLinha();


                const inicio = contadorPosicao;

                const fim =
                    contadorPosicao +
                    bloco.quantidade - 1;


                for (

                    let posicao = fim;

                    posicao >= inicio;

                    posicao--

                ) {

                    blocoLinha.appendChild(

                        criarCirculo({

                            posicao,

                            total,

                            posicaoSelecionada

                        })

                    );

                }


                contadorPosicao +=
                    bloco.quantidade;


                linhaGlobal.appendChild(
                    blocoLinha
                );

            });


            grade.appendChild(
                linhaGlobal
            );

        });

    }



    /**
     * Agrupa a tabela LAYOUT
     * em linhas completas.
     */
    function agruparLayout(layout) {

        const mapa =
            new Map();


        layout.forEach(item => {

            const fileira =
                normalizarNumero(
                    item.Fileira ??
                    item.fileira
                );


            const bloco =
                normalizarNumero(
                    item.Bloco ??
                    item.bloco
                );


            const quantidade =
                normalizarNumero(
                    item["Posições"] ??
                    item["Posicoes"] ??
                    item.posicoes ??
                    item.quantidade
                );


            if (!mapa.has(fileira)) {

                mapa.set(
                    fileira,
                    []
                );

            }


            mapa.get(fileira).push({

                bloco,

                quantidade

            });

        });


        return [...mapa.entries()]

            .sort((a, b) =>
                a[0] - b[0]
            )

            .map(item => item[1]);

    }



    /**
     * Retorna
     * a maior quantidade de cadeiras
     * encontrada em um bloco.
     */
    function obterMaiorQuantidade(layout) {

        let maior = 1;


        layout.forEach(item => {

            const quantidade =
                normalizarNumero(

                    item["Posições"] ??

                    item["Posicoes"] ??

                    item.posicoes ??

                    item.quantidade

                );


            if (quantidade > maior) {

                maior = quantidade;

            }

        });


        return maior;

    }



    /**
     * Descobre
     * quantos blocos existem
     * na maior fileira.
     */
    function obterMaiorNumeroBlocos(linhas) {

        let maior = 1;


        linhas.forEach(linha => {

            if (linha.length > maior) {

                maior = linha.length;

            }

        });


        return maior;

    }

            /**
     * ============================================================
     * FUNÇÕES AUXILIARES
     * ============================================================
     */

    function normalizarNumero(valor) {

        if (
            valor === null ||
            valor === undefined ||
            valor === ""
        ) {
            return 0;
        }

        const numero = Number(valor);

        if (Number.isNaN(numero)) {
            return 0;
        }

        return numero;

    }



    function normalizarTexto(texto) {

        if (
            texto === null ||
            texto === undefined
        ) {
            return "";
        }

        return texto
            .toString()
            .trim()
            .toUpperCase();

    }



    /**
     * Permite redesenhar o dispositivo
     * quando a tela mudar de tamanho.
     */
    function atualizar(options) {

        renderizar(options);

    }



    /**
     * Destaca uma posição sem
     * reconstruir todo o dispositivo.
     * (Será utilizado futuramente
     * no Dashboard.)
     */
    function destacarPosicao(

        grade,

        posicao

    ) {

        if (!grade) return;

        grade

            .querySelectorAll(
                ".dispositivo-destaque"
            )

            .forEach(item => {

                item.classList.remove(
                    "dispositivo-destaque"
                );

                item.classList.add(
                    "dispositivo-normal"
                );

            });


        const circulos =

            grade.querySelectorAll(
                ".dispositivo-circulo"
            );


        circulos.forEach(circulo => {

            if (

                Number(circulo.textContent) ===
                Number(posicao)

            ) {

                circulo.classList.remove(
                    "dispositivo-normal"
                );

                circulo.classList.add(
                    "dispositivo-destaque"
                );

            }

        });

    }



    /**
     * Limpa totalmente o dispositivo.
     */
    function limpar(grade) {

        if (!grade) return;

        grade.innerHTML = "";

    }



    /**
     * API pública
     */

    return {

        renderizar,

        atualizar,

        destacarPosicao,

        limpar

    };

})();
         
