// ======================================
// PRESENÇA
// ======================================

let dados = null;
let listaAgraciados = [];

const campoPesquisa =
document.getElementById("pesquisa");

const lista =
document.getElementById("listaAgraciados");

const contador =
document.getElementById("contador");

window.addEventListener("load", iniciar);

campoPesquisa.addEventListener("input", filtrar);

async function iniciar(){

    try{

        dados = await apiGet("dados");

        listaAgraciados =
            dados.agraciados || [];

        listaAgraciados.sort((a,b)=>{

            return a.Nome.localeCompare(

                b.Nome,

                "pt-BR"

            );

        });

        atualizarLista(listaAgraciados);

    }

    catch(e){

        console.error(e);

        lista.innerHTML =

        "<div class='erro'>Erro ao carregar lista.</div>";

    }

}

function filtrar(){

    const texto =

        normalizar(

            campoPesquisa.value

        );

    if(texto===""){

        atualizarLista(listaAgraciados);

        return;

    }

    const resultado =

        listaAgraciados.filter(item=>{

            return normalizar(

                item.Nome

            ).includes(texto);

        });

    atualizarLista(resultado);

}

function atualizarLista(vetor){

    lista.innerHTML="";

    contador.textContent =

        vetor.length;

    vetor.forEach(item=>{

        const botao =

            document.createElement("button");

        botao.className =

            "agraciado";

        botao.textContent =

            item.Nome;

        botao.onclick = ()=>{

            location.href =

            "registro.html?id="+

            item.ID;

        };

        lista.appendChild(botao);

    });

}
