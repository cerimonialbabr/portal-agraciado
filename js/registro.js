let dados = null;
let agraciado = null;

window.addEventListener(

    "load",

    iniciar

);

async function iniciar(){

    try{

        const parametros =

            new URLSearchParams(

                location.search

            );

        const id =

            parametros.get("id");

        if(!id){

            mostrarErro(

                "Agraciado não informado."

            );

            return;

        }

        dados = await apiGet(

            "dados"

        );

        agraciado =

            dados.agraciados.find(item=>{

                return item.ID===id;

            });

        if(!agraciado){

            mostrarErro(

                "Agraciado não encontrado."

            );

            return;

        }

        preencherPagina();

    }

    catch(e){

        console.error(e);

        mostrarErro(

            "Erro ao carregar informações."

        );

    }

}

function preencherPagina(){

    document.getElementById(

        "nome"

    ).textContent =

    agraciado.Nome;

    document.getElementById(

        "posicao"

    ).textContent =

    numero(

        agraciado.Posicao

    );

    carregarMensagem();

    carregarDispositivo();

    verificarStatus();

}
function carregarMensagem(){

    const caixa =

        document.getElementById(

            "mensagemIndividual"

        );

    if(

        agraciado.Mensagem_Individual &&

        agraciado.Mensagem_Individual.trim()!==""

    ){

        caixa.innerHTML=

        "<div class='mensagem card-amarelo'>"+

        agraciado.Mensagem_Individual+

        "</div>";

    }

    else{

        caixa.innerHTML="";

    }

}

function carregarDispositivo(){

    const div =

        document.getElementById(

            "dispositivo"

        );

    renderizarDispositivo(

        div,

        dados.agraciados,

        numero(

            agraciado.Posicao

        )

    );

}function verificarStatus(){

    if(

        agraciado.Status==="PRESENTE"

    ){

        mostrarConfirmado();

    }

}

function mostrarConfirmado(){

    document.getElementById(

        "confirmar"

    ).style.display="none";

    document.getElementById(

        "confirmado"

    ).style.display="block";

async function confirmarPresenca(){

    const botao =

        document.getElementById(

            "confirmar"

        );

    botao.disabled=true;

    botao.textContent=

    "Registrando...";

    try{

        await apiPost(

            "checkin",

            {

                id:

                agraciado.ID

            }

        );

        mostrarConfirmado();

    }

    catch(e){

        console.error(e);

        alert(

            "Não foi possível registrar a presença."

        );

        botao.disabled=false;

        botao.textContent=

        "CONFIRMAR PRESENÇA";

    }

function mostrarErro(texto){

    document.body.innerHTML=

    "<div class='container'>"+

    "<div class='pagina'>"+

    "<div class='erro'>"+

    texto+

    "</div>"+

    "</div>"+

    "</div>";

}
