/**
 * =====================================================
 * CONFIGURAÇÃO
 * =====================================================
 */

const API = (() => {

    /**
     * URL do Apps Script
     * (substituir após o deploy)
     */
    const BASE_URL = "https://script.google.com/macros/s/AKfycby_Oeki-w1mFC8VPSPuszOpsRvPVfZ1fuCyvvz1cYkXogwll6jO051eh0R9y3ibWr8A/exec";



    /**
     * =====================================================
     * MÉTODO PRIVADO
     * =====================================================
     */

    async function requisicao(

        acao,

        parametros = {}

    ) {

        const dados = {

            acao,

            ...parametros

        };


        const resposta = await fetch(

            BASE_URL,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(dados)

            }

        );


        if (!resposta.ok) {

            throw new Error(

                "Erro de comunicação."

            );

        }


        const json =
            await resposta.json();


        if (json.erro) {

            throw new Error(

                json.erro

            );

        }


        return json;

    }



    /**
     * =====================================================
     * REGISTRO
     * =====================================================
     */

    async function buscarRegistro(id) {

        return await requisicao(

            "buscarRegistro",

            {

                id

            }

        );

    }



    async function confirmarPresenca(id) {

        return await requisicao(

            "confirmarPresenca",

            {

                id

            }

        );

    }



    /**
     * =====================================================
     * DASHBOARD
     * =====================================================
     */

    async function buscarDashboard() {

        return await requisicao(

            "dashboard"

        );

    }



    /**
     * =====================================================
     * CONFIGURAÇÃO
     * =====================================================
     */

    async function buscarConfiguracao() {

        return await requisicao(

            "config"

        );

    }



    /**
     * =====================================================
     * LISTA DE AGRACIADOS
     * =====================================================
     */

    async function buscarAgraciados() {

        return await requisicao(

            "agraciados"

        );

    }



    /**
     * =====================================================
     * EXPORTAÇÃO
     * =====================================================
     */

    return {

        buscarRegistro,

        confirmarPresenca,

        buscarDashboard,

        buscarConfiguracao,

        buscarAgraciados

    };

})();
