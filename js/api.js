// ===========================================
// API
// ===========================================

const API_URL =
"https://script.google.com/macros/s/AKfycby_Oeki-w1mFC8VPSPuszOpsRvPVfZ1fuCyvvz1cYkXogwll6jO051eh0R9y3ibWr8A/exec";

async function apiGet(action, parametros = {}) {

    const url = new URL(API_URL);

    url.searchParams.set("action", action);

    Object.keys(parametros).forEach(chave => {

        url.searchParams.set(chave, parametros[chave]);

    });

    url.searchParams.set("_", Date.now());

    const resposta = await fetch(url, {

        cache: "no-store"

    });

    if (!resposta.ok) {

        throw new Error("Erro ao consultar API.");

    }

    return await resposta.json();

}

async function apiPost(action, dados = {}) {

    const resposta = await fetch(API_URL, {

        method: "POST",

        headers: {

            "Content-Type": "text/plain;charset=utf-8"

        },

        body: JSON.stringify({

            action,

            ...dados

        })

    });

    if (!resposta.ok) {

        throw new Error("Erro ao enviar dados.");

    }

    return await resposta.json();

}
