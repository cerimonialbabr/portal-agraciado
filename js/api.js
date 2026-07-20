//====================================================
// CONFIGURAÇÃO
//====================================================

// COLE AQUI O MESMO WEB APP DO SISTEMA ANTIGO

const API_URL =
"https://SEU_APPS_SCRIPT/exec";


//====================================================
// BUSCAR CONFIGURAÇÃO
//====================================================

async function carregarConfiguracao(){

    const resposta = await fetch(API_URL);

    if(!resposta.ok){

        throw new Error("Erro ao acessar a API.");

    }

    const dados = await resposta.json();

    return dados;

}
