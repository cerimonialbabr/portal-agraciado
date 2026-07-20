document.addEventListener("DOMContentLoaded", iniciar);


async function iniciar(){

    try{

        const dados = await carregarConfiguracao();

        console.log(dados);

    }

    catch(erro){

        console.error(erro);

        alert("Não foi possível conectar ao servidor.");

    }

}
