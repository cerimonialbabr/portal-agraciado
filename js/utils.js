function normalizar(texto){

    return String(texto || "")

        .normalize("NFD")

        .replace(/[\u0300-\u036f]/g,"")

        .trim()

        .toUpperCase();

}

function numero(valor){

    const n = Number(valor);

    return Number.isFinite(n) ? n : 0;

}

function formatarDataHora(data){

    const d = new Date(data);

    if(isNaN(d.getTime())){

        return "";

    }

    return new Intl.DateTimeFormat(

        "pt-BR",

        {

            dateStyle:"short",

            timeStyle:"short"

        }

    ).format(d);

}
