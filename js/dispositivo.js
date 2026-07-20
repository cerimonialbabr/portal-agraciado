// ===========================================
// DISPOSITIVO
// ===========================================

function renderizarDispositivo(containerId, config, posicaoSelecionada) {

    const container = document.getElementById(containerId);

    container.innerHTML = "";

    const total =
        Number(config.Total_Agraciados) || 0;

    const blocos =
        Number(config.Quantidade_Blocos) || 1;

    const linhas =
        Number(config.Linhas_Por_Bloco) || 1;

    const colunas =
        Number(config.Colunas_Por_Bloco) ||
        Math.ceil(total / (blocos * linhas));

    const capacidadeBloco =
        linhas * colunas;

    ajustarEscala(
        container,
        blocos,
        colunas
    );

    for (let linha = 0; linha < linhas; linha++) {

        const linhaGlobal =
            document.createElement("div");

        linhaGlobal.className =
            "mini-linha-global";

        for (let bloco = blocos; bloco >= 1; bloco--) {

            const blocoLinha =
                document.createElement("div");

            blocoLinha.className =
                "mini-bloco-linha";

            const inicioBloco =
                ((bloco - 1) * capacidadeBloco) + 1;

            const inicioLinha =
                inicioBloco +
                (linha * colunas);

            const fimLinha =
                inicioLinha +
                colunas - 1;

            for (
                let pos = fimLinha;
                pos >= inicioLinha;
                pos--
            ) {

                blocoLinha.appendChild(

                    criarCirculo(

                        pos,

                        posicaoSelecionada,

                        pos > total

                    )

                );

            }

            linhaGlobal.appendChild(blocoLinha);

        }

        container.appendChild(linhaGlobal);

    }
function criarCirculo(
    posicao,
    selecionada,
    vazio
) {

    const div =
        document.createElement("div");

    div.className =
        "mini-circulo";

    if (vazio) {

        div.classList.add(
            "mini-vazio"
        );

        return div;

    }

    if (
        Number(posicao) ===
        Number(selecionada)
    ) {

        div.classList.add(
            "mini-destaque"
        );

    } else {

        div.classList.add(
            "mini-normal"
        );

    }

    div.textContent = posicao;

    return div;

function ajustarEscala(
    grade,
    blocos,
    colunas
) {

    const largura =

        grade.parentElement.clientWidth * 0.90;

    const totalColunas =
        blocos * colunas;

    let tamanho = Math.floor(

        largura /

        (totalColunas + 4)

    );

    tamanho =

        Math.max(

            14,

            Math.min(

                tamanho,

                32

            )

        );

    grade.style.setProperty(

        "--mini-circle-size",

        tamanho + "px"

    );

    grade.style.setProperty(

        "--mini-gap-circulos",

        Math.max(

            3,

            tamanho * 0.15

        ) + "px"

    );

    grade.style.setProperty(

        "--mini-gap-blocos",

        Math.max(

            16,

            tamanho * 0.75

        ) + "px"

    );

    grade.style.setProperty(

        "--mini-gap-linhas",

        Math.max(

            4,

            tamanho * 0.18

        ) + "px"

    );

}
}
